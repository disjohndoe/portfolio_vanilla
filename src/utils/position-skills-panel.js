/**
 * Utility to position skills panel optimized for all screen sizes
 */
const positionSkillsPanel = () => {
  // Find the skills globe canvas and skills info panel
  const skillsInfoPanel = document.querySelector('.skills-info-display');
  const globeContainer = document.querySelector('.globe-container');
  
  // Add debugging info for mobile devices
  const isMobile = window.innerWidth <= 768;
  if (isMobile && globeContainer) {
    console.log('Mobile device detected, size:', window.innerWidth, 'x', window.innerHeight);
    console.log('Globe container found:', globeContainer);
    console.log('Globe dimensions:', globeContainer.clientWidth, 'x', globeContainer.clientHeight);
    
    // Force the container to be visible
    globeContainer.style.display = 'block';
    globeContainer.style.visibility = 'visible';
    globeContainer.style.minHeight = '300px';
    
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL not supported on this device');
        // Add a fallback message to the container
        const fallback = document.createElement('div');
        fallback.className = 'globe-fallback';
        fallback.textContent = 'Interactive 3D skills globe';
        fallback.style.position = 'absolute';
        fallback.style.top = '50%';
        fallback.style.left = '50%';
        fallback.style.transform = 'translate(-50%, -50%)';
        fallback.style.textAlign = 'center';
        fallback.style.color = 'white';
        fallback.style.zIndex = '104';
        fallback.style.padding = '20px';
        fallback.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        globeContainer.appendChild(fallback);
      } else {
        console.log('WebGL is supported on this device');
      }
    } catch (e) {
      console.warn('Error checking WebGL support:', e);
    }
  }
  
  if (!skillsInfoPanel) return;
  
  // Add a class to the overall wrapper to identify it for CSS targeting
  const overallWrapper = skillsInfoPanel.parentNode;
  if (overallWrapper) {
    overallWrapper.classList.add('globe-skills-wrapper');
  }
  
  // Handle mobile responsiveness
  const handleResize = () => {
    const width = window.innerWidth;
    
    if (overallWrapper) {
      // Switch to column layout at 768px breakpoint
      if (width <= 768) {
        overallWrapper.style.flexDirection = 'column';
        overallWrapper.style.alignItems = 'center';
        
        // Force the globe container to be visible
        if (globeContainer) {
          const globeWrapper = globeContainer.parentElement;
          if (globeWrapper) {
            globeWrapper.style.display = 'block';
            globeWrapper.style.visibility = 'visible';
            globeWrapper.style.width = '100%';
            globeWrapper.style.maxWidth = '100%';
          }
          
          globeContainer.style.display = 'block';
          globeContainer.style.visibility = 'visible';
          globeContainer.style.height = width <= 480 ? '350px' : '450px';
          globeContainer.style.minHeight = width <= 480 ? '250px' : '300px';
        }
        
        // Adjust panel width based on screen size
        if (width <= 480) {
          skillsInfoPanel.style.width = '92%';
          skillsInfoPanel.style.maxHeight = '250px';
        } else {
          skillsInfoPanel.style.width = '80%';
          skillsInfoPanel.style.maxWidth = '450px';
          skillsInfoPanel.style.maxHeight = '300px';
        }
        
        // Reset margin left that might be set in larger screens
        skillsInfoPanel.style.marginLeft = '0';
        skillsInfoPanel.style.marginTop = '20px';
        
        // Ensure globe container takes full width
        if (globeContainer) {
          globeContainer.parentElement.style.maxWidth = '100%';
        }
      } else {
        // Row layout for larger screens
        overallWrapper.style.flexDirection = 'row';
        overallWrapper.style.alignItems = 'stretch';
        
        // Reset panel to original size
        skillsInfoPanel.style.width = '220px';
        skillsInfoPanel.style.marginTop = '0';
        skillsInfoPanel.style.maxHeight = '650px';
        
        // On tablets, ensure panel isn't too far from globe
        if (width <= 992) {
          skillsInfoPanel.style.marginLeft = '15px';
        } else {
          skillsInfoPanel.style.marginLeft = '20px';
        }
        
        // Limit globe container width on larger screens
        if (globeContainer) {
          globeContainer.parentElement.style.maxWidth = '70%';
        }
      }
    }
  };
  
  // Initial responsive setup
  handleResize();
  
  // Listen for window resize
  window.addEventListener('resize', handleResize);
};

export default positionSkillsPanel;