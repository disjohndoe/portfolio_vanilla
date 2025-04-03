const threeBackground = () => {
  if (!window.THREE) {
    console.error("THREE.js not loaded for background");
    return;
  }
  
  const THREE = window.THREE;
  
  // Check if the browser supports WebGL
  if (!document.body) return;
  
  // Create a dark background with the same color as --clr-dark to ensure consistency
  const bgElement = document.createElement('div');
  bgElement.style.position = 'fixed';
  bgElement.style.top = '0';
  bgElement.style.left = '0';
  bgElement.style.width = '100%';
  bgElement.style.height = '100%';
  bgElement.style.backgroundColor = 'rgb(7, 10, 19)';
  bgElement.style.zIndex = '-2';
  document.body.prepend(bgElement);
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.classList.add('three-canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);
  
  // Initialize scene with proper error handling
  try {
    // Function to create sun texture with gradient
    function createSunTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      
      // Create radial gradient for sun
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2;
      
      const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, '#FFEE33');    // Bright yellow center
      gradient.addColorStop(0.7, '#FFCC22');  // Darker yellow middle
      gradient.addColorStop(1, '#FF9900');    // Orange edge
      
      // Fill with gradient
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      return canvas;
    }
    
    // Function to create ray texture with gradient
    function createRayTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      
      // Create linear gradient for ray
      const gradient = context.createLinearGradient(32, 0, 32, 256);
      gradient.addColorStop(0, '#FFEE33');    // Yellow at base (near sun)
      gradient.addColorStop(0.6, '#FFCC22');  // Darker yellow in middle
      gradient.addColorStop(1, '#FFAA11');    // Orange at tip
      
      // Fill with gradient
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      return canvas;
    }
    
    // Check initial theme mode
    const isLightMode = document.body.classList.contains('light-mode');
    bgElement.style.backgroundColor = isLightMode ? 'rgb(241, 245, 249)' : 'rgb(7, 10, 19)';
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Stars for dark mode
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    
    const starsPositions = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);
    const starsSizes = new Float32Array(starsCount);
    
    const colorPrimary = new THREE.Color(0x4361ee);
    const colorSecondary = new THREE.Color(0xff0066);
    const colorWhite = new THREE.Color(0xffffff);
    
    for(let i = 0; i < starsCount; i++) {
      // Position - spread stars throughout the scene with better distribution
      starsPositions[i * 3] = (Math.random() - 0.5) * 20;
      starsPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      starsPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      // Randomize sizes for more realistic star field
      const sizeFactor = Math.random();
      starsSizes[i] = sizeFactor * 0.1 + 0.01;
      
      // Color - mix between primary, secondary and white
      const mixedColor = new THREE.Color();
      
      if (Math.random() > 0.7) {
        // 30% chance for colored stars
        const baseColor = Math.random() > 0.5 ? colorPrimary.clone() : colorSecondary.clone();
        mixedColor.copy(baseColor).lerp(colorWhite, 0.3 + Math.random() * 0.4);
      } else {
        // 70% chance for white/blueish stars
        mixedColor.copy(colorWhite).lerp(new THREE.Color(0xaaccff), Math.random() * 0.3);
      }
      
      starsColors[i * 3] = mixedColor.r;
      starsColors[i * 3 + 1] = mixedColor.g;
      starsColors[i * 3 + 2] = mixedColor.b;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starsSizes, 1));
    
    // Create a custom vertex shader to render stars with glow
    const starVertexShader = `
      attribute float size;
      varying vec3 vColor;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    
    // Create a custom fragment shader to render stars with glow
    const starFragmentShader = `
      varying vec3 vColor;
      
      void main() {
        // Calculate distance from center of point
        float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        
        // Softer, more natural star glow effect
        float alpha = 1.0 - smoothstep(0.2, 0.5, r);
        
        // Star core
        if (r < 0.25) {
          gl_FragColor = vec4(vColor, alpha * 1.0);
        } 
        // Star glow
        else {
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      }
    `;
    
    // Material using custom shaders
    const starsMaterial = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    // Create stars
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Create sun for light mode
    const sunGroup = new THREE.Group();
    sunGroup.position.set(-5, 4, -8);
    scene.add(sunGroup);
    
    // Sun core with gradient for more realistic look
    const sunGeometry = new THREE.CircleGeometry(1.5, 32);
    const sunTexture = new THREE.CanvasTexture(createSunTexture());
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const sunCore = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sunCore);
    
    // Eyes
    const leftEyeGeometry = new THREE.CircleGeometry(0.18, 32);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 0.3, 0.01);
    sunCore.add(leftEye);
    
    const rightEyeGeometry = new THREE.CircleGeometry(0.18, 32);
    const rightEye = new THREE.Mesh(rightEyeGeometry, eyeMaterial);
    rightEye.position.set(0.5, 0.3, 0.01);
    sunCore.add(rightEye);
    
    // White dots in eyes for more cartoon look
    const leftEyeHighlightGeometry = new THREE.CircleGeometry(0.05, 32);
    const eyeHighlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftEyeHighlight = new THREE.Mesh(leftEyeHighlightGeometry, eyeHighlightMaterial);
    leftEyeHighlight.position.set(-0.45, 0.35, 0.02);
    sunCore.add(leftEyeHighlight);
    
    const rightEyeHighlightGeometry = new THREE.CircleGeometry(0.05, 32);
    const rightEyeHighlight = new THREE.Mesh(rightEyeHighlightGeometry, eyeHighlightMaterial);
    rightEyeHighlight.position.set(0.55, 0.35, 0.02);
    sunCore.add(rightEyeHighlight);
    
    // Create a frown/neutral expression using an arc curve
    const smileCurve = new THREE.EllipseCurve(
      0, -0.1,             // cx, cy - moved up a bit
      0.7, 0.4,           // xRadius, yRadius
      0, Math.PI,         // startAngle, endAngle - REVERSED to make upward curve
      true,              // clockwise
      0                  // rotation
    );
    
    const smilePoints = smileCurve.getPoints(20);
    const smileGeometry = new THREE.BufferGeometry().setFromPoints(smilePoints);
    const smileMaterial = new THREE.LineBasicMaterial({ 
      color: 0x333333,
      linewidth: 3 
    });
    
    const smile = new THREE.Line(smileGeometry, smileMaterial);
    smile.position.set(0, 0, 0.01);
    sunCore.add(smile);
    
    // Rosy cheeks
    const leftCheekGeometry = new THREE.CircleGeometry(0.15, 32);
    const cheekMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff9999,
      transparent: true,
      opacity: 0.4
    });
    const leftCheek = new THREE.Mesh(leftCheekGeometry, cheekMaterial);
    leftCheek.position.set(-0.7, -0.25, 0.01);
    sunCore.add(leftCheek);
    
    const rightCheekGeometry = new THREE.CircleGeometry(0.15, 32);
    const rightCheek = new THREE.Mesh(rightCheekGeometry, cheekMaterial);
    rightCheek.position.set(0.7, -0.25, 0.01);
    sunCore.add(rightCheek);
    
    // Sun rays with improved shape
    const sunRaysGroup = new THREE.Group();
    const rayCount = 12;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      
      // Create a triangular ray
      const rayShape = new THREE.Shape();
      rayShape.moveTo(0, 0);
      rayShape.lineTo(-0.25, 1.8); // Left point of triangle
      rayShape.lineTo(0, 2.2);     // Tip of triangle
      rayShape.lineTo(0.25, 1.8);  // Right point of triangle
      rayShape.lineTo(0, 0);      // Back to center
      
      const rayGeometry = new THREE.ShapeGeometry(rayShape);
      
      // Create gradient texture for rays
      const rayTexture = new THREE.CanvasTexture(createRayTexture());
      const rayMaterial = new THREE.MeshBasicMaterial({
        map: rayTexture,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const ray = new THREE.Mesh(rayGeometry, rayMaterial);
      
      // Position and rotate the ray
      ray.position.set(0, 0, -0.01);
      ray.rotation.z = angle;
      
      // Add the ray to the group
      sunRaysGroup.add(ray);
    }
    
    sunGroup.add(sunRaysGroup);
    
    // Create clouds (for light mode only)
    const createCloud = (x, y, z, scale) => {
      const cloudGroup = new THREE.Group();
      
      // Create several circles to form a cloud shape
      const coreGeometry = new THREE.CircleGeometry(0.7, 16);
      const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const core = new THREE.Mesh(coreGeometry, cloudMaterial);
      cloudGroup.add(core);
      
      const parts = [
        { x: 0.6, y: 0.4, z: 0, s: 0.6 },
        { x: -0.5, y: 0.3, z: 0, s: 0.7 },
        { x: 0.2, y: -0.4, z: 0, s: 0.5 },
        { x: -0.4, y: -0.2, z: 0, s: 0.6 },
        { x: 0.5, y: 0.2, z: 0, s: 0.55 }
      ];
      
      parts.forEach(part => {
        const partGeometry = new THREE.CircleGeometry(part.s, 16);
        const partMesh = new THREE.Mesh(partGeometry, cloudMaterial);
        partMesh.position.set(part.x, part.y, part.z);
        cloudGroup.add(partMesh);
      });
      
      cloudGroup.position.set(x, y, z);
      cloudGroup.scale.set(scale, scale, scale);
      
      return cloudGroup;
    };
    
    const clouds = [
      createCloud(-10, 3, -12, 1.5),
      createCloud(-6, -2, -15, 2),
      createCloud(8, 2, -10, 1.7),
      createCloud(12, -3, -12, 2.2),
      createCloud(5, 5, -18, 3)
    ];
    
    clouds.forEach(cloud => scene.add(cloud));
    
    // Set initial mode visibility
    const setModeVisibility = (isLight) => {
      stars.visible = !isLight;
      sunGroup.visible = isLight;
      clouds.forEach(cloud => cloud.visible = isLight);
    };
    
    setModeVisibility(isLightMode);
    
    // Listen for theme changes
    const darkModeObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isLightMode = document.body.classList.contains('light-mode');
          bgElement.style.backgroundColor = isLightMode ? 'rgb(241, 245, 249)' : 'rgb(7, 10, 19)';
          setModeVisibility(isLightMode);
        }
      });
    });
    
    darkModeObserver.observe(document.body, { attributes: true });
    
    // Camera position - moved further back for full page view
    camera.position.z = 6;
    
    // Mouse movement
    const mouse = {
      x: 0,
      y: 0
    };
    
    document.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
    });
    
    // Scroll movement effect
    const scroll = {
      y: 0,
      lastScrollTop: 0,
      direction: 0
    };
    
    window.addEventListener('scroll', () => {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      scroll.y = st / 1000; // Normalize scroll value
      
      // Determine scroll direction
      scroll.direction = st > scroll.lastScrollTop ? 1 : -1;
      scroll.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    });
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation
    const clock = new THREE.Clock();
    let frameId;
    let blinkTime = Math.random() * 5; // Random initial blink time
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      try {
        const elapsedTime = clock.getElapsedTime();
        const isLightMode = document.body.classList.contains('light-mode');
        
        // Dark mode animations - stars
        if (!isLightMode) {
          // Animate stars with a slower, more subtle motion
          stars.rotation.y = elapsedTime * 0.03;
          stars.rotation.x = elapsedTime * 0.02;
          
          // Add subtle scroll-based motion
          stars.position.y = -scroll.y * 0.5;
          
          // React to mouse with smoother motion
          stars.rotation.y += (mouse.x * 0.01 - stars.rotation.y) * 0.1;
          stars.rotation.x += (mouse.y * 0.01 - stars.rotation.x) * 0.1;
          
          // Make some stars twinkle
          const starsSizes = starsGeometry.attributes.size.array;
          
          for (let i = 0; i < starsCount; i++) {
            if (Math.random() > 0.995) { // Occasional twinkle
              const originalSize = starsSizes[i];
              // Temporarily increase the size for a twinkle effect
              starsSizes[i] = originalSize * (1 + Math.sin(elapsedTime * 10) * 0.5);
              
              // Reset after a brief moment
              setTimeout(() => {
                if (starsGeometry.attributes.size) { // Check if still exists
                  starsSizes[i] = originalSize;
                  starsGeometry.attributes.size.needsUpdate = true;
                }
              }, 150);
            }
          }
          
          starsGeometry.attributes.size.needsUpdate = true;
        } 
        // Light mode animations - sun and clouds
        else {
        // Rotate sun rays at varying speeds
        sunRaysGroup.rotation.z = elapsedTime * 0.3;
        
        // Make the sun bounce slightly with a pleasant rhythm
        sunGroup.position.y = 4 + Math.sin(elapsedTime * 1.2) * 0.25;
        
        // Make the rays pulse in and out with different phases
        sunRaysGroup.children.forEach((ray, index) => {
        const offset = index * (Math.PI / 6);
        const radialScale = 1 + Math.sin(elapsedTime * 1.5 + offset) * 0.15;
        const lengthScale = 1 + Math.sin(elapsedTime * 0.8 + offset) * 0.1;
          ray.scale.set(radialScale, lengthScale, 1);
        });
        
        // Enhanced blinking animation with more natural timing
        blinkTime -= clock.getDelta();
        if (blinkTime <= 0) {
          // Close eyes with a smoother animation
          const blinkDuration = 150; // milliseconds
          const startTime = Date.now();
          
          // Create smooth blinking animation
          const blinkInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / blinkDuration;
            
            if (progress >= 1) {
              clearInterval(blinkInterval);
              leftEye.scale.y = 1;
              rightEye.scale.y = 1;
              blinkTime = 2 + Math.random() * 3; // 2-5 seconds between blinks
            } else {
              // Create a smooth close and open effect using sine function
              const blinkAmount = Math.abs(Math.sin(progress * Math.PI));
              leftEye.scale.y = 1 - (blinkAmount * 0.9); // not completely closed
              rightEye.scale.y = 1 - (blinkAmount * 0.9);
            }
          }, 16); // Approx 60fps
        }
        
        // Animate frown to move slightly with breathing - match image
        const mouthWave = Math.sin(elapsedTime * 1.2) * 0.05; // Subtle movement
        smile.position.y = -0.1 + mouthWave; // Centered on original position
        
        // Very subtle scaling to maintain the frown appearance
        smile.scale.y = 1 - Math.sin(elapsedTime) * 0.05; // Less scaling for frown
        smile.scale.x = 1 + Math.sin(elapsedTime * 0.8) * 0.03; // Subtle width change
        
        // Pulse cheeks with breathing
        const cheekPulse = 1 + Math.sin(elapsedTime * 1) * 0.15;
        leftCheek.scale.set(cheekPulse, cheekPulse, 1);
        rightCheek.scale.set(cheekPulse, cheekPulse, 1);
        
        // Simultaneous occasional blink (both eyes)
        if (Math.random() > 0.9995) {
          const startTime = Date.now();
          const quickBlinkDuration = 250;
          
          const quickBlinkInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / quickBlinkDuration;
            
            if (progress >= 1) {
              clearInterval(quickBlinkInterval);
              leftEye.scale.y = 1;
              rightEye.scale.y = 1;
            } else {
              // Quick blink
              const blinkAmount = Math.sin(progress * Math.PI);
              leftEye.scale.y = 1 - (blinkAmount * 0.9);
              rightEye.scale.y = 1 - (blinkAmount * 0.9);
            }
          }, 16);
        }
            
            // React to mouse movement - smoother sun movement
            const targetX = -5 + mouse.x * 0.8;
            sunGroup.position.x += (targetX - sunGroup.position.x) * 0.02;
          
          // Animate clouds to move slowly
          clouds.forEach((cloud, index) => {
            cloud.position.x += Math.sin(elapsedTime * 0.2 + index) * 0.003;
            cloud.position.y += Math.cos(elapsedTime * 0.3 + index * 0.5) * 0.002;
            
            // Subtle cloud rotation
            cloud.rotation.z = Math.sin(elapsedTime * 0.1 + index) * 0.05;
          });
        }
        
        // Render
        renderer.render(scene, camera);
      } catch (error) {
        console.error("Animation error:", error);
        cancelAnimationFrame(frameId);
      }
    };
    
    animate();
    
    // Clean up function
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', () => {});
      darkModeObserver.disconnect();
      
      // Dispose of resources
      starsGeometry.dispose();
      starsMaterial.dispose();
      sunGeometry.dispose();
      sunMaterial.dispose();
      
      // Clean up meshes
      sunGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      
      clouds.forEach(cloud => {
        cloud.children.forEach(part => {
          if (part.geometry) part.geometry.dispose();
          if (part.material) part.material.dispose();
        });
      });
      
      renderer.dispose();
      
      // Remove from DOM
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      if (bgElement.parentNode) {
        bgElement.parentNode.removeChild(bgElement);
      }
    };
  } catch (error) {
    console.error("Error initializing Three.js background:", error);
    
    // Remove canvas if there's an error
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    
    return null;
  }
};

export default threeBackground;