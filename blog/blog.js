// Blog functionality
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
    mobileNav.style.display = 'flex';
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  // Close mobile menu
  closeBtn?.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    setTimeout(() => {
      mobileNav.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  });

  // Close mobile menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      setTimeout(() => {
        mobileNav.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 300);
    });
  });

  // Fetch blog posts
  const postsContainer = document.getElementById('posts-container');
  
  // Format date to readable format
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }
  
  // Create post card element
  function createPostCard(post) {
    return `
      <article class="post-card">
        ${post.image ? `
          <div class="post-image">
            <img src="${post.image}" alt="${post.title}">
          </div>
        ` : ''}
        <div class="post-content">
          <time class="post-date">${formatDate(post.date)}</time>
          <h2 class="post-title">${post.title}</h2>
          <p class="post-excerpt">${post.excerpt}</p>
          <a href="./post.html?id=${post.id}" class="post-read-more">Read More</a>
        </div>
      </article>
    `;
  }
  
  // Fetch and display posts
  async function fetchPosts() {
    try {
      const response = await fetch('../api/blog.php');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const posts = await response.json();
      
      if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No posts found. Check back soon!</p>';
        return;
      }
      
      const postsHtml = posts.map(post => createPostCard(post)).join('');
      postsContainer.innerHTML = postsHtml;
    } catch (error) {
      console.error('Error fetching posts:', error);
      postsContainer.innerHTML = `<p>Failed to load posts. Please try again later. Error: ${error.message}</p>`;
    }
  }
  
  // Load posts
  if (postsContainer) {
    fetchPosts();
  }
});
