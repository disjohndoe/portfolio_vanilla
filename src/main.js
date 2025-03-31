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
import threeBackground from './utils/three-background';
import skillsGlobe from './utils/skills-globe';
import projectModel from './utils/project-model';
import fireCursor from './utils/fire-cursor';

// Initialize components
mobileNav();
darkMode();
lazyLoading();
animations();

// Initialize 3D effects
// Check if browser supports WebGL
if (window.WebGLRenderingContext) {
  // Create a temporary canvas to check WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (gl) {
    // Load Three.js dynamically
    import('three').then(() => {
      console.log('Three.js loaded successfully');
      
      // Add a small delay to ensure DOM is fully loaded
      setTimeout(() => {
        threeBackground();
        skillsGlobe();
        projectModel();
      }, 500);
    }).catch(error => {
      console.error('Failed to load Three.js:', error);
    });
  } else {
    console.warn('WebGL not supported, 3D effects disabled');
  }
} else {
  console.warn('WebGL not supported, 3D effects disabled');
}

// Add fire cursor effect
fireCursor();

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