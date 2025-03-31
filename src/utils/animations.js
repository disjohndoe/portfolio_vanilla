const animations = () => {
  // Intersection Observer for section animations
  const sections = document.querySelectorAll('.section');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        sectionObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    sectionObserver.observe(section);
  });
  
  // Animate skill badges
  const skillBadges = document.querySelectorAll('.skill-badge');
  skillBadges.forEach((badge, index) => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(10px)';
    badge.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      badge.style.opacity = '1';
      badge.style.transform = 'translateY(0)';
    }, 100 * index);
  });
  
  // Hero subtitle animation
  const heroSubtitle = document.querySelector('.hero__subtitle');
  if (heroSubtitle) {
    heroSubtitle.style.opacity = '0';
    heroSubtitle.style.transform = 'translateY(-10px)';
    heroSubtitle.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    setTimeout(() => {
      heroSubtitle.style.opacity = '1';
      heroSubtitle.style.transform = 'translateY(0)';
    }, 300);
  }
  
  // Hero title typing effect
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    heroTitle.style.opacity = '1';
    
    // Create wrapper span
    const wrapper = document.createElement('span');
    wrapper.className = 'text-gradient';
    heroTitle.appendChild(wrapper);
    
    // Type out each character
    let charIndex = 0;
    const typeChar = () => {
      if (charIndex < text.length) {
        wrapper.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, 50);
      }
    };
    
    setTimeout(typeChar, 800);
  }
  
  // Project card hover effects
  const workCards = document.querySelectorAll('.work-card');
  workCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = 'var(--shadow-xl)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = 'var(--shadow-md)';
    });
  });
};

export default animations;