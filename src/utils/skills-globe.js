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
  
  // Get skills data from the DOM before replacing
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
  
  // Create a container div that will hold both the canvas and skills panel
  const globeContainer = document.createElement('div');
  globeContainer.className = 'globe-container';
  globeContainer.style.position = 'relative';
  globeContainer.style.width = '100%';
  globeContainer.style.height = '500px';
  globeContainer.style.borderRadius = 'var(--radius-lg)';
  globeContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  globeContainer.style.overflow = 'hidden';
  globeContainer.style.boxShadow = '0 0 30px rgba(67, 97, 238, 0.1)';
  globeContainer.style.marginTop = 'var(--spacing-lg)';
  globeContainer.style.marginBottom = 'var(--spacing-lg)';
  
  // Add the canvas to the container
  globeContainer.appendChild(canvas);
  
  // Replace the skills container with our container
  skillsContainer.style.display = 'none';
  skillsContainer.parentNode.insertBefore(globeContainer, skillsContainer.nextSibling);
  
  // Create a skills info display that shows the original skill badges
  const skillsInfo = document.createElement('div');
  skillsInfo.className = 'skills-info-display';
  skillsInfo.style.position = 'absolute';
  skillsInfo.style.top = '15px';
  skillsInfo.style.right = '15px';
  skillsInfo.style.width = '180px';
  skillsInfo.style.background = 'rgba(0,0,0,0.8)';
  skillsInfo.style.color = 'white';
  skillsInfo.style.padding = '15px';
  skillsInfo.style.borderRadius = '10px';
  skillsInfo.style.zIndex = '1000';
  skillsInfo.style.boxShadow = '0 0 15px rgba(0,100,255,0.5)';
  skillsInfo.style.border = '1px solid rgba(0,150,255,0.5)';
  skillsInfo.style.maxHeight = '80%';
  skillsInfo.style.overflowY = 'auto';
  globeContainer.appendChild(skillsInfo);
  
  // Add a title to the info panel
  const infoTitle = document.createElement('div');
  infoTitle.textContent = 'My Skills';
  infoTitle.style.textAlign = 'center';
  infoTitle.style.fontWeight = 'bold';
  infoTitle.style.fontSize = '16px';
  infoTitle.style.marginBottom = '10px';
  infoTitle.style.borderBottom = '1px solid rgba(255,255,255,0.3)';
  infoTitle.style.paddingBottom = '5px';
  skillsInfo.appendChild(infoTitle);
  
  // Add a description
  const infoDesc = document.createElement('div');
  infoDesc.textContent = 'Click on a sphere to highlight a skill:';
  infoDesc.style.fontSize = '12px';
  infoDesc.style.marginBottom = '10px';
  infoDesc.style.opacity = '0.8';
  skillsInfo.appendChild(infoDesc);
  
  // Add a container for the skill items
  const skillsList = document.createElement('div');
  skillsList.className = 'skills-list';
  skillsInfo.appendChild(skillsList);
  
  // Add skill items to the info panel
  skillsData.forEach((skill, index) => {
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.dataset.index = index;
    skillItem.textContent = skill.name;
    skillItem.style.padding = '6px 10px';
    skillItem.style.margin = '5px 0';
    skillItem.style.borderRadius = '5px';
    skillItem.style.transition = 'all 0.2s ease';
    skillItem.style.cursor = 'pointer';
    skillItem.style.backgroundColor = 'rgba(0,0,0,0.3)';
    
    // Highlight on hover
    skillItem.addEventListener('mouseover', () => {
      skillItem.style.backgroundColor = 'rgba(255,153,0,0.3)';
    });
    
    skillItem.addEventListener('mouseout', () => {
      if (skillItem.dataset.selected !== 'true') {
        skillItem.style.backgroundColor = 'rgba(0,0,0,0.3)';
      }
    });
    
    skillsList.appendChild(skillItem);
  });
  
  // Add loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'three-loading';
  canvas.appendChild(loadingIndicator);
  
  // Add a popup for focused skill
  const focusedSkillPopup = document.createElement('div');
  focusedSkillPopup.className = 'focused-skill-popup';
  focusedSkillPopup.style.position = 'absolute';
  focusedSkillPopup.style.display = 'none';
  focusedSkillPopup.style.padding = '8px 15px';
  focusedSkillPopup.style.backgroundColor = 'rgba(255,0,0,0.8)';
  focusedSkillPopup.style.color = 'white';
  focusedSkillPopup.style.fontWeight = 'bold';
  focusedSkillPopup.style.borderRadius = '5px';
  focusedSkillPopup.style.zIndex = '1001';
  focusedSkillPopup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  focusedSkillPopup.style.transform = 'translate(-50%, -100%)';
  focusedSkillPopup.style.pointerEvents = 'none';
  focusedSkillPopup.style.fontSize = '16px';
  focusedSkillPopup.style.letterSpacing = '0.5px';
  canvas.appendChild(focusedSkillPopup);
  
  // Add instructions
  const instructions = document.createElement('div');
  instructions.className = 'globe-instructions';
  instructions.style.position = 'absolute';
  instructions.style.bottom = '15px';
  instructions.style.left = '15px';
  instructions.style.padding = '5px 12px';
  instructions.style.backgroundColor = 'rgba(0,0,0,0.6)';
  instructions.style.color = 'rgba(255,255,255,0.7)';
  instructions.style.borderRadius = '15px';
  instructions.style.fontSize = '12px';
  instructions.style.pointerEvents = 'none';
  instructions.innerHTML = 'Move mouse to rotate • Click skills to focus';
  globeContainer.appendChild(instructions);
  
  // Setup Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Set canvas to fill its container
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  
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
  const skillItems = skillsInfo.querySelectorAll('.skill-item');
  
  skillsData.forEach((skill, index) => {
    // Create a sphere for the skill
    const geometry = new THREE.SphereGeometry(0.25, 16, 16); // Even larger particle
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
  });
  
  // Add raycaster for interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Track focused skill
  let focusedSkill = null;
  
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
      
      // Reset list item highlight if not focused
      if (skillItems[index] && !skillItems[index].dataset.selected) {
        skillItems[index].style.backgroundColor = 'rgba(0,0,0,0.3)';
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
        
        // Also highlight the corresponding skill in the list
        if (skillItems[particleIndex]) {
          skillItems[particleIndex].style.backgroundColor = 'rgba(255,153,0,0.3)';
        }
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
      if (focusedSkill) {
        // Reset previous focus
        focusedSkill.material.color.set(0x00aaff);
        focusedSkill.scale.set(1, 1, 1);
        
        // Reset the previous list item
        const prevIndex = particles.indexOf(focusedSkill);
        if (prevIndex >= 0 && skillItems[prevIndex]) {
          skillItems[prevIndex].style.backgroundColor = 'rgba(0,0,0,0.3)';
          skillItems[prevIndex].style.fontWeight = 'normal';
          skillItems[prevIndex].dataset.selected = 'false';
        }
        
        // If clicking the same particle, just unfocus
        if (clickedParticle === focusedSkill) {
          focusedSkill = null;
          focusedSkillPopup.style.display = 'none';
          return;
        }
      }
      
      // Focus the clicked skill
      focusedSkill = clickedParticle;
      focusedSkill.material.color.set(0xff0000);
      focusedSkill.scale.set(2, 2, 2);
      
      // Update the popup
      focusedSkillPopup.textContent = focusedSkill.userData.skill;
      focusedSkillPopup.style.display = 'block';
      
      // Position the popup above the particle
      const vector = new THREE.Vector3();
      vector.copy(focusedSkill.position);
      vector.project(camera);
      
      const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (-vector.y * 0.5 + 0.5) * canvas.clientHeight;
      
      focusedSkillPopup.style.left = `${x}px`;
      focusedSkillPopup.style.top = `${y - 20}px`;
      
      // Highlight the list item
      if (skillItems[particleIndex]) {
        skillItems[particleIndex].style.backgroundColor = 'rgba(255,0,0,0.3)';
        skillItems[particleIndex].style.fontWeight = 'bold';
        skillItems[particleIndex].dataset.selected = 'true';
        
        // Scroll to the item if needed
        skillItems[particleIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Clicked outside any skill, clear focus
      if (focusedSkill) {
        focusedSkill.material.color.set(0x00aaff);
        focusedSkill.scale.set(1, 1, 1);
        
        // Reset the list item
        const prevIndex = particles.indexOf(focusedSkill);
        if (prevIndex >= 0 && skillItems[prevIndex]) {
          skillItems[prevIndex].style.backgroundColor = 'rgba(0,0,0,0.3)';
          skillItems[prevIndex].style.fontWeight = 'normal';
          skillItems[prevIndex].dataset.selected = 'false';
        }
        
        focusedSkill = null;
        focusedSkillPopup.style.display = 'none';
      }
    }
  });
  
  // Update popup position when the focused skill moves
  const updatePopupPosition = () => {
    if (focusedSkill && focusedSkillPopup.style.display !== 'none') {
      const vector = new THREE.Vector3();
      vector.copy(focusedSkill.position);
      vector.project(camera);
      
      const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth;
      const y = (-vector.y * 0.5 + 0.5) * canvas.clientHeight;
      
      // Only show popup for particles in front of the globe
      if (focusedSkill.position.z > 0) {
        focusedSkillPopup.style.display = 'block';
        focusedSkillPopup.style.left = `${x}px`;
        focusedSkillPopup.style.top = `${y - 20}px`;
      } else {
        focusedSkillPopup.style.display = 'none';
      }
    }
  };
  
  // Make the globe rotate on mouse movement
  let targetRotationY = 0;
  let targetRotationX = 0;
  let currentRotationY = 0;
  let currentRotationX = 0;
  
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate normalized mouse position relative to center (-1 to 1)
    const mouseX = (event.clientX - rect.left - centerX) / centerX;
    const mouseY = (event.clientY - rect.top - centerY) / centerY;
    
    // Set target rotation based on mouse position
    targetRotationY = mouseX * 0.5;
    targetRotationX = mouseY * 0.3;
  });
  
  // Link skill items in the info panel to the particles
  skillItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      // Reset all particles and list items
      particles.forEach((p, i) => {
        p.material.color.set(0x00aaff);
        p.scale.set(1, 1, 1);
        
        if (skillItems[i]) {
          skillItems[i].style.backgroundColor = 'rgba(0,0,0,0.3)';
          skillItems[i].style.fontWeight = 'normal';
          skillItems[i].dataset.selected = 'false';
        }
      });
      
      // If we had a focused skill and clicked the same item, unfocus
      if (focusedSkill && particles.indexOf(focusedSkill) === index) {
        focusedSkill = null;
        focusedSkillPopup.style.display = 'none';
        return;
      }
      
      // Focus the corresponding particle
      focusedSkill = particles[index];
      focusedSkill.material.color.set(0xff0000);
      focusedSkill.scale.set(2, 2, 2);
      
      // Highlight the list item
      item.style.backgroundColor = 'rgba(255,0,0,0.3)';
      item.style.fontWeight = 'bold';
      item.dataset.selected = 'true';
      
      // Update the popup
      focusedSkillPopup.textContent = focusedSkill.userData.skill;
      focusedSkillPopup.style.display = 'block';
      
      // Position the popup (will be updated in animation loop)
      updatePopupPosition();
    });
  });
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    
    // Smooth rotation
    currentRotationY += (targetRotationY - currentRotationY) * 0.05;
    currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    
    // Apply rotation to globe
    globe.rotation.y = currentRotationY;
    globe.rotation.x = currentRotationX;
    
    // Update particles positioning on globe
    particles.forEach((particle) => {
      // Only update particles that aren't focused
      if (particle !== focusedSkill) {
        // Get the original angles
        const phi = particle.userData.phi;
        const theta = particle.userData.theta;
        
        // Rotate around axes
        const rotatedTheta = theta + globe.rotation.y;
        
        // Calculate new position based on sphere coordinates
        const x = 2 * Math.cos(rotatedTheta) * Math.sin(phi);
        const z = 2 * Math.cos(phi);
        const y = 2 * Math.sin(rotatedTheta) * Math.sin(phi);
        
        // Apply X rotation (tilt)
        const cosX = Math.cos(globe.rotation.x);
        const sinX = Math.sin(globe.rotation.x);
        const newY = y * cosX - z * sinX;
        const newZ = y * sinX + z * cosX;
        
        particle.position.set(x, newY, newZ);
      }
    });
    
    // Update popup position
    updatePopupPosition();
    
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