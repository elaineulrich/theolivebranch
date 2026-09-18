// The Olive Branch — Coffee & Café — site interactions

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Newsletter signup (front-end only — wire to a real provider) ---------- */
  const signupForm = document.getElementById('signup-form');
  const signupNote = document.getElementById('signup-note');

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = signupForm.email.value.trim();
      if (!email) return;
      // NOTE: this is a placeholder. Connect this form to an email provider
      // (Mailchimp, Flodesk, ConvertKit, etc.) to actually collect signups.
      signupNote.textContent = `Thanks! We'll be in touch at ${email}.`;
      signupForm.reset();
    });
  }

  /* ---------- Reveal-on-scroll for content sections ---------- */
  const revealTargets = document.querySelectorAll(
    '.menu-card, .space-card, #community .eyebrow, #community h2, #community .section-lede, #community .signup-form, #community .social-row, .visit-block'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Story: bean-to-latte scrollytelling ---------- */
  const storySection = document.querySelector('.story');
  const frames = document.querySelectorAll('.story__frame');
  const stageItems = document.querySelectorAll('.stage-item');
  const stageRail = document.querySelector('.story__stage-rail');
  const captionEl = document.getElementById('story-caption');

  const espressoFill = document.querySelector('.espresso-fill');
  const cremaSwirl = document.querySelector('.crema-swirl');
  const mugFill = document.querySelector('.mug-fill');
  const latteArtPaths = document.querySelectorAll('.latte-art path');
  const doveEl = document.querySelector('.latte-art-dove');

  const captions = [
    'We start with beans sourced with care and roasted for warmth, not bitterness.',
    'Ground to order, right before your shot is pulled — because stale grounds make stale coffee.',
    'A slow, precise pull draws out the richness — nine bars of pressure, twenty-five seconds of patience.',
    'Straight from the portafilter into the mug — nothing wasted, nothing rushed.',
    'Milk steamed to a whisper-thin microfoam — silky enough to hold a design.',
    'And finally, an olive branch — poured by hand, just for you. Rooted in faith, served with love.'
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!storySection) return;

  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Static fallback: show the final pour, full caption, skip the scrub animation.
    storySection.classList.add('story--static');
    frames.forEach((f, i) => f.classList.toggle('is-active', i === frames.length - 1));
    stageItems.forEach((it, i) => it.classList.toggle('is-active', i === stageItems.length - 1));
    captionEl.textContent = captions[captions.length - 1];
    latteArtPaths.forEach(p => { p.style.strokeDashoffset = '0'; });
    if (doveEl) doveEl.style.opacity = '1';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const STAGE_COUNT = frames.length;

  ScrollTrigger.create({
    trigger: storySection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate(self) {
      const progress = self.progress;
      const stageProgress = progress * STAGE_COUNT;
      const activeStage = Math.min(STAGE_COUNT - 1, Math.floor(stageProgress));
      const localProgress = Math.min(1, Math.max(0, stageProgress - activeStage));

      frames.forEach((frame, i) => frame.classList.toggle('is-active', i === activeStage));
      stageItems.forEach((item, i) => item.classList.toggle('is-active', i === activeStage));
      if (stageRail) stageRail.style.setProperty('--rail-progress', `${progress * 100}%`);
      captionEl.textContent = captions[activeStage];

      // Stage 2 — espresso shot filling the glass
      if (espressoFill) {
        const active = activeStage === 2;
        const fillProgress = active ? localProgress : (activeStage > 2 ? 1 : 0);
        const maxHeight = 38;
        const h = fillProgress * maxHeight;
        espressoFill.setAttribute('height', h.toFixed(1));
        espressoFill.setAttribute('y', (318 - h).toFixed(1));
        if (cremaSwirl) cremaSwirl.style.opacity = fillProgress > 0.7 ? '1' : '0';
      }

      // Stage 3 — pouring shot into the mug
      if (mugFill) {
        const active = activeStage === 3;
        const fillProgress = active ? localProgress : (activeStage > 3 ? 1 : 0);
        const maxHeight = 100;
        const h = fillProgress * maxHeight;
        mugFill.setAttribute('height', h.toFixed(1));
        mugFill.setAttribute('y', (314 - h).toFixed(1));
      }

      // Stage 5 — hand-drawn olive branch latte art
      if (latteArtPaths.length) {
        const active = activeStage === 5;
        const drawProgress = active ? localProgress : (activeStage > 5 ? 1 : 0);
        latteArtPaths.forEach((p, idx) => {
          const segStart = idx * 0.14;
          const segProgress = Math.min(1, Math.max(0, (drawProgress - segStart) / 0.4));
          p.style.strokeDashoffset = `${100 - segProgress * 100}`;
        });
        if (doveEl) doveEl.style.opacity = drawProgress > 0.88 ? '1' : '0';
      }
    }
  });
});
