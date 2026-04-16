function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page || (page === '' && a.getAttribute('href') === 'index.html')) {
      a.classList.add('active');
    }
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function initCaseStudies() {
  document.querySelectorAll('.cs-card').forEach(card => {
    card.querySelector('.cs-card-header')?.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      document.querySelectorAll('.cs-card').forEach(c => c.classList.remove('open'));
      if (!isOpen) card.classList.add('open');
    });
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = "Message sent — we'll be in touch.";
    btn.disabled = true;
    btn.style.background = '#2d7a4f';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
  initCaseStudies();
  initContactForm();
});
