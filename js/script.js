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

  // localStorage can throw (blocked site data, some private modes). A throw here
  // used to stop the whole script, which left the mobile menu dead, so every
  // read and write goes through these two helpers.
  const store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ } }
  };

  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    store.set('jwkp-theme', theme);
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
      themeToggle.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
  }

  applyTheme(store.get('jwkp-theme') || 'dark');

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

  // navbar is position:fixed and sits on top of the document (z-index above
  // page content), so scrollIntoView's default block:'start' lands a target
  // flush with the viewport top — directly underneath the navbar, not below
  // it. Every in-page and cross-page hash jump needs the navbar's own height
  // subtracted, plus a little breathing room, or the thing the user clicked
  // for ends up hidden behind the bar they're still looking at.
  const NAV_SCROLL_GAP = 16;

  function scrollToTarget(target, behavior) {
    const navHeight = navbar ? navbar.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - navHeight - NAV_SCROLL_GAP;
    window.scrollTo({ top: Math.max(0, y), left: 0, behavior: behavior });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        scrollToTarget(target, 'smooth');

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
  // short of the real target. A single fonts.ready/load correction wasn't
  // enough in practice (production still landed ~1000px short even after
  // both had resolved — some other late shift, or a race with the browser's
  // own native jump), so re-check on a short spread of delays instead of
  // trying to name the exact one true "settled" moment.
  if (window.location.hash) {
    const rejumpToHash = function () {
      const target = document.getElementById(window.location.hash.slice(1));
      if (!target) return;
      const navHeight = navbar ? navbar.offsetHeight : 0;
      const wanted = navHeight + NAV_SCROLL_GAP;
      if (Math.abs(target.getBoundingClientRect().top - wanted) > 4) {
        // The site sets scroll-behavior: smooth globally, which turns this
        // correction into an animated scroll — fine for one call, but
        // repeated corrective calls (needed because layout keeps shifting)
        // would each restart/fight the previous animation. Force an
        // instant jump instead so every correction is atomic.
        scrollToTarget(target, 'instant');
      }
    };
    [0, 150, 400, 800, 1500].forEach(function (delay) {
      setTimeout(rejumpToHash, delay);
    });
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
    let frameScheduled = false;
    let inView = true;

    function resizeCanvas() {
      // A phone's 2-3x pixel density multiplies fill cost for a faint
      // background effect, so cap it on small screens.
      const maxDpr = window.matchMedia('(max-width: 768px)').matches ? 1 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
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

    function schedule() {
      if (frameScheduled) return;
      frameScheduled = true;
      animationFrame = window.requestAnimationFrame(animate);
    }

    function animate(timestamp) {
      frameScheduled = false;
      if (prefersReducedMotion.matches) {
        drawFrame();
        return;
      }
      // Stop the loop while the hero is scrolled away or the tab is in the
      // background; it is restarted below when either changes back.
      if (!inView || document.hidden) return;
      if (timestamp - lastFrame > (1000 / targetFps)) {
        lastFrame = timestamp;
        drawFrame();
      }
      schedule();
    }

    function start() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      frameScheduled = false;
      resizeCanvas();
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      if (prefersReducedMotion.matches) {
        drawFrame();
        return;
      }
      schedule();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView && !prefersReducedMotion.matches) schedule();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && !prefersReducedMotion.matches) schedule();
    });

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

    // The body class lets the mobile sticky CTA and the WhatsApp button step
    // aside while the banner is open instead of stacking underneath it.
    function setBannerHidden(isHidden) {
      if (!banner) return;
      banner.hidden = isHidden;
      document.body.classList.toggle('cookie-banner-open', !isHidden);
    }

    function hideBanner() {
      setBannerHidden(true);
    }

    function showBanner() {
      setBannerHidden(false);
    }

    var stored = store.get(CONSENT_KEY);
    if (stored === 'granted') {
      pushConsent(true);
    } else if (stored === 'denied') {
      pushConsent(false);
    } else if (banner) {
      setTimeout(showBanner, 1200);
    }

    if (btnAccept) {
      btnAccept.addEventListener('click', function () {
        store.set(CONSENT_KEY, 'granted');
        pushConsent(true);
        hideBanner();
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', function () {
        store.set(CONSENT_KEY, 'denied');
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

  // ── Mobile sticky CTA ───────────────────────────────────────────────────
  // Shown only once the hero's own buttons have scrolled out of view, so it
  // never sits on top of them. The body class also lifts the WhatsApp button
  // clear of the bar (see .sticky-cta-visible in the stylesheet).
  // On the home page that moment is when the hero buttons leave the screen. On the
  // other content pages it is when the hero has scrolled away, and the bar steps
  // aside again while an in-page call button or the footer is on screen, or while
  // a form field is focused (so it never sits over a field or the on-screen keyboard).
  const stickyCta = document.querySelector('.sticky-mobile-cta');
  if (stickyCta && 'IntersectionObserver' in window) {
    const setBar = function (show) {
      stickyCta.classList.toggle('is-visible', show);
      document.body.classList.toggle('sticky-cta-visible', show);
    };
    const heroActions = document.querySelector('.hp-hero-actions');
    if (heroActions) {
      new IntersectionObserver(function (entries) {
        setBar(!entries[0].isIntersecting);
      }, { threshold: 0 }).observe(heroActions);
    } else {
      const hero = document.querySelector('header.hero');
      const covered = new Set();
      let pastHero = !hero;
      let typing = false;
      const update = function () { setBar(pastHero && !typing && covered.size === 0); };
      if (hero) {
        new IntersectionObserver(function (entries) {
          const entry = entries[entries.length - 1];
          pastHero = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
          update();
        }).observe(hero);
      }
      // The extra 120px below the screen hides the bar just before a button arrives.
      const watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) covered.add(entry.target); else covered.delete(entry.target);
        });
        update();
      }, { rootMargin: '0px 0px 120px 0px' });
      document.querySelectorAll('[data-book-call], .footer').forEach(function (el) { watcher.observe(el); });
      const isField = function (el) {
        return !!el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && !/^(checkbox|radio|button|submit)$/.test(el.type);
      };
      document.addEventListener('focusin', function (e) { typing = isField(e.target); update(); });
      document.addEventListener('focusout', function () { typing = false; update(); });
    }
  }

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
  // 7. Newsletter signup (footer, every page). It used to post to FormSubmit's own captcha
  // page and then land on /contact with no confirmation. It now sends in the page and says
  // what happened. If sending fails, nothing is lost: the visitor is told to write to us.
  (function () {
    var form = document.getElementById('newsletterForm');
    var status = document.getElementById('newsletterStatus');
    if (!form || !status) return;
    var loadedAt = Date.now();
    var address = (form.action.split('formsubmit.co/')[1] || '').split(/[?#]/)[0];

    function say(message, ok) {
      status.hidden = false;
      status.className = 'newsletter-status ' + (ok ? 'is-ok' : 'is-error');
      status.textContent = message;
    }

    // Visitors without JavaScript are redirected here by the form's own _next value.
    if (new URLSearchParams(window.location.search).get('newsletter') === 'thanks') {
      say('Thanks. Your email is on the list. You can unsubscribe at any time by writing to us.', true);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (form.elements._honey && form.elements._honey.value) return;
      if (Date.now() - loadedAt < 2500) { say('That was quick. Please try again in a moment.', false); return; }
      var button = form.querySelector('button[type="submit"]');
      var label = button.textContent;
      button.disabled = true;
      button.textContent = 'Subscribing...';
      fetch(form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: form.elements.email.value, consent: 'yes', _subject: form.elements._subject.value, _captcha: 'false', page: window.location.pathname })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok || data.success === false || data.success === 'false') throw new Error('not accepted');
        });
      }).then(function () {
        form.reset();
        say('Thanks. Your email is on the list. You can unsubscribe at any time by writing to us.', true);
      }).catch(function () {
        say('Sorry, that did not go through. Please try again, or email ' + (address || 'us') + ' and we will add you.', false);
      }).then(function () {
        button.disabled = false;
        button.textContent = label;
      });
    });
  })();

  // 8. Phones only: Services and Technology Stack are long runs of similar cards. On a phone each
  // card becomes a tap-to-open row, and the two image galleries scroll sideways. The markup is
  // unchanged, so without JavaScript, or on a wider screen, everything stays open. The title (and
  // the logo, icon or step number next to it) is moved into a head row with a transparent button
  // laid over it, and moved back on wider screens. The first card of each run starts open. A link
  // that points at a closed card (for example services#virtualization) opens it.
  (function () {
    var mq = window.matchMedia('(max-width: 768px)');
    var groups = [
      { scope: '.stack-page .tech-grid', item: '.tech-card', parts: ['.tech-logo', 'h4'], open: 1 },
      { scope: '.services-section .service-grid', item: '.service-card', parts: ['.service-icon', 'h3'], open: 1 },
      { scope: '.services-section .svc-method-grid', item: '.svc-method-card', parts: ['.svc-method-num', 'h3', '.svc-method-time'], open: 1 },
      { scope: '.services-section .svc-faq-grid, .stack-page .svc-faq-grid', item: '.svc-faq-card', parts: ['h3'], open: 1 },
      { scope: '.services-section #support-terms', self: true, parts: ['h4'], open: 0 }
    ];
    var carousels = [
      { sel: '.stack-page .visual-showcase', label: 'Technology visuals, scroll sideways' },
      { sel: '.stack-page .solution-gallery-grid', label: 'Solution visuals, scroll sideways' }
    ];

    function direct(parent, selector) {
      return Array.prototype.filter.call(parent.children, function (c) { return c.matches(selector); })[0] || null;
    }
    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      var b = item.querySelector(':scope > .collapse-head > .collapse-toggle');
      if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function enableItem(item, parts, open) {
      if (item.classList.contains('is-collapsible')) return;
      var found = parts.map(function (sel) { return direct(item, sel); }).filter(Boolean);
      var title = found.filter(function (el) { return /^H[1-6]$/.test(el.tagName); })[0];
      if (!title) return;
      var head = document.createElement('div');
      head.className = 'collapse-head';
      item.insertBefore(head, found[0]);
      found.forEach(function (el) { head.appendChild(el); });
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'collapse-toggle';
      btn.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
      btn.addEventListener('click', function () { setOpen(item, !item.classList.contains('is-open')); });
      head.appendChild(btn);
      item.classList.add('is-collapsible');
      setOpen(item, open);
    }
    function disableItem(item) {
      var head = direct(item, '.collapse-head');
      if (!head) return;
      Array.prototype.slice.call(head.children).forEach(function (c) {
        if (c.classList.contains('collapse-toggle')) c.remove(); else item.insertBefore(c, head);
      });
      head.remove();
      item.classList.remove('is-collapsible', 'is-open');
    }
    function itemsOf(g) {
      var out = [];
      document.querySelectorAll(g.scope).forEach(function (scope) {
        if (g.self) { out.push({ item: scope, first: true }); return; }
        var n = 0;
        Array.prototype.forEach.call(scope.children, function (c) { if (c.matches(g.item)) out.push({ item: c, first: n++ < g.open }); });
      });
      return out;
    }
    function apply() {
      var on = mq.matches;
      groups.forEach(function (g) {
        itemsOf(g).forEach(function (x) { if (on) enableItem(x.item, g.parts, g.self ? g.open > 0 : x.first); else disableItem(x.item); });
      });
      carousels.forEach(function (c) {
        document.querySelectorAll(c.sel).forEach(function (el) {
          if (on) { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'group'); el.setAttribute('aria-label', c.label); }
          else { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); }
        });
      });
      if (on) openHash();
    }
    // once the page has finished loading the layout above the target can still move, so the
    // first call after load scrolls again even if the card is already open
    function openHash(rescroll) {
      var id = '';
      try { id = decodeURIComponent((window.location.hash || '').slice(1)); } catch (e) { return; }
      var target = id && document.getElementById(id);
      var card = target && target.closest('.is-collapsible');
      if (!card) return;
      var wasOpen = card.classList.contains('is-open');
      if (!wasOpen) setOpen(card, true);
      if (wasOpen && rescroll !== true) return;
      // cards slide up into place as they appear; show the target in its final position first
      for (var el = target; el && el !== document.body; el = el.parentElement) {
        if (el.hasAttribute('data-aos')) {
          el.style.transition = 'none';
          el.classList.add('aos-animate');
          void el.offsetHeight;
          el.style.transition = '';
        }
      }
      target.scrollIntoView();
    }
    apply();
    window.addEventListener('hashchange', function () { if (mq.matches) openHash(); });
    window.addEventListener('load', function () { if (mq.matches) openHash(true); });
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  })();

})();
