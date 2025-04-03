import '../styles/modern-normalize.css';
import '../styles/colors.css';
import '../styles/style.css';
import '../styles/components/header.css';
import '../styles/components/footer.css';
import '../styles/components/mobile-nav.css';
import '../styles/components/loader.css';
import '../styles/components/navigation.css';
import '../styles/components/blog.css';
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

// Initialize blog-specific functionality
document.addEventListener('DOMContentLoaded', () => {
  // Constants for blog
  const BLOG_API = '/api/blog.php'; 
  const POSTS_PER_PAGE = 6;
  
  // State
  let allPosts = [];
  let filteredPosts = [];
  let currentPage = 1;
  let currentTag = 'all';
  let allTags = new Set(['all']);
  
  // DOM elements
  const postsContainer = document.getElementById('blog-posts');
  const paginationContainer = document.getElementById('blog-pagination');
  const filtersContainer = document.getElementById('blog-filters');
  
  // Format date helper
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Truncate text helper
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
  
  // Fetch all blog posts
  async function fetchPosts() {
    try {
      console.log('Fetching posts from API');
      const response = await fetch(BLOG_API);
      
      if (!response.ok) {
        console.error('API error:', response.status, response.statusText);
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      processPostData(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      // Try the fallback data if it exists
      if (typeof getBlogFallbackData === 'function') {
        console.log('Using fallback blog data');
        const fallbackData = getBlogFallbackData();
        processPostData(fallbackData);
      } else {
        postsContainer.innerHTML = `
          <div class="no-posts">
            <h3>Error loading blog posts</h3>
            <p>Error details: ${error.message}</p>
            <p>Please check the console for more information.</p>
          </div>
        `;
      }
    }
  }
  
  // Process post data after successful fetch
  function processPostData(data) {
    allPosts = data;
    
    // Collect all unique tags
    allPosts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
    });
    
    // Update filters
    renderFilters();
    
    // Update posts
    filteredPosts = [...allPosts];
    renderPosts();
    renderPagination();
  }
  
  // Render blog posts for current page
  function renderPosts() {
    if (filteredPosts.length === 0) {
      postsContainer.innerHTML = `
        <div class="no-posts">
          <h3>No posts found</h3>
          <p>There are no blog posts in this category yet.</p>
        </div>
      `;
      return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);
    
    // Clear container
    postsContainer.innerHTML = '';
    
    // Add posts
    currentPosts.forEach(post => {
      const postDate = formatDate(post.date);
      const excerpt = truncateText(post.excerpt, 120);
      const defaultImage = '/particle.png'; // Use an existing image as fallback
      
      const postElement = document.createElement('article');
      postElement.className = 'blog-card';
      postElement.innerHTML = `
        <div class="blog-card__image-container">
          <img class="blog-card__image" src="${post.image || defaultImage}" alt="${post.title}">
        </div>
        <div class="blog-card__content">
          <div class="blog-card__date">${postDate}</div>
          <h2 class="blog-card__title">${post.title}</h2>
          <p class="blog-card__excerpt">${excerpt}</p>
          <div class="blog-card__tags">
            ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
          </div>
          <a href="/blog-post.html?id=${post.id}" class="blog-card__btn">Read More</a>
        </div>
      `;
      
      postsContainer.appendChild(postElement);
    });
  }
  
  // Render pagination controls
  function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    
    if (totalPages <= 1) {
      paginationContainer.style.display = 'none';
      return;
    }
    
    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'blog-pagination__btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `blog-pagination__btn ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => changePage(i));
      paginationContainer.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'blog-pagination__btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);
  }
  
  // Render tag filters
  function renderFilters() {
    filtersContainer.innerHTML = '';
    
    // Add "All Posts" filter
    const allBtn = document.createElement('button');
    allBtn.className = `blog-filter__btn ${currentTag === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All Posts';
    allBtn.dataset.tag = 'all';
    allBtn.addEventListener('click', () => filterByTag('all'));
    filtersContainer.appendChild(allBtn);
    
    // Add tag filters
    Array.from(allTags)
      .filter(tag => tag !== 'all')
      .sort()
      .forEach(tag => {
        const tagBtn = document.createElement('button');
        tagBtn.className = `blog-filter__btn ${currentTag === tag ? 'active' : ''}`;
        tagBtn.textContent = tag;
        tagBtn.dataset.tag = tag;
        tagBtn.addEventListener('click', () => filterByTag(tag));
        filtersContainer.appendChild(tagBtn);
      });
  }
  
  // Filter posts by tag
  function filterByTag(tag) {
    currentTag = tag;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.blog-filter__btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });
    
    // Filter posts
    if (tag === 'all') {
      filteredPosts = [...allPosts];
    } else {
      filteredPosts = allPosts.filter(post => post.tags.includes(tag));
    }
    
    renderPosts();
    renderPagination();
    
    // Scroll to top of blog section
    window.scrollTo({
      top: document.querySelector('.blog-container').offsetTop - 100,
      behavior: 'smooth'
    });
  }
  
  // Change page
  function changePage(page) {
    currentPage = page;
    renderPosts();
    renderPagination();
    
    // Scroll to top of blog section
    window.scrollTo({
      top: document.querySelector('.blog-container').offsetTop - 100,
      behavior: 'smooth'
    });
  }

  // Track image loading progress
  let imagesLoaded = 0;
  const imagesToLoad = document.querySelectorAll('img').length;
  
  function imageLoaded() {
    imagesLoaded++;
    const progress = imagesLoaded / imagesToLoad;
    
    // When all images are loaded, remove loader
    if (progress >= 1) {
      removeLoader();
    }
  }
  
  // If no images, just remove loader after a minimum time
  if (imagesToLoad === 0) {
    setTimeout(removeLoader, 800);
  } else {
    // Track image loading progress
    document.querySelectorAll('img').forEach(img => {
      // For already loaded or cached images
      if (img.complete) {
        imageLoaded();
      } else {
        // For images still loading
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded); // Count errors as loaded
      }
    });
  }
  
  function removeLoader() {
    // Short delay to ensure a minimum loading time for better UX
    setTimeout(() => {
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
    }, 600);
  }
  
  // If everything else fails, remove loader after a timeout
  setTimeout(() => {
    document.body.classList.remove('loading-start');
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.add('loaded');
    });
    removeLoader();
  }, 5000);
  
  // Fetch blog posts
  fetchPosts();
});
