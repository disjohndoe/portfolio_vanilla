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
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Add directional light for better definition
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Add point lights with colors
  const pointLight1 = new THREE.PointLight(0x4361ee, 1, 10);
  pointLight1.position.set(3, 2, 3);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xff0066, 1, 10);
  pointLight2.position.set(-3, -2, -3);
  scene.add(pointLight2);
  
  // Create improved text sprites for skills
  const createTextSprite = (text) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Background - create gradient
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'rgba(67, 97, 238, 0.85)'); // Primary blue
    gradient.addColorStop(1, 'rgba(255, 0, 102, 0.85)'); // Secondary pink
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 4;
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Add glow effect
    context.shadowColor = 'rgba(255, 255, 255, 0.5)';
    context.shadowBlur = 10;
    
    // Text
    context.font = 'bold 32px Inter, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Improve text quality
    
    // Create material with texture
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.2, 0.6, 1);
    
    return sprite;
  };
  
  // Create central sphere
  const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
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
  
  // Add atmosphere glow
  const glowGeometry = new THREE.SphereGeometry(1.55, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0x4361ee) },
      innerRadius: { value: 1.5 },
      outerRadius: { value: 1.8 }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float innerRadius;
      uniform float outerRadius;
      varying vec3 vNormal;
      void main() {
        float intensity = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        intensity = pow(intensity, 2.0);
        gl_FragColor = vec4(glowColor, intensity * 0.5);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glowMesh);
  
  // Create globe of skills
  const radius = 3;
  const skillSprites = [];
  
  skills.forEach((skill, index) => {
    // Use Fibonacci sphere for better distribution
    const y = 1 - (index / (skills.length - 1)) * 2;
    const phi = Math.acos(y);
    const theta = Math.sqrt(skills.length * Math.PI) * phi;
    
    const sprite = createTextSprite(skill);
    
    sprite.position.x = radius * Math.sin(phi) * Math.cos(theta);
    sprite.position.y = radius * Math.sin(phi) * Math.sin(theta);
    sprite.position.z = radius * Math.cos(phi);
    
    scene.add(sprite);
    skillSprites.push({
      sprite,
      initialPosition: sprite.position.clone(),
      orbitSpeed: Math.random() * 0.01 + 0.005,
      orbitOffset: Math.random() * Math.PI * 2
    });
  });
  
  // Add more particles for a richer effect
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 300;
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  
  const colorPrimary = new THREE.Color(0x4361ee);
  const colorSecondary = new THREE.Color(0xff0066);
  
  for(let i = 0; i < particlesCount; i++) {
    // Use spherical distribution
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radiusRandom = (radius - 1) * (0.3 + Math.random() * 0.7);
    
    positions[i * 3] = radiusRandom * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radiusRandom * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radiusRandom * Math.cos(phi);
    
    // Mix colors
    const mixedColor = colorPrimary.clone();
    mixedColor.lerp(colorSecondary, Math.random());
    
    colors[i * 3] = mixedColor.r;
    colors[i * 3 + 1] = mixedColor.g;
    colors[i * 3 + 2] = mixedColor.b;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // Create particles material with custom size and vertex colors
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  
  const particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
  
  // Create better connections between nodes (skills)
  const createConnections = () => {
    // Remove old connections if they exist
    scene.children.forEach(child => {
      if (child.userData && child.userData.isConnection) {
        scene.remove(child);
      }
    });
    
    // Create new connections
    for(let i = 0; i < skillSprites.length; i++) {
      for(let j = i + 1; j < skillSprites.length; j++) {
        // Add more connections but keep it clean
        if (Math.random() > 0.75) {
          const pos1 = skillSprites[i].sprite.position;
          const pos2 = skillSprites[j].sprite.position;
          
          // Determine if positions are near enough
          const distance = pos1.distanceTo(pos2);
          if (distance < radius * 1.2) {
            // Create line geometry
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([pos1, pos2]);
            
            // Calculate connection strength
            const alpha = 1.0 - (distance / (radius * 1.2));
            
            // Create gradient material
            const lineMaterial = new THREE.LineBasicMaterial({
              color: Math.random() > 0.5 ? 0x4361ee : 0xff0066,
              transparent: true,
              opacity: alpha * 0.5,
              blending: THREE.AdditiveBlending
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.userData = { isConnection: true };
            scene.add(line);
          }
        }
      }
    }
  };
  
  // Position camera
  camera.position.z = 7;
  
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
  
  // Animation
  const clock = new THREE.Clock();
  
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Smooth mouse movement
    mouse.lerpX += (mouse.x - mouse.lerpX) * 0.05;
    mouse.lerpY += (mouse.y - mouse.lerpY) * 0.05;
    
    // Rotate entire scene based on mouse
    scene.rotation.y = mouse.lerpX * 0.5;
    scene.rotation.x = mouse.lerpY * 0.3;
    
    // Rotate core sphere
    sphere.rotation.y = elapsedTime * 0.1;
    sphere.rotation.x = elapsedTime * 0.05;
    
    // Update glow effect
    glowMaterial.uniforms.glowColor.value.setHSL(
      (elapsedTime * 0.03) % 1, 
      0.6, 
      0.6
    );
    
    // Animate skills with orbital motion
    skillSprites.forEach((skillData, index) => {
      const { sprite, initialPosition, orbitSpeed, orbitOffset } = skillData;
      
      // Calculate orbit
      const orbitAngle = elapsedTime * orbitSpeed + orbitOffset;
      const orbitRadius = 0.2;
      
      // Apply orbit to position
      sprite.position.x = initialPosition.x + Math.cos(orbitAngle) * orbitRadius;
      sprite.position.y = initialPosition.y + Math.sin(orbitAngle) * orbitRadius;
      sprite.position.z = initialPosition.z + Math.sin(orbitAngle * 0.5) * orbitRadius;
      
      // Make sprites always face the camera
      sprite.lookAt(camera.position);
    });
    
    // Rotate particles
    particles.rotation.y = elapsedTime * 0.03;
    
    // Periodically update connections
    if (Math.floor(elapsedTime * 2) % 5 === 0) {
      createConnections();
    }
    
    // Render
    renderer.render(scene, camera);
    
    // Call animate again on the next frame
    requestAnimationFrame(animate);
  };
  
  // Initial connections
  createConnections();
  
  // Start animation
  animate();
};

export default skillsGlobe;