/**
 * REACT BITS AGENCY SITE - MASTER INTERACTIVE JAVASCRIPT
 * Features:
 *   1. Canvas Particle Background Physics (Reactive cursor repulsion)
 *   2. 3D Card Tilt Effects & Glare Overlays (eased every frame, mouse only)
 *   3. Magnet Buttons & Spring Pull Physics, scroll reveal, off-screen pausing
 *   4. Mobile Navigation Dropdown
 *   5. Accordion Physics & Toast Notifications
 */

document.addEventListener('DOMContentLoaded', function () {
  // Respect the visitor's "reduce motion" setting for all decorative effects
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fancy pointer effects only where there is a real mouse; on touch screens a tap would leave cards stuck mid-tilt
  const finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- 1. Canvas Particle Background System ----------
  const canvas = document.createElement('canvas');
  canvas.id = 'particleCanvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = window.innerWidth;
  let height = window.innerHeight;

  function sizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();

  // Pre-render one glowing dot; drawing a sprite is far cheaper than shadowBlur on every particle every frame
  const sprite = document.createElement('canvas');
  const SPRITE = 32;
  sprite.width = sprite.height = SPRITE * dpr;
  const sctx = sprite.getContext('2d');
  sctx.scale(dpr, dpr);
  const glow = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
  glow.addColorStop(0, 'rgba(255, 170, 110, 1)');
  glow.addColorStop(0.18, 'rgba(249, 115, 22, 1)');
  glow.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
  glow.addColorStop(1, 'rgba(249, 115, 22, 0)');
  sctx.fillStyle = glow;
  sctx.fillRect(0, 0, SPRITE, SPRITE);

  const mouse = { x: -1000, y: -1000, radius: 140 };
  if (finePointer) {
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener('mouseleave', function () { mouse.x = mouse.y = -1000; });
  }

  const particles = [];
  const particleCount = Math.max(14, Math.min(Math.floor((width * height) / 16000), 75));

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

  let rafId = null;

  function drawParticles(move) {
    ctx.clearRect(0, 0, width, height);
    const LINK = 110;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (move) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls (and stay inside after a resize or a mouse push)
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        else if (p.x > width) { p.x = width; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        else if (p.y > height) { p.y = height; p.vy = -Math.abs(p.vy); }

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0.01) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 2.2;
          p.y -= (dy / dist) * force * 2.2;
          p.alpha += (Math.min(p.baseAlpha + force * 0.5, 0.8) - p.alpha) * 0.2;
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }
      }

      const size = p.radius * 5;
      ctx.globalAlpha = p.alpha;
      ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      ctx.globalAlpha = 1;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ddx = p.x - p2.x;
        const ddy = p.y - p2.y;
        if (Math.abs(ddx) > LINK || Math.abs(ddy) > LINK) continue;
        const distance = Math.sqrt(ddx * ddx + ddy * ddy);
        if (distance < LINK) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(225, 29, 72, ' + (0.15 * (1 - distance / LINK)) + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    drawParticles(true);
    rafId = requestAnimationFrame(loop);
  }

  function start() { if (!reduceMotion && rafId === null) rafId = requestAnimationFrame(loop); }
  function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

  drawParticles(false); // a static frame straight away (and the only frame when reduced motion is on)
  start();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  let resizeTimer;
  let lastWidth = width;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      // Phones fire resize when the address bar slides; only redraw when the size really changed
      if (window.innerWidth === lastWidth && Math.abs(window.innerHeight - height) < 120) return;
      lastWidth = window.innerWidth;
      sizeCanvas();
      if (reduceMotion) drawParticles(false);
    }, 150);
  }, { passive: true });


  // Shared helper: ease a value toward its target every frame, then stop when settled
  function springLoop(state, apply) {
    if (state.running) return;
    state.running = true;
    (function step() {
      let moving = false;
      for (const k in state.target) {
        const diff = state.target[k] - state.current[k];
        if (Math.abs(diff) > 0.02) { state.current[k] += diff * 0.18; moving = true; }
        else state.current[k] = state.target[k];
      }
      apply(state.current);
      if (moving) requestAnimationFrame(step);
      else { state.running = false; if (state.onRest) state.onRest(); }
    })();
  }


  // ---------- 2. 3D Card Tilt Effects ----------
  // Long reading panels (.doc-block) and the contact form are left still so text never moves while reading or typing
  const tiltCards = (reduceMotion || !finePointer) ? [] :
    document.querySelectorAll('.tilted-card:not(.contact-form-card), .service-card, .timeline-card, .protosem-card');
  const MAX_TILT = 5; // degrees

  tiltCards.forEach(function (card) {
    card.classList.add('js-tilt');
    let glare = card.querySelector('.card-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'card-glare';
      glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);
    }

    let rect = null;
    const state = {
      current: { x: 0, y: 0, s: 1 },
      target: { x: 0, y: 0, s: 1 },
      onRest: function () { if (state.target.s === 1) card.classList.remove('is-tilting'); }
    };
    const apply = function (v) {
      card.style.setProperty('--tilt-x', v.x.toFixed(2) + 'deg');
      card.style.setProperty('--tilt-y', v.y.toFixed(2) + 'deg');
      card.style.setProperty('--tilt-s', v.s.toFixed(4));
    };

    card.addEventListener('mouseenter', function () {
      rect = card.getBoundingClientRect();
      card.classList.add('is-tilting');
    });

    card.addEventListener('mousemove', function (e) {
      if (!rect) rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      state.target.x = ((y / rect.height) - 0.5) * -2 * MAX_TILT;
      state.target.y = ((x / rect.width) - 0.5) * 2 * MAX_TILT;
      state.target.s = 1.01;
      glare.style.background = 'radial-gradient(circle at ' + (x / rect.width * 100) + '% ' + (y / rect.height * 100) + '%, rgba(255,255,255,0.14), transparent 60%)';
      springLoop(state, apply);
    });

    card.addEventListener('mouseleave', function () {
      rect = null;
      state.target.x = 0;
      state.target.y = 0;
      state.target.s = 1;
      springLoop(state, apply);
    });
  });


  // ---------- 3. Magnet Buttons Physics ----------
  const magnetBtns = (reduceMotion || !finePointer) ? [] :
    document.querySelectorAll('.btn-primary-gradient, .pill-nav-btn, .project-link-btn, .task-nav-link');

  magnetBtns.forEach(function (btn) {
    btn.classList.add('js-magnet');
    let rect = null;
    const state = { current: { x: 0, y: 0 }, target: { x: 0, y: 0 } };
    const apply = function (v) { btn.style.translate = v.x.toFixed(2) + 'px ' + v.y.toFixed(2) + 'px'; };

    btn.addEventListener('mouseenter', function () { rect = btn.getBoundingClientRect(); });
    btn.addEventListener('mousemove', function (e) {
      if (!rect) rect = btn.getBoundingClientRect();
      state.target.x = (e.clientX - (rect.left + rect.width / 2)) * 0.2;
      state.target.y = (e.clientY - (rect.top + rect.height / 2)) * 0.2;
      springLoop(state, apply);
    });
    btn.addEventListener('mouseleave', function () {
      rect = null;
      state.target.x = 0;
      state.target.y = 0;
      springLoop(state, apply);
    });
  });

  // Cached rects go stale when the page scrolls under a hovered element
  window.addEventListener('scroll', function () {
    document.querySelectorAll('.js-tilt.is-tilting').forEach(function (c) { c.dispatchEvent(new Event('mouseenter')); });
  }, { passive: true });


  // ---------- 3b. Scroll reveal & off-screen animation pausing ----------
  if ('IntersectionObserver' in window) {
    if (!reduceMotion) {
      const revealTargets = document.querySelectorAll(
        '.section-label, .section-heading, .section-subtext, .about-bio-text, .about-card-photo, ' +
        '.service-card, .diff-item, .project-list-row, .timeline-card, .protosem-card, ' +
        '.contact-form-card, .contact-socials-card, .doc-block, .evidence-card'
      );
      // Stagger siblings in the same grid a little so cards cascade in rather than pop at once
      revealTargets.forEach(function (el) {
        const siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.className === el.className; }) : [];
        const idx = siblings.indexOf(el);
        if (idx > 0) el.style.setProperty('--reveal-delay', Math.min(idx % 3, 2) * 80 + 'ms');
        el.classList.add('reveal');
      });

      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
      revealTargets.forEach(function (el) { revealObserver.observe(el); });

      // Anything a visitor jumps past via an anchor link should never stay hidden
      window.addEventListener('hashchange', function () {
        setTimeout(function () {
          document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
            if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
          });
        }, 600);
      });
    }

    const pauseObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
      });
    }, { rootMargin: '100px 0px' });
    document.querySelectorAll('.hero-section, .marquee-ribbon, .section-heading, .neon-planet-orb-container').forEach(function (el) {
      pauseObserver.observe(el);
    });
  }


  // ---------- 3c. Accordion keyboard support ----------
  document.querySelectorAll('.diff-header').forEach(function (header) {
    const item = header.parentElement;
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');
    header.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDiff(header);
      }
    });
  });


  // ---------- 4. Mobile Navigation Menu Toggle ----------
  const menuToggle = document.getElementById('menuToggle');
  const navDropdown = document.getElementById('navDropdown');

  if (menuToggle && navDropdown) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const open = navDropdown.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navDropdown.classList.contains('active')) {
        navDropdown.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!navDropdown.contains(e.target) && !menuToggle.contains(e.target)) {
        navDropdown.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    const dropdownLinks = navDropdown.querySelectorAll('a');
    dropdownLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navDropdown.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
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
    const header = el.querySelector('.diff-header');
    if (header) header.setAttribute('aria-expanded', 'false');
  });

  if (!isExpanded) {
    item.classList.add('active');
    const icon = item.querySelector('.diff-icon');
    if (icon) icon.textContent = '−';
    element.setAttribute('aria-expanded', 'true');
  }
}
