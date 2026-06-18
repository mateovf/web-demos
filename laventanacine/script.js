(() => {
  const header    = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  // Header background state on scroll
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  navToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
    });
  });

  // Hero video — pause for users who prefer reduced motion
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroVideo.pause();
  }

  // Scroll-triggered reveals
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 90}ms`;
      observer.observe(el);
    });
  }

  // Film card modal
  const modal    = document.querySelector('.film-modal');
  const iframe   = modal.querySelector('.modal-iframe');
  const btsStrip = modal.querySelector('.modal-bts-strip');

  function vimeoEmbed(url) {
    // Handles both https://vimeo.com/123456 and https://vimeo.com/123456/abcdef (unlisted)
    const match = url.match(/vimeo\.com\/([0-9]+)(?:\/([a-f0-9]+))?/);
    if (!match) return '';
    const id   = match[1];
    const hash = match[2] ? `&h=${match[2]}` : '';
    return `https://player.vimeo.com/video/${id}?autoplay=0&title=0&byline=0&portrait=0${hash}`;
  }

  function openModal(card) {
    modal.querySelector('.modal-tag').textContent      = card.dataset.tag      || '';
    modal.querySelector('.modal-title').textContent    = card.dataset.title    || '';
    modal.querySelector('.modal-synopsis').textContent = card.dataset.synopsis || '';

    const awardsEl = modal.querySelector('.modal-awards');
    awardsEl.textContent = card.dataset.awards || '';
    awardsEl.hidden      = !card.dataset.awards;

    const watchEl = modal.querySelector('.modal-watch');
    watchEl.href    = card.dataset.watch || '#';
    watchEl.hidden  = !card.dataset.watch || card.dataset.watch === '#';

    iframe.src = vimeoEmbed(card.dataset.trailer || '');

    const btsPaths = (card.dataset.bts || '').split(',').map(s => s.trim()).filter(Boolean);
    btsStrip.innerHTML = btsPaths.map(src =>
      `<img src="${src}" alt="Behind the scenes" loading="lazy">`
    ).join('');

    modal.showModal();
  }

  function closeModal() {
    modal.close();
  }

  // Stop video playback on any close (X button, backdrop click, Escape)
  modal.addEventListener('close', () => { iframe.src = ''; btsStrip.innerHTML = ''; });

  // Close when clicking the backdrop (click hits <dialog> itself, not .modal-inner)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelector('.modal-close').addEventListener('click', closeModal);

  // Open on card click or keyboard Enter/Space
  const filmGrid = document.querySelector('.film-grid');

  filmGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.film-card');
    if (card) openModal(card);
  });

  filmGrid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.film-card');
      if (card) { e.preventDefault(); openModal(card); }
    }
  });
})();
