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
    }
  };
  
  // Initial check
  handleResize();
  
  // Listen for window resize
  window.addEventListener('resize', handleResize);
};

export default positionSkillsPanel;