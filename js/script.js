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

(function () {
  'use strict';

  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const matrixCanvas = document.getElementById('matrix-canvas');

  if (matrixCanvas && root) {
    const matrixContext = matrixCanvas.getContext('2d');
    const matrixChars = '01<>/+=-:*';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let matrixColumns = [];
    let matrixFontSize = 14;
    let matrixAnimationFrame;
    let matrixLastFrame = 0;
    const targetFps = 22;

    function resizeMatrixCanvas() {
      const dpr = window.devicePixelRatio || 1;
      matrixCanvas.width = Math.floor(matrixCanvas.clientWidth * dpr);
      matrixCanvas.height = Math.floor(matrixCanvas.clientHeight * dpr);
      matrixContext.setTransform(dpr, 0, 0, dpr, 0, 0);

      matrixFontSize = Math.max(12, Math.floor(matrixCanvas.clientWidth / 90));
      const totalColumns = Math.ceil(matrixCanvas.clientWidth / matrixFontSize);
      matrixColumns = Array.from({ length: totalColumns }, function () {
        return Math.random() * (matrixCanvas.clientHeight / matrixFontSize);
      });
    }

    function drawMatrixFrame() {
      const isLightTheme = root.getAttribute('data-theme') === 'light';
      matrixContext.fillStyle = isLightTheme ? 'rgba(249, 250, 251, 0.18)' : 'rgba(10, 15, 30, 0.14)';
      matrixContext.fillRect(0, 0, matrixCanvas.clientWidth, matrixCanvas.clientHeight);

      matrixContext.font = matrixFontSize + 'px Space Grotesk, monospace';
      matrixContext.fillStyle = isLightTheme ? 'rgba(30, 64, 175, 0.34)' : 'rgba(103, 232, 249, 0.54)';

      matrixColumns.forEach(function (columnY, index) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = index * matrixFontSize;
        const y = columnY * matrixFontSize;
        matrixContext.fillText(char, x, y);

        if (y > matrixCanvas.clientHeight && Math.random() > 0.975) {
          matrixColumns[index] = 0;
        } else {
          matrixColumns[index] = columnY + 1;
        }
      });
    }

    function animateMatrix(timestamp) {
      if (prefersReducedMotion.matches) {
        drawMatrixFrame();
        return;
      }

      if (timestamp - matrixLastFrame > (1000 / targetFps)) {
        matrixLastFrame = timestamp;
        drawMatrixFrame();
      }

      matrixAnimationFrame = window.requestAnimationFrame(animateMatrix);
    }

    function startMatrix() {
      if (matrixAnimationFrame) {
        window.cancelAnimationFrame(matrixAnimationFrame);
      }
      resizeMatrixCanvas();
      matrixContext.clearRect(0, 0, matrixCanvas.clientWidth, matrixCanvas.clientHeight);

      if (prefersReducedMotion.matches) {
        drawMatrixFrame();
        return;
      }

      matrixAnimationFrame = window.requestAnimationFrame(animateMatrix);
    }

    window.addEventListener('resize', startMatrix);
    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener('change', startMatrix);
    } else if (prefersReducedMotion.addListener) {
      prefersReducedMotion.addListener(startMatrix);
    }
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        matrixContext.clearRect(0, 0, matrixCanvas.clientWidth, matrixCanvas.clientHeight);
      });
    }
    startMatrix();
  }

  if (typeof Typed !== 'undefined') {
    var typedEl = document.getElementById('typed-headline');
    if (typedEl) {
      new Typed('#typed-headline', {
        strings: [
          'IT Infrastructure',
          'Security Solutions',
          'Cost Optimization',
          'Open-Source Platforms',
          'Business Continuity'
        ],
        typeSpeed: 52,
        backSpeed: 28,
        backDelay: 1800,
        startDelay: 400,
        loop: true,
        smartBackspace: true,
        cursorChar: '|'
      });
    }
  }

  (function () {
    var badge = document.getElementById('hero-badge');
    if (!badge) return;

    var lines = [
      'Future-Ready IT for Indian Businesses',
      'Secure. Scalable. Budget-Smart.',
      'Modern Infrastructure Without Vendor Lock-In',
      'Cut IT Cost, Improve Reliability'
    ];

    var index = 0;
    window.setInterval(function () {
      badge.classList.add('badge-fade-out');
      window.setTimeout(function () {
        index = (index + 1) % lines.length;
        badge.textContent = lines[index];
        badge.classList.remove('badge-fade-out');
      }, 220);
    }, 3200);
  })();

  (function () {
    var strip = document.getElementById('hero-outcome-strip');
    var text = document.getElementById('hero-outcome-text');
    if (!strip || !text) return;

    var outcomes = [
      'Delivered 50+ IT modernization projects across India.',
      'Reduced recurring IT cost by up to 70% for selected clients.',
      'Helped teams improve uptime with stronger monitoring and alerts.',
      'Migrated critical workloads with low-disruption rollout plans.'
    ];

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var index = 0;
    window.setInterval(function () {
      strip.classList.add('outcome-fade-out');
      window.setTimeout(function () {
        index = (index + 1) % outcomes.length;
        text.textContent = outcomes[index];
        strip.classList.remove('outcome-fade-out');
      }, 220);
    }, 3600);
  })();

  (function () {
    var hero = document.querySelector('.hero-cyber');
    var left = document.querySelector('.hero-copy-panel');
    var right = document.querySelector('.hero-visual-panel');
    var particles = document.querySelector('.hero-particles');
    if (!hero || !left || !right || !particles) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduceMotion || !finePointer) return;

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var rafId = null;

    function renderParallax() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      left.style.transform = 'translate3d(' + (currentX * -10) + 'px,' + (currentY * -8) + 'px,0)';
      right.style.transform = 'translate3d(' + (currentX * 14) + 'px,' + (currentY * 10) + 'px,0)';
      particles.style.transform = 'translate3d(' + (currentX * 18) + 'px,' + (currentY * 12) + 'px,0)';

      rafId = window.requestAnimationFrame(renderParallax);
    }

    hero.addEventListener('mousemove', function (event) {
      var rect = hero.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width;
      var y = (event.clientY - rect.top) / rect.height;
      targetX = (x - 0.5) * 2;
      targetY = (y - 0.5) * 2;
    });

    hero.addEventListener('mouseleave', function () {
      targetX = 0;
      targetY = 0;
    });

    rafId = window.requestAnimationFrame(renderParallax);
    window.addEventListener('beforeunload', function () {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  })();
})();
