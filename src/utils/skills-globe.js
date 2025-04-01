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
  
  // Set initial height based on screen size - more responsive heights
  const setGlobeContainerHeight = () => {
    const screenWidth = window.innerWidth;
    let containerHeight = '600px';
    
    if (screenWidth <= 480) {
      containerHeight = '350px';
    } else if (screenWidth <= 600) {
      containerHeight = '400px';
    } else if (screenWidth <= 768) {
      containerHeight = '450px';
    } else if (screenWidth <= 992) {
      containerHeight = '500px';
    }
    
    globeContainer.style.height = containerHeight;
  };
  
  // Set initial height
  setGlobeContainerHeight();
  
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
  
  // Add loading indicator with an ID for easier removal
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'three-loading';
  loadingIndicator.id = 'globe-loading-indicator';
  loadingIndicator.style.position = 'absolute';
  loadingIndicator.style.top = '50%';
  loadingIndicator.style.left = '50%';
  loadingIndicator.style.transform = 'translate(-50%, -50%)';
  loadingIndicator.style.width = '40px';
  loadingIndicator.style.height = '40px';
  loadingIndicator.style.zIndex = '105';
  loadingIndicator.innerHTML = '<div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: #4361ee; animation: spin 1s linear infinite;"></div>';
  globeContainer.appendChild(loadingIndicator);
  
  // Add a popup for focused skill
  const focusedSkillPopup = document.createElement('div');
  focusedSkillPopup.className = 'focused-skill-popup';
  focusedSkillPopup.style.position = 'absolute';
  focusedSkillPopup.style.padding = '5px 10px';
  focusedSkillPopup.style.borderRadius = '4px';
  focusedSkillPopup.style.fontSize = '14px';
  focusedSkillPopup.style.fontWeight = 'bold';
  focusedSkillPopup.style.color = 'white';
  focusedSkillPopup.style.zIndex = '105';
  focusedSkillPopup.style.display = 'none';
  globeContainer.appendChild(focusedSkillPopup);
  
  // Add instructions - hide on small screens
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
  
  // Hide instructions on small screens
  if (window.innerWidth <= 480) {
    instructions.style.display = 'none';
  }
  
  globeContainer.appendChild(instructions);
  
  // Add proficiency legend with responsiveness
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
  
  // Hide legend on small screens
  if (window.innerWidth <= 480) {
    proficiencyLegend.style.display = 'none';
  }
  
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
  
  // Add a fallback message for mobile devices that cannot render WebGL properly
  const fallbackMessage = document.createElement('div');
  fallbackMessage.className = 'globe-fallback';
  fallbackMessage.style.position = 'absolute';
  fallbackMessage.style.top = '50%';
  fallbackMessage.style.left = '50%';
  fallbackMessage.style.transform = 'translate(-50%, -50%)';
  fallbackMessage.style.textAlign = 'center';
  fallbackMessage.style.color = 'white';
  fallbackMessage.style.fontSize = '14px';
  fallbackMessage.style.padding = '20px';
  fallbackMessage.style.zIndex = '104';
  fallbackMessage.style.display = 'none';
  fallbackMessage.innerHTML = 'Interactive 3D skills globe<br>Explore my tech stack!';
  globeContainer.appendChild(fallbackMessage);
  
  // Function to remove loading indicator
  const removeLoadingIndicator = () => {
    // Find and remove all loading indicators to ensure none remain
    const loadingElements = document.querySelectorAll('.three-loading, #globe-loading-indicator');
    loadingElements.forEach(el => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };
  
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
  
  // Adjust camera distance based on screen size
  const updateCameraPosition = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) {
      camera.position.z = 8.5; // Further away for smaller screens
    } else if (screenWidth <= 768) {
      camera.position.z = 7.5;
    } else {
      camera.position.z = 6.5;
    }
  };
  
  updateCameraPosition();
  
  // Initialize renderer with better mobile compatibility settings
  let renderer;
  
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false, // Disable antialiasing on mobile for better performance
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false // Don't fail on low-end devices
    });
    
    // Detect if WebGL is supported
    if (!renderer.capabilities.isWebGL2 && !renderer.capabilities.isWebGL) {
      throw new Error('WebGL not supported');
    }
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limit pixel ratio for performance
    renderer.setClearColor(0x000000, 0); // Make sure background is transparent
    
    // Try to force the loading indicator to be removed
    setTimeout(removeLoadingIndicator, 1000);
  } catch (error) {
    // Show fallback message if WebGL initialization fails
    console.warn('WebGL initialization failed:', error);
    fallbackMessage.style.display = 'block';
    removeLoadingIndicator();
    
    // Create a simple canvas fallback
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw a simple gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#070a13');
      gradient.addColorStop(1, '#101426');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a circle representing the globe
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 4, 0, Math.PI * 2);
      ctx.strokeStyle = '#4361ee';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw some dots representing skills
      const skills = ['HTML', 'CSS', 'JS', 'React'];
      skills.forEach((_, index) => {
        const angle = (index / skills.length) * Math.PI * 2;
        const x = canvas.width / 2 + Math.cos(angle) * (canvas.width / 5);
        const y = canvas.height / 2 + Math.sin(angle) * (canvas.width / 5);
        
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#00aaff';
        ctx.fill();
      });
    }
    
    return; // Exit early as we can't continue with Three.js
  }
  
  // Set canvas to fill its container
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '101';
  canvas.style.display = 'block'; // Ensure canvas is displayed
  
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
  
  // Create a star field background with reduced particles for mobile
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true
  });
  
  // Adjust number of stars based on screen size for performance
  const getStarsCount = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) return 300;
    if (screenWidth <= 768) return 500;
    return 1000;
  };
  
  const starsVertices = [];
  const starsCount = getStarsCount();
  
  for (let i = 0; i < starsCount; i++) {
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
    
    // Adjust geometry detail based on screen size for performance
    const segmentDetail = window.innerWidth <= 480 ? 8 : 16;
    const geometry = new THREE.SphereGeometry(radius, segmentDetail, segmentDetail);
    
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
    const haloGeometry = new THREE.SphereGeometry(radius * 1.3, segmentDetail, segmentDetail);
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
  
  // Add trails to some particles - reduce or disable on mobile
  const shouldAddTrail = (index) => {
    if (window.innerWidth <= 480) {
      // Add trails to very few particles on mobile or none
      return index % 10 === 0;
    } else if (window.innerWidth <= 768) {
      return index % 5 === 0;
    } else {
      return index % 3 === 0;
    }
  };
  
  particles.forEach((particle, index) => {
    // Only add trails to certain skills based on screen size
    if (shouldAddTrail(index)) {
      const trailGeometry = new THREE.BufferGeometry();
      
      // Reduce trail length on mobile for performance
      const maxTrailPoints = window.innerWidth <= 480 ? 5 : window.innerWidth <= 768 ? 10 : 20;
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
  
  // Touch support for mobile
  let isTouching = false;
  let touchStartX, touchStartY;
  
  // Handle mouse movement 
  canvas.addEventListener('mousemove', (event) => {
    // Skip if user is currently touching (mobile)
    if (isTouching) return;
    
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
  
  // Touch event handlers for mobile
  canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    isTouching = true;
    
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // Use touch for clicking/selecting skills
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((touch.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((touch.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(particles);
    
    if (intersects.length > 0) {
      handleSkillSelection(intersects[0].object);
    } else if (focusedSkill) {
      // Clear focus when touching empty space
      resetFocusedSkill();
    }
  });
  
  canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    if (!isTouching) return;
    
    const touch = event.touches[0];
    
    // Calculate drag distance
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // Update rotation based on touch drag
    targetRotationY += deltaX * 0.01;
    targetRotationX += deltaY * 0.01;
    
    // Update starting position for next move event
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    // Stop auto-rotation when user interacts
    isAutoRotating = false;
  });
  
  canvas.addEventListener('touchend', () => {
    isTouching = false;
    
    // Resume auto-rotation after inactivity
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      isAutoRotating = true;
    }, 3000);
  });
  
  // Helper function to handle skill selection
  const handleSkillSelection = (clickedParticle) => {
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
    updatePopupPosition();
    
    // Highlight the list item
    const particleIndex = particles.indexOf(focusedSkill);
    if (skillItems[particleIndex]) {
      skillItems[particleIndex].style.backgroundColor = 'rgba(255,0,0,0.3)';
      skillItems[particleIndex].style.fontWeight = 'bold';
      skillItems[particleIndex].dataset.selected = 'true';
      
      // Scroll to the item if needed
      skillItems[particleIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Helper function to reset focused skill
  const resetFocusedSkill = () => {
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
  };
  
  // Handle click event for focusing on a skill
  canvas.addEventListener('click', (event) => {
    // Skip if this was the end of a touch event
    if (isTouching) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    
    // Update raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections with particles only
    const intersects = raycaster.intersectObjects(particles);
    
    if (intersects.length > 0) {
      handleSkillSelection(intersects[0].object);
    } else {
      // Clicked outside any skill, clear focus
      resetFocusedSkill();
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
    if (isTouching) return;
    
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
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      isAutoRotating = true;
    }, 3000); // Resume auto-rotation after 3 seconds of inactivity
  };
  
  canvas.addEventListener('mousemove', resetInactivityTimer);
  canvas.addEventListener('touchend', resetInactivityTimer);
  
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
  
  // Performance monitoring
  let frameCount = 0;
  let lastFpsTime = 0;
  let fps = 0;
  let lowPerformanceMode = false;
  let isRendering = true;
  
  // Helper to check if we should reduce rendering quality for performance
  const checkPerformance = (currentTime) => {
    frameCount++;
    
    if (currentTime > lastFpsTime + 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFpsTime = currentTime;
      
      // If FPS drops below threshold, enable low performance mode
      if (fps < 20 && !lowPerformanceMode) {
        lowPerformanceMode = true;
        
        // Reduce visual effects for better performance
        particles.forEach(particle => {
          if (particle.userData.trail) {
            particle.userData.trail.visible = false;
          }
          
          // Simplify halos
          if (particle.userData.halo) {
            particle.userData.halo.material.opacity = 0.1;
          }
        });
        
        // Reduce star count
        stars.visible = window.innerWidth > 768;
        
        // Simplify orbit rings
        Object.values(orbits).forEach(orbit => {
          orbit.visible = window.innerWidth > 768;
        });
      }
    }
  };
  
  // Show error message if rendering fails
  const handleRenderingError = () => {
    isRendering = false;
    // Show fallback message
    fallbackMessage.style.display = 'block';
    // Hide loading indicator
    removeLoadingIndicator();
    
    // Log the error
    console.warn('Three.js rendering failed, showing fallback content');
    
    // Try to render at least a static scene
    try {
      renderer.render(scene, camera);
    } catch (e) {
      console.error('Static render also failed:', e);
    }
  };
  
  // Ensure loading indicator is removed
  let loadingCheckCount = 0;
  const checkAndRemoveLoadingIndicator = () => {
    removeLoadingIndicator();
    loadingCheckCount++;
    
    // Keep trying to remove the loading indicator for a few seconds
    if (loadingCheckCount < 10) {
      setTimeout(checkAndRemoveLoadingIndicator, 500);
    }
  };
  
  // Start the loading indicator check
  checkAndRemoveLoadingIndicator();
  
  // Animation loop
  const animate = (currentTime) => {
    if (!isRendering) return;
    
    try {
      requestAnimationFrame(animate);
      
      // Check performance and adjust quality if needed
      checkPerformance(currentTime);
      
      // Calculate time delta for consistent animations
      delta = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;
      time += delta;
      
      // Remove loading indicator after first frame
      if (time > 0.5) {
        removeLoadingIndicator();
      }
      
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
      
      // Rotate orbit rings - skip in low performance mode
      if (!lowPerformanceMode) {
        Object.values(orbits).forEach((orbit, index) => {
          orbit.rotation.z += 0.001 * (index + 1);
        });
      }
      
      // Animate star field - skip in low performance mode
      if (!lowPerformanceMode) {
        stars.rotation.y = time * 0.05;
        stars.rotation.z = time * 0.02;
      }
      
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
          
          // Pulse the halo - skip in low performance mode
          if (!lowPerformanceMode && particle.userData.halo) {
            const pulseFactor = 1 + 0.1 * Math.sin(time * 3 + phi * 5);
            particle.userData.halo.scale.set(pulseFactor, pulseFactor, pulseFactor);
          }
          
          // Update trail if present - skip in low performance mode
          if (!lowPerformanceMode && particle.userData.trail) {
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
      
      // Remove loading indicator again
      if (time > 1) {
        removeLoadingIndicator();
      }
    } catch (error) {
      console.error('Animation error:', error);
      handleRenderingError();
    }
  };
  
  // Handle window resize
  window.addEventListener('resize', () => {
    try {
      // Update container height
      setGlobeContainerHeight();
      
      // Update camera position
      updateCameraPosition();
      
      // Update canvas size
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      
      // Hide/show UI elements based on screen size
      if (window.innerWidth <= 480) {
        instructions.style.display = 'none';
        proficiencyLegend.style.display = 'none';
      } else {
        instructions.style.display = 'block';
        proficiencyLegend.style.display = 'flex';
      }
      
      // Make sure loading indicator is still removed
      removeLoadingIndicator();
    } catch (error) {
      console.error('Resize error:', error);
      handleRenderingError();
    }
  });
  
  // Initial resize to make sure everything is sized correctly
  setTimeout(() => {
    try {
      const resizeEvent = new Event('resize');
      window.dispatchEvent(resizeEvent);
      
      // Extra attempt to remove loading indicator
      removeLoadingIndicator();
    } catch (error) {
      console.error('Initial resize error:', error);
      handleRenderingError();
    }
  }, 100);
  
  // Check if WebGL context is lost
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost');
    handleRenderingError();
  });
  
  // Remove all loading indicators when DOM is fully loaded
  window.addEventListener('load', () => {
    removeLoadingIndicator();
  });
  
  // Start animation
  animate(0);
};

export default skillsGlobe;