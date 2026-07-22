(() => {
      const form = document.getElementById('servicesQuoteForm');
      if (!form) return;

      const successBanner = document.getElementById('services-quote-success');
      const startedAtInput = document.getElementById('services-form-started-at');
      const MIN_HUMAN_FILL_TIME_MS = 2500;

      function showQuoteSuccess() {
        if (successBanner) {
          successBanner.style.display = 'block';
        }
      }

      function submitViaFallbackEndpoint(payload) {
        const fallbackEndpoint = atob(form.dataset.fallbackEndpointEncrypted);
        const fallbackForm = document.createElement('form');
        fallbackForm.method = 'POST';
        fallbackForm.action = fallbackEndpoint;
        fallbackForm.style.display = 'none';

        for (const [key, value] of payload.entries()) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          fallbackForm.appendChild(input);
        }

        document.body.appendChild(fallbackForm);
        fallbackForm.submit();
      }

      async function handleSubmit(event) {
        event.preventDefault();

        const startedAt = Number(startedAtInput.value || Date.now());
        if ((Date.now() - startedAt) < MIN_HUMAN_FILL_TIME_MS) {
          alert('Please review your details for a moment, then submit again.');
          return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        const payload = new FormData();
        payload.append('_subject', `Custom Quote Request - ${document.getElementById('quote-company').value.trim() || 'JwithKP Services'}`);
        payload.append('name', document.getElementById('quote-name').value.trim());
        payload.append('company', document.getElementById('quote-company').value.trim());
        payload.append('email', document.getElementById('quote-email').value.trim());
        payload.append('companySize', document.getElementById('quote-size').value);
        payload.append('currentStack', document.getElementById('quote-stack').value.trim() || 'Not provided');
        payload.append('scope', document.getElementById('quote-scope').value);
        payload.append('painPoints', document.getElementById('quote-pain').value.trim());
        payload.append('timeline', document.getElementById('quote-timeline').value.trim() || 'Not provided');
        payload.append('submittedAt', new Date().toISOString());
        payload.append('_honey', document.getElementById('services-website').value || '');
        payload.append('_captcha', 'true');
        payload.append('_template', 'table');
        payload.append('_replyto', document.getElementById('quote-email').value.trim());
        payload.append('_next', 'https://www.jwithkp.com/services?submitted=1');

        try {
          const response = await fetch(atob(form.dataset.endpointEncrypted), {
            method: 'POST',
            headers: {
              Accept: 'application/json'
            },
            body: payload
          });

          if (!response.ok) {
            throw new Error('Submission failed');
          }

          form.reset();
          startedAtInput.value = String(Date.now());
          showQuoteSuccess();
        } catch (error) {
          submitViaFallbackEndpoint(payload);
          return;
        } finally {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Send Quote Request';
        }
      }

      form.addEventListener('submit', handleSubmit);
      startedAtInput.value = String(Date.now());

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('submitted') === '1') {
        showQuoteSuccess();
        urlParams.delete('submitted');
        const cleanUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    })();

