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
  const storyVisual = document.querySelector('.story__visual');
  const mural = document.getElementById('story-mural');
  const stageItems = document.querySelectorAll('.stage-item');
  const stageRail = document.querySelector('.story__stage-rail');
  const captionEl = document.getElementById('story-caption');

  const captions = [
    'We start with beans sourced with care and roasted for warmth, not bitterness.',
    'Ground to order, right before your shot is pulled — because stale grounds make stale coffee.',
    'A slow, precise pull draws out the richness — nine bars of pressure, twenty-five seconds of patience.',
    'Straight from the portafilter into the mug — nothing wasted, nothing rushed.',
    'Milk steamed to a whisper-thin microfoam — silky enough to hold a design.',
    'And finally, an olive branch — poured by hand, just for you. Rooted in faith, served with love.'
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!storySection || !mural) return;

  const STAGE_COUNT = captions.length;
  const MURAL_VB_HEIGHT = 2400; // matches the SVG's viewBox height

  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Static fallback: pan straight to the final pour, full caption, no scrub.
    storySection.classList.add('story--static');
    stageItems.forEach((it, i) => it.classList.toggle('is-active', i === stageItems.length - 1));
    captionEl.textContent = captions[captions.length - 1];
    requestAnimationFrame(() => {
      const pxPerUnit = mural.getBoundingClientRect().width / 400;
      mural.style.transform = `translateY(${-2100 * pxPerUnit}px)`;
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // The whole sequence is ONE tall illustration (a vertical "mural" — beans at
  // the top, latte art at the bottom, connected by drips/chutes the whole way
  // down). Scrolling simply pans the viewport down through it, so the motion
  // is genuinely linear/continuous rather than a slideshow of separate scenes.
  let maxTranslate = 0;
  let pxPerUnit = 1;
  let viewportUnits = 0;

  function measure() {
    const muralRect = mural.getBoundingClientRect();
    const viewportHeight = storyVisual.getBoundingClientRect().height;
    pxPerUnit = muralRect.width / 400;
    viewportUnits = viewportHeight / pxPerUnit;
    maxTranslate = Math.max(0, muralRect.height - viewportHeight);
  }

  function updateStory(progress) {
    // Derive the caption from what's actually centered on screen (not from a
    // raw progress/6 split) so the label never drifts out of sync with the
    // pan — the two are computed differently (the pan subtracts viewport
    // height from the range; a naive split doesn't) and will disagree unless
    // tied together explicitly.
    const topViewBoxY = (progress * maxTranslate) / pxPerUnit;
    const centerViewBoxY = topViewBoxY + viewportUnits / 2;
    const captionStage = Math.max(0, Math.min(STAGE_COUNT - 1, Math.floor(centerViewBoxY / MURAL_VB_HEIGHT * STAGE_COUNT)));

    stageItems.forEach((item, i) => item.classList.toggle('is-active', i === captionStage));
    if (stageRail) stageRail.style.setProperty('--rail-progress', `${progress * 100}%`);
    captionEl.textContent = captions[captionStage];

    mural.style.transform = `translateY(${(-progress * maxTranslate).toFixed(1)}px)`;
  }

  measure();

  ScrollTrigger.create({
    trigger: storySection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => updateStory(self.progress),
    onRefresh: () => measure()
  });

  window.addEventListener('resize', () => {
    measure();
    ScrollTrigger.refresh();
  });

  updateStory(0);
});
