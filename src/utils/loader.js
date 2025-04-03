export default function loader() {
  // Create loader elements
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'loader-container';
  
  const loader = document.createElement('div');
  loader.className = 'loader';
  
  // Create three concentric circles
  for (let i = 0; i < 3; i++) {
    const circle = document.createElement('div');
    circle.className = 'loader-circle';
    loader.appendChild(circle);
  }
  
  // Add logo/initials in the center
  const logo = document.createElement('div');
  logo.className = 'loader-logo';
  logo.textContent = 'HM';
  loader.appendChild(logo);
  
  loaderContainer.appendChild(loader);
  document.body.prepend(loaderContainer);
  
  // Add initial loading class
  document.body.classList.add('loading-start');
  
  // List of sections in desired loading order
  const contentSectionsInOrder = [
    'section.hero', // Hero first
    'section.about',
    'section.featured',
    'section.work',
    'section.contact',
    'footer'
  ];
  
  // Immediately make the hero section visible, load others progressively
  const showHeroFirst = () => {
    const heroSection = document.querySelector('section.hero');
    if (heroSection) {
      heroSection.classList.add('content-section');
      heroSection.classList.add('loaded');
      heroSection.style.opacity = '1';
      heroSection.style.visibility = 'visible';
      heroSection.style.transform = 'translateY(0)';
    }
    
    // For other sections, prepare them for delayed loading
    contentSectionsInOrder.slice(1).forEach((selector, index) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('content-section');
        el.dataset.loadOrder = index + 1; // Hero is 0, rest follow
      });
    });
    
    // Remove initial loading state to allow header visibility
    document.body.classList.remove('loading-start');
  };
  
  // Call showHeroFirst immediately when script runs
  showHeroFirst();
  
  // Wait for DOM to be ready for the rest of the content
  document.addEventListener('DOMContentLoaded', () => {
    // Remove initial loading spinner quickly
    setTimeout(() => {
      loaderContainer.classList.add('hidden');
      
      // Start loading other sections progressively
      loadRemainingContent();
      
      // Remove loader after transition
      setTimeout(() => {
        loaderContainer.remove();
      }, 300);
    }, 100);
  });
  
  function loadRemainingContent() {
    // Get all non-hero content sections and sort them by load order
    const remainingSections = Array.from(document.querySelectorAll('.content-section:not(.loaded)'));
    
    // Add loaded class with proper delays based on data-load-order
    remainingSections.forEach(section => {
      const delay = parseInt(section.dataset.loadOrder || 0) * 100;
      setTimeout(() => {
        section.classList.add('loaded');
      }, delay);
    });
  }
  
  // Also load any remaining sections when everything is ready
  window.addEventListener('load', () => {
    loadRemainingContent();
  });
}