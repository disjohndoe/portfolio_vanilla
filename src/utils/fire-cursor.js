const fireCursor = () => {
  // Create cursor container
  const cursorContainer = document.createElement('div');
  cursorContainer.classList.add('cursor-container');
  document.body.appendChild(cursorContainer);
  
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
    
    .fire-particle {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 9998;
      mix-blend-mode: screen;
    }
    
    .fire-cursor-center {
      position: absolute;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,140,0,0.9) 0%, rgba(255,69,0,0.5) 60%, rgba(255,0,0,0) 100%);
      transform: translate(-50%, -50%);
      filter: blur(2px);
      pointer-events: none;
      z-index: 10000;
      mix-blend-mode: screen;
    }
    
    /* Special hover effect for interactive elements */
    a:hover ~ .cursor-container .fire-cursor-center,
    button:hover ~ .cursor-container .fire-cursor-center,
    .work-card:hover ~ .cursor-container .fire-cursor-center,
    .skill-badge:hover ~ .cursor-container .fire-cursor-center {
      width: 30px;
      height: 30px;
      background: radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,140,0,0.7) 60%, rgba(255,0,0,0) 100%);
      filter: blur(3px);
    }
  `;
  document.head.appendChild(style);
  
  // Create center cursor
  const cursorCenter = document.createElement('div');
  cursorCenter.classList.add('fire-cursor-center');
  cursorContainer.appendChild(cursorCenter);
  
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
  const MAX_PARTICLES = 60;
  const particles = [];
  
  // Fire color palette
  const fireColors = [
    'rgba(255, 255, 0, 0.8)',   // Yellow
    'rgba(255, 165, 0, 0.8)',   // Orange
    'rgba(255, 140, 0, 0.8)',   // Dark Orange
    'rgba(255, 69, 0, 0.8)',    // Red-Orange
    'rgba(255, 0, 0, 0.8)',     // Red
    'rgba(139, 0, 0, 0.6)'      // Dark Red
  ];
  
  // Create initial particle pool
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const particle = document.createElement('div');
    particle.classList.add('fire-particle');
    cursorContainer.appendChild(particle);
    
    particles.push({
      element: particle,
      x: 0,
      y: 0,
      size: Math.random() * 8 + 2,
      speedX: 0,
      speedY: 0,
      life: 0,
      maxLife: 0,
      active: false,
      color: fireColors[Math.floor(Math.random() * fireColors.length)]
    });
  }
  
  // Emit new particles
  let lastEmitTime = 0;
  
  const emitParticles = (currentTime) => {
    // Emit particles every 10ms
    if (currentTime - lastEmitTime > 10) {
      lastEmitTime = currentTime;
      
      // Find inactive particles to reuse
      for (let i = 0; i < 3; i++) {
        const inactiveParticle = particles.find(p => !p.active);
        if (inactiveParticle) {
          // Randomize particle properties
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 1;
          
          // Set particle properties
          inactiveParticle.x = cursorX;
          inactiveParticle.y = cursorY;
          inactiveParticle.speedX = Math.cos(angle) * speed * (Math.random() * 0.5 + 0.5);
          inactiveParticle.speedY = (Math.sin(angle) * speed - 3) * (Math.random() * 0.5 + 0.5); // Upward bias
          inactiveParticle.life = 0;
          inactiveParticle.maxLife = Math.random() * 40 + 20;
          inactiveParticle.color = fireColors[Math.floor(Math.random() * fireColors.length)];
          inactiveParticle.active = true;
          inactiveParticle.size = Math.random() * 8 + 2;
        }
      }
    }
  };
  
  // Animation
  const animate = (currentTime) => {
    // Smooth cursor movement
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Update cursor center
    cursorCenter.style.left = `${cursorX}px`;
    cursorCenter.style.top = `${cursorY}px`;
    
    // Emit new particles
    emitParticles(currentTime);
    
    // Update particles
    particles.forEach(particle => {
      if (particle.active) {
        // Increase life
        particle.life++;
        
        // Deactivate dead particles
        if (particle.life >= particle.maxLife) {
          particle.active = false;
          particle.element.style.display = 'none';
          return;
        }
        
        // Apply gravity and friction
        particle.speedY += 0.07; // Gravity
        particle.speedX *= 0.99; // Air resistance
        
        // Add some random movement for fire effect
        particle.speedX += (Math.random() - 0.5) * 0.2;
        
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Calculate size and opacity based on life
        const lifeRatio = particle.life / particle.maxLife;
        const size = particle.size * (1 - lifeRatio * 0.5);
        const opacity = 1 - lifeRatio;
        
        // Choose color based on life (younger particles are more yellowish)
        const colorIndex = Math.min(Math.floor(lifeRatio * fireColors.length), fireColors.length - 1);
        
        // Apply styles
        particle.element.style.display = 'block';
        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
        particle.element.style.width = `${size}px`;
        particle.element.style.height = `${size}px`;
        particle.element.style.backgroundColor = particle.color;
        particle.element.style.opacity = opacity;
        
        // Add blur for a more fire-like effect
        particle.element.style.filter = `blur(${1 + lifeRatio * 2}px)`;
      }
    });
    
    requestAnimationFrame(animate);
  };
  
  // Start animation
  animate(0);
  
  // Hide cursor on mouse leave
  document.addEventListener('mouseleave', () => {
    cursorCenter.style.opacity = '0';
    particles.forEach(particle => {
      particle.element.style.opacity = '0';
    });
  });
  
  document.addEventListener('mouseenter', () => {
    cursorCenter.style.opacity = '1';
  });
  
  // Show special cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .work-card, .skill-badge');
  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => {
      cursorCenter.classList.add('cursor-hover');
    });
    
    element.addEventListener('mouseleave', () => {
      cursorCenter.classList.remove('cursor-hover');
    });
  });
};

export default fireCursor;