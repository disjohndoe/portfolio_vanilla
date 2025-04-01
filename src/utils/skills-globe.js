const skillsGlobe = () => {
  if (!window.THREE) {
    console.error("THREE.js not loaded for skills globe");
    return;
  }
  
  const THREE = window.THREE;
  
  if (!document.querySelector('.about')) return;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.classList.add('skills-globe');
  canvas.classList.add('three-canvas-container');
  
  // Find the skills container and append the canvas
  const skillsContainer = document.querySelector('.skills-container');
  if (!skillsContainer) return;
  
  // Replace the skills container with our canvas
  skillsContainer.style.display = 'none';
  skillsContainer.parentNode.insertBefore(canvas, skillsContainer.nextSibling);
  
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'three-loading';
  canvas.appendChild(loadingIndicator);
  
  // Create container for skill labels
  const labelsContainer = document.createElement('div');
  labelsContainer.className = 'skill-labels-container';
  labelsContainer.style.position = 'absolute';
  labelsContainer.style.top = '0';
  labelsContainer.style.left = '0';
  labelsContainer.style.width = '100%';
  labelsContainer.style.height = '100%';
  labelsContainer.style.pointerEvents = 'none';
  canvas.appendChild(labelsContainer);
  
  // Add styles for labels if not already in CSS
  const style = document.createElement('style');
  style.textContent = `
    .skill-label {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      white-space: nowrap;
      transition: transform 0.2s ease;
    }
    .skill-label.focused {
      background-color: rgba(255, 50, 50, 0.9);
      font-weight: bold;
      transform: scale(1.2);
    }
  `;
  document.head.appendChild(style);
  
  // Get skills data from the DOM
  const skillsData = [];
  document.querySelectorAll('.skill-badge').forEach(badge => {
    // Extract the skill name and icon
    const text = badge.textContent.trim();
    const icon = badge.querySelector('i') ? badge.querySelector('i').className : '';
    
    skillsData.push({
      name: text,
      icon: icon
    });
  });
  
  // Setup Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Create a sphere for the globe
  const globeGeometry = new THREE.SphereGeometry(2, 32, 32);
  const globeMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);
  
  // Create particles for each skill
  const particles = [];
  const skillLabels = [];
  
  skillsData.forEach((skill, index) => {
    // Create a sphere for the skill
    const geometry = new THREE.SphereGeometry(0.15, 16, 16); // Slightly larger
    const material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    const particle = new THREE.Mesh(geometry, material);
    
    // Position the particle on the globe surface with better distribution
    const phi = Math.acos(-1 + (2 * index) / skillsData.length);
    const theta = Math.sqrt(skillsData.length * Math.PI) * phi;
    
    particle.position.x = 2 * Math.cos(theta) * Math.sin(phi);
    particle.position.y = 2 * Math.sin(theta) * Math.sin(phi);
    particle.position.z = 2 * Math.cos(phi);
    
    particle.userData = { 
      skill: skill.name,
      index: index, 
      theta: theta,
      phi: phi
    };
    particles.push(particle);
    scene.add(particle);
    
    // Create a label for the skill
    const skillLabel = document.createElement('div');
    skillLabel.className = 'skill-label';
    skillLabel.textContent = skill.name;
    skillLabel.style.display = 'block'; // Always visible
    labelsContainer.appendChild(skillLabel);
    skillLabels.push(skillLabel);
  });
  
  // Add raycaster for interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Track focused skill
  let focusedSkill = null;
  let focusedLabelIndex = -1;
  
  // Handle mouse movement 
  canvas.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(particles);
    
    // Reset hover effect on all particles except focused one
    particles.forEach((particle, index) => {
      if (particle !== focusedSkill) {
        particle.material.color.set(0x00aaff);
        particle.scale.set(1, 1, 1);
      }
    });
    
    // Handle intersection for hover effect
    if (intersects.length > 0) {
      const intersection = intersects[0];
      const particleIndex = particles.indexOf(intersection.object);
      
      if (particleIndex !== -1 && intersection.object !== focusedSkill) {
        // Highlight the particle on hover
        intersection.object.material.color.set(0xff9900);
        intersection.object.scale.set(1.5, 1.5, 1.5);
      }
    }
  });
  
  // Handle click event for focusing on a skill
  canvas.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections with particles only
    const intersects = raycaster.intersectObjects(particles);
    
    if (intersects.length > 0) {
      const clickedParticle = intersects[0].object;
      const particleIndex = particles.indexOf(clickedParticle);
      
      // If we already had a focused skill, unfocus it
      if (focusedSkill && focusedLabelIndex !== -1) {
        // Reset previous focus
        focusedSkill.material.color.set(0x00aaff);
        focusedSkill.scale.set(1, 1, 1);
        skillLabels[focusedLabelIndex].classList.remove('focused');
        focusedSkill = null;
        focusedLabelIndex = -1;
      }
      
      // If we clicked a different skill, focus it
      if (clickedParticle !== focusedSkill) {
        focusedSkill = clickedParticle;
        focusedLabelIndex = particleIndex;
        focusedSkill.material.color.set(0xff0000);
        focusedSkill.scale.set(2, 2, 2);
        skillLabels[focusedLabelIndex].classList.add('focused');
      }
    } else {
      // Clicked outside any skill, clear focus
      if (focusedSkill && focusedLabelIndex !== -1) {
        focusedSkill.material.color.set(0x00aaff);
        focusedSkill.scale.set(1, 1, 1);
        skillLabels[focusedLabelIndex].classList.remove('focused');
        focusedSkill = null;
        focusedLabelIndex = -1;
      }
    }
  });
  
  // Update label positions based on particle positions
  const updateLabelPositions = () => {
    const canvas_rect = canvas.getBoundingClientRect();
    const canvas_width = canvas_rect.width;
    const canvas_height = canvas_rect.height;
    
    particles.forEach((particle, index) => {
      const skillLabel = skillLabels[index];
      
      // Get the screen position of the particle
      const vector = new THREE.Vector3();
      vector.copy(particle.position);
      vector.project(camera);
      
      // Convert to screen coordinates
      const x = (vector.x * 0.5 + 0.5) * canvas_width;
      const y = (-vector.y * 0.5 + 0.5) * canvas_height;
      
      // Only show labels for particles that are in front of the globe (z > 0)
      if (particle.position.z > 0) {
        skillLabel.style.display = 'block';
        skillLabel.style.left = `${x}px`;
        skillLabel.style.top = `${y}px`;
        
        // Add depth effect - particles further back are more transparent
        const opacity = 0.7 + 0.3 * (particle.position.z / 2);
        skillLabel.style.opacity = opacity.toString();
      } else {
        // Hide labels for particles behind the globe
        skillLabel.style.display = 'none';
      }
    });
  };
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    // Rotate the globe
    globe.rotation.y += 0.002;
    
    // Update particles positioning on globe
    particles.forEach((particle, index) => {
      // Only update particles that aren't focused
      if (particle !== focusedSkill) {
        // Get the original angles
        const phi = particle.userData.phi;
        const theta = particle.userData.theta;
        
        // Rotate around Y axis
        const x = 2 * Math.cos(theta + globe.rotation.y) * Math.sin(phi);
        const z = 2 * Math.cos(phi);
        const y = 2 * Math.sin(theta + globe.rotation.y) * Math.sin(phi);
        
        particle.position.set(x, y, z);
      }
    });
    
    // Update label positions
    updateLabelPositions();
    
    renderer.render(scene, camera);
    
    // Remove loading indicator once rendered
    if (loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  };
  
  // Handle window resize
  window.addEventListener('resize', () => {
    const newWidth = canvas.clientWidth;
    const newHeight = canvas.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
  
  // Initial resize to make sure everything is sized correctly
  setTimeout(() => {
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }, 100);
  
  // Start animation
  animate();
};

export default skillsGlobe;