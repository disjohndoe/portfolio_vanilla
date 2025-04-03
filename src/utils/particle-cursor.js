const particleCursor = () => {
  // Create cursor container
  const cursorContainer = document.createElement('div');
  cursorContainer.classList.add('cursor-container');
  document.body.appendChild(cursorContainer);
  
  // Create main cursor
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursorContainer.appendChild(cursor);
  
  // Add styling
  const style = document.createElement('style');
  style.textContent = `
    .cursor-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    }
    
    .cursor {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,0,102,0.5) 0%, rgba(67,97,238,0) 70%);
      transform: translate(-50%, -50%);
      transition: width 0.3s, height 0.3s, background 0.3s;
      mix-blend-mode: screen;
    }
    
    .particle {
      position: absolute;
      background: linear-gradient(90deg, var(--clr-primary), var(--clr-secondary));
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9998;
      opacity: 0.7;
      mix-blend-mode: screen;
    }
    
    a:hover ~ .cursor-container .cursor,
    button:hover ~ .cursor-container .cursor {
      width: 50px;
      height: 50px;
      background: radial-gradient(circle, rgba(255,0,102,0.3) 0%, rgba(67,97,238,0) 70%);
    }
  `;
  document.head.appendChild(style);
  
  // Mouse position
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  
  // Track mouse position
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  
  // Store particles
  const particles = [];
  const particleCount = 15;
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    cursorContainer.appendChild(particle);
    
    particles.push({
      element: particle,
      x: 0,
      y: 0,
      size: Math.random() * 5 + 3,
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 - 1,
      life: 0,
      maxLife: Math.random() * 100 + 50
    });
  }
  
  // Animation
  const animate = () => {
    // Smooth cursor movement
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;
    
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    
    // Update particles
    particles.forEach(particle => {
      // Decrease life
      particle.life++;
      
      // Reset dead particles
      if (particle.life >= particle.maxLife) {
        particle.life = 0;
        particle.x = cursorX;
        particle.y = cursorY;
        particle.speedX = Math.random() * 4 - 2;
        particle.speedY = Math.random() * 4 - 2;
      }
      
      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Fade out based on life
      const opacity = 1 - (particle.life / particle.maxLife);
      const scale = 1 - (particle.life / particle.maxLife) * 0.5;
      
      // Apply styles
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
      particle.element.style.width = `${particle.size * scale}px`;
      particle.element.style.height = `${particle.size * scale}px`;
      particle.element.style.opacity = opacity;
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
  
  // Hide cursor on mouse leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    particles.forEach(particle => {
      particle.element.style.opacity = '0';
    });
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
  
  // Show special cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .work-card, .skill-badge');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    
    element.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
};

export default particleCursor;