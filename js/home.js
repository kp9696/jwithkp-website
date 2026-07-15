(function () {
  'use strict';

  if (typeof window.initMatrix === 'function') {
    window.initMatrix('matrix-canvas', '01<>/+=-:*');
  }

  if (typeof Typed !== 'undefined') {
    var typedEl = document.getElementById('typed-headline');
    if (typedEl) {
      new Typed('#typed-headline', {
        strings: [
          'Private Cloud Architecture',
          'Cyber Security',
          'Operational Automation',
          'Business Automation Solutions',
          'Digital Transformation Roadmaps'
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
      'Enterprise Infrastructure, Cloud & Automation',
      'Secure Foundations. Smarter Operations.',
      'Infrastructure That Powers Applications',
      'Automation That Supports Growth'
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
      'Infrastructure powers applications. Applications power people.',
      'Build private cloud, collaboration, and security with less lock-in.',
      'Connect architecture decisions with day-to-day operations.',
      'Move from technology modernization to business process automation.'
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
