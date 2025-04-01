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
    const geometry = new THREE.SphereGeometry(0.1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    const particle = new THREE.Mesh(geometry, material);
    
    // Position the particle randomly on the globe surface
    const phi = Math.acos(-1 + (2 * index) / skillsData.length);
    const theta = Math.sqrt(skillsData.length * Math.PI) * phi;
    
    particle.position.x = 2 * Math.cos(theta) * Math.sin(phi);
    particle.position.y = 2 * Math.sin(theta) * Math.sin(phi);
    particle.position.z = 2 * Math.cos(phi);
    
    particle.userData = { skill: skill.name };
    particles.push(particle);
    scene.add(particle);
    
    // Create a label for the skill (we'll handle this with HTML for better text rendering)
    const skillLabel = document.createElement('div');
    skillLabel.className = 'skill-label';
    skillLabel.textContent = skill.name;
    skillLabel.style.position = 'absolute';
    skillLabel.style.display = 'none';
    canvas.appendChild(skillLabel);
    skillLabels.push(skillLabel);
  });
  
  // Add raycaster for interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Track focused skill
  let focusedSkill = null;
  
  // Handle mouse movement to show labels
  canvas.addEventListener('mousemove', (event) => {
    // Calculate mouse position in normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections
    const intersects = raycaster.intersectObjects(particles);
    
    // Reset all particles to default
    particles.forEach((particle, index) => {
      particle.material.color.set(0x00aaff);
      particle.scale.set(1, 1, 1);
      skillLabels[index].style.display = 'none';
    });
    
    // Handle intersection
    if (intersects.length > 0) {
      const intersection = intersects[0];
      const particleIndex = particles.indexOf(intersection.object);
      
      if (particleIndex !== -1) {
        // Highlight the particle
        intersection.object.material.color.set(0xff9900);
        intersection.object.scale.set(1.5, 1.5, 1.5);
        
        // Position and show the label
        const skillLabel = skillLabels[particleIndex];
        skillLabel.style.display = 'block';
        skillLabel.style.left = `${event.clientX}px`;
        skillLabel.style.top = `${event.clientY - 30}px`;
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
      
      // If we already had a focused skill, unfocus it
      if (focusedSkill) {
        // Reset previous focus
        focusedSkill.material.color.set(0x00aaff);
        focusedSkill.scale.set(1, 1, 1);
        focusedSkill = null;
      }
      
      // If we clicked a different skill, focus it
      if (clickedParticle !== focusedSkill) {
        focusedSkill = clickedParticle;
        focusedSkill.material.color.set(0xff0000);
        focusedSkill.scale.set(2, 2, 2);
        
        // You could also do other actions here like showing skill details
        console.log('Focused skill:', clickedParticle.userData.skill);
      }
    } else {
      // Clicked outside any skill, clear focus
      if (focusedSkill) {
        focusedSkill.material.color.set(0x00aaff);
        focusedSkill.scale.set(1, 1, 1);
        focusedSkill = null;
      }
    }
  });
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    // Rotate the globe
    globe.rotation.y += 0.002;
    
    // Keep particles positioned on globe but don't rotate them
    particles.forEach((particle, index) => {
      // Only update particles that aren't focused
      if (particle !== focusedSkill) {
        // Get the original position
        const phi = Math.acos(-1 + (2 * index) / skillsData.length);
        const theta = Math.sqrt(skillsData.length * Math.PI) * phi;
        
        // Rotate around Y axis
        const x = 2 * Math.cos(theta + globe.rotation.y) * Math.sin(phi);
        const z = 2 * Math.cos(phi);
        const y = 2 * Math.sin(theta + globe.rotation.y) * Math.sin(phi);
        
        particle.position.set(x, y, z);
      }
    });
    
    renderer.render(scene, camera);
    
    // Remove loading indicator once rendered
    if (loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  };
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  
  // Start animation
  animate();
};

export default skillsGlobe;