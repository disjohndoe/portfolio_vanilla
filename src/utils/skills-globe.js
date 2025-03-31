import * as THREE from 'three';

const skillsGlobe = () => {
  if (!document.querySelector('.about')) return;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.classList.add('skills-globe');
  
  // Find the skills container and append the canvas
  const skillsContainer = document.querySelector('.skills-container');
  if (!skillsContainer) return;
  
  // Replace the skills container with our canvas
  skillsContainer.style.display = 'none';
  skillsContainer.parentNode.insertBefore(canvas, skillsContainer.nextSibling);
  
  // Get skills data from the DOM
  const skills = [];
  document.querySelectorAll('.skill-badge').forEach(badge => {
    skills.push(badge.textContent.trim());
  });
  
  // Initialize scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: true,
    antialias: true 
  });
  
  // Set size based on container
  const setSize = () => {
    const width = canvas.clientWidth;
    const height = 400; // Fixed height
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    canvas.style.height = `${height}px`;
  };
  
  setSize();
  window.addEventListener('resize', setSize);
  
  // Create text sprites for skills
  const createTextSprite = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Background
    context.fillStyle = 'rgba(30, 30, 40, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = '#4361ee';
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Text
    context.font = '32px Inter, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    
    // Create material with texture
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1, 0.5, 1);
    
    return sprite;
  };
  
  // Create globe of skills
  const radius = 3;
  const skillSprites = [];
  
  skills.forEach((skill, index) => {
    const phi = Math.acos(-1 + (2 * index) / skills.length);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    
    const sprite = createTextSprite(skill);
    
    sprite.position.x = radius * Math.sin(phi) * Math.cos(theta);
    sprite.position.y = radius * Math.sin(phi) * Math.sin(theta);
    sprite.position.z = radius * Math.cos(phi);
    
    scene.add(sprite);
    skillSprites.push({
      sprite,
      initialPosition: sprite.position.clone()
    });
  });
  
  // Add some particles for effect
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 200;
  const positions = new Float32Array(particlesCount * 3);
  
  for(let i = 0; i < particlesCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radiusRandom = radius * (0.6 + Math.random() * 0.4);
    positions[i * 3] = Math.cos(angle) * radiusRandom;
    positions[i * 3 + 1] = (Math.random() - 0.5) * radiusRandom;
    positions[i * 3 + 2] = Math.sin(angle) * radiusRandom;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x4361ee,
    size: 0.05,
    transparent: true
  });
  
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  
  // Create connections between nodes (skills)
  const connectionsGeometry = new THREE.BufferGeometry();
  const linePositions = [];
  
  for(let i = 0; i < skillSprites.length; i++) {
    for(let j = i + 1; j < skillSprites.length; j++) {
      // Only connect some nodes to avoid too many lines
      if (Math.random() > 0.8) {
        const pos1 = skillSprites[i].sprite.position;
        const pos2 = skillSprites[j].sprite.position;
        
        linePositions.push(pos1.x, pos1.y, pos1.z);
        linePositions.push(pos2.x, pos2.y, pos2.z);
      }
    }
  }
  
  connectionsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  
  const connectionsMaterial = new THREE.LineBasicMaterial({
    color: 0xff0066,
    transparent: true,
    opacity: 0.3
  });
  
  const connections = new THREE.LineSegments(connectionsGeometry, connectionsMaterial);
  scene.add(connections);
  
  // Position camera
  camera.position.z = 7;
  
  // Mouse control
  const mouse = {
    x: 0,
    y: 0
  };
  
  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  });
  
  // Animation
  const clock = new THREE.Clock();
  
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate entire scene based on mouse
    scene.rotation.y = mouse.x * 0.5;
    scene.rotation.x = mouse.y * 0.5;
    
    // Pulse effect for skills
    skillSprites.forEach((skillData, index) => {
      const { sprite, initialPosition } = skillData;
      const pulseSpeed = 0.5;
      const pulseAmount = 0.05;
      
      // Make each skill pulse at a different rate
      const pulse = Math.sin(elapsedTime * pulseSpeed + index) * pulseAmount;
      
      // Apply pulse to position
      sprite.position.x = initialPosition.x * (1 + pulse);
      sprite.position.y = initialPosition.y * (1 + pulse);
      sprite.position.z = initialPosition.z * (1 + pulse);
      
      // Make sprites always face the camera
      sprite.lookAt(camera.position);
    });
    
    // Rotate particles
    particles.rotation.y = elapsedTime * 0.05;
    
    // Render
    renderer.render(scene, camera);
    
    // Call animate again on the next frame
    requestAnimationFrame(animate);
  };
  
  animate();
};

export default skillsGlobe;