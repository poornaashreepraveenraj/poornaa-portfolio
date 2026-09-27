/**
 * LIQUID GLASS & DARK FUTURISTIC EDITORIAL BRAND - Master JavaScript
 */

document.addEventListener('DOMContentLoaded', function () {
  // ---------- Navigation Menu Toggle ----------
  const menuToggle = document.getElementById('menuToggle');
  const navDropdown = document.getElementById('navDropdown');

  if (menuToggle && navDropdown) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navDropdown.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navDropdown.contains(e.target) && !menuToggle.contains(e.target)) {
        navDropdown.classList.remove('active');
      }
    });

    // Close menu when clicking a dropdown link
    const dropdownLinks = navDropdown.querySelectorAll('a');
    dropdownLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navDropdown.classList.remove('active');
      });
    });
  }

  // ---------- Toast Notification Handler ----------
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
  
  // Optional: Collapse other accordion items
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
