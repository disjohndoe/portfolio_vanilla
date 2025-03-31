import * as THREE from 'three';

const projectModel = () => {
  // Apply to project cards
  const projectCards = document.querySelectorAll('.work-card');
  if (!projectCards.length) return;
  
  projectCards.forEach((card, index) => {
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
      antialias: true 
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
    
    // Create different model for each project
    let model;
    
    // Helper function to create a laptop model
    const createLaptop = () => {
      const group = new THREE.Group();
      
      // Screen
      const screenGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
      const screenMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x333333,
        shininess: 100
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      group.add(screen);
      
      // Screen display
      const displayGeometry = new THREE.PlaneGeometry(1.8, 1.3);
      const displayMaterial = new THREE.MeshBasicMaterial({ 
        color: index === 0 ? 0x3498db : index === 1 ? 0x2ecc71 : 0xe74c3c
      });
      const display = new THREE.Mesh(displayGeometry, displayMaterial);
      display.position.z = 0.06;
      screen.add(display);
      
      // Base
      const baseGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
      const baseMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x555555,
        shininess: 100
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -0.8;
      base.position.z = 0.75;
      group.add(base);
      
      // Keyboard
      const keyboardGeometry = new THREE.PlaneGeometry(1.8, 1.3);
      const keyboardMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x222222
      });
      const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
      keyboard.rotation.x = -Math.PI / 2;
      keyboard.position.y = 0.05;
      keyboard.position.z = 0.75;
      base.add(keyboard);
      
      return group;
    };
    
    // Helper function to create website layout model
    const createWebsiteModel = () => {
      const group = new THREE.Group();
      
      // Frame
      const frameGeometry = new THREE.BoxGeometry(3, 2, 0.1);
      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 30
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      group.add(frame);
      
      // Header
      const headerGeometry = new THREE.BoxGeometry(2.8, 0.3, 0.11);
      const headerMaterial = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x3498db : index === 1 ? 0x2ecc71 : 0xe74c3c
      });
      const header = new THREE.Mesh(headerGeometry, headerMaterial);
      header.position.z = 0.1;
      header.position.y = 0.8;
      group.add(header);
      
      // Content blocks
      const createBlock = (width, height, x, y, color = 0xcccccc) => {
        const blockGeometry = new THREE.BoxGeometry(width, height, 0.11);
        const blockMaterial = new THREE.MeshBasicMaterial({ color });
        const block = new THREE.Mesh(blockGeometry, blockMaterial);
        block.position.set(x, y, 0.1);
        return block;
      };
      
      // Add some random content blocks with project-specific colors
      const projectColor = index === 0 ? 0x3498db : index === 1 ? 0x2ecc71 : 0xe74c3c;
      
      group.add(createBlock(1.3, 1, -0.7, 0.1));
      group.add(createBlock(1.3, 0.3, 0.7, 0.45, projectColor));
      group.add(createBlock(1.3, 0.5, 0.7, -0.1));
      group.add(createBlock(2.8, 0.3, 0, -0.7, projectColor));
      
      return group;
    };
    
    // Create a different model for each project
    switch(index) {
      case 0:
        model = createWebsiteModel();
        break;
      case 1:
        model = createLaptop();
        break;
      case 2:
        model = createWebsiteModel();
        break;
      default:
        model = createLaptop();
    }
    
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
    
    const animate = () => {
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
      requestAnimationFrame(animate);
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
  });
};

export default projectModel;