const mobileNav = () => {
  const headerBtn = document.querySelector('.header__bars');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');
  const closeBtn = document.querySelector('.mobile-nav__close');
  
  // State
  let isMobileNavOpen = false;
  
  const openMobileNav = () => {
    isMobileNavOpen = true;
    mobileNav.style.display = 'flex';
    mobileNav.classList.add('active');
    document.body.style.overflowY = 'hidden';
  };
  
  const closeMobileNav = () => {
    isMobileNavOpen = false;
    mobileNav.classList.remove('active');
    setTimeout(() => {
      mobileNav.style.display = 'none';
      document.body.style.overflowY = 'auto';
    }, 300);
  };

  if (headerBtn) {
    headerBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event from bubbling up
      openMobileNav();
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent event from bubbling up
      closeMobileNav();
    });
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
  
  // Close mobile nav on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileNavOpen) {
      closeMobileNav();
    }
  });
  
  // Close mobile nav on outside click
  document.addEventListener('click', (e) => {
    // Only close if mobile nav is open and the click is outside the nav
    // and not on the hamburger button or its children
    if (isMobileNavOpen && 
        mobileNav && !mobileNav.contains(e.target) && 
        headerBtn && !headerBtn.contains(e.target)) {
      closeMobileNav();
    }
  });
};

export default mobileNav;