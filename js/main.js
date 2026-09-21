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

  const captions = [
    'We start with beans sourced with care and roasted for warmth, not bitterness.',
    'Ground to order, right before your shot is pulled — because stale grounds make stale coffee.',
    'A slow, precise pull draws out the richness — nine bars of pressure, twenty-five seconds of patience.',
    'Straight from the portafilter into the mug — nothing wasted, nothing rushed.',
    'Milk steamed to a whisper-thin microfoam — silky enough to hold a design.',
    'And finally, an olive branch — poured by hand, just for you. Rooted in faith, served with love.'
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!storySection || !frames.length) return;

  const STAGE_COUNT = captions.length;

  function setStage(stage) {
    frames.forEach((frame, i) => frame.classList.toggle('is-active', i === stage));
    stageItems.forEach((item, i) => item.classList.toggle('is-active', i === stage));
    captionEl.textContent = captions[stage];
  }

  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Static fallback: show the finished pour, full caption, skip the scrub.
    storySection.classList.add('story--static');
    setStage(STAGE_COUNT - 1);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Espresso pour (stage 2): real footage, scrubbed frame by frame ---------- */
  const ESPRESSO_STAGE = 2;
  const ESPRESSO_FRAME_COUNT = 41;
  const espressoImg = document.getElementById('espresso-scrub');
  let espressoFrameIndex = -1;

  const espressoFramePath = (i) => `img/story/espresso/frame-${String(i).padStart(3, '0')}.webp`;

  if (espressoImg) {
    for (let i = 1; i <= ESPRESSO_FRAME_COUNT; i++) {
      new Image().src = espressoFramePath(i);
    }
  }

  function setEspressoFrame(localProgress) {
    const idx = Math.min(
      ESPRESSO_FRAME_COUNT,
      Math.max(1, Math.round(localProgress * (ESPRESSO_FRAME_COUNT - 1)) + 1)
    );
    if (idx === espressoFrameIndex) return;
    espressoFrameIndex = idx;
    espressoImg.src = espressoFramePath(idx);
  }

  // Each stage is its own bouncy, continuously-animated vignette (bouncing
  // beans, a wobbling grinder...); scrolling just decides which one is
  // currently "on stage." The espresso stage is the exception — its "life"
  // comes from scrubbing real footage frame by frame as the user scrolls,
  // rather than from a CSS keyframe loop.
  let currentStage = -1;

  ScrollTrigger.create({
    trigger: storySection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.3,
    onUpdate(self) {
      const stage = Math.max(0, Math.min(STAGE_COUNT - 1, Math.floor(self.progress * STAGE_COUNT)));
      if (stageRail) stageRail.style.setProperty('--rail-progress', `${self.progress * 100}%`);

      if (espressoImg) {
        const stageStart = ESPRESSO_STAGE / STAGE_COUNT;
        const stageEnd = (ESPRESSO_STAGE + 1) / STAGE_COUNT;
        if (self.progress >= stageStart && self.progress <= stageEnd) {
          setEspressoFrame((self.progress - stageStart) / (stageEnd - stageStart));
        }
      }

      if (stage === currentStage) return;
      currentStage = stage;
      setStage(stage);
    }
  });

  setStage(0);
  currentStage = 0;
});
