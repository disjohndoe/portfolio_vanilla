// Single post functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dark mode toggle
  const themeToggle = document.querySelectorAll('#theme-toggle');
  themeToggle.forEach(toggle => {
    toggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      
      // Save preference to localStorage
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        themeToggle.forEach(t => t.innerHTML = '<i class="fas fa-moon"></i>');
      } else {
        localStorage.setItem('darkMode', 'disabled');
        themeToggle.forEach(t => t.innerHTML = '<i class="fas fa-sun"></i>');
      }
    });
  });

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    themeToggle.forEach(t => t.innerHTML = '<i class="fas fa-moon"></i>');
  }

  // Mobile navigation functionality
  const menuBtn = document.querySelector('.header__bars');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav__close');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  // Open mobile menu
  menuBtn?.addEventListener('click', () => {
    mobileNav.classList.add('mobile-nav--open');
    document.body.style.overflow = 'hidden';
  });

  // Close mobile menu
  closeBtn?.addEventListener('click', () => {
    mobileNav.classList.remove('mobile-nav--open');
    document.body.style.overflow = 'auto';
  });

  // Close mobile menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('mobile-nav--open');
      document.body.style.overflow = 'auto';
    });
  });

  // Format date to readable format
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Get post ID from URL
  function getPostId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }
  
  // Create post content HTML
  function createPostHTML(post) {
    return `
      <div class="post-header">
        ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-featured-image">` : ''}
        <div class="post-meta">
          <span class="post-meta-item"><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
          ${post.author ? `<span class="post-meta-item"><i class="far fa-user"></i> ${post.author}</span>` : ''}
        </div>
        <h1 class="post-title-single">${post.title}</h1>
      </div>
      <div class="post-content-body">
        ${post.content}
      </div>
    `;
  }
  
  // Fetch and display post
  async function fetchPost(postId) {
    const postContainer = document.getElementById('post-content');
    
    try {
      const response = await fetch(`../api/blog.php?id=${postId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const post = await response.json();
      
      // Set page title
      document.title = `${post.title} - Hrvoje Matosevic`;
      
      // Set meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }
      
      // Render post content
      postContainer.innerHTML = createPostHTML(post);
      
      // Apply syntax highlighting to code blocks
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
      
    } catch (error) {
      console.error('Error fetching post:', error);
      postContainer.innerHTML = `
        <div class="post-error">
          <h2>Error Loading Post</h2>
          <p>Failed to load the post. It may have been removed or is unavailable.</p>
          <a href="./index.html" class="post-read-more">Back to Blog</a>
        </div>
      `;
    }
  }
  
  // Load post if on post page
  const postId = getPostId();
  if (postId) {
    fetchPost(postId);
  }
});
