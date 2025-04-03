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
  
  // Define skill categories with colors
  const skillCategories = {
    "frontend": { color: 0x00aaff, name: "Frontend" },
    "backend": { color: 0xff5500, name: "Backend" },
    "tools": { color: 0x88cc00, name: "Tools" },
    "framework": { color: 0xaa44ff, name: "Frameworks" }
  };
  
  // Get skills data from the DOM before replacing and assign categories
  const skillsData = [];
  document.querySelectorAll('.skill-badge').forEach(badge => {
    // Extract the skill name and icon
    const text = badge.textContent.trim();
    const icon = badge.querySelector('i') ? badge.querySelector('i').className : '';
    
    // Assign category based on skill
    let category = "frontend"; // default
    if (text.includes("Python") || text.includes("REST")) {
      category = "backend";
    } else if (text.includes("Git") || text.includes("WordPress")) {
      category = "tools";
    } else if (text.includes("React") || text.includes("Redux") || text.includes("Bootstrap")) {
      category = "framework";
    }
    
    skillsData.push({
      name: text,
      icon: icon,
      category: category,
      color: skillCategories[category].color
    });
  });
  
  // Create a container div that will hold both the canvas and skills panel
  const globeContainer = document.createElement('div');
  globeContainer.className = 'globe-container';
  globeContainer.style.position = 'relative';
  globeContainer.style.width = '100%';
  globeContainer.style.height = '650px';
  globeContainer.style.zIndex = '100';
  globeContainer.style.isolation = 'isolate';
  globeContainer.style.borderRadius = 'var(--radius-lg)';
  globeContainer.style.backgroundColor = 'rgb(7, 10, 19)';
  globeContainer.style.overflow = 'hidden';
  globeContainer.style.boxShadow = '0 0 40px rgba(67, 97, 238, 0.3)';
  globeContainer.style.marginTop = 'var(--spacing-xl)';
  globeContainer.style.marginBottom = 'var(--spacing-xl)';
  globeContainer.style.display = 'flex';
  globeContainer.style.justifyContent = 'center';
  globeContainer.style.alignItems = 'center';
  
  // Add the canvas to the container
  globeContainer.appendChild(canvas);
  
  // Create a stacking context wrapper to prevent z-index issues
  const stackingContextWrapper = document.createElement('div');
  stackingContextWrapper.style.position = 'relative';
  stackingContextWrapper.style.zIndex = '99';
  stackingContextWrapper.style.isolation = 'isolate';
  stackingContextWrapper.appendChild(globeContainer);
  
  // Create a skills info display that shows the original skill badges with categories
  const skillsInfo = document.createElement('div');
  skillsInfo.className = 'skills-info-display';

  // Replace the skills container with our globe container
  skillsContainer.parentNode.replaceChild(stackingContextWrapper, skillsContainer);
  
  // Make a direct reference to the about section for better positioning
  const aboutSection = document.querySelector('.about');
  const aboutContent = document.querySelector('.about__content');
  
  // Create a wrapper div that will hold both the globe container and skills panel
  const overallWrapper = document.createElement('div');
  overallWrapper.style.position = 'relative';
  overallWrapper.style.display = 'flex';
  overallWrapper.style.justifyContent = 'center';
  overallWrapper.style.width = '100%';
  overallWrapper.className = 'globe-skills-wrapper';
  
  // Insert the overall wrapper after the stacking context wrapper
  // This ensures proper DOM structure
  if (aboutContent) {
    // Insert the wrapper after the about content
    aboutSection.insertBefore(overallWrapper, aboutContent.nextSibling);
    
    // Move the stacking context wrapper (with the globe) into our new overall wrapper
    stackingContextWrapper.parentNode.removeChild(stackingContextWrapper);
    overallWrapper.appendChild(stackingContextWrapper);
  } else {
    // Fallback in case we can't find the about content
    skillsContainer.parentNode.insertBefore(overallWrapper, skillsContainer.nextSibling);
    stackingContextWrapper.parentNode.removeChild(stackingContextWrapper);
    overallWrapper.appendChild(stackingContextWrapper);
  }
  
  // Now add the skills panel to the overall wrapper, outside the globe container
  overallWrapper.appendChild(skillsInfo);
  
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
  
  // Add category filters
  const categoryFilters = document.createElement('div');
  categoryFilters.className = 'category-filters';
  categoryFilters.style.display = 'flex';
  categoryFilters.style.flexWrap = 'wrap';
  categoryFilters.style.gap = '5px';
  categoryFilters.style.marginBottom = '10px';
  
  // Add "All" filter
  const allFilter = document.createElement('div');
  allFilter.className = 'category-filter active';
  allFilter.textContent = 'All';
  allFilter.dataset.category = 'all';
  allFilter.style.padding = '3px 8px';
  allFilter.style.backgroundColor = 'rgba(255,255,255,0.2)';
  allFilter.style.borderRadius = '5px';
  allFilter.style.fontSize = '12px';
  allFilter.style.cursor = 'pointer';
  allFilter.style.transition = 'all 0.2s ease';
  categoryFilters.appendChild(allFilter);
  
  // Add category filters
  Object.entries(skillCategories).forEach(([key, value]) => {
    const filter = document.createElement('div');
    filter.className = 'category-filter';
    filter.textContent = value.name;
    filter.dataset.category = key;
    filter.style.padding = '3px 8px';
    filter.style.backgroundColor = 'rgba(255,255,255,0.1)';
    filter.style.borderRadius = '5px';
    filter.style.fontSize = '12px';
    filter.style.cursor = 'pointer';
    filter.style.transition = 'all 0.2s ease';
    
    // Add color indicator
    const colorIndicator = document.createElement('span');
    colorIndicator.style.display = 'inline-block';
    colorIndicator.style.width = '8px';
    colorIndicator.style.height = '8px';
    colorIndicator.style.borderRadius = '50%';
    colorIndicator.style.backgroundColor = '#' + value.color.toString(16).padStart(6, '0');
    colorIndicator.style.marginRight = '5px';
    filter.prepend(colorIndicator);
    
    categoryFilters.appendChild(filter);
  });
  
  skillsInfo.appendChild(categoryFilters);
  
  // Add a container for the skill items
  const skillsList = document.createElement('div');
  skillsList.className = 'skills-list';
  skillsInfo.appendChild(skillsList);
  
  // Add skill items to the info panel with category indicators
  skillsData.forEach((skill, index) => {
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';
    skillItem.dataset.index = index;
    skillItem.dataset.category = skill.category;
    
    // Create a skill item with icon and text
    const skillIcon = document.createElement('i');
    skillIcon.className = skill.icon;
    skillIcon.style.marginRight = '5px';
    skillIcon.style.color = '#' + skill.color.toString(16).padStart(6, '0');
    
    const skillText = document.createElement('span');
    skillText.textContent = skill.name;
    
    skillItem.appendChild(skillIcon);
    skillItem.appendChild(skillText);
    
    skillItem.style.padding = '6px 10px';
    skillItem.style.margin = '5px 0';
    skillItem.style.borderRadius = '5px';
    skillItem.style.transition = 'all 0.2s ease';
    skillItem.style.cursor = 'pointer';
    skillItem.style.backgroundColor = 'rgba(0,0,0,0.3)';
    skillItem.style.display = 'flex';
    skillItem.style.alignItems = 'center';
    
    // Highlight on hover
    skillItem.addEventListener('mouseover', () => {
      skillItem.style.backgroundColor = `rgba(${(skill.color >> 16) & 255}, ${(skill.color >> 8) & 255}, ${skill.color & 255}, 0.3)`;
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
  instructions.style.zIndex = '102';
  instructions.innerHTML = 'Move mouse to rotate • Click skills to focus';
  globeContainer.appendChild(instructions);
  
  // Add proficiency legend
  const proficiencyLegend = document.createElement('div');
  proficiencyLegend.className = 'proficiency-legend';
  proficiencyLegend.style.position = 'absolute';
  proficiencyLegend.style.bottom = '15px';
  proficiencyLegend.style.right = '15px';
  proficiencyLegend.style.padding = '5px 12px';
  proficiencyLegend.style.backgroundColor = 'rgba(0,0,0,0.6)';
  proficiencyLegend.style.color = 'rgba(255,255,255,0.7)';
  proficiencyLegend.style.borderRadius = '15px';
  proficiencyLegend.style.fontSize = '12px';
  proficiencyLegend.style.display = 'flex';
  proficiencyLegend.style.gap = '10px';
  proficiencyLegend.style.alignItems = 'center';
  proficiencyLegend.style.zIndex = '102';
  
  // Legend items
  const legendItems = [
    { size: 'Small', text: 'Familiar' },
    { size: 'Medium', text: 'Proficient' },
    { size: 'Large', text: 'Expert' }
  ];
  
  legendItems.forEach(item => {
    const legendItem = document.createElement('div');
    legendItem.style.display = 'flex';
    legendItem.style.alignItems = 'center';
    legendItem.style.gap = '5px';
    
    const legendDot = document.createElement('div');
    legendDot.style.width = item.size === 'Small' ? '8px' : item.size === 'Medium' ? '12px' : '16px';
    legendDot.style.height = legendDot.style.width;
    legendDot.style.borderRadius = '50%';
    legendDot.style.backgroundColor = 'rgba(0, 170, 255, 0.7)';
    
    const legendText = document.createElement('span');
    legendText.textContent = item.text;
    
    legendItem.appendChild(legendDot);
    legendItem.appendChild(legendText);
    proficiencyLegend.appendChild(legendItem);
  });
  
  globeContainer.appendChild(proficiencyLegend);
  
  // Setup Three.js scene
  const scene = new THREE.Scene();
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = window.innerWidth <= 600 ? 8.5 : 6.5; // Responsive camera position
  
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Set canvas to fill its container with responsive behavior
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '101';
  
  // Set initial camera position based on screen size
  if (window.innerWidth <= 600) {
    camera.position.z = 8.5; // More zoom out on mobile for better view
  }
  
  // Create a sphere for the globe
  const globeGeometry = new THREE.SphereGeometry(2.5, 32, 32);
  const globeMaterial = new THREE.MeshBasicMaterial({
    color: 0x333333,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);
  
  // Add glow effect to the globe
  const glowGeometry = new THREE.SphereGeometry(2.56, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x4361ee) },
      viewVector: { value: new THREE.Vector3(0, 0, 1) }
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(1.0 - dot(vNormal, vNormel), 2.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 0.3);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glowMesh);
  
  // Create a star field background
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true
  });
  
  const starsVertices = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 30;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    starsVertices.push(x, y, z);
  }
  
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  
  // Create particles for each skill with varying sizes based on proficiency
  const particles = [];
  const skillItems = skillsInfo.querySelectorAll('.skill-item');
  
  // Function to get skill proficiency level based on name or index
  const getSkillProficiency = (skill, index) => {
    // Assign proficiency based on skill name (you can customize this)
    if (skill.name.includes("HTML") || skill.name.includes("CSS") || skill.name.includes("JavaScript")) {
      return 0.85; // Expert - scale factor for particle size
    } else if (skill.name.includes("React") || skill.name.includes("Git")) {
      return 0.7; // Proficient
    } else {
      return 0.55; // Familiar
    }
  };
  
  // Create orbit rings for categories
  const orbits = {};
  Object.keys(skillCategories).forEach((category, index) => {
    const orbitGeometry = new THREE.TorusGeometry(2.85 + index * 0.12, 0.025, 16, 100);
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
      color: skillCategories[category].color,
      transparent: true,
      opacity: 0.3
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    
    // Rotate each orbit to a different plane
    orbit.rotation.x = Math.PI / 2;
    orbit.rotation.y = index * Math.PI / 6;
    
    orbit.userData = { category };
    orbits[category] = orbit;
    scene.add(orbit);
  });
  
  skillsData.forEach((skill, index) => {
    const proficiency = getSkillProficiency(skill, index);
    // Create a sphere for the skill - size varies by proficiency
    const radius = 0.15 + proficiency * 0.15; // Vary between 0.15 and 0.3
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    
    // Use custom materials for better appearance
    const material = new THREE.MeshPhongMaterial({ 
      color: skill.color,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    
    const particle = new THREE.Mesh(geometry, material);
    
    // Position the particle on the globe surface with better distribution
    const phi = Math.acos(-1 + (2 * index) / skillsData.length);
    const theta = Math.sqrt(skillsData.length * Math.PI) * phi;
    
    particle.position.x = 2.5 * Math.cos(theta) * Math.sin(phi);
    particle.position.y = 2.5 * Math.sin(theta) * Math.sin(phi);
    particle.position.z = 2.5 * Math.cos(phi);
    
    particle.userData = { 
      skill: skill.name,
      index: index, 
      theta: theta,
      phi: phi,
      category: skill.category,
      proficiency: proficiency,
      originalColor: skill.color,
      originalScale: 1
    };
    
    particles.push(particle);
    scene.add(particle);
    
    // Add a pulsing halo effect to each particle
    const haloGeometry = new THREE.SphereGeometry(radius * 1.3, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: skill.color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    particle.add(halo);
    particle.userData.halo = halo;
  });
  
  // Add trails to some particles
  particles.forEach((particle, index) => {
    // Only add trails to certain skills (e.g., primary skills)
    if (index % 3 === 0) {
      const trailGeometry = new THREE.BufferGeometry();
      const maxTrailPoints = 20;
      const trailPositions = new Float32Array(maxTrailPoints * 3);
      
      // Initialize with particle's position
      for (let i = 0; i < maxTrailPoints; i++) {
        trailPositions[i * 3] = particle.position.x;
        trailPositions[i * 3 + 1] = particle.position.y;
        trailPositions[i * 3 + 2] = particle.position.z;
      }
      
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      
      const trailMaterial = new THREE.LineBasicMaterial({
        color: particle.userData.originalColor,
        transparent: true,
        opacity: 0.5
      });
      
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trail);
      
      particle.userData.trail = trail;
      particle.userData.trailPositions = trailPositions;
      particle.userData.trailUpdateCounter = 0;
    }
  });
  
  // Add raycaster for interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // Track focused skill
  let focusedSkill = null;
  let activeCategory = 'all';
  
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
        particle.material.color.set(particle.userData.originalColor);
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
        intersection.object.material.color.set(0xffff00);
        intersection.object.scale.set(1.5, 1.5, 1.5);
        
        // Also highlight the corresponding skill in the list
        if (skillItems[particleIndex]) {
          skillItems[particleIndex].style.backgroundColor = 'rgba(255,255,0,0.3)';
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
        focusedSkill.material.color.set(focusedSkill.userData.originalColor);
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
      focusedSkillPopup.style.backgroundColor = `rgba(${(focusedSkill.userData.originalColor >> 16) & 255}, ${(focusedSkill.userData.originalColor >> 8) & 255}, ${focusedSkill.userData.originalColor & 255}, 0.8)`;
      
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
        focusedSkill.material.color.set(focusedSkill.userData.originalColor);
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
  
  // Filter skills by category
  const filterByCategory = (category) => {
    activeCategory = category;
    
    // Reset all category filters
    document.querySelectorAll('.category-filter').forEach(filter => {
      filter.classList.remove('active');
      filter.style.backgroundColor = 'rgba(255,255,255,0.1)';
    });
    
    // Highlight active filter
    const activeFilter = document.querySelector(`.category-filter[data-category="${category}"]`);
    if (activeFilter) {
      activeFilter.classList.add('active');
      activeFilter.style.backgroundColor = 'rgba(255,255,255,0.3)';
    }
    
    // Filter skill items in the list
    skillItems.forEach(item => {
      if (category === 'all' || item.dataset.category === category) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
    
    // Filter particles in the 3D view
    particles.forEach(particle => {
      const isVisible = category === 'all' || particle.userData.category === category;
      particle.visible = isVisible;
      if (particle.userData.trail) {
        particle.userData.trail.visible = isVisible;
      }
    });
    
    // Filter orbit rings
    Object.entries(orbits).forEach(([key, orbit]) => {
      orbit.visible = category === 'all' || key === category;
    });
  };
  
  // Add event listeners to category filters
  document.querySelectorAll('.category-filter').forEach(filter => {
    filter.addEventListener('click', () => {
      filterByCategory(filter.dataset.category);
    });
  });
  
  // Make the globe rotate on mouse movement
  let targetRotationY = 0;
  let targetRotationX = 0;
  let currentRotationY = 0;
  let currentRotationX = 0;
  let isAutoRotating = true;
  let autoRotateSpeed = 0.005;
  
  canvas.addEventListener('mousemove', (event) => {
    // Stop auto-rotation when user interacts
    isAutoRotating = false;
    
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
  
  // Resume auto-rotation after inactivity
  let inactivityTimer;
  canvas.addEventListener('mousemove', () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      isAutoRotating = true;
    }, 3000); // Resume auto-rotation after 3 seconds of inactivity
  });
  
  // Link skill items in the info panel to the particles
  skillItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      // Reset all particles and list items
      particles.forEach((p, i) => {
        p.material.color.set(p.userData.originalColor);
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
      focusedSkillPopup.style.backgroundColor = `rgba(${(focusedSkill.userData.originalColor >> 16) & 255}, ${(focusedSkill.userData.originalColor >> 8) & 255}, ${focusedSkill.userData.originalColor & 255}, 0.8)`;
      
      // Position the popup (will be updated in animation loop)
      updatePopupPosition();
    });
  });
  
  // Animation time variables
  let time = 0;
  let delta = 0;
  let lastFrameTime = 0;
  
  // Animation loop
  const animate = (currentTime) => {
    requestAnimationFrame(animate);
    
    // Calculate time delta for consistent animations
    delta = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    time += delta;
    
    // Handle auto-rotation
    if (isAutoRotating) {
      currentRotationY += autoRotateSpeed;
    } else {
      // Smooth rotation
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
    }
    
    // Apply rotation to globe
    globe.rotation.y = currentRotationY;
    globe.rotation.x = currentRotationX;
    
    // Apply the same rotation to the glow effect
    glowMesh.rotation.y = globe.rotation.y;
    glowMesh.rotation.x = globe.rotation.x;
    
    // Rotate orbit rings
    Object.values(orbits).forEach((orbit, index) => {
      orbit.rotation.z += 0.001 * (index + 1);
    });
    
    // Animate star field
    stars.rotation.y = time * 0.05;
    stars.rotation.z = time * 0.02;
    
    // Update particles positioning on globe
    particles.forEach((particle) => {
      // Skip the focused particle
      if (particle !== focusedSkill) {
        // Get the original angles
        const phi = particle.userData.phi;
        const theta = particle.userData.theta;
        
        // Rotate around axes
        const rotatedTheta = theta + globe.rotation.y;
        
        // Calculate new position based on sphere coordinates
        const x = 2.5 * Math.cos(rotatedTheta) * Math.sin(phi);
        const z = 2.5 * Math.cos(phi);
        const y = 2.5 * Math.sin(rotatedTheta) * Math.sin(phi);
        
        // Apply X rotation (tilt)
        const cosX = Math.cos(globe.rotation.x);
        const sinX = Math.sin(globe.rotation.x);
        const newY = y * cosX - z * sinX;
        const newZ = y * sinX + z * cosX;
        
        particle.position.set(x, newY, newZ);
        
        // Pulse the halo
        if (particle.userData.halo) {
          const pulseFactor = 1 + 0.1 * Math.sin(time * 3 + phi * 5);
          particle.userData.halo.scale.set(pulseFactor, pulseFactor, pulseFactor);
        }
        
        // Update trail if present
        if (particle.userData.trail) {
          const positions = particle.userData.trailPositions;
          // Only update every few frames to create a spaced trail
          if (particle.userData.trailUpdateCounter++ % 5 === 0) {
            // Shift all positions back
            for (let i = positions.length / 3 - 1; i > 0; i--) {
              positions[i * 3] = positions[(i - 1) * 3];
              positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
              positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
            }
            
            // Set the first position to current particle position
            positions[0] = particle.position.x;
            positions[1] = particle.position.y;
            positions[2] = particle.position.z;
            
            // Update the buffer
            particle.userData.trail.geometry.attributes.position.needsUpdate = true;
          }
        }
      }
    });
    
    // Update popup position
    updatePopupPosition();
    
    // Update glowMesh view vector (for glow effect)
    glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
      camera.position,
      glowMesh.position
    );
    
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
    
    // Adjust camera position based on screen size
    if (window.innerWidth <= 600) {
      camera.position.z = 8.5; // More zoom out on mobile for better view
    } else {
      camera.position.z = 6.5; // Default position for larger screens
    }
    
    // Update the info panel and globe container height for mobile
    if (window.innerWidth <= 600) {
      if (globeContainer) {
        globeContainer.style.height = '450px';
      }
      if (skillsInfo) {
        skillsInfo.style.maxHeight = '300px';
      }
    } else {
      if (globeContainer) {
        globeContainer.style.height = '650px';
      }
      if (skillsInfo) {
        skillsInfo.style.maxHeight = '650px';
      }
    }
  });
  
  // Initial resize to make sure everything is sized correctly
  setTimeout(() => {
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }, 100);
  
  // Start animation
  animate(0);
};

export default skillsGlobe;