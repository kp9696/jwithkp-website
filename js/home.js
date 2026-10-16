(function () {
  'use strict';

  // 1. Matrix background initialization
  if (typeof window.initMatrix === 'function') {
    window.initMatrix('matrix-canvas', '01<>/+=-:*');
  }

  // 3. Testimonials Carousel
  (function () {
    const track = document.querySelector('.hp-carousel-track');
    if (!track) return;
    const slides = Array.from(track.children);
    const dotsContainer = document.querySelector('.hp-carousel-controls');
    if (!dotsContainer || slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create dot indicators dynamically
    dotsContainer.innerHTML = '';
    slides.forEach(function (_, idx) {
      const dot = document.createElement('button');
      dot.className = 'hp-carousel-dot' + (idx === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
      if (idx === 0) dot.setAttribute('aria-current', 'true');
      dot.addEventListener('click', function () {
        goToSlide(idx);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === currentIndex);
        if (idx === currentIndex) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    // Autoplay is a "motion" a visitor may have explicitly opted out of;
    // manual navigation via the dots (and the arrow-key handler below)
    // still works either way, it just won't advance on its own.
    function startTimer() {
      if (prefersReducedMotion) return;
      timer = setInterval(function () {
        goToSlide(currentIndex + 1);
      }, 6000);
    }

    function resetTimer() {
      clearInterval(timer);
      startTimer();
    }

    startTimer();

    // Pause on hover
    track.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    track.addEventListener('mouseleave', function () {
      startTimer();
    });

    // Keyboard navigation support for accessibility
    track.parentElement.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentIndex - 1);
        resetTimer();
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentIndex + 1);
        resetTimer();
      }
    });
  })();

  // 4. FAQ Accordion Interaction with Accessibility
  (function () {
    const triggers = document.querySelectorAll('.hp-faq-trigger');
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.hp-faq-item');
        if (!item) return;

        const content = item.querySelector('.hp-faq-content');
        const isCurrentlyActive = item.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.hp-faq-item').forEach(function (el) {
          el.classList.remove('active');
          el.querySelector('.hp-faq-trigger').setAttribute('aria-expanded', 'false');
          const innerContent = el.querySelector('.hp-faq-content');
          if (innerContent) {
            innerContent.style.maxHeight = null;
          }
        });

        // Toggle the clicked one
        if (!isCurrentlyActive && content) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  })();

  // 5. Timeline Active node scroll effect
  (function () {
    const timelineSteps = document.querySelectorAll('.hp-timeline-step');
    if (timelineSteps.length === 0) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.6 });

    timelineSteps.forEach(function (step) {
      observer.observe(step);
    });
  })();

  // 6. Phones only: the stage cards open one at a time and the enterprise / open-source
  // table opens row by row. The markup is unchanged, so without JavaScript (or on a wider
  // screen) everything stays open. The toggle is a transparent button laid over the card or
  // row heading, so the heading keeps its own semantics.
  (function () {
    var mq = window.matchMedia('(max-width: 768px)');
    var groups = [
      {
        items: '.hp-stage-grid .hp-stage-card', head: '.hp-stage-head', exclusive: true,
        label: function (el) {
          var b = el.querySelector('.hp-stage-badge'), h = el.querySelector('h3');
          return (b ? b.textContent.trim() + ': ' : '') + (h ? h.textContent.trim() : '');
        }
      },
      {
        items: '.hp-compare tbody tr', head: 'th', exclusive: false,
        label: function (el) { return el.querySelector('th').textContent.trim(); }
      }
    ];
    function setOpen(item, open) {
      item.classList.toggle('is-open', open);
      var b = item.querySelector('.hp-collapse-toggle');
      if (b) b.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function enable(g) {
      var items = Array.prototype.slice.call(document.querySelectorAll(g.items));
      items.forEach(function (item, i) {
        var head = item.querySelector(g.head);
        if (!head || item.classList.contains('is-collapsible')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hp-collapse-toggle';
        btn.setAttribute('aria-label', g.label(item));
        btn.addEventListener('click', function () {
          var open = !item.classList.contains('is-open');
          if (g.exclusive && open) items.forEach(function (other) { if (other !== item) setOpen(other, false); });
          setOpen(item, open);
        });
        head.appendChild(btn);
        item.classList.add('is-collapsible');
        setOpen(item, i === 0);
      });
    }
    function disable(g) {
      document.querySelectorAll(g.items).forEach(function (item) {
        var b = item.querySelector('.hp-collapse-toggle');
        if (b) b.remove();
        item.classList.remove('is-collapsible', 'is-open');
      });
    }
    function apply() { groups.forEach(mq.matches ? enable : disable); }
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply); else mq.addListener(apply);
  })();

})();

