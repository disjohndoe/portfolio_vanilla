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
    
    // Categorize skills (you can customize these categories)
    let category = 'general';
    let color = 0x4361ee; // Default blue
    
    if (/HTML|CSS|JavaScript|React/.test(text)) {
      category = 'frontend';
      color = 0x61dafb; // React blue
    } else if (/Python|Redux|API|Node/.test(text)) {
      category = 'backend';
      color = 0x68a063; // Node green
    } else if (/Git|WordPress|Bootstrap/.test(text)) {
      category = 'tools';
      color = 0xe24329; // Git red
    }
    
    // Assign skill level (1-10) - random for demonstration
    const level = Math.floor(Math.random() * 3) + 7; // Random level between 7-10
    
    skillsData.push({
      name: text,
      category,
      color,
      level
    });
  });
  
  // Initialize scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 2, 0.1, 1000);
  
  // Create renderer with improved error handling
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ 
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
  } catch (error) {
    console.error("Failed to create WebGL renderer:", error);
    // Show error message in the canvas
    loadingIndicator.innerHTML = "WebGL error: Could not initialize renderer";
    return;
  }
  
  // Set size based on container
  const setSize = () => {
    try {
      const width = canvas.clientWidth;
      const height = 500; // Fixed height
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      canvas.style.height = `${height}px`;
    } catch (e) {
      console.error("Error setting size:", e);
    }
  };
  
  setSize();
  window.addEventListener('resize', setSize);
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Add directional light for better definition
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Create text sprites for skills
  const createTextSprite = (skill) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256; 
    canvas.height = 128;
    
    // Background color
    context.fillStyle = `rgba(20, 20, 30, 0.8)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border gradient
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, `rgba(67, 97, 238, 0.8)`);
    gradient.addColorStop(1, `rgba(255, 0, 102, 0.8)`);
    
    context.strokeStyle = gradient;
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Skill name
    context.font = 'bold 32px Arial, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(skill.name, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    // Create material with texture
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.2, 0.6, 1);
    
    // Store skill name for interaction
    sprite.userData = { skillName: skill.name };
    
    return sprite;
  };
  
  // Create central sphere
  const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x111827,
    emissive: 0x222222,
    specular: 0x555555,
    shininess: 30,
    transparent: true,
    opacity: 0.6
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  
  // Create orbiting skill rings
  const rings = [];
  const categories = ['frontend', 'backend', 'tools', 'general'];
  
  categories.forEach((category, idx) => {
    // Filter skills by category
    const categorySkills = skillsData.filter(skill => skill.category === category);
    if (categorySkills.length === 0) return;
    
    // Create a ring for this category
    const ringGeometry = new THREE.TorusGeometry(3 + idx * 0.5, 0.05, 16, 60);
    
    const color = categorySkills[0].color;
    const ringMaterial = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.7
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Set ring orientation
    ring.rotation.x = Math.PI / 2;
    ring.rotation.y = idx * Math.PI / 4;
    
    scene.add(ring);
    rings.push({
      mesh: ring,
      category,
      rotationSpeed: 0.1 - idx * 0.02
    });
  });
  
  // Create orbiting skills
  const skillSprites = [];
  
  skillsData.forEach((skill, index) => {
    // Find which ring this skill belongs to
    const ringIndex = rings.findIndex(ring => ring.category === skill.category);
    if (ringIndex === -1) return;
    
    // Calculate position on the ring
    const angle = (index / skillsData.length) * Math.PI * 2;
    const ringRadius = 3 + ringIndex * 0.5;
    
    const x = Math.cos(angle) * ringRadius;
    const z = Math.sin(angle) * ringRadius;
    const y = (Math.random() * 0.5 - 0.25) * ringIndex; // Slight vertical variation
    
    const sprite = createTextSprite(skill);
    sprite.position.set(x, y, z);
    
    scene.add(sprite);
    skillSprites.push({
      sprite,
      initialPosition: new THREE.Vector3(x, y, z),
      category: skill.category,
      ringIndex,
      angle,
      orbitSpeed: 0.2 - ringIndex * 0.05,
      orbitOffset: Math.random() * Math.PI * 2
    });
  });
  
  // Add particles for effect
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 200;
  const positions = new Float32Array(particlesCount * 3);
  
  for(let i = 0; i < particlesCount; i++) {
    // Use spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 5 * Math.random() + 2;
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0x4361ee,
    size: 0.1,
    transparent: true,
    opacity: 0.7
  });
  
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  
  // Position camera
  camera.position.z = 10;
  
  // Mouse control
  const mouse = {
    x: 0,
    y: 0,
    lerpX: 0,
    lerpY: 0
  };
  
  document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
  });
  
  // Raycaster for skill interaction
  const raycaster = new THREE.Raycaster();
  let intersectedObject = null;
  
  // Animation
  const clock = new THREE.Clock();
  let frameId;
  
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    
    try {
      const elapsedTime = clock.getElapsedTime();
      
      // Smooth mouse movement
      mouse.lerpX += (mouse.x - mouse.lerpX) * 0.05;
      mouse.lerpY += (mouse.y - mouse.lerpY) * 0.05;
      
      // Rotate scene based on mouse
      scene.rotation.y = mouse.lerpX * 0.5;
      scene.rotation.x = mouse.lerpY * 0.3;
      
      // Rotate sphere
      sphere.rotation.y = elapsedTime * 0.1;
      
      // Rotate rings
      rings.forEach(ring => {
        ring.mesh.rotation.z += ring.rotationSpeed * 0.01;
      });
      
      // Animate orbiting skills
      skillSprites.forEach(skillData => {
        const { sprite, angle, orbitSpeed, ringIndex } = skillData;
        
        // Update position based on orbit
        const newAngle = angle + elapsedTime * orbitSpeed;
        const ringRadius = 3 + ringIndex * 0.5;
        
        const x = Math.cos(newAngle) * ringRadius;
        const z = Math.sin(newAngle) * ringRadius;
        
        sprite.position.x = x;
        sprite.position.z = z;
        
        // Make sprites face camera
        sprite.lookAt(camera.position);
      });
      
      // Rotate particles
      particles.rotation.y = elapsedTime * 0.05;
      
      // Check for hovering on skills
      raycaster.setFromCamera({ x: mouse.lerpX, y: mouse.lerpY }, camera);
      const intersects = raycaster.intersectObjects(skillSprites.map(data => data.sprite));
      
      if (intersects.length > 0) {
        if (intersectedObject !== intersects[0].object) {
          // Reset previous
          if (intersectedObject) {
            intersectedObject.scale.divideScalar(1.2);
          }
          
          // Set new
          intersectedObject = intersects[0].object;
          intersectedObject.scale.multiplyScalar(1.2);
          
          // Change cursor
          canvas.style.cursor = 'pointer';
        }
      } else {
        if (intersectedObject) {
          intersectedObject.scale.divideScalar(1.2);
          intersectedObject = null;
          canvas.style.cursor = 'default';
        }
      }
      
      // Render
      renderer.render(scene, camera);
      
      // Remove loading indicator once rendering starts
      if (loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
      }
    } catch (error) {
      console.error("Error in animation loop:", error);
      cancelAnimationFrame(frameId);
      
      // Show error message
      loadingIndicator.innerHTML = "Rendering error occurred";
    }
  };
  
  // Start animation with proper error handling
  try {
    animate();
  } catch (error) {
    console.error("Failed to start animation:", error);
    loadingIndicator.innerHTML = "Failed to start animation";
  }
  
  // Add click interaction
  canvas.addEventListener('click', () => {
    if (intersectedObject) {
      // Highlight the clicked skill
      const scale = intersectedObject.scale.x / 1.2 * 1.5;
      intersectedObject.scale.set(scale, scale / 2, 1);
      
      // Reset after delay
      setTimeout(() => {
        intersectedObject.scale.set(1.2, 0.6, 1);
      }, 1000);
    }
  });
  
  // Clean up on page unload
  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('resize', setSize);
    
    // Dispose of geometries and materials
    sphereGeometry.dispose();
    sphereMaterial.dispose();
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    
    rings.forEach(ring => {
      ring.mesh.geometry.dispose();
      ring.mesh.material.dispose();
    });
    
    // Remove from DOM
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
};

export default skillsGlobe;