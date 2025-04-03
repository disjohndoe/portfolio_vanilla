import { createNavigation } from '../components/Navigation.js';

/**
 * Sets up common page elements for consistency across all pages
 * @param {string} pageName - The current page ID (home, blog, etc.)
 */
export function setupPage(pageName) {
  // Get navigation HTML
  const { desktopNavHTML, mobileNavHTML } = createNavigation(pageName);
  
  // Replace the desktop navigation
  const headerElement = document.querySelector('header.header');
  if (headerElement) {
    headerElement.outerHTML = desktopNavHTML;
  }
  
  // Replace the mobile navigation
  const mobileNavElement = document.querySelector('.mobile-nav');
  if (mobileNavElement) {
    mobileNavElement.outerHTML = mobileNavHTML;
  }
  
  // Initialize mobile navigation event listeners
  initMobileNav();
  
  // Initialize theme toggle
  initThemeToggle();
}

/**
 * Initialize mobile navigation functionality
 */
function initMobileNav() {
  const mobileNavToggle = document.querySelector('.header__bars');
  const mobileNavClose = document.querySelector('.mobile-nav__close');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  if (mobileNavToggle && mobileNav) {
    mobileNavToggle.addEventListener('click', () => {
      mobileNav.style.display = 'flex';
      mobileNav.classList.add('active');
      document.body.style.overflowY = 'hidden';
    });
  }

  if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => {
      mobileNav.classList.remove('active');
      setTimeout(() => {
        mobileNav.style.display = 'none';
        document.body.style.overflowY = 'auto';
      }, 300);
    });
  }
  
  // Close mobile nav when clicking links
  mobileLinks.forEach(link => {
    if (link) {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        setTimeout(() => {
          mobileNav.style.display = 'none';
          document.body.style.overflowY = 'auto';
        }, 300);
      });
    }
  });
}

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
  const themeToggleDesktop = document.querySelector('#theme-toggle');
  const themeToggleMobile = document.querySelector('#mobile-theme-toggle');
  const themeToggles = [themeToggleDesktop, themeToggleMobile].filter(Boolean);
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    
    // Update all theme toggle buttons
    themeToggles.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
      }
    });
  }
  
  // Add click event listeners to theme toggles
  themeToggles.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        // Update all icons in all toggle buttons
        themeToggles.forEach(toggleBtn => {
          const icon = toggleBtn.querySelector('i');
          if (icon) {
            if (document.body.classList.contains('light-mode')) {
              icon.classList.remove('fa-sun');
              icon.classList.add('fa-moon');
            } else {
              icon.classList.remove('fa-moon');
              icon.classList.add('fa-sun');
            }
          }
        });
        
        // Save theme preference
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
      });
    }
  });
}
