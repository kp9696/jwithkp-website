/* =============================================================
   JwithKP  Shared JavaScript
   Features:
     1. Theme toggle (localStorage persistence)
     2. Hamburger menu + mega-menu submenus
     3. Navbar scroll class
     4. Smooth scroll (with focus management for a11y)
     5. Animated counters (countUp)
     6. Canvas "matrix" background
     7. Cookie consent
     8. Hero SVG crossfade
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

  // ── Mega-menu submenus: click/tap toggle for touch + keyboard users ─────
  // Desktop already reveals these on :hover/:focus-within (see CSS); this
  // toggle is what makes the six Services items and two Resources items
  // reachable at all on touch devices, where the absolute-positioned
  // desktop dropdown is hidden below the mobile-nav breakpoint.
  const megaToggles = document.querySelectorAll('.mega-menu-toggle');

  function closeAllMegaMenus(exceptLi) {
    megaToggles.forEach(function (btn) {
      const li = btn.closest('.has-mega-menu');
      if (li && li !== exceptLi) {
        li.classList.remove('mega-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  megaToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const li = btn.closest('.has-mega-menu');
      if (!li) return;
      const isOpen = li.classList.toggle('mega-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      closeAllMegaMenus(isOpen ? li : null);
    });
  });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      const icon = menuToggle.querySelector('i');
      if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
      if (!isOpen) closeAllMegaMenus();
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
        closeAllMegaMenus();
      });
    });

    document.addEventListener('click', function (e) {
      const navbar = document.getElementById('navbar');
      if (navbar && !navbar.contains(e.target)) {
        navMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const icon = menuToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
        closeAllMegaMenus();
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

      if (e.key === 'Escape') {
        const openLi = document.querySelector('.has-mega-menu.mega-open');
        if (openLi) {
          closeAllMegaMenus();
          const toggleBtn = openLi.querySelector('.mega-menu-toggle');
          if (toggleBtn) toggleBtn.focus();
        } else if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          menuToggle.setAttribute('aria-expanded', 'false');
          const icon = menuToggle.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
          menuToggle.focus();
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

        // Move keyboard focus to the target too, not just the scroll
        // position — otherwise the skip link (and any other in-page anchor)
        // scrolls a keyboard user to the right place but leaves their next
        // Tab press resuming from wherever focus already was, defeating the
        // point. Most jump targets (<main>, <section>, a heading) aren't
        // natively focusable, so give it a temporary tabindex, focus it, and
        // drop the tabindex again on blur so it doesn't linger in the tab
        // order.
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
          target.addEventListener('blur', function onBlur() {
            target.removeAttribute('tabindex');
            target.removeEventListener('blur', onBlur);
          });
        }
        target.focus({ preventScroll: true });
      }
    });
  });

  // A fresh page load that already carries a #hash (e.g. arriving from a
  // mega-menu link on another page) gets the browser's one-time, automatic
  // anchor jump — but self-hosted web fonts swap in and hero visuals finish
  // sizing shortly after that, shifting the layout so the jump lands well
  // short of the real target. Redo the scroll once the page has settled.
  if (window.location.hash) {
    const rejumpToHash = function () {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ block: 'start' });
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(rejumpToHash);
    }
    window.addEventListener('load', rejumpToHash);
  }

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

    // Group thousands so 50000 renders as "50,000" rather than "50000".
    function format(n) {
      return n.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = easeOutQuart(progress) * target;
      el.textContent = prefix + format(value) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + format(target) + suffix;
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

  // Scroll-reveal for data-aos="fade-up|fade-left|fade-right" elements (see
  // the matching CSS in section 9). Replaces the AOS library previously
  // loaded from unpkg.com — same effect (fade + 100px slide, 700ms
  // ease-out, once per element, ~80px early-trigger offset), same
  // attributes already in the markup, no third-party dependency.
  const aosElements = document.querySelectorAll('[data-aos]');
  if (aosElements.length) {
    const prefersReducedMotionAOS = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    aosElements.forEach(function (el) {
      const delay = el.dataset.aosDelay;
      if (delay) el.style.transitionDelay = delay + 'ms';
    });

    if (prefersReducedMotionAOS) {
      // The CSS media query already neutralizes opacity/transform/transition
      // for these elements; still mark them "animated" so nothing depends on
      // .aos-animate ever being added is left in a permanently-unfinished
      // state.
      aosElements.forEach(function (el) { el.classList.add('aos-animate'); });
    } else {
      const aosObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            aosObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });

      aosElements.forEach(function (el) { aosObserver.observe(el); });
    }
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

  // ── Cookie Consent (Google Consent Mode v2 / GDPR / India DPDP) ─────────
  (function () {
    var CONSENT_KEY = 'jwkp-cookie-consent';
    var banner      = document.getElementById('cookieBanner');
    var btnAccept   = document.getElementById('cookieAcceptAll');
    var btnReject   = document.getElementById('cookieNecessaryOnly');

    var btnSettings = document.getElementById('cookieSettingsBtn');

    function pushConsent(granted) {
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag === 'function') {
        // This site runs analytics only, not ads — ad_storage/ad_user_data/
        // ad_personalization stay denied regardless of the visitor's choice.
        window.gtag('consent', 'update', {
          analytics_storage: granted ? 'granted' : 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied'
        });
      }
    }

    function hideBanner() {
      if (banner) banner.hidden = true;
    }

    function showBanner() {
      if (banner) banner.hidden = false;
    }

    var stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'granted') {
      pushConsent(true);
    } else if (stored === 'denied') {
      pushConsent(false);
    } else if (banner) {
      setTimeout(function () { banner.hidden = false; }, 1200);
    }

    if (btnAccept) {
      btnAccept.addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'granted');
        pushConsent(true);
        hideBanner();
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', function () {
        localStorage.setItem(CONSENT_KEY, 'denied');
        pushConsent(false);
        hideBanner();
      });
    }

    // Lets a returning visitor reopen the banner and change an earlier
    // choice — the banner itself only ever appears once per browser
    // otherwise, with no other way to withdraw or change consent.
    if (btnSettings) {
      btnSettings.addEventListener('click', function () {
        showBanner();
        if (btnAccept) btnAccept.focus();
      });
    }
  }());

  // ── Hero SVG Crossfade (10 s rotation) ──────────────────────────────────
  const svgSlides = document.querySelectorAll('.hero-svg-slide');
  if (svgSlides.length >= 2 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let svgIdx = 0;
    setInterval(function () {
      svgSlides[svgIdx].setAttribute('aria-hidden', 'true');
      svgSlides[svgIdx].classList.remove('hero-svg-active');
      svgIdx = (svgIdx + 1) % svgSlides.length;
      svgSlides[svgIdx].removeAttribute('aria-hidden');
      svgSlides[svgIdx].classList.add('hero-svg-active');
    }, 10000);
  }

  // ── Service Worker Registration ──────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
