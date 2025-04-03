// Direct implementation for homepage mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.querySelector('.header__bars');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav__close');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  // State
  let isMobileNavOpen = false;

  // Make sure the menu starts hidden with proper transform
  if (mobileNav) {
    mobileNav.style.transform = 'translateX(100%)';
    mobileNav.style.transition = 'transform 0.3s ease-in-out';
  }

  // Open mobile menu
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      console.log('Menu button clicked');
      isMobileNavOpen = true;
      mobileNav.style.display = 'flex';
      
      // Force a reflow before changing the transform to ensure the animation works
      void mobileNav.offsetWidth;
      
      mobileNav.style.transform = 'translateX(0)';
      document.body.style.overflow = 'hidden';
    });
  }

  // Close mobile menu
  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', () => {
      console.log('Close button clicked');
      isMobileNavOpen = false;
      mobileNav.style.transform = 'translateX(100%)';
      
      // Wait for the animation to finish before hiding the menu
      setTimeout(() => {
        mobileNav.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 300);
    });
  }

  // Close mobile menu when clicking links
  mobileLinks.forEach(link => {
    if (link && mobileNav) {
      link.addEventListener('click', () => {
        console.log('Mobile link clicked');
        isMobileNavOpen = false;
        mobileNav.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
          mobileNav.style.display = 'none';
          document.body.style.overflow = 'auto';
        }, 300);
      });
    }
  });

  // Close mobile nav on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileNavOpen && mobileNav) {
      console.log('Escape key pressed');
      isMobileNavOpen = false;
      mobileNav.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        mobileNav.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 300);
    }
  });
});