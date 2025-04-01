const threeBackground = () => {
  if (!window.THREE) {
    console.error("THREE.js not loaded for background");
    return;
  }
  
  const THREE = window.THREE;
  
  // Check if the browser supports WebGL
  if (!document.querySelector('.hero')) return;
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.classList.add('three-canvas');
  document.querySelector('.hero').prepend(canvas);
  
  // Initialize scene with proper error handling
  try {
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
    
    // Create particles - simplified for performance
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000; // Reduced count for better performance
    
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    const colorPrimary = new THREE.Color(0x4361ee);
    const colorSecondary = new THREE.Color(0xff0066);
    
    for(let i = 0; i < particlesCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Color
      const mixedColor = colorPrimary.clone();
      mixedColor.lerp(colorSecondary, Math.random());
      
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    
    // Points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Camera position
    camera.position.z = 4;
    
    // Mouse movement
    const mouse = {
      x: 0,
      y: 0
    };
    
    document.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
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
    
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      try {
        const elapsedTime = clock.getElapsedTime();
        
        // Animate particles
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = elapsedTime * 0.03;
        
        // React to mouse
        particles.rotation.y += mouse.x * 0.01;
        particles.rotation.x += mouse.y * 0.01;
        
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
      
      // Dispose of resources
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
      
      // Remove from DOM
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
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