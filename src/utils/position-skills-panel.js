/**
 * Simple utility to position skills panel next to the Three.js canvas
 */
const positionSkillsPanel = () => {
  // Find the skills globe canvas and skills info panel
  const skillsInfoPanel = document.querySelector('.skills-info-display');
  
  if (!skillsInfoPanel) return;
  
  // Add a class to the overall wrapper to identify it for CSS targeting
  const overallWrapper = skillsInfoPanel.parentNode;
  if (overallWrapper) {
    overallWrapper.classList.add('globe-skills-wrapper');
  }
  
  // Handle mobile responsiveness
  const handleResize = () => {
    const isMobile = window.innerWidth <= 600;
    if (overallWrapper) {
      overallWrapper.style.flexDirection = isMobile ? 'column' : 'row';
      
      // Set the globe container height based on screen size
      const globeContainer = document.querySelector('.globe-container');
      if (globeContainer) {
        globeContainer.style.height = isMobile ? '450px' : '650px';
      }
      
      // Adjust the panel height for mobile
      if (skillsInfoPanel) {
        skillsInfoPanel.style.maxHeight = isMobile ? '300px' : '650px';
      }
      
      // Adjust canvas size
      const canvas = document.querySelector('.skills-globe');
      if (canvas) {
        if (isMobile) {
          canvas.style.height = '450px';
        } else {
          canvas.style.height = '650px';
        }
      }
    }
  };
  
  // Initial check
  handleResize();
  
  // Listen for window resize
  window.addEventListener('resize', handleResize);
};

export default positionSkillsPanel;