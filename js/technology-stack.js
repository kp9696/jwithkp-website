(() => {
      const hero = document.querySelector('.hero');
      const matrixCanvas = document.getElementById('hero-matrix-canvas');
      if (!hero || !matrixCanvas) return;

      const matrixCtx = matrixCanvas.getContext('2d');
      if (!matrixCtx) return;

      const matrixChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const fontSize = 16;
      const minDropSpeed = 0.7;
      const maxDropSpeed = 1.35;
      let columns = 0;
      let drops = [];
      let animationFrameId = null;

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

      const resizeMatrix = () => {
        const rect = hero.getBoundingClientRect();
        matrixCanvas.width = Math.max(1, Math.floor(rect.width));
        matrixCanvas.height = Math.max(1, Math.floor(rect.height));
        columns = Math.max(1, Math.floor(matrixCanvas.width / fontSize));
        drops = Array.from({ length: columns }, () => ({
          y: Math.random() * matrixCanvas.height,
          speed: minDropSpeed + Math.random() * (maxDropSpeed - minDropSpeed)
        }));
      };

      const drawFrame = () => {
        matrixCtx.fillStyle = 'rgba(10, 15, 30, 0.15)';
        matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        matrixCtx.font = `${fontSize}px monospace`;
        matrixCtx.fillStyle = 'rgba(66, 245, 155, 0.65)';

        drops.forEach((drop, index) => {
          const character = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = index * fontSize;
          matrixCtx.fillText(character, x, drop.y);

          drop.y += fontSize * drop.speed;
          if (drop.y > matrixCanvas.height + fontSize && Math.random() > 0.975) {
            drop.y = -fontSize;
          }
        });
      };

      const animate = () => {
        drawFrame();
        animationFrameId = requestAnimationFrame(animate);
      };

      const startOrStop = () => {
        if (prefersReducedMotion.matches) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          matrixCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
          return;
        }

        if (!animationFrameId) {
          animate();
        }
      };

      resizeMatrix();
      startOrStop();

      window.addEventListener('resize', () => {
        resizeMatrix();
        if (!prefersReducedMotion.matches) {
          drawFrame();
        }
      });

      prefersReducedMotion.addEventListener('change', startOrStop);
    })();

