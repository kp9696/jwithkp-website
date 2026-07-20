/* =============================================================
   JwithKP  Shared JavaScript
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

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && navMenu.classList.contains('open')) {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        const focusables = navbar.querySelectorAll('a, button, [tabindex="0"]');
        const visibleFocusables = Array.from(focusables).filter(function (el) {
          return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
        });
        if (visibleFocusables.length === 0) return;
        const firstVisible = visibleFocusables[0];
        const lastVisible = visibleFocusables[visibleFocusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstVisible) {
            e.preventDefault();
            lastVisible.focus();
          }
        } else {
          if (document.activeElement === lastVisible) {
            e.preventDefault();
            firstVisible.focus();
          }
        }
      }
    });
  }

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  function revealOnScroll() {
    const trigger = window.innerHeight * 0.88;
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.getBoundingClientRect().top < trigger) el.classList.add('active');
    });
  }
  window.addEventListener('scroll', revealOnScroll, { passive: true });
  revealOnScroll();

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

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing:   'ease-out-cubic',
      once:     true,
      offset:   80,
    });
  }

  const filterBtns = document.querySelectorAll('.filter-btn');

  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const filter = btn.dataset.filter;

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        document.querySelectorAll('.filterable-card').forEach(function (card) {
          const tags = (card.dataset.tags || '').toLowerCase();
          const match = filter === 'all' || tags.includes(filter.toLowerCase());

          if (match) {
            card.style.display = '';
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

    document.querySelectorAll('.filterable-card').forEach(function (card) {
      card.classList.add('filter-visible');
    });
  }

  function initMatrix(canvasId, chars, colorDark, colorLight) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fontSize = 14;
    const targetFps = 22;
    let columns = [];
    let animationFrame;
    let lastFrame = 0;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const totalColumns = Math.ceil(canvas.clientWidth / fontSize);
      columns = Array.from({ length: totalColumns }, function () {
        return Math.random() * (canvas.clientHeight / fontSize);
      });
    }

    function drawFrame() {
      const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
      ctx.fillStyle = isLightTheme ? 'rgba(249, 250, 251, 0.18)' : 'rgba(10, 15, 30, 0.14)';
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      ctx.font = fontSize + 'px Space Grotesk, monospace';
      ctx.fillStyle = isLightTheme ? (colorLight || 'rgba(30, 64, 175, 0.34)') : (colorDark || 'rgba(103, 232, 249, 0.54)');

      columns.forEach(function (columnY, index) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = index * fontSize;
        const y = columnY * fontSize;
        ctx.fillText(char, x, y);

        if (y > canvas.clientHeight && Math.random() > 0.975) {
          columns[index] = 0;
        } else {
          columns[index] = columnY + 1;
        }
      });
    }

    function animate(timestamp) {
      if (prefersReducedMotion.matches) {
        drawFrame();
        return;
      }
      if (timestamp - lastFrame > (1000 / targetFps)) {
        lastFrame = timestamp;
        drawFrame();
      }
      animationFrame = window.requestAnimationFrame(animate);
    }

    function start() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      resizeCanvas();
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      if (prefersReducedMotion.matches) {
        drawFrame();
        return;
      }
      animationFrame = window.requestAnimationFrame(animate);
    }

    window.addEventListener('resize', start);
    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener('change', start);
    } else if (prefersReducedMotion.addListener) {
      prefersReducedMotion.addListener(start);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      });
    }

    start();
  }

  window.initMatrix = initMatrix;

  window.switchHeroTab = function (tabName) {
    const tabs = ['network', 'hrms'];
    tabs.forEach(function (t) {
      const content = document.getElementById('hero-tab-' + t);
      if (content) content.style.display = (t === tabName) ? 'block' : 'none';
    });

    const btns = document.querySelectorAll('.hero-tab-btn');
    btns.forEach(function (btn) {
      const isMatch = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName);
      if (isMatch) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  };
})();
