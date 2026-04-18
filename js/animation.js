(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cubes    = gsap.utils.toArray('.c');
  const halo     = document.querySelector('.final-halo');
  const labelEls = [
    document.querySelector('.anim-label-1'),
    document.querySelector('.anim-label-2'),
    document.querySelector('.anim-label-3'),
    document.querySelector('.anim-label-4'),
  ];

  // Read SVG coordinate positions from CSS custom properties
  const pos = cubes.map(el => {
    const s = getComputedStyle(el);
    const v = name => parseFloat(s.getPropertyValue(name));
    return { sx: v('--sx'), sy: v('--sy'), mx: v('--mx'), my: v('--my'), gx: v('--gx'), gy: v('--gy') };
  });

  gsap.set(cubes, { x: i => pos[i].sx, y: i => pos[i].sy });
  gsap.set(halo,  { opacity: 0, scale: 0.85, transformOrigin: '600px 380px' });

  if (reduced) {
    gsap.set(cubes, { x: i => pos[i].gx, y: i => pos[i].gy });
    gsap.set(halo,  { opacity: 0.35, scale: 1 });
    gsap.set(labelEls[3], { opacity: 1 });
    return;
  }

  // Phase timing (seconds, 14s loop)
  // P1 scatter:     0.00 – 2.80
  // P2 collect:     2.80 – 5.88
  // P3 process:     5.88 – 8.68
  // P4 structured:  8.68 – 12.32
  // dissolve:      12.32 – 14.00

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

  // Phase 2 — fly to mixed cube
  tl.to(cubes, {
    x: i => pos[i].mx, y: i => pos[i].my,
    duration: 1.6,
    stagger: { amount: 0.5, from: 'random' },
  }, 2.8);

  // Phase 3 — internal sort to final grid
  tl.to(cubes, {
    x: i => pos[i].gx, y: i => pos[i].gy,
    duration: 1.3,
    stagger: { amount: 0.35, from: 'center' },
  }, 5.88);

  // Phase 4 — halo in, subtle cube pulse, halo out
  tl.to(halo,  { opacity: 0.5, scale: 1,    duration: 0.8, ease: 'power1.out' }, 9.5);
  tl.to(cubes, { scale: 1.015,              duration: 0.4, ease: 'power1.inOut' }, 10.5);
  tl.to(cubes, { scale: 1,                  duration: 0.4, ease: 'power1.inOut' }, 10.9);
  tl.to(halo,  { opacity: 0, scale: 0.85,  duration: 0.6, ease: 'power1.in'   }, 11.8);

  // Dissolve back to scatter
  tl.to(cubes, {
    x: i => pos[i].sx, y: i => pos[i].sy,
    duration: 1.2,
    ease: 'power2.in',
    stagger: { amount: 0.4, from: 'random' },
  }, 12.32);

  // Labels — fade in/out at phase boundaries
  const FADE = 0.25;
  [[0, 0.3, 2.55], [1, 3.05, 5.63], [2, 6.13, 8.43], [3, 8.93, 12.07]].forEach(([i, inT, outT]) => {
    tl.to(labelEls[i], { opacity: 1, duration: FADE }, inT);
    tl.to(labelEls[i], { opacity: 0, duration: FADE }, outT);
  });

  // Micro-drift — independent yoyo on each cube's <use>, random phase offset
  cubes.forEach(el => {
    gsap.to(el.querySelector('use'), {
      y: -3, duration: 1.5,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
      delay: Math.random(),
    });
  });
})();
