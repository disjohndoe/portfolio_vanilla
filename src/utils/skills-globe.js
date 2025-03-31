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
    
    // Assign skill level (1-10) - in a real app, you would get this from data
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
  const renderer = new THREE.WebGLRenderer({ 
    canvas,
    alpha: true,
    antialias: true 
  });
  
  // Set size based on container - BIGGER
  const setSize = () => {
    const width = canvas.clientWidth;
    const height = 500; // Increased height from 400 to 500
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
  
  // Add dynamic point lights that move around
  const pointLights = [];
  const pointLightColors = [0x4361ee, 0xff0066, 0x00ffff, 0xffff00];
  
  for (let i = 0; i < 4; i++) {
    const light = new THREE.PointLight(pointLightColors[i], 1, 10);
    light.position.set(
      Math.cos(i * Math.PI/2) * 5,
      Math.sin(i * Math.PI/2) * 5,
      0
    );
    light.userData = {
      angle: i * Math.PI/2,
      radius: 5,
      speed: 0.3 + Math.random() * 0.2,
      oscillation: Math.random() * Math.PI * 2
    };
    scene.add(light);
    pointLights.push(light);
  }
  
  // Create improved text sprites for skills
  const createTextSprite = (skill) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512; // Doubled for higher resolution
    canvas.height = 200;
    
    // Background - create gradient with skill category color
    const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
    const skillColor = new THREE.Color(skill.color);
    
    gradient.addColorStop(0, `rgba(${skillColor.r * 255}, ${skillColor.g * 255}, ${skillColor.b * 255}, 0.85)`);
    gradient.addColorStop(1, 'rgba(40, 40, 50, 0.85)');
    
    // Round rectangle function
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
    
    // Draw rounded rectangle
    roundRect(0, 0, canvas.width, canvas.height, 20);
    context.fillStyle = gradient;
    context.fill();
    
    // Border
    context.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    context.lineWidth = 6;
    roundRect(3, 3, canvas.width - 6, canvas.height - 6, 17);
    context.stroke();
    
    // Add glow effect
    context.shadowColor = 'rgba(255, 255, 255, 0.7)';
    context.shadowBlur = 15;
    
    // Skill name
    context.font = 'bold 48px Inter, sans-serif';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(skill.name, canvas.width / 2, canvas.height * 0.4);
    
    // Draw skill level bar
    const barWidth = 300;
    const barHeight = 12;
    const barX = (canvas.width - barWidth) / 2;
    const barY = canvas.height * 0.7;
    
    // Background bar
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    roundRect(barX, barY, barWidth, barHeight, 6);
    context.fill();
    
    // Skill level fill
    const fillWidth = (skill.level / 10) * barWidth;
    const levelGradient = context.createLinearGradient(barX, 0, barX + fillWidth, 0);
    levelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    levelGradient.addColorStop(1, `rgba(${skillColor.r * 255}, ${skillColor.g * 255}, ${skillColor.b * 255}, 0.9)`);
    
    context.fillStyle = levelGradient;
    roundRect(barX, barY, fillWidth, barHeight, 6);
    context.fill();
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Improve text quality
    
    // Create material with texture
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 0.8, 1); // Bigger sprites
    
    return sprite;
  };
  
  // Create central sphere - bigger and more complex
  const sphereGeometry = new THREE.SphereGeometry(2, 64, 64); // Bigger radius, more segments
  
  // Create custom shader material for the core
  const sphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(0x111827) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 baseColor;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        // First corner
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        // Permutations
        i = mod289(i);
        vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
              
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
      
      void main() {
        // Create a noise pattern that changes over time
        float noise = snoise(vec3(vPosition * 2.0 + time * 0.1));
        
        // Create code-like pattern using grid lines
        float gridX = step(0.97, mod(vPosition.x * 15.0 + time * 0.1, 1.0));
        float gridY = step(0.97, mod(vPosition.y * 15.0, 1.0));
        float gridZ = step(0.97, mod(vPosition.z * 15.0 - time * 0.05, 1.0));
        
        float grid = max(max(gridX, gridY), gridZ) * 0.3;
        
        // Edge highlight effect
        float edge = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        edge = pow(edge, 3.0) * 0.5;
        
        // Combine effects
        vec3 color = baseColor + vec3(edge) + vec3(grid) + vec3(noise * 0.1);
        
        // Pulse effect
        float pulse = 0.5 + 0.5 * sin(time);
        color += vec3(0.0, 0.2, 0.4) * pulse * edge;
        
        gl_FragColor = vec4(color, 0.85);
      }
    `,
    transparent: true
  });
  
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);
  
  // Add matrix-like code rain background
  const createCodeRain = () => {
    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const opacities = new Float32Array(count);
    const lifeTimes = new Float32Array(count);
    const characters = ['0', '1', '{', '}', '(', ')', ';', '=', '+', '*', '/', '<', '>', '$', '#'];
    
    for (let i = 0; i < count; i++) {
      // Random position in a larger sphere
      const radius = 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random attributes
      scales[i] = Math.random() * 0.3 + 0.1;
      speeds[i] = Math.random() * 0.5 + 0.5;
      opacities[i] = Math.random() * 0.5 + 0.5;
      lifeTimes[i] = Math.random();
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifeTimes, 1));
    
    // Create materials for code characters
    const codeRainMaterials = [];
    
    for (const char of characters) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      
      // Draw character
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Gradient for code characters
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#4361ee');
      gradient.addColorStop(1, '#ff0066');
      
      ctx.fillStyle = gradient;
      ctx.fillText(char, canvas.width / 2, canvas.height / 2);
      
      // Create texture
      const texture = new THREE.CanvasTexture(canvas);
      
      const material = new THREE.PointsMaterial({
        size: 0.5,
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      
      codeRainMaterials.push(material);
    }
    
    // Create multiple particle systems with different characters
    const codeRainGroups = [];
    
    for (let i = 0; i < characters.length; i++) {
      const partialGeometry = geometry.clone();
      const startIdx = Math.floor(count / characters.length * i);
      const endIdx = Math.floor(count / characters.length * (i + 1));
      
      // Extract a portion of the points for each character
      const positions = geometry.attributes.position.array;
      const partialPositions = new Float32Array((endIdx - startIdx) * 3);
      for (let j = startIdx; j < endIdx; j++) {
        partialPositions[(j - startIdx) * 3] = positions[j * 3];
        partialPositions[(j - startIdx) * 3 + 1] = positions[j * 3 + 1];
        partialPositions[(j - startIdx) * 3 + 2] = positions[j * 3 + 2];
      }
      
      partialGeometry.setAttribute('position', new THREE.BufferAttribute(partialPositions, 3));
      
      const particles = new THREE.Points(partialGeometry, codeRainMaterials[i]);
      particles.userData = {
        originalPositions: [...partialPositions],
        startIdx, endIdx
      };
      
      scene.add(particles);
      codeRainGroups.push(particles);
    }
    
    return codeRainGroups;
  };
  
  const codeRainGroups = createCodeRain();
  
  // Add atmosphere glow
  const glowGeometry = new THREE.SphereGeometry(2.1, 64, 64);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec3 vNormal;
      void main() {
        float intensity = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        intensity = pow(intensity, 2.0);
        
        // Changing glow color over time
        vec3 color1 = vec3(0.1, 0.2, 0.5); // Deep blue
        vec3 color2 = vec3(0.5, 0.1, 0.3); // Purple
        vec3 glowColor = mix(color1, color2, 0.5 + 0.5 * sin(time * 0.5));
        
        gl_FragColor = vec4(glowColor, intensity * 0.8);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glowMesh);
  
  // Create orbiting skill rings
  const createSkillRings = () => {
    const rings = [];
    const categories = ['frontend', 'backend', 'tools', 'general'];
    
    categories.forEach((category, idx) => {
      // Filter skills by category
      const categorySkills = skillsData.filter(skill => skill.category === category);
      if (categorySkills.length === 0) return;
      
      // Create a ring for this category
      const ringGeometry = new THREE.TorusGeometry(3 + idx * 0.5, 0.05, 16, 100);
      
      // Use category color for the ring
      const color = categorySkills[0].color;
      const ringMaterial = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2,
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
    
    return rings;
  };
  
  const skillRings = createSkillRings();
  
  // Create orbit skill containers with orbit lines
  const createOrbitLines = () => {
    const orbitLines = [];
    
    skillRings.forEach((ring, ringIdx) => {
      const categorySkills = skillsData.filter(skill => skill.category === ring.category);
      
      // Create orbit line
      const curve = new THREE.EllipseCurve(
        0, 0,             // Center x, y
        3 + ringIdx * 0.5, 3 + ringIdx * 0.5, // xRadius, yRadius
        0, 2 * Math.PI,   // Start angle, end angle
        false,            // Clockwise
        0                 // Rotation
      );
      
      const points = curve.getPoints(100);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const color = new THREE.Color(categorySkills[0].color);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3
      });
      
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2;
      orbitLine.rotation.y = ringIdx * Math.PI / 4;
      
      scene.add(orbitLine);
      orbitLines.push(orbitLine);
    });
    
    return orbitLines;
  };
  
  const orbitLines = createOrbitLines();
  
  // Create globe of skills
  const radius = 4; // Bigger radius
  const skillSprites = [];
  
  skillsData.forEach((skill, index) => {
    // Find which ring this skill belongs to
    const ringIndex = skillRings.findIndex(ring => ring.category === skill.category);
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
      orbitSpeed: 0.2 - ringIndex * 0.03, // Outer rings move slower
      orbitOffset: Math.random() * Math.PI * 2
    });
  });
  
  // Add code flow connections between related skills
  const createCodeFlows = () => {
    const codeFlows = [];
    
    // Connect skills that are related (simplified logic - in real app you'd have real relationships)
    for (let i = 0; i < skillSprites.length; i++) {
      for (let j = i + 1; j < skillSprites.length; j++) {
        // Connect some skills within the same category, and fewer between categories
        const isSameCategory = skillSprites[i].category === skillSprites[j].category;
        const shouldConnect = isSameCategory ? Math.random() > 0.7 : Math.random() > 0.95;
        
        if (shouldConnect) {
          // Create curve for the code flow
          const pos1 = skillSprites[i].sprite.position;
          const pos2 = skillSprites[j].sprite.position;
          const midPoint = new THREE.Vector3(
            (pos1.x + pos2.x) / 2,
            (pos1.y + pos2.y) / 2 + (isSameCategory ? 0.2 : 0.5),
            (pos1.z + pos2.z) / 2
          );
          
          const curve = new THREE.QuadraticBezierCurve3(pos1, midPoint, pos2);
          
          // Create geometry from the curve
          const points = curve.getPoints(50);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          
          // Create material with gradient color
          const color1 = new THREE.Color(skillsData.find(s => s.name === skillSprites[i].sprite.userData.skillName)?.color || 0x4361ee);
          const color2 = new THREE.Color(skillsData.find(s => s.name === skillSprites[j].sprite.userData.skillName)?.color || 0xff0066);
          
          const material = new THREE.LineDashedMaterial({
            color: isSameCategory ? color1 : 0xffffff,
            dashSize: 0.1,
            gapSize: 0.1,
            opacity: 0.3,
            transparent: true
          });
          
          const line = new THREE.Line(geometry, material);
          line.computeLineDistances(); // Required for dashed lines
          
          line.userData = {
            startSkill: i,
            endSkill: j,
            progress: 0,
            speed: Math.random() * 0.02 + 0.01,
            active: false,
            activationTime: Math.random() * 10
          };
          
          scene.add(line);
          codeFlows.push(line);
        }
      }
    }
    
    return codeFlows;
  };
  
  const codeFlows = createCodeFlows();
  
  // Add floating code blocks
  const createCodeBlocks = () => {
    const codeBlocks = [];
    const codeSnippets = [
      "function initApp() {\n  const app = new App();\n  app.start();\n}",
      "const data = await fetch('/api');\nconst json = await data.json();",
      "import React from 'react';\nimport { useState } from 'react';",
      "const [state, setState] = useState(0);\nreturn <div>{state}</div>;",
      "class Node {\n  constructor(value) {\n    this.value = value;\n  }\n}"
    ];
    
    codeSnippets.forEach((snippet, idx) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 256;
      
      // Background
      context.fillStyle = 'rgba(30, 30, 40, 0.7)';
      roundRect(0, 0, canvas.width, canvas.height, 10);
      context.fill();
      
      // Function to draw rounded rectangles
      function roundRect(x, y, width, height, radius) {
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
      }
      
      // Add syntax highlighting (simplified)
      const lines = snippet.split('\n');
      context.font = 'normal 24px monospace';
      context.textAlign = 'left';
      
      lines.forEach((line, lineIdx) => {
        // Apply different colors to different parts
        const parts = line.split(/(\s+|[(){}[\];,.]|"[^"]*"|'[^']*'|\b(function|const|let|var|await|return|import|from|class|constructor|this)\b)/g)
          .filter(p => p.length > 0);
        
        let xPos = 20;
        const yPos = 40 + lineIdx * 36;
        
        parts.forEach(part => {
          // Determine color based on content
          if (/^(function|const|let|var|await|return|import|from|class|constructor|this)$/.test(part)) {
            context.fillStyle = '#569cd6'; // Blue for keywords
          } else if (/^[(){}[\];,.]$/.test(part)) {
            context.fillStyle = '#d4d4d4'; // White for punctuation
          } else if (/^".*"$/.test(part) || /^'.*'$/.test(part)) {
            context.fillStyle = '#ce9178'; // Orange for strings
          } else if (/^[A-Z][a-zA-Z0-9]*$/.test(part)) {
            context.fillStyle = '#4ec9b0'; // Teal for types/classes
          } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) {
            context.fillStyle = '#9cdcfe'; // Light blue for variables
          } else if (/^\d+$/.test(part)) {
            context.fillStyle = '#b5cea8'; // Green for numbers
          } else {
            context.fillStyle = '#d4d4d4'; // White for everything else
          }
          
          context.fillText(part, xPos, yPos);
          // Measure text width to determine next position
          xPos += context.measureText(part).width;
        });
      });
      
      // Create a texture
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });
      
      const sprite = new THREE.Sprite(material);
      
      // Position in 3D space
      const angle = idx * (Math.PI * 2 / codeSnippets.length);
      const distance = 8 + Math.random() * 2;
      sprite.position.set(
        Math.cos(angle) * distance,
        (Math.random() - 0.5) * 5,
        Math.sin(angle) * distance
      );
      
      sprite.scale.set(4, 2, 1);
      
      // Set initial properties
      sprite.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        verticalSpeed: (Math.random() - 0.5) * 0.01,
        opacity: Math.random() * 0.3 + 0.2
      };
      
      material.opacity = sprite.userData.opacity;
      
      scene.add(sprite);
      codeBlocks.push(sprite);
    });
    
    return codeBlocks;
  };
  
  const codeBlocks = createCodeBlocks();
  
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
  
  // Add interactivity to skills
  canvas.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update the picking ray
    raycaster.setFromCamera({ x, y }, camera);
    
    // Find intersections with sprites
    const sprites = skillSprites.map(data => data.sprite);
    const intersects = raycaster.intersectObjects(sprites);
    
    if (intersects.length > 0) {
      const skill = intersects[0].object;
      
      // Toggle highlight
      skill.scale.multiplyScalar(1.2);
      
      // Reset after a delay
      setTimeout(() => {
        skill.scale.divideScalar(1.2);
      }, 1000);
    }
  });
  
  // Animation
  const clock = new THREE.Clock();
  
  const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    
    // Update shader uniforms
    sphereMaterial.uniforms.time.value = elapsedTime;
    glowMaterial.uniforms.time.value = elapsedTime;
    
    // Smooth mouse movement
    mouse.lerpX += (mouse.x - mouse.lerpX) * 0.05;
    mouse.lerpY += (mouse.y - mouse.lerpY) * 0.05;
    
    // Rotate main scene based on mouse with damping
    scene.rotation.y = mouse.lerpX * 0.8;
    scene.rotation.x = mouse.lerpY * 0.5;
    
    // Animate orbiting skill rings
    skillRings.forEach(ring => {
      ring.mesh.rotation.z += ring.rotationSpeed * 0.01;
    });
    
    // Animate orbital skill motion
    skillSprites.forEach(skillData => {
      // Get the current ring rotation
      const ring = skillRings.find(r => r.category === skillData.category);
      if (ring) {
        const { sprite, initialPosition, angle, orbitSpeed, ringIndex } = skillData;
        
        // Update position based on ring rotation
        const newAngle = angle + elapsedTime * orbitSpeed;
        const ringRadius = 3 + ringIndex * 0.5;
        
        const x = Math.cos(newAngle) * ringRadius;
        const z = Math.sin(newAngle) * ringRadius;
        
        sprite.position.x = x;
        sprite.position.z = z;
        
        // Add subtle up/down motion
        sprite.position.y = initialPosition.y + Math.sin(elapsedTime * 0.5 + angle * 3) * 0.1;
        
        // Make sprites always face the camera
        sprite.lookAt(camera.position);
      }
    });
    
    // Animate code flows
    codeFlows.forEach(flow => {
      const { activationTime, speed } = flow.userData;
      
      // Periodically activate flows
      if (Math.sin(elapsedTime * 0.2 + activationTime) > 0.95) {
        flow.userData.active = true;
        flow.userData.progress = 0;
      }
      
      if (flow.userData.active) {
        flow.userData.progress += speed;
        
        if (flow.userData.progress >= 1) {
          flow.userData.active = false;
        }
        
        // Make the flow glow when active
        flow.material.opacity = flow.userData.active ? 0.8 : 0.1;
        
        // Animate dash offset for "flowing" effect
        flow.material.dashOffset = -elapsedTime * 0.5;
      }
    });
    
    // Animate code rain
    codeRainGroups.forEach(particles => {
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        // Move particles downward and rotate slightly
        positions[i + 1] -= 0.03; // Move down
        
        // Wrap around when particles go too far
        if (positions[i + 1] < -15) {
          positions[i + 1] = 15;
        }
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsedTime * 0.01;
    });
    
    // Animate point lights
    pointLights.forEach(light => {
      const { angle, radius, speed, oscillation } = light.userData;
      
      // Circular motion with oscillation
      const newAngle = angle + elapsedTime * speed;
      const oscY = Math.sin(elapsedTime * 0.5 + oscillation) * 2;
      
      light.position.x = Math.cos(newAngle) * radius;
      light.position.z = Math.sin(newAngle) * radius;
      light.position.y = oscY;
      
      // Animate light intensity
      light.intensity = 0.8 + Math.sin(elapsedTime + oscillation) * 0.2;
    });
    
    // Animate code blocks
    codeBlocks.forEach(block => {
      // Rotate slowly
      block.rotation.z += block.userData.rotationSpeed;
      
      // Gentle floating motion
      block.position.y += Math.sin(elapsedTime * 0.5) * 0.001;
      
      // Pulse opacity
      block.material.opacity = block.userData.opacity + Math.sin(elapsedTime * 0.3) * 0.1;
    });
    
    // Check for sprite intersections
    raycaster.setFromCamera({ x: mouse.lerpX, y: mouse.lerpY }, camera);
    const sprites = skillSprites.map(data => data.sprite);
    const intersects = raycaster.intersectObjects(sprites);
    
    if (intersects.length > 0) {
      if (intersectedObject !== intersects[0].object) {
        // Reset previous intersected object
        if (intersectedObject) {
          intersectedObject.scale.divideScalar(1.2);
        }
        
        // Set new intersected object
        intersectedObject = intersects[0].object;
        intersectedObject.scale.multiplyScalar(1.2);
        
        // Change cursor to indicate interaction
        canvas.style.cursor = 'pointer';
      }
    } else {
      if (intersectedObject) {
        intersectedObject.scale.divideScalar(1.2);
        intersectedObject = null;
        
        // Reset cursor
        canvas.style.cursor = 'default';
      }
    }
    
    // Render
    renderer.render(scene, camera);
    
    // Call animate again on the next frame
    requestAnimationFrame(animate);
  };
  
  // Start animation
  animate();
};

export default skillsGlobe;