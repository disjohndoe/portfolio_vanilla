import '../styles/modern-normalize.css';
import '../styles/colors.css';
import '../styles/style.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';
import '../styles/components/mobile-nav.css';
import '../styles/components/loader.css';
import '../styles/components/navigation.css';
import '../styles/components/blog-post.css';
import '../styles/components/blog/share-buttons.css'; // Added special share button styling
import '../styles/utils.css';

// Import utilities 
import { setupPage } from './utils/page-setup';
import loader from './utils/loader';
import threeBackground from './utils/three-background';

// Initialize loader
loader();

// Set up consistent navigation with blog page active
setupPage('blog');

// Initialize three.js background instead of simple div
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (window.THREE) {
      threeBackground();
    } else {
      console.warn('THREE.js not available, using fallback background');
      // Fallback to simple background if THREE.js is not available
      const bgElement = document.createElement('div');
      bgElement.classList.add('blog-background');
      document.body.prepend(bgElement);
    }
  } catch (error) {
    console.error('Error initializing background:', error);
    // Ensure we have a fallback background in case of errors
    const bgElement = document.createElement('div');
    bgElement.classList.add('blog-background');
    document.body.prepend(bgElement);
  }
});

// Initialize blog post functionality
document.addEventListener('DOMContentLoaded', () => {
  // Function to run after the blog post content is rendered to fix FHIR resource lists
  function fixResourceLists() {
    // Find all list items and remove backgrounds
    document.querySelectorAll('.blog-post__content li').forEach(li => {
      // Remove any background styling
      li.style.backgroundColor = 'transparent';
      
      // Also clean up any child elements
      li.querySelectorAll('*').forEach(child => {
        if (child.style) {
          child.style.backgroundColor = 'transparent';
        }
      });
      
      // Format resource items (format: ResourceName: description)
      const text = li.innerHTML;
      if (text.includes(':') && !text.includes('<strong>')) {
        const parts = text.split(':', 2);
        if (parts[0].trim().length > 0 && parts[0].indexOf('<') === -1) {
          li.innerHTML = `<strong>${parts[0].trim()}</strong>:${parts[1]}`;
        }
      }
    });
    
    // Find potential FHIR resource sections
    document.querySelectorAll('.blog-post__content h2, .blog-post__content h3, .blog-post__content p').forEach(el => {
      if (el.textContent.includes('Resources:') || el.textContent.includes('Resource Types:')) {
        // Find the next UL and apply the resource-list class
        let nextEl = el.nextElementSibling;
        while (nextEl) {
          if (nextEl.tagName === 'UL') {
            nextEl.classList.add('resource-list');
            break;
          }
          nextEl = nextEl.nextElementSibling;
        }
      }
    });
  }
  // Constants
  const BLOG_API = '/api/blog.php';
  
  // DOM elements
  const blogPostContainer = document.getElementById('blog-post');
  
  // Get post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  
  // Format date helper
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Convert markdown to HTML or handle HTML content
  function markdownToHtml(content) {
    if (!content) return '';
    
    // Check if content is already HTML (contains HTML tags)
    if (/<[a-z][\s\S]*>/i.test(content)) {
      console.log('Content appears to be HTML, returning as is');
      return content;
    }
    
    // Process markdown content
    let markdown = content;
    
    // Process code blocks with syntax highlighting
    markdown = markdown.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, language, code) => {
      return `<pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>`;
    });
    
    // Process headers
    markdown = markdown.replace(/^### (.*$)/gim, function(match, p1) {
      const id = p1.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h3 id="${id}">${p1}</h3>`;
    });
    markdown = markdown.replace(/^## (.*$)/gim, function(match, p1) {
      const id = p1.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h2 id="${id}">${p1}</h2>`;
    });
    markdown = markdown.replace(/^# (.*$)/gim, function(match, p1) {
      const id = p1.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h1 id="${id}">${p1}</h1>`;
    });
    
    // Process bold and italic
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Process lists
    markdown = markdown.replace(/^\s*\n\* (.*)/gm, '<ul>\n<li>$1</li>');
    markdown = markdown.replace(/^\* (.*)/gm, '<li>$1</li>');
    markdown = markdown.replace(/^\s*\n<\/ul>/gm, '</ul>');
    markdown = markdown.replace(/^\s*\n\d\. (.*)/gm, '<ol>\n<li>$1</li>');
    markdown = markdown.replace(/^\d\. (.*)/gm, '<li>$1</li>');
    markdown = markdown.replace(/^\s*\n<\/ol>/gm, '</ol>');
    
    // Process nested lists with indentation (handle specifically for FHIR resources)
    markdown = markdown.replace(/<li>([^:]+): /g, '<li><strong>$1</strong>: ');
    
    // Process o-based lists (commonly used for FHIR resource lists)
    markdown = markdown.replace(/^\s*o\s+(.*)/gm, '<li>$1</li>');
    
    // Special handling for resource items with a colon but no formatting yet
    markdown = markdown.replace(/<li>([^<:]+):\s*([^<]+)<\/li>/g, '<li><strong>$1</strong>: $2</li>');
    
    // Process links and images
    markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    markdown = markdown.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">');
    
    // Process blockquotes
    markdown = markdown.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Process paragraphs
    markdown = markdown.replace(/^\s*(\n)?(.+)/gm, function(m) {
      return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
    });
    
    // Process line breaks
    markdown = markdown.replace(/\n\n+/g, '</p><p>'); // Multiple line breaks become paragraph breaks
    markdown = markdown.replace(/\n/g, ' '); // Single line breaks become spaces
    
    return markdown;
  }
  
  // Generate table of contents from HTML content
  function generateTableOfContents(htmlContent) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const headings = tempDiv.querySelectorAll('h2, h3');
    if (headings.length < 3) return ''; // Don't show TOC if there are fewer than 3 headings
    
    let toc = '<div class="blog-post__toc">';
    toc += '<h4 class="blog-post__toc-title">Table of Contents</h4>';
    toc += '<ul class="blog-post__toc-list">';
    
    let currentH2 = null;
    let hasSubHeadings = false;
    
    headings.forEach(heading => {
      const id = heading.id;
      
      if (heading.tagName === 'H2') {
        if (currentH2 !== null && hasSubHeadings) {
          toc += '</ul></li>';
        }
        toc += `<li><a href="#${id}">${heading.textContent}</a>`;
        currentH2 = id;
        hasSubHeadings = false;
      } else if (heading.tagName === 'H3' && currentH2 !== null) {
        if (!hasSubHeadings) {
          toc += '<ul>';
          hasSubHeadings = true;
        }
        toc += `<li><a href="#${id}">${heading.textContent}</a></li>`;
      }
    });
    
    if (hasSubHeadings) {
      toc += '</ul></li>';
    } else if (currentH2 !== null) {
      toc += '</li>';
    }
    
    toc += '</ul></div>';
    return toc;
  }
  
  // Fetch and display blog post
  function fetchPost() {
    return new Promise((resolve) => {
      if (!postId) {
        showError('Post not found', 'The blog post you requested could not be found.');
        resolve();
        return;
      }
      
      // Fetch single post from API
      console.log(`Fetching post from API: ${BLOG_API}?id=${postId}`);
      fetch(`${BLOG_API}?id=${postId}`)
        .then(response => {
          if (!response.ok) {
            console.error('API error:', response.status, response.statusText);
            throw new Error('Post not found');
          }
          return response.json();
        })
        .then(post => {
          displayPost(post);
          fetchRelatedPosts(post);
          resolve();
        })
        .catch(error => {
          console.error('Error fetching post:', error);
          
          // Try using fallback data
          if (typeof getBlogFallbackData === 'function') {
            console.log('Trying fallback data for post:', postId);
            const fallbackData = getBlogFallbackData();
            const fallbackPost = fallbackData.find(post => post.id === postId);
            
            if (fallbackPost) {
              console.log('Found post in fallback data');
              displayPost(fallbackPost);
              fetchRelatedPostsFromAllPosts(fallbackPost, fallbackData);
              resolve();
              return;
            }
          }
          
          showError('Post not found', 'The blog post you requested could not be found.');
          resolve();
        });
    });
  }
  
  // Display blog post
  function displayPost(post) {
    // Update page title and meta tags
    document.title = `${post.title} | Hrvoje Matosevic`;
    document.querySelector('meta[name="description"]').setAttribute('content', post.excerpt);
    document.querySelector('meta[property="og:title"]').setAttribute('content', post.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', post.excerpt);
    document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
    
    if (post.image) {
      document.querySelector('meta[property="og:image"]').setAttribute('content', post.image);
    }
    
    // Process content
    const htmlContent = markdownToHtml(post.content);
    const toc = generateTableOfContents(htmlContent);
    
    // Format date
    const formattedDate = formatDate(post.date);
    
    // Build post HTML
    blogPostContainer.innerHTML = `
      <header class="blog-post__header">
        <h1 class="blog-post__title">${post.title}</h1>
        <div class="blog-post__meta">
          <div class="blog-post__author">
            <i class="fas fa-user"></i> ${post.author}
          </div>
          <div class="blog-post__date">
            <i class="far fa-calendar-alt"></i> ${formattedDate}
          </div>
        </div>
        <div class="blog-post__author-socials">
          <a href="https://x.com/CtrlAltDeMatt" target="_blank" class="blog-post__author-social">
            <i class="fab fa-twitter"></i> @CtrlAltDeMatt
          </a>
          <a href="https://www.linkedin.com/in/hrvoje-matt/" target="_blank" class="blog-post__author-social">
            <i class="fab fa-linkedin"></i> Hrvoje Matosevic
          </a>
        </div>
        <div class="blog-post__tags">
          ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
        </div>
      </header>
      
      ${post.image ? `<img class="blog-post__image" src="${post.image}" onerror="this.onerror=null; this.src='/assets/default-blog-image.jpg';" alt="${post.title}">` : ''}
      
      ${toc}
      
      <div class="blog-post__content">
        ${htmlContent}
      </div>
      
      <div class="blog-post__share">
        <div class="blog-post__share-label">Share this post:</div>
        <div class="blog-post__share-buttons">
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" target="_blank" class="blog-post__share-btn blog-post__share-btn--twitter" title="Share on Twitter">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="blog-post__share-btn blog-post__share-btn--facebook" title="Share on Facebook">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank" class="blog-post__share-btn blog-post__share-btn--linkedin" title="Share on LinkedIn">
            <i class="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
      
      <div class="blog-post__back">
        <a href="/blog.html" class="blog-post__back-link">
          <i class="fas fa-arrow-left"></i> Back to Blog
        </a>
      </div>
      
      <div class="blog-post__nav" id="post-navigation">
        <!-- Will be populated with related posts -->
      </div>
    `;
    
    // Initialize code highlighting
    if (window.hljs) {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightBlock(block);
      });
    }
    
    // Fix resource lists in FHIR blog posts
    fixResourceLists();
  }
  
  // Fetch related posts for navigation
  async function fetchRelatedPosts(currentPost) {
    try {
      // Fetch all posts to find related ones
      const response = await fetch(BLOG_API);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related posts');
      }
      
      const posts = await response.json();
      setupRelatedPostsNavigation(posts, currentPost);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      // Try fetching from fallback source
      try {
        if (typeof getBlogFallbackData === 'function') {
          console.log('Using fallback blog data for related posts');
          const fallbackData = getBlogFallbackData();
          setupRelatedPostsNavigation(fallbackData, currentPost);
        }
      } catch (fallbackError) {
        console.error('Error using fallback data:', fallbackError);
      }
    }
  }
  
  // Fetch related posts from the list of all posts (when using fallback)
  function fetchRelatedPostsFromAllPosts(currentPost, allPosts) {
    try {
      // Find current post index
      const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);
      
      if (currentIndex === -1) return;
      
      const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
      const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
      
      const navContainer = document.getElementById('post-navigation');
      navContainer.innerHTML = '';
      
      if (prevPost) {
        navContainer.innerHTML += `
          <div class="blog-post__nav-item blog-post__nav-item--prev">
            <a href="/blog-post.html?id=${prevPost.id}" class="blog-post__nav-link">
              <div class="blog-post__nav-label">
                <i class="fas fa-arrow-left"></i> Previous Post
              </div>
              <div class="blog-post__nav-title">${prevPost.title}</div>
            </a>
          </div>
        `;
      } else {
        navContainer.innerHTML += `<div class="blog-post__nav-item"></div>`;
      }
      
      if (nextPost) {
        navContainer.innerHTML += `
          <div class="blog-post__nav-item blog-post__nav-item--next">
            <a href="/blog-post.html?id=${nextPost.id}" class="blog-post__nav-link">
              <div class="blog-post__nav-label">
                Next Post <i class="fas fa-arrow-right"></i>
              </div>
              <div class="blog-post__nav-title">${nextPost.title}</div>
            </a>
          </div>
        `;
      } else {
        navContainer.innerHTML += `<div class="blog-post__nav-item"></div>`;
      }
    } catch (error) {
      console.error('Error setting up related posts from all posts:', error);
    }
  }
  
  // Set up the previous/next navigation for blog posts
  function setupRelatedPostsNavigation(posts, currentPost) {
    // Find current post index
    const currentIndex = posts.findIndex(post => post.id === currentPost.id);
    
    if (currentIndex === -1) return;
    
    const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
    const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
    
    const navContainer = document.getElementById('post-navigation');
    navContainer.innerHTML = '';
    
    if (prevPost) {
      navContainer.innerHTML += `
        <div class="blog-post__nav-item blog-post__nav-item--prev">
          <a href="/blog-post.html?id=${prevPost.id}" class="blog-post__nav-link">
            <div class="blog-post__nav-label">
              <i class="fas fa-arrow-left"></i> Previous Post
            </div>
            <div class="blog-post__nav-title">${prevPost.title}</div>
          </a>
        </div>
      `;
    } else {
      navContainer.innerHTML += `<div class="blog-post__nav-item"></div>`;
    }
    
    if (nextPost) {
      navContainer.innerHTML += `
        <div class="blog-post__nav-item blog-post__nav-item--next">
          <a href="/blog-post.html?id=${nextPost.id}" class="blog-post__nav-link">
            <div class="blog-post__nav-label">
              Next Post <i class="fas fa-arrow-right"></i>
            </div>
            <div class="blog-post__nav-title">${nextPost.title}</div>
          </a>
        </div>
      `;
    } else {
      navContainer.innerHTML += `<div class="blog-post__nav-item"></div>`;
    }
  }
  
  // Show error message
  function showError(title, message) {
    blogPostContainer.innerHTML = `
      <div class="error">
        <h2 class="error__title">${title}</h2>
        <p class="error__message">${message}</p>
        <a href="/blog.html" class="btn">Back to Blog</a>
      </div>
    `;
  }

  // Remove loader function
  function removeLoader() {
    // Make sure all sections are revealed
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.add('loaded');
    });
    
    // Remove loader with fade out
    const loaderContainer = document.querySelector('.loader-container');
    if (loaderContainer) {
      loaderContainer.classList.add('hidden');
      
      // Remove loader after transition
      setTimeout(() => {
        loaderContainer.remove();
      }, 500);
    }
  }
  
  // Call removeLoader after a reasonable time if not already done
  setTimeout(removeLoader, 2000);
  
  // Handle smooth scrolling for table of contents links
  document.addEventListener('click', (e) => {
    const target = e.target;
    
    // Check if the clicked element is a link inside the table of contents
    if (target.tagName === 'A' && target.closest('.blog-post__toc-list')) {
      e.preventDefault();
      
      // Get the target element ID from the href
      const targetId = target.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Scroll to the element with smooth behavior
        targetElement.scrollIntoView({ behavior: 'smooth' });
        
        // Add a highlight effect to the target heading
        targetElement.classList.add('highlight-heading');
        setTimeout(() => {
          targetElement.classList.remove('highlight-heading');
        }, 2000);
        
        // Update URL without page reload
        history.pushState(null, null, `#${targetId}`);
      }
    }
  });
  
  // Fetch blog post
  fetchPost().then(() => {
    // Check if URL has a hash and scroll to the corresponding element
    if (window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Small delay to ensure content is rendered
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth' });
          
          // Add highlight effect
          targetElement.classList.add('highlight-heading');
          setTimeout(() => {
            targetElement.classList.remove('highlight-heading');
          }, 2000);
        }, 500);
      }
    }
  });
});
