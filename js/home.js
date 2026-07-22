(function () {
  'use strict';

  // 1. Matrix background initialization
  if (typeof window.initMatrix === 'function') {
    window.initMatrix('matrix-canvas', '01<>/+=-:*');
  }

  // 2. Parallax mouse movement in the new hero
  (function () {
    const hero = document.querySelector('.hp-hero');
    const visualArea = document.querySelector('.hp-visual-area');
    if (!hero || !visualArea) return;

    const cards = visualArea.querySelectorAll('.hp-float-card');
    const center = visualArea.querySelector('.hp-center-illustration');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduceMotion || !finePointer) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    function renderParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (center) {
        center.style.transform = 'translate3d(' + (currentX * 12) + 'px,' + (currentY * 12) + 'px, 0)';
      }

      cards.forEach(function (card, idx) {
        const factor = (idx + 1) * 6;
        card.style.transform = 'translate3d(' + (currentX * -factor) + 'px,' + (currentY * -factor) + 'px, 0)';
      });

      rafId = window.requestAnimationFrame(renderParallax);
    }

    hero.addEventListener('mousemove', function (event) {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
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

  // 3. Testimonials Carousel
  (function () {
    const track = document.querySelector('.hp-carousel-track');
    if (!track) return;
    const slides = Array.from(track.children);
    const dotsContainer = document.querySelector('.hp-carousel-controls');
    if (!dotsContainer || slides.length === 0) return;

    let currentIndex = 0;
    let timer = null;

    // Create dot indicators dynamically
    dotsContainer.innerHTML = '';
    slides.forEach(function (_, idx) {
      const dot = document.createElement('button');
      dot.className = 'hp-carousel-dot' + (idx === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
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
      });
    }

    function startTimer() {
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

})();

