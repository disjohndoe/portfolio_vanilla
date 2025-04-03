const darkMode = () => {
    const themeToggleBtns = document.querySelectorAll('#theme-toggle');
  
    // State
    const theme = localStorage.getItem('theme');
  
    // On mount
    theme && document.body.classList.add(theme);
    
    // Fix category filters styling for current theme
    updateCategoryFiltersStyles(document.body.classList.contains('light-mode'));
  
    // Handlers
    const handleThemeToggle = () => {
      document.body.classList.toggle('light-mode');
      const isLightMode = document.body.classList.contains('light-mode');
      
      if (isLightMode) {
        localStorage.setItem('theme', 'light-mode');
      } else {
        localStorage.removeItem('theme');
        document.body.removeAttribute('class');
      }
      
      // Update category filters styling
      updateCategoryFiltersStyles(isLightMode);
    };
    
    // Function to fix category filters text color
    const updateCategoryFiltersStyles = (isLightMode) => {
      // Wait a bit to ensure DOM is ready
      setTimeout(() => {
        // Update the title
        const skillsTitle = document.querySelector('.skills-info-display > div:first-child');
        if (skillsTitle) {
          if (isLightMode) {
            skillsTitle.style.color = '#070a13'; // Dark text for light mode
            skillsTitle.style.borderBottom = '1px solid rgba(7, 10, 19, 0.3)'; // Darker border for light mode
          } else {
            skillsTitle.style.color = 'white'; // White text for dark mode
            skillsTitle.style.borderBottom = '1px solid rgba(255, 255, 255, 0.3)'; // Original border
          }
        }
        
        // Update the description
        const skillsDesc = document.querySelector('.skills-info-display > div:nth-child(2)');
        if (skillsDesc) {
          skillsDesc.style.color = isLightMode ? '#070a13' : 'white';
        }
        
        // Update category filters
        const categoryFilters = document.querySelectorAll('.category-filters .category-filter');
        
        if (categoryFilters.length > 0) {
          categoryFilters.forEach(filter => {
            // Direct style modification to override inline styles
            if (isLightMode) {
              filter.style.color = '#070a13'; // Dark text for light mode
              // Use darker background colors for better contrast in light mode
              filter.style.backgroundColor = filter.classList.contains('active') 
                ? 'rgba(12, 78, 162, 0.2)' // Blue tint for active filter
                : 'rgba(7, 10, 19, 0.1)'; // Light dark background for others
            } else {
              filter.style.color = 'white'; // White text for dark mode
              filter.style.backgroundColor = filter.classList.contains('active')
                ? 'rgba(255, 255, 255, 0.2)' // Original active color
                : 'rgba(255, 255, 255, 0.1)'; // Original inactive color
            }
          });
        }
      }, 100);
    };
  
    // Events
    themeToggleBtns.forEach(btn =>
      btn.addEventListener('click', handleThemeToggle)
    );
  };
  
  export default darkMode;