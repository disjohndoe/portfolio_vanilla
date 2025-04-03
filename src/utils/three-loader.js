// A specialized loader for THREE.js components that defers loading
// until the hero section and critical UI elements are visible

const loadThreeComponents = () => {
  // Dynamically import THREE.js components after a delay
  return new Promise((resolve) => {
    // Wait for critical content to be visible
    setTimeout(() => {
      // Create a function to load THREE.js components
      const loadComponents = async () => {
        try {
          // First check if THREE is available
          if (!window.THREE) {
            console.error("THREE.js not loaded, cannot initialize 3D components");
            resolve(false);
            return;
          }
          
          // Dynamically import components
          const threeBackgroundModule = await import('./three-background.js');
          const threeBackground = threeBackgroundModule.default;
          
          // Initialize background first
          threeBackground();
          console.log('THREE.js background initialized');
          
          // Add loaded class to any THREE canvas
          const threeCanvas = document.querySelector('.three-canvas');
          if (threeCanvas) {
            setTimeout(() => {
              threeCanvas.classList.add('loaded');
            }, 100);
          }
          
          // Then load skills globe with further delay
          setTimeout(async () => {
            try {
              const skillsGlobeModule = await import('./skills-globe.js');
              const skillsGlobe = skillsGlobeModule.default;
              skillsGlobe();
              console.log('Skills globe initialized');
              
              // Position the skills panel after skills globe
              const positionSkillsPanelModule = await import('./position-skills-panel.js');
              const positionSkillsPanel = positionSkillsPanelModule.default;
              positionSkillsPanel();
              
              resolve(true);
            } catch (e) {
              console.error('Error loading skills globe:', e);
              resolve(false);
            }
          }, 800);
        } catch (e) {
          console.error('Error loading THREE.js components:', e);
          resolve(false);
        }
      };
      
      // Start loading components
      loadComponents();
    }, 1200); // Wait for hero section to be fully visible
  });
};

export default loadThreeComponents;