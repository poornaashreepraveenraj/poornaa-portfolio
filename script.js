/**
 * REACT BITS AGENCY SITE - MASTER INTERACTIVE JAVASCRIPT
 * Features:
 *   1. Canvas Particle Background Physics (Reactive cursor repulsion)
 *   2. 3D Card Tilt Effects & Glare Overlays
 *   3. Magnet Buttons & Spring Pull Physics
 *   4. Mobile Navigation Dropdown
 *   5. Accordion Physics & Toast Notifications
 */

document.addEventListener('DOMContentLoaded', function () {
  // ---------- 1. Canvas Particle Background System ----------
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', function () {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mouse = { x: -1000, y: -1000, radius: 140 };

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Particle constructor
  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 16000), 75);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.15,
      alpha: 0.2
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off walls
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse interaction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        p.x -= (dx / dist) * force * 3;
        p.y -= (dy / dist) * force * 3;
        p.alpha = Math.min(p.baseAlpha + force * 0.5, 0.8);
      } else {
        p.alpha += (p.baseAlpha - p.alpha) * 0.05;
      }

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(249, 115, 22, ${p.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#F97316';
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (distance < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(225, 29, 72, ${0.15 * (1 - distance / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animateParticles);
  }
  animateParticles();


  // ---------- 2. 3D Card Tilt Effects ----------
  const tiltCards = document.querySelectorAll('.tilted-card, .service-card, .timeline-card, .protosem-card, .doc-block');

  tiltCards.forEach(function (card) {
    // Inject Glare overlay if missing
    if (!card.querySelector('.card-glare')) {
      const glare = document.createElement('div');
      glare.className = 'card-glare';
      card.style.position = 'relative';
      card.appendChild(glare);
    }

    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8; // Max 8 deg
      const rotateY = ((x - centerX) / centerX) * 8;  // Max 8 deg

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      const glare = card.querySelector('.card-glare');
      if (glare) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.18), transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });


  // ---------- 3. Magnet Buttons Physics ----------
  const magnetBtns = document.querySelectorAll('.btn-primary-gradient, .pill-nav-btn, .project-link-btn, .task-nav-link');

  magnetBtns.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });


  // ---------- 4. Mobile Navigation Menu Toggle ----------
  const menuToggle = document.getElementById('menuToggle');
  const navDropdown = document.getElementById('navDropdown');

  if (menuToggle && navDropdown) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!navDropdown.contains(e.target) && !menuToggle.contains(e.target)) {
        navDropdown.classList.remove('active');
      }
    });

    const dropdownLinks = navDropdown.querySelectorAll('a');
    dropdownLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navDropdown.classList.remove('active');
      });
    });
  }


  // ---------- 5. Toast Notification System ----------
  const toast = document.getElementById('toast');
  let toastTimer;

  window.showToast = function (msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 3200);
  };


  // ---------- 6. Contact Form Submission Handler ----------
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('nameInput').value.trim();
      const email = document.getElementById('emailInput').value.trim();
      const message = document.getElementById('messageInput').value.trim();

      if (!name || !email || !message) {
        formStatus.style.display = 'block';
        formStatus.textContent = 'Please complete all required fields before submitting.';
        formStatus.style.borderColor = '#E11D48';
        formStatus.style.color = '#E11D48';
        return;
      }

      formStatus.style.display = 'block';
      formStatus.style.borderColor = 'rgba(249, 115, 22, 0.4)';
      formStatus.style.color = '#F97316';
      formStatus.textContent = 'Thank you, ' + name + '! Your message has been sent successfully.';
      showToast('Message sent! Poornaa will respond shortly.');
      contactForm.reset();
    });
  }
});

/**
 * Accordion Toggle Function for "WHAT MAKES ME DIFFERENT?"
 */
function toggleDiff(element) {
  const item = element.parentElement;
  const isExpanded = item.classList.contains('active');
  
  const allItems = document.querySelectorAll('.diff-item');
  allItems.forEach(function (el) {
    el.classList.remove('active');
    const icon = el.querySelector('.diff-icon');
    if (icon) icon.textContent = '+';
  });

  if (!isExpanded) {
    item.classList.add('active');
    const icon = item.querySelector('.diff-icon');
    if (icon) icon.textContent = '−';
  }
}
