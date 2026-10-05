const contactForm = document.getElementById('smartContactForm');
    const successBanner = document.getElementById('success-banner');
    const dismissSuccessBanner = document.getElementById('dismiss-success-banner');
    const formStartedAtInput = document.getElementById('form-started-at');
    const interestSelect = document.getElementById('interest');
    const interestTags = document.querySelector('.interest-tags');
    const MIN_HUMAN_FILL_TIME_MS = 2500;

    function setInterest(interest) {
      interestSelect.value = interest;
      document.querySelector('.contact-form-card').scrollIntoView({ behavior: 'smooth' });
    }

    function showNotification(message, isSuccess = true) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.innerHTML = `<i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-circle-info'}"></i> ${message}`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }

    function submitViaFallbackEndpoint(payload) {
      const fallbackEndpoint = atob(contactForm.dataset.fallbackEndpointEncrypted);
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

      // Basic bot gate: block unrealistically fast submissions.
      const startedAt = Number(formStartedAtInput.value || Date.now());
      if ((Date.now() - startedAt) < MIN_HUMAN_FILL_TIME_MS) {
        showNotification('Please review your details for a moment, then submit again.', false);
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const submitLabel = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      // Optional fields may be absent or empty, so read each defensively.
      const field = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      const formData = {
        name: field('full-name'),
        company: field('company-name'),
        email: field('contact-email'),
        phone: field('contact-phone'),
        city: field('city'),
        companySize: field('company-size-select'),
        interest: field('interest'),
        timeline: field('timeline'),
        budget: field('budget'),
        message: field('message')
      };

      const endpoint = atob(contactForm.dataset.endpointEncrypted);
      const payload = new FormData();

      payload.append('_subject', `New project inquiry from ${formData.name}`);
      payload.append('name', formData.name);
      payload.append('company', formData.company || 'Not provided');
      payload.append('email', formData.email);
      payload.append('phone', formData.phone || 'Not provided');
      payload.append('city', formData.city || 'Not provided');
      payload.append('companySize', formData.companySize || 'Not provided');
      payload.append('interest', formData.interest);
      payload.append('timeline', formData.timeline || 'Not provided');
      payload.append('budget', formData.budget || 'Not provided');
      payload.append('message', formData.message || 'Not provided');
      payload.append('submittedAt', new Date().toISOString());

      // Forward hidden anti-spam values so provider enforces honeypot/captcha.
      payload.append('_honey', document.getElementById('website').value || '');
      payload.append('_captcha', 'true');
      payload.append('_template', 'table');
      payload.append('_replyto', formData.email);
      payload.append('_next', 'https://www.jwithkp.com/contact?submitted=1');

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json'
          },
          body: payload
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        showNotification('Request submitted successfully. We will respond within 24 hours.');
        contactForm.reset();
        formStartedAtInput.value = String(Date.now());
      } catch (error) {
        showNotification('Network issue detected. Retrying with secure fallback submission...', false);
        submitViaFallbackEndpoint(payload);
        return;
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = submitLabel;
      }
    }

    dismissSuccessBanner?.addEventListener('click', () => {
      successBanner.style.display = 'none';
    });

    interestTags?.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-interest]');
      if (!trigger) return;
      setInterest(trigger.dataset.interest);
    });

    contactForm?.addEventListener('submit', handleSubmit);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === '1') {
      successBanner.style.display = 'block';
      urlParams.delete('submitted');
      const cleanUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    formStartedAtInput.value = String(Date.now());

