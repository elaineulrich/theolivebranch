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
  const frames = Array.from(document.querySelectorAll('.story__frame'));
  const frameMedia = frames.map(f => f.querySelector('.story__frame__img') || f);
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

  if (!storySection) return;

  const STAGE_COUNT = frames.length;
  const N = STAGE_COUNT - 1;

  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Static fallback: show the final pour, full caption, skip the scrub animation.
    storySection.classList.add('story--static');
    frames.forEach((f, i) => { f.style.opacity = i === frames.length - 1 ? '1' : '0'; });
    stageItems.forEach((it, i) => it.classList.toggle('is-active', i === stageItems.length - 1));
    captionEl.textContent = captions[captions.length - 1];
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Each stage's photo is a full-bleed "frame" in one continuous downward pour:
  // frames cross-dissolve into each other (linear opacity ramp centered on each
  // stage) rather than hard-cutting, and every frame drifts slowly downward as
  // its moment passes — so the whole sequence reads as one flowing shot instead
  // of a slideshow of discrete images.
  const DRIFT_PERCENT = 6;   // how far a frame drifts vertically across its own span
  const ZOOM_AMOUNT = 0.06;  // subtle continuous Ken Burns push-in

  function updateStory(progress) {
    // Map progress 0..1 so stage 0 is fully centered at progress=0 and the
    // last stage is fully centered at progress=1, with even crossfades between.
    const stageProgress = progress * N + 0.5;
    const captionStage = Math.max(0, Math.min(N, Math.round(stageProgress - 0.5)));

    stageItems.forEach((item, i) => item.classList.toggle('is-active', i === captionStage));
    if (stageRail) stageRail.style.setProperty('--rail-progress', `${progress * 100}%`);
    captionEl.textContent = captions[captionStage];

    frames.forEach((frame, i) => {
      const center = i + 0.5;
      const dist = stageProgress - center; // -1..1 across this frame's visible span
      const clamped = Math.max(-1, Math.min(1, dist));
      const opacity = Math.max(0, 1 - Math.abs(dist));

      frame.style.opacity = opacity.toFixed(3);

      const drift = clamped * DRIFT_PERCENT;
      const scale = 1 + ZOOM_AMOUNT * (1 - Math.abs(clamped));
      frameMedia[i].style.transform = `scale(${scale.toFixed(3)}) translateY(${drift.toFixed(2)}%)`;
    });
  }

  ScrollTrigger.create({
    trigger: storySection,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => updateStory(self.progress)
  });

  updateStory(0);
});
