import '../styles/modern-normalize.css';
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
import '../styles/utils.css';

import mobileNav from './utils/mobile-nav';
import darkMode from './utils/dark-mode';
import lazyLoading from './utils/lazy-loading';
import animations from './utils/animations';
import fireCursor from './utils/fire-cursor';

// Initialize basic components first
mobileNav();
darkMode();
lazyLoading();
animations();
fireCursor();

// Load Three.js effects
let threeJsLoaded = false;
const loadThreeJs = async () => {
  try {
    // Import Three.js and the visualization components
    const Three = await import('three');
    window.THREE = Three; // Make THREE globally available
    
    console.log('Three.js loaded successfully');
    
    // Import our three.js components
    const threeBackgroundModule = await import('./utils/three-background.js');
    const skillsGlobeModule = await import('./utils/skills-globe.js');
    const projectModelModule = await import('./utils/project-model.js');
    
    // Initialize components with a small delay
    setTimeout(() => {
      try {
        threeBackgroundModule.default();
        skillsGlobeModule.default();
        projectModelModule.default();
        threeJsLoaded = true;
        console.log('Three.js components initialized');
      } catch (error) {
        console.error('Error initializing Three.js components:', error);
        showThreeJsError();
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to load Three.js:', error);
    showThreeJsError();
  }
};

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

// Check if browser supports WebGL and load Three.js
if (window.WebGLRenderingContext) {
  // Create a temporary canvas to check WebGL support
  const canvas = document.createElement('canvas');
  let gl;
  
  try {
    // Try to get WebGL context
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      // WebGL is supported, load Three.js
      loadThreeJs();
    } else {
      console.warn('WebGL context failed, 3D effects disabled');
      showThreeJsError();
    }
  } catch (e) {
    console.error('Error checking WebGL support:', e);
    showThreeJsError();
  }
} else {
  console.warn('WebGL not supported, 3D effects disabled');
  showThreeJsError();
}

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