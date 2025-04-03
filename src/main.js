import '../styles/modern-normalize.css';
import '../styles/colors.css';
import '../styles/style.css';
import '../styles/components/header.css';
import '../styles/components/hero.css';
import '../styles/components/about.css';
import '../styles/components/featured.css';
import '../styles/components/work.css';
import '../styles/components/contact.css';
import '../styles/components/footer.css';
import '../styles/components/mobile-nav.css';
import '../styles/components/three-effects.css';
import '../styles/components/skills-panel.css';
import '../styles/components/loader.css';
import '../styles/utils.css';

// Import utilities
import mobileNav from './utils/mobile-nav';
import darkMode from './utils/dark-mode';
import lazyLoading from './utils/lazy-loading';
import animations from './utils/animations';
import loader from './utils/loader';
// import fireCursor from './utils/fire-cursor';
import threeBackground from './utils/three-background';
import skillsGlobe from './utils/skills-globe';
import projectModel from './utils/project-model';
import positionSkillsPanel from './utils/position-skills-panel';

// Initialize loader first
loader();

// Initialize basic components next
mobileNav();
darkMode();
lazyLoading();
animations();
// fireCursor();

// Remove any existing cursor containers
document.addEventListener('DOMContentLoaded', () => {
  const cursorContainer = document.querySelector('.cursor-container');
  if (cursorContainer) {
    cursorContainer.remove();
  }
});

// THREE.js components initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking for THREE...');
  
  // Check if THREE is available from the CDN
  if (window.THREE) {
    console.log('THREE is available, initializing components');
    
    // Initialize THREE components
    setTimeout(() => {
      try {
        threeBackground();
        console.log('Background initialized');
        
        setTimeout(() => {
          try {
          skillsGlobe();
          console.log('Skills globe initialized');
            
            // Position the skills panel after globe initialization
            positionSkillsPanel();
            
            // Project model initialization disabled to remove hover effects
            // setTimeout(() => {
            //   try {
            //     projectModel();
            //     console.log('Project model initialized');
            //   } catch (e) {
            //     console.error('Project model error:', e);
            //   }
            // }, 200);
          } catch (e) {
            console.error('Skills globe error:', e);
          }
        }, 200);
      } catch (e) {
        console.error('Three background error:', e);
      }
    }, 500);
  } else {
    console.error('THREE is not available from CDN');
    showThreeJsError();
  }
});

// Function to show an error message when Three.js fails
const showThreeJsError = () => {
  const skillsContainer = document.querySelector('.skills-container');
  if (skillsContainer) {
    skillsContainer.style.display = 'flex';
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'threejs-error';
    errorMsg.innerHTML = `
      <p>3D visualization couldn't be loaded.</p>
      <p>Please ensure WebGL is enabled in your browser or try a different browser.</p>
    `;
    
    skillsContainer.parentNode.insertBefore(errorMsg, skillsContainer.nextSibling);
  }
};

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  });
});

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  document.querySelectorAll('.header__link a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});