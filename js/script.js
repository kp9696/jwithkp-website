/* =============================================================
   JwithKP — Shared JavaScript
   Features:
     1. Theme toggle (localStorage persistence)
     2. Hamburger menu
     3. Navbar scroll class
     4. Smooth scroll
     5. Scroll-reveal
     6. Animated counters (countUp)
     7. AOS initialisation
     8. Filterable cards (blog & case-studies)
   ============================================================= */

(function () {
  'use strict';

  /* ── 1. THEME TOGGLE ──────────────────────────────────────── */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('jwkp-theme', theme);
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
      themeToggle.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  applyTheme(localStorage.getItem('jwkp-theme') || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── 2. HAMBURGER MENU ────────────────────────────────────── */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu    = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      const icon = menuToggle.querySelector('i');
      if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });

    document.addEventListener('click', function (e) {
      const navbar = document.getElementById('navbar');
      if (navbar && !navbar.contains(e.target)) {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      }
    });
  }

  /* ── 3. NAVBAR SCROLL CLASS ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ── 4. SMOOTH SCROLL ─────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 5. SCROLL REVEAL ─────────────────────────────────────── */
  function revealOnScroll() {
    const trigger = window.innerHeight * 0.88;
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < trigger) el.classList.add('active');
    });
  }
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();

  /* ── 6. ANIMATED COUNTERS ─────────────────────────────────── */
  /**
   * Usage: <span class="count-up" data-target="50" data-suffix="+">0</span>
   * Animates from 0 → data-target when element enters viewport.
   * data-suffix: optional string appended after number (e.g. "+", "%", "h")
   * data-prefix: optional string prepended before number (e.g. "INR ")
   * data-duration: animation duration in ms (default 1800)
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = 'true';

    const target   = parseFloat(el.dataset.target) || 0;
    const suffix   = el.dataset.suffix  || '';
    const prefix   = el.dataset.prefix  || '';
    const duration = parseInt(el.dataset.duration, 10) || 1800;
    const decimals = (String(target).split('.')[1] || '').length;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = easeOutQuart(progress) * target;
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) animateCounter(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.count-up').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ── 7. AOS INITIALISATION ────────────────────────────────── */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing:   'ease-out-cubic',
      once:     true,
      offset:   80,
    });
  }

  /* ── 8. FILTERABLE CARDS ──────────────────────────────────── */
  /**
   * Usage:
   *   Filter buttons: <button class="filter-btn" data-filter="Security">Security</button>
   *                   <button class="filter-btn active" data-filter="all">All</button>
   *   Cards:          <article class="filterable-card" data-tags="Security">...</article>
   *
   * A card is shown if data-filter === "all" OR data-tags contains the filter value.
   */
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Show/hide cards
        document.querySelectorAll('.filterable-card').forEach(function (card) {
          const tags = (card.dataset.tags || '').toLowerCase();
          const match = filter === 'all' || tags.includes(filter.toLowerCase());

          if (match) {
            card.style.display = '';
            // Trigger re-animation
            card.classList.remove('filter-visible');
            requestAnimationFrame(function () {
              card.classList.add('filter-visible');
            });
          } else {
            card.style.display = 'none';
            card.classList.remove('filter-visible');
          }
        });
      });
    });

    // Show all cards initially
    document.querySelectorAll('.filterable-card').forEach(function (card) {
      card.classList.add('filter-visible');
    });
  }

})();
