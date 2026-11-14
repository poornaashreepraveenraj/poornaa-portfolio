/**
 * Portfolio site script
 *   1. Gentle scroll reveal and off-screen animation pausing
 *   2. Accordion keyboard support
 *   3. Navigation menu
 *   4. Toast notifications and contact form
 */

document.addEventListener('DOMContentLoaded', function () {
  // Respect the visitor's "reduce motion" setting for all decorative effects
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- 1. Scroll reveal & off-screen animation pausing ----------
  if ('IntersectionObserver' in window) {
    if (!reduceMotion) {
      const revealTargets = document.querySelectorAll(
        '.section-label, .section-heading, .section-subtext, .about-bio-text, .about-card-photo, ' +
        '.service-card, .diff-item, .project-list-row, .timeline-card, .protosem-card, ' +
        '.contact-form-card, .contact-socials-card'
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
    document.querySelectorAll('.marquee-ribbon').forEach(function (el) {
      pauseObserver.observe(el);
    });
  }


  // ---------- 2. Accordion keyboard support ----------
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


  // ---------- 3. Navigation Menu Toggle ----------
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


  // ---------- 4. Toast Notification System ----------
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


  // ---------- 5. Contact Form Submission Handler ----------
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
        formStatus.style.borderColor = '#FCA5A5';
        formStatus.style.color = '#B91C1C';
        return;
      }

      formStatus.style.display = 'block';
      formStatus.style.borderColor = '#FED7C3';
      formStatus.style.color = '#9A3412';
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
