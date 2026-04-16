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

  const btn = form.querySelector('.form-submit');
  const note = form.querySelector('.form-note');
  const originalText = btn.textContent;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    btn.textContent = 'Sending…';
    btn.disabled = true;
    note.textContent = "We'll get back to you within 1–2 business days.";
    note.style.color = '';

    const formData = new FormData(form);
    formData.append('access_key', '42f8510c-a3cb-465c-9849-45fc1cf6a540');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        btn.textContent = "Message sent — we'll be in touch.";
        btn.style.background = '#2d7a4f';
        note.textContent = 'Thank you! We'll respond within 1–2 business days.';
        form.reset();
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error) {
      btn.textContent = originalText;
      btn.disabled = false;
      note.textContent = 'Something went wrong. Please try again or email us directly.';
      note.style.color = '#c0392b';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
  initCaseStudies();
  initContactForm();
});
