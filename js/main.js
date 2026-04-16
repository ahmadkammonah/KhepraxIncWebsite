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

function initContactForm() {}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
  initCaseStudies();
  initContactForm();
});
