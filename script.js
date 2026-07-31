/**
 * AREA x APPLE PORTFOLIO - Combined Master JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
  // ---------- Theme Switcher (Dark Mode Default) ----------
  const themeToggleBtn = document.getElementById('themeToggle');
  const body = document.body;

  // Set default dark theme if not specified
  if (!body.getAttribute('data-theme')) {
    body.setAttribute('data-theme', 'dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const currentTheme = body.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme-preference', newTheme);
    });
  }

  // Restore user theme preference if stored
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  }

  // ---------- Navbar Shrink on Scroll ----------
  const nav = document.getElementById('siteNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ---------- Scroll Reveal Animations ----------
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

  // ---------- Dashboard Menu Switching (Interactive Mockup) ----------
  const menuItems = document.querySelectorAll('.dash-menu-item');
  menuItems.forEach(function (item) {
    item.addEventListener('click', function () {
      menuItems.forEach(function (i) { i.classList.remove('active'); });
      this.classList.add('active');
    });
  });

  // ---------- Mobile Menu Toggle ----------
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isExpanded = navLinks.style.display === 'flex';
      navLinks.style.display = isExpanded ? 'none' : 'flex';
      if (!isExpanded) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'var(--nav-bg)';
        navLinks.style.padding = '20px 32px';
        navLinks.style.borderBottom = '1px solid var(--border-color)';
      }
    });
  }
});
