/**
 * FIGMA SITE THEME & APPLE SCROLL PHYSICS - Master JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
  const body = document.body;
  const themeToggleBtn = document.getElementById('themeToggle');

  // ---------- Theme Switcher ----------
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const isDark = body.getAttribute('data-theme') === 'dark';
      body.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme-preference', isDark ? 'light' : 'dark');
    });
  }

  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  }

  // ---------- Mobile Menu Toggle ----------
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isExpanded = navLinks.style.display === 'flex';
      navLinks.style.display = isExpanded ? 'none' : 'flex';
      if (!isExpanded) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '16px';
        navLinks.style.right = '16px';
        navLinks.style.background = 'var(--color-bg-soft)';
        navLinks.style.padding = '20px';
        navLinks.style.borderRadius = '20px';
        navLinks.style.border = '1px solid var(--color-border)';
        navLinks.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      }
    });
  }

  // ---------- Scrollytelling Reveal Animations ----------
  const revealElements = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('in');
    });
  }

  // ---------- Scroll-Spy Active Link Highlight ----------
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (sections.length > 0 && navAnchors.length > 0) {
    window.addEventListener('scroll', function () {
      let currentSectionId = '';
      sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSectionId = section.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navAnchors.forEach(function (anchor) {
          const href = anchor.getAttribute('href');
          if (href === '#' + currentSectionId || href === currentSectionId + '.html') {
            anchor.classList.add('active');
          } else {
            anchor.classList.remove('active');
          }
        });
      }
    }, { passive: true });
  }

  // ---------- Toast Notification ----------
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      showToast('Resume PDF placeholder — attach your PDF file to this button link.');
    });
  }

  // ---------- Contact Form Handler ----------
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
        formStatus.style.background = 'rgba(255, 69, 58, 0.15)';
        formStatus.style.color = '#FF453A';
        return;
      }

      formStatus.style.display = 'block';
      formStatus.style.background = 'var(--color-bg-soft)';
      formStatus.style.color = 'var(--color-kicker)';
      formStatus.textContent = 'Thank you, ' + name + '! Your message is ready to send.';
      contactForm.reset();
    });
  }
});
