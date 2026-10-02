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
    '.trust-item, .pour-card, .menu-card, .space-card, #community .eyebrow, #community h2, #community .section-lede, #community .signup-form, #community .social-row, .visit-block'
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
});
