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
    mobileNav.style.animation = 'slideIn 0.3s forwards';
    document.body.style.overflowY = 'hidden';
  };
  
  const closeMobileNav = () => {
    isMobileNavOpen = false;
    mobileNav.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => {
      mobileNav.style.display = 'none';
      document.body.style.overflowY = 'auto';
    }, 300);
  };
  
  // Add the CSS animations
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); }
      to { transform: translateX(100%); }
    }
    
    .mobile-nav {
      transform: translateX(100%);
    }
  `;
  document.head.appendChild(style);

  headerBtn.addEventListener('click', openMobileNav);
  closeBtn.addEventListener('click', closeMobileNav);

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
    if (isMobileNavOpen && !mobileNav.contains(e.target) && e.target !== headerBtn) {
      closeMobileNav();
    }
  });
};

export default mobileNav;