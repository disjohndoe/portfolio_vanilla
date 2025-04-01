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
  
  // Create improved text sprites for skills with better visibility
  const createTextSprite = (skill) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512; // Doubled for better resolution
    canvas.height = 160;
    
    // Function to draw rounded rectangle
    const roundRect = (x, y, width, height, radius) => {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height - radius);
      context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      context.lineTo(x + radius, y + height);
      context.quadraticCurveTo(x, y + height, x, y + height - radius);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
    };
    
    // Background with category-specific color gradient
    const skillColor = new THREE.Color(skill.color);
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, `rgba(${skillColor.r * 255}, ${skillColor.g * 255}, ${skillColor.b * 255}, 0.9)`);
    gradient.addColorStop(1, `rgba(30, 30, 40, 0.9)`);
    
    // Draw background with rounded corners
    roundRect(0, 0, canvas.width, canvas.height, 20);
    context.fillStyle = gradient;
    context.fill();
    
    // Add glow effect
    context.shadowColor = `rgba(${skillColor.r * 255}, ${skillColor.g * 255}, ${skillColor.b * 255}, 0.8)`;
    context.shadowBlur = 15;
    
    // Add border
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 4;
    roundRect(2, 2, canvas.width - 4, canvas.height - 4, 18);
    context.stroke();
    
    // Skill name with larger, more readable font
    context.font = 'bold 52px Arial, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(skill.name, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // Create material with texture
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.6, 0.8, 1); // Larger scale for better visibility
    
    // Store skill data for interaction
    sprite.userData = { 
      skillName: skill.name,
      category: skill.category,
      color: skill.color,
      originalScale: {x: 1.6, y: 0.8, z: 1}
    };
    
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
  
  // Create orbiting skill rings - without the blue ring
  const rings = [];
  const categories = ['frontend', 'backend', 'tools']; // 'general' removed
  
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
    
    let x, y, z;
    
    if (ringIndex === -1) {
      // Place 'general' skills in a cloud around the sphere
      const angle = (index / skillsData.length) * Math.PI * 2;
      const elevation = Math.random() * Math.PI - Math.PI/2;
      const radius = 3.5;
      
      x = radius * Math.cos(elevation) * Math.cos(angle);
      y = radius * Math.sin(elevation);
      z = radius * Math.cos(elevation) * Math.sin(angle);
    } else {
      // For skills with a category ring, place them on that ring
      const angle = (index / skillsData.length) * Math.PI * 2;
      const ringRadius = 3 + ringIndex * 0.5;
      
      x = Math.cos(angle) * ringRadius;
      z = Math.sin(angle) * ringRadius;
      y = (Math.random() * 0.5 - 0.25) * ringIndex; // Slight vertical variation
    }
    
    const sprite = createTextSprite(skill);
    sprite.position.set(x, y, z);
    
    scene.add(sprite);
    skillSprites.push({
      sprite,
      initialPosition: new THREE.Vector3(x, y, z),
      category: skill.category,
      ringIndex,
      angle: index / skillsData.length * Math.PI * 2,
      orbitSpeed: ringIndex === -1 ? 0.05 : (0.2 - ringIndex * 0.05),
      orbitOffset: Math.random() * Math.PI * 2,
      highlighted: false,
      animationProgress: 0
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
  
  // Create highlight effect objects
  const createHighlightEffects = () => {
    // Create glow ring for highlighting selected skill
    const glowRingGeometry = new THREE.TorusGeometry(0.8, 0.05, 16, 32);
    const glowRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
    scene.add(glowRing);
    
    // Create particles for highlight effect
    const highlightParticlesGeometry = new THREE.BufferGeometry();
    const highlightParticlesCount = 50;
    const highlightPositions = new Float32Array(highlightParticlesCount * 3);
    
    for(let i = 0; i < highlightParticlesCount * 3; i++) {
      highlightPositions[i] = 0;
    }
    
    highlightParticlesGeometry.setAttribute('position', 
      new THREE.BufferAttribute(highlightPositions, 3));
    
    const highlightParticlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    
    const highlightParticles = new THREE.Points(
      highlightParticlesGeometry, highlightParticlesMaterial);
    scene.add(highlightParticles);
    
    return { glowRing, highlightParticles };
  };
  
  const highlightEffects = createHighlightEffects();
  
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
  let selectedSkill = null;
  let cameraTarget = new THREE.Vector3(0, 0, 0);
  
  // Animation variables
  let isAnimating = false;
  let animationStartTime = 0;
  const ANIMATION_DURATION = 1.0; // seconds
  
  // Helper functions for cool effects
  const focusOnSkill = (skillData) => {
    if (isAnimating) return;
    
    // Set the selected skill
    selectedSkill = skillData;
    isAnimating = true;
    animationStartTime = Date.now() / 1000;
    
    // Save original positions
    scene.userData.originalCameraPos = camera.position.clone();
    scene.userData.originalCameraTarget = cameraTarget.clone();
    scene.userData.originalRotation = scene.rotation.clone();
    
    // Set target position
    const targetPosition = skillData.sprite.position.clone();
    
    // Position highlight effects
    const color = new THREE.Color(skillData.sprite.userData.color);
    highlightEffects.glowRing.material.color = color;
    highlightEffects.glowRing.position.copy(targetPosition);
    highlightEffects.glowRing.lookAt(camera.position);
    
    // Update highlight particles
    const particlePositions = highlightEffects.highlightParticles.geometry.attributes.position.array;
    
    for(let i = 0; i < particlePositions.length / 3; i++) {
      const radius = 1.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      particlePositions[i * 3] = targetPosition.x + radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = targetPosition.y + radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = targetPosition.z + radius * Math.cos(phi);
    }
    
    highlightEffects.highlightParticles.geometry.attributes.position.needsUpdate = true;
    highlightEffects.highlightParticles.position.set(0, 0, 0);
    
    // Create description panel
    const infoPanel = document.createElement('div');
    infoPanel.className = 'skill-info-panel';
    infoPanel.innerHTML = `
      <h3>${skillData.sprite.userData.skillName}</h3>
      <div class="skill-category">Category: ${skillData.category}</div>
    `;
    
    // Remove any existing panel
    const existingPanel = document.querySelector('.skill-info-panel');
    if (existingPanel) {
      existingPanel.parentNode.removeChild(existingPanel);
    }
    
    // Add panel to DOM
    canvas.parentNode.appendChild(infoPanel);
    
    // Fade in the panel
    setTimeout(() => {
      infoPanel.style.opacity = '1';
    }, 10);
  };
  
  const resetFocus = () => {
    if (!selectedSkill || !isAnimating) return;
    
    // Start reset animation
    isAnimating = true;
    animationStartTime = Date.now() / 1000;
    
    // Set the flag to indicate we're resetting
    scene.userData.isResetting = true;
    
    // Fade out info panel
    const infoPanel = document.querySelector('.skill-info-panel');
    if (infoPanel) {
      infoPanel.style.opacity = '0';
      setTimeout(() => {
        if (infoPanel.parentNode) {
          infoPanel.parentNode.removeChild(infoPanel);
        }
      }, 500);
    }
    
    // Reset selection
    selectedSkill = null;
  };
  
  // Animation
  const clock = new THREE.Clock();
  let frameId;
  
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    
    try {
      const elapsedTime = clock.getElapsedTime();
      const currentTime = Date.now() / 1000;
      
      // Handle animation transitions
      if (isAnimating) {
        const animationProgress = Math.min(
          (currentTime - animationStartTime) / ANIMATION_DURATION, 1.0);
        
        if (selectedSkill && !scene.userData.isResetting) {
          // Animating focus on a skill
          
          // Move the skill toward the camera slightly
          const sprite = selectedSkill.sprite;
          const initialPos = selectedSkill.initialPosition.clone();
          const dir = camera.position.clone().sub(initialPos).normalize();
          const targetPos = initialPos.clone().add(dir.multiplyScalar(1.5));
          
          sprite.position.lerp(targetPos, animationProgress);
          
          // Grow the skill sprite
          const scale = sprite.userData.originalScale;
          sprite.scale.set(
            scale.x * (1 + animationProgress * 0.8),
            scale.y * (1 + animationProgress * 0.8),
            scale.z
          );
          
          // Fade in highlight effects
          highlightEffects.glowRing.material.opacity = animationProgress * 0.7;
          highlightEffects.glowRing.rotation.z = elapsedTime * 0.5;
          highlightEffects.glowRing.scale.set(
            1 + Math.sin(elapsedTime * 3) * 0.1,
            1 + Math.sin(elapsedTime * 3) * 0.1,
            1
          );
          
          highlightEffects.highlightParticles.material.opacity = animationProgress * 0.7;
          highlightEffects.highlightParticles.material.size = 0.15 + Math.sin(elapsedTime * 2) * 0.05;
          
          // Slow down other animations
          scene.userData.timeScale = 1.0 - animationProgress * 0.7;
        } else if (scene.userData.isResetting) {
          // Animating back to normal view
          
          // Reset any previously focused skill
          if (selectedSkill) {
            const sprite = selectedSkill.sprite;
            const initialPos = selectedSkill.initialPosition.clone();
            
            // Move back to original position
            sprite.position.lerp(initialPos, animationProgress);
            
            // Return to original scale
            const scale = sprite.userData.originalScale;
            sprite.scale.lerp(new THREE.Vector3(scale.x, scale.y, scale.z), animationProgress);
          }
          
          // Fade out highlight effects
          highlightEffects.glowRing.material.opacity = 0.7 * (1 - animationProgress);
          highlightEffects.highlightParticles.material.opacity = 0.7 * (1 - animationProgress);
          
          // Return to normal animation speed
          scene.userData.timeScale = 0.3 + animationProgress * 0.7;
          
          if (animationProgress >= 1.0) {
            scene.userData.isResetting = false;
            scene.userData.timeScale = 1.0;
          }
        }
        
        // End animation when complete
        if (animationProgress >= 1.0) {
          isAnimating = false;
        }
      }
      
      // Get the effective time scale for animations
      const timeScale = scene.userData.timeScale || 1.0;
      
      // Smooth mouse movement
      mouse.lerpX += (mouse.x - mouse.lerpX) * 0.05 * timeScale;
      mouse.lerpY += (mouse.y - mouse.lerpY) * 0.05 * timeScale;
      
      // Rotate scene based on mouse (unless focused)
      if (!selectedSkill || scene.userData.isResetting) {
        scene.rotation.y = mouse.lerpX * 0.5;
        scene.rotation.x = mouse.lerpY * 0.3;
      }
      
      // Rotate sphere
      sphere.rotation.y = elapsedTime * 0.1 * timeScale;
      
      // Rotate rings
      rings.forEach(ring => {
        ring.mesh.rotation.z += ring.rotationSpeed * 0.01 * timeScale;
      });
      
      // Animate orbiting skills (except selected one)
      skillSprites.forEach(skillData => {
        if (skillData === selectedSkill && !scene.userData.isResetting) return;
        
        const { sprite, angle, orbitSpeed, ringIndex } = skillData;
        
        // For skills with a ring
        if (ringIndex !== -1) {
          // Update position based on orbit
          const newAngle = angle + elapsedTime * orbitSpeed * timeScale;
          const ringRadius = 3 + ringIndex * 0.5;
          
          const x = Math.cos(newAngle) * ringRadius;
          const z = Math.sin(newAngle) * ringRadius;
          
          sprite.position.x = x;
          sprite.position.z = z;
        } else {
          // For skills without a ring (general category),
          // add a gentle floating motion
          const initialPos = skillData.initialPosition;
          sprite.position.x = initialPos.x + Math.sin(elapsedTime * 0.2 + angle * 5) * 0.2 * timeScale;
          sprite.position.y = initialPos.y + Math.sin(elapsedTime * 0.3 + angle * 3) * 0.2 * timeScale;
          sprite.position.z = initialPos.z + Math.sin(elapsedTime * 0.4 + angle * 4) * 0.2 * timeScale;
        }
        
        // Make sprites face camera
        sprite.lookAt(camera.position);
      });
      
      // Rotate particles
      particles.rotation.y = elapsedTime * 0.05 * timeScale;
      
      // Check for hovering on skills (only if not already focused)
      if (!selectedSkill) {
        raycaster.setFromCamera({ x: mouse.lerpX, y: mouse.lerpY }, camera);
        const intersects = raycaster.intersectObjects(skillSprites.map(data => data.sprite));
        
        if (intersects.length > 0) {
          if (intersectedObject !== intersects[0].object) {
            // Reset previous
            if (intersectedObject) {
              intersectedObject.scale.copy(
                new THREE.Vector3(
                  intersectedObject.userData.originalScale.x,
                  intersectedObject.userData.originalScale.y,
                  intersectedObject.userData.originalScale.z
                )
              );
            }
            
            // Set new
            intersectedObject = intersects[0].object;
            intersectedObject.scale.set(
              intersectedObject.userData.originalScale.x * 1.2,
              intersectedObject.userData.originalScale.y * 1.2,
              intersectedObject.userData.originalScale.z
            );
            
            // Change cursor
            canvas.style.cursor = 'pointer';
          }
        } else {
          if (intersectedObject) {
            intersectedObject.scale.copy(
              new THREE.Vector3(
                intersectedObject.userData.originalScale.x,
                intersectedObject.userData.originalScale.y,
                intersectedObject.userData.originalScale.z
              )
            );
            intersectedObject = null;
            canvas.style.cursor = 'default';
          }
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
    // Set default time scale
    scene.userData.timeScale = 1.0;
    animate();
  } catch (error) {
    console.error("Failed to start animation:", error);
    loadingIndicator.innerHTML = "Failed to start animation";
  }
  
  // Add click interaction to select/deselect skills
  canvas.addEventListener('click', (event) => {
    // If already animating, ignore clicks
    if (isAnimating) return;
    
    if (selectedSkill) {
      // Reset focus if already selected
      resetFocus();
    } else if (intersectedObject) {
      // Find the skill data for the clicked object
      const skillData = skillSprites.find(data => data.sprite === intersectedObject);
      if (skillData) {
        focusOnSkill(skillData);
      }
    }
  });
  
  // Add CSS for skill info panel
  const style = document.createElement('style');
  style.textContent = `
    .skill-info-panel {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      border: 1px solid rgba(67, 97, 238, 0.5);
      box-shadow: 0 0 20px rgba(67, 97, 238, 0.3);
      text-align: center;
      transition: opacity 0.5s ease;
      opacity: 0;
      z-index: 10;
    }
    
    .skill-info-panel h3 {
      margin: 0 0 10px 0;
      font-size: 18px;
      background: linear-gradient(90deg, #4361ee, #ff0066);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .skill-category {
      font-size: 14px;
      opacity: 0.8;
    }
  `;
  document.head.appendChild(style);
  
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
    
    // Remove any skill info panels
    const infoPanel = document.querySelector('.skill-info-panel');
    if (infoPanel && infoPanel.parentNode) {
      infoPanel.parentNode.removeChild(infoPanel);
    }
  };
};

export default skillsGlobe;