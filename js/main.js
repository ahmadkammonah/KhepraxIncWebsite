function setActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-64px 0px -60% 0px' });

  sections.forEach(s => observer.observe(s));
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

function initCsCarousel() {
  const track    = document.getElementById('cs-carousel-track');
  const viewport = document.getElementById('cs-viewport');
  const dots     = document.querySelectorAll('#cs-dots .carousel-dot');
  const prevBtn  = document.getElementById('cs-prev-btn');
  const nextBtn  = document.getElementById('cs-next-btn');
  if (!track || !viewport) return;

  // ── 1. Clone cards for infinite loop ──────────────────────────────────────
  const realCards = Array.from(track.querySelectorAll('.cs-card'));
  const total = realCards.length;

  // Append copies at the end
  realCards.forEach(c => track.appendChild(c.cloneNode(true)));

  // Prepend copies at the start (use fragment to keep order)
  const frag = document.createDocumentFragment();
  realCards.forEach(c => frag.appendChild(c.cloneNode(true)));
  track.insertBefore(frag, track.firstChild);

  // All cards = [prepended clones | real | appended clones]
  const allCards = Array.from(track.querySelectorAll('.cs-card'));

  // ── 2. Accordion logic (works on all cards including clones) ───────────────
  function attachAccordion(cards) {
    cards.forEach(card => {
      card.querySelector('.cs-card-header')?.addEventListener('click', () => {
        if (!card.classList.contains('cs-active')) return;
        const isOpen = card.classList.contains('open');
        allCards.forEach(c => c.classList.remove('open'));
        if (!isOpen) card.classList.add('open');
      });
    });
  }
  attachAccordion(allCards);

  // ── 3. Core carousel state ─────────────────────────────────────────────────
  let current = total; // start on first real card (index `total` in allCards)
  let baseOffset = 0;
  let isTransitioning = false;

  function gap() { return 24; } // matches CSS gap: 1.5rem

  function computeOffset(index) {
    const cardW = allCards[0].offsetWidth;
    const viewW = viewport.offsetWidth;
    return index * (cardW + gap()) - (viewW - cardW) / 2;
  }

  // Map any absolute index back to a 0-based real index for dots
  function realIndex(index) {
    return ((index - total) % total + total) % total;
  }

  function applyTransform(offset, animate) {
    track.style.transition = animate
      ? 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    track.style.transform = `translateX(-${offset}px)`;
  }

  function goTo(index, animate = true) {
    current = index;
    const ri = realIndex(current);

    allCards.forEach(c => { c.classList.remove('cs-active'); c.classList.remove('open'); });
    allCards[current].classList.add('cs-active');

    baseOffset = computeOffset(current);
    if (animate) isTransitioning = true;
    applyTransform(baseOffset, animate);

    dots.forEach((d, i) => d.classList.toggle('active', i === ri));
  }

  // After each animated move: if we landed in a clone zone, teleport silently
  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (current < total) {
      goTo(current + total, false);
    } else if (current >= total * 2) {
      goTo(current - total, false);
    }
  });

  // ── 4. Initialise ──────────────────────────────────────────────────────────
  goTo(total, false);

  // ── 5. Arrow buttons ───────────────────────────────────────────────────────
  prevBtn?.addEventListener('click', () => { if (!isTransitioning) goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { if (!isTransitioning) goTo(current + 1); });

  // ── 6. Dot buttons ─────────────────────────────────────────────────────────
  dots.forEach((dot, i) => dot.addEventListener('click', () => {
    if (!isTransitioning) goTo(total + i);
  }));

  // ── 7. Resize ──────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => goTo(current, false));

  // ── 8. Mouse drag ──────────────────────────────────────────────────────────
  let dragStartX = 0;
  let isDragging = false;

  track.addEventListener('mousedown', e => {
    if (isTransitioning) return;
    isDragging = true;
    dragStartX = e.clientX;
    track.classList.add('dragging');
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    applyTransform(baseOffset - (e.clientX - dragStartX), false);
  });
  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    const delta = e.clientX - dragStartX;
    if (delta < -60) goTo(current + 1);
    else if (delta > 60)  goTo(current - 1);
    else goTo(current);
  });

  // ── 9. Touch drag ──────────────────────────────────────────────────────────
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    if (isTransitioning) return;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    if (!touchStartX) return;
    applyTransform(baseOffset - (e.touches[0].clientX - touchStartX), false);
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    touchStartX = 0;
    if (delta < -60) goTo(current + 1);
    else if (delta > 60)  goTo(current - 1);
    else goTo(current);
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = new FormData(form);
    const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
    const json = await res.json();

    if (json.success) {
      form.style.display = 'none';
      const success = document.getElementById('form-success');
      if (success) success.classList.add('visible');
    } else {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      alert('Something went wrong. Please try again or email us directly.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
  initCsCarousel();
  initContactForm();
});
