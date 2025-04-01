/**
 * Simple utility to ensure the globe is visible on all devices
 * This script adds a fallback when WebGL isn't working
 */
const ensureGlobeVisible = () => {
  // Wait for DOM to be ready
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const globeContainer = document.querySelector('.globe-container');
      
      if (!globeContainer) {
        console.warn('Globe container not found in DOM');
        return;
      }
      
      // Force visibility of the container
      globeContainer.style.display = 'block';
      globeContainer.style.visibility = 'visible';
      
      // Check if there's a canvas inside the container
      const canvas = globeContainer.querySelector('canvas');
      
      // If no canvas is found (WebGL failed to initialize), create a fallback
      if (!canvas || canvas.offsetHeight === 0) {
        console.log('Canvas missing or hidden, creating fallback');
        
        // Create fallback canvas
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = globeContainer.clientWidth;
        fallbackCanvas.height = globeContainer.clientHeight;
        fallbackCanvas.style.position = 'absolute';
        fallbackCanvas.style.top = '0';
        fallbackCanvas.style.left = '0';
        fallbackCanvas.style.width = '100%';
        fallbackCanvas.style.height = '100%';
        fallbackCanvas.style.display = 'block';
        fallbackCanvas.style.zIndex = '101';
        
        // Add a simple visualization to the canvas
        const ctx = fallbackCanvas.getContext('2d');
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, fallbackCanvas.height);
        gradient.addColorStop(0, '#071019');
        gradient.addColorStop(1, '#131b2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
        
        // Draw a circle representing the globe
        const centerX = fallbackCanvas.width / 2;
        const centerY = fallbackCanvas.height / 2;
        const radius = Math.min(fallbackCanvas.width, fallbackCanvas.height) / 3;
        
        // Draw glowing circle
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius + i, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(67, 97, 238, ${0.1 - i * 0.02})`;
          ctx.lineWidth = 20 - i * 3;
          ctx.stroke();
        }
        
        // Draw globe wireframe
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw some horizontal lines
        for (let i = 1; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Draw some vertical lines
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - radius);
          ctx.lineTo(centerX, centerY + radius);
          ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)';
          ctx.lineWidth = 1;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(i * Math.PI / 4);
          ctx.translate(-centerX, -centerY);
          ctx.moveTo(centerX, centerY - radius);
          ctx.lineTo(centerX, centerY + radius);
          ctx.stroke();
          ctx.restore();
        }
        
        // Draw skill dots
        const skills = ['HTML', 'CSS', 'JS', 'React', 'Git', 'Python', 'Bootstrap'];
        const colors = ['#00aaff', '#ff5500', '#88cc00', '#aa44ff', '#ffaa00', '#00ccaa', '#ff66cc'];
        
        skills.forEach((skill, i) => {
          const angle = (i / skills.length) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius * 0.8;
          const y = centerY + Math.sin(angle) * radius * 0.8;
          
          // Draw dot
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = colors[i % colors.length];
          ctx.fill();
          
          // Draw text
          ctx.font = '12px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(skill, x, y);
        });
        
        // Add fallback notice
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('Interactive 3D Skills Globe', centerX, centerY - radius - 20);
        ctx.font = '12px Arial';
        ctx.fillText('Use the skills panel to explore →', centerX, centerY + radius + 30);
        
        // Add to container
        globeContainer.appendChild(fallbackCanvas);
        
        // Add text explanation
        const fallbackText = document.createElement('div');
        fallbackText.className = 'globe-fallback';
        fallbackText.textContent = 'Interactive Skills Globe';
        fallbackText.style.display = 'none'; // Hidden by default since we have the canvas
        globeContainer.appendChild(fallbackText);
      }
    }, 500); // Slight delay to ensure the globe has had time to initialize
  });
};

export default ensureGlobeVisible;