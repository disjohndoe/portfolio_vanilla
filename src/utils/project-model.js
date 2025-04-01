const projectModel = () => {
  if (!window.THREE) {
    console.error("THREE.js not loaded for project models");
    return;
  }
  
  const THREE = window.THREE;
  
  // Apply to project cards
  const projectCards = document.querySelectorAll('.work-card');
  if (!projectCards.length) return;
  
  projectCards.forEach((card, index) => {
    try {
      // Create canvas element for each card
      const canvas = document.createElement('canvas');
      canvas.classList.add('project-model');
      
      // Add canvas to the card
      const imgWrapper = card.querySelector('.work-card__img-wrapper');
      if (!imgWrapper) return;
      
      // Style canvas container
      const canvasContainer = document.createElement('div');
      canvasContainer.classList.add('project-model-container');
      canvasContainer.appendChild(canvas);
      
      // Insert canvas before the image
      imgWrapper.prepend(canvasContainer);
      
      // Set up Three.js scene
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      
      // Make renderer responsive
      const setSize = () => {
        const width = imgWrapper.clientWidth;
        const height = width * 0.6; // Aspect ratio for the models
        
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        canvas.style.height = `${height}px`;
      };
      
      setSize();
      window.addEventListener('resize', setSize);
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);
      
      // Create a simple 3D model based on index
      const createSimpleModel = () => {
        const group = new THREE.Group();
        
        // Base platform
        const baseGeometry = new THREE.BoxGeometry(3, 0.2, 2);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x333333,
          shininess: 100
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);
        
        // Project-specific color
        const colors = [0x3498db, 0x2ecc71, 0xe74c3c];
        const projectColor = colors[index % colors.length];
        
        // Add a device/screen on top
        const screenGeometry = new THREE.BoxGeometry(2.5, 1.5, 0.1);
        const screenMaterial = new THREE.MeshPhongMaterial({ 
          color: 0x222222,
          shininess: 100
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.y = 1;
        screen.position.z = -0.5;
        screen.rotation.x = -Math.PI / 6; // Tilt the screen
        group.add(screen);
        
        // Add screen content
        const displayGeometry = new THREE.PlaneGeometry(2.3, 1.3);
        const displayMaterial = new THREE.MeshBasicMaterial({ 
          color: projectColor
        });
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.z = 0.06;
        screen.add(display);
        
        // Add decorative elements
        for (let i = 0; i < 5; i++) {
          const elementGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
          const elementMaterial = new THREE.MeshPhongMaterial({
            color: projectColor,
            opacity: 0.8,
            transparent: true
          });
          const element = new THREE.Mesh(elementGeometry, elementMaterial);
          
          // Position elements in a semi-circle
          const angle = (i / 4) * Math.PI;
          element.position.x = Math.cos(angle) * 1;
          element.position.z = Math.sin(angle) * 0.7;
          element.position.y = 0.2;
          
          base.add(element);
        }
        
        return group;
      };
      
      const model = createSimpleModel();
      scene.add(model);
      
      // Position camera
      camera.position.z = 5;
      
      // Mouse interaction for the model
      let isHovering = false;
      let rotationSpeed = 0.01;
      
      canvasContainer.addEventListener('mouseenter', () => {
        isHovering = true;
        rotationSpeed = 0.05;
      });
      
      canvasContainer.addEventListener('mouseleave', () => {
        isHovering = false;
        rotationSpeed = 0.01;
      });
      
      // Track mouse position
      let mouseX = 0;
      let mouseY = 0;
      
      canvasContainer.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      });
      
      // Animation
      const clock = new THREE.Clock();
      let frameId;
      
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        
        try {
          const elapsedTime = clock.getElapsedTime();
          
          // Auto rotation
          model.rotation.y = elapsedTime * rotationSpeed;
          
          // Mouse interaction when hovering
          if (isHovering) {
            model.rotation.x = mouseY * 0.3;
            model.rotation.y = mouseX * 0.5 + elapsedTime * rotationSpeed;
          } else {
            // Return to normal rotation when not hovering
            model.rotation.x *= 0.95; // Smoothly return to 0
          }
          
          // Render
          renderer.render(scene, camera);
        } catch (error) {
          console.error("Animation error in project model:", error);
          cancelAnimationFrame(frameId);
        }
      };
      
      animate();
      
      // Show/hide the 3D model on hover
      const originalImg = imgWrapper.querySelector('img');
      if (originalImg) {
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.top = '0';
        canvasContainer.style.left = '0';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.opacity = '0';
        canvasContainer.style.transition = 'opacity 0.5s ease';
        
        imgWrapper.addEventListener('mouseenter', () => {
          canvasContainer.style.opacity = '1';
          originalImg.style.opacity = '0.2';
        });
        
        imgWrapper.addEventListener('mouseleave', () => {
          canvasContainer.style.opacity = '0';
          originalImg.style.opacity = '1';
        });
      }
    } catch (error) {
      console.error("Error creating project model:", error);
    }
  });
};

export default projectModel;