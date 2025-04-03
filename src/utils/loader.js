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
  
  // Mark content sections for progressive loading
  const contentSections = [
    'section.hero',
    'section.about',
    'section.featured',
    'section.work',
    'section.contact',
    'footer'
  ];
  
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    // Find all content sections and add the class
    contentSections.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.classList.add('content-section'));
    });
    
    // Once DOM is ready, allow showing header and basic structure
    document.body.classList.remove('loading-start');
    
    // Track images and critical resources loading
    let imagesLoaded = 0;
    const imagesToLoad = document.querySelectorAll('img').length;
    
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
          img.addEventListener('error', imageLoaded); // Count errors as loaded to avoid hanging
        }
      });
    }
    
    function imageLoaded() {
      imagesLoaded++;
      const progress = imagesLoaded / imagesToLoad;
      
      // When all images are loaded, remove loader
      if (progress >= 1) {
        removeLoader();
      }
    }
  });
  
  // When page is fully loaded, ensure all content is visible
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('loaded');
      });
      
      // Ensure loader is removed
      removeLoader();
    }, 200);
  });
  
  function removeLoader() {
    // Short delay to ensure a minimum loading time for better UX
    setTimeout(() => {
      // Make sure all sections are revealed
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('loaded');
      });
      
      // Remove loader with fade out
      loaderContainer.classList.add('hidden');
      
      // Remove loader after transition
      setTimeout(() => {
        loaderContainer.remove();
      }, 500);
    }, 600);
  }
}