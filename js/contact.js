const contactForm = document.getElementById('smartContactForm');
    const successBanner = document.getElementById('success-banner');
    const dismissSuccessBanner = document.getElementById('dismiss-success-banner');
    const formStartedAtInput = document.getElementById('form-started-at');
    const interestSelect = document.getElementById('interest');
    const interestTags = document.querySelector('.interest-tags');
    const MIN_HUMAN_FILL_TIME_MS = 2500;

    function setInterest(interest) {
      interestSelect.value = interest;
      updateSubOptions();
      document.querySelector('.contact-form-card').scrollIntoView({ behavior: 'smooth' });
    }

    function updateSubOptions() {
      const interest = interestSelect.value;
      const subContainer = document.getElementById('sub-options-container');
      const subSelect = document.getElementById('sub-interest');
      const budgetContainer = document.getElementById('budget-container');
      const budgetSelect = document.getElementById('budget');

      const subOptions = {
        virtualization: ['Proxmox New Setup', 'VMware to Proxmox Migration', 'Hyper-V to Proxmox', 'High Availability Cluster'],
        'open-source': ['Nextcloud Setup', 'Zimbra Email Server', 'Odoo ERP', 'SuiteCRM', 'GLPI Helpdesk', 'Full Stack Implementation'],
        security: ['Wazuh SIEM', 'pfSense Firewall', 'Fortinet Implementation', 'Sophos XG', 'Security Audit'],
        monitoring: ['Zabbix Setup', 'Prometheus + Grafana', 'ELK Stack', 'Custom Dashboards'],
        office365: ['Zimbra Migration', 'Office 365 Setup', 'Exchange to Zimbra', 'SharePoint Alternative'],
        network: ['New Office Network', 'SD-WAN Implementation', 'WiFi Design', 'VPN Setup', 'Network Audit'],
        endpoint: ['ESET Protect', 'Safetica DLP', 'Sophos Intercept X', 'Trend Micro', 'Kaspersky'],
        ecom: ['WordPress', 'Shopify', 'Magento', 'Custom CMS', 'Payment Gateway'],
        erp: ['Odoo Implementation', 'SuiteCRM', 'ERPNext', 'Custom ERP'],
        backup: ['Veeam Backup', 'Bacula', 'Proxmox Backup Server', 'Disaster Recovery'],
        hybrid: ['Complete IT Audit', 'Cost Optimization Strategy', 'Migration Planning']
      };

      if (subOptions[interest]) {
        subSelect.innerHTML = '<option value="">-- Select specific need --</option>' +
          subOptions[interest].map(opt => `<option value="${opt.toLowerCase().replace(/\s+/g, '-')}">${opt}</option>`).join('');
        subContainer.style.display = 'block';
        budgetContainer.style.display = 'block';
      } else {
        subSelect.innerHTML = '';
        subSelect.value = '';
        if (budgetSelect) {
          budgetSelect.selectedIndex = 0;
        }
        subContainer.style.display = 'none';
        budgetContainer.style.display = 'none';
      }
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
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      const formData = {
        name: document.getElementById('full-name').value.trim(),
        company: document.getElementById('company-name').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        phone: document.getElementById('contact-phone').value.trim(),
        city: document.getElementById('city').value.trim(),
        companySize: document.getElementById('company-size-select').value,
        interest: document.getElementById('interest').value,
        subInterest: document.getElementById('sub-interest')?.value || 'Not specified',
        budget: document.getElementById('budget')?.value || 'Not specified',
        timeline: document.getElementById('timeline').value,
        message: document.getElementById('message').value.trim()
      };

      const endpoint = atob(contactForm.dataset.endpointEncrypted);
      const payload = new FormData();

      payload.append('_subject', `New project inquiry from ${formData.name}`);
      payload.append('name', formData.name);
      payload.append('company', formData.company || 'Not provided');
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('city', formData.city || 'Not provided');
      payload.append('companySize', formData.companySize || 'Not provided');
      payload.append('interest', formData.interest);
      payload.append('subInterest', formData.subInterest);
      payload.append('budget', formData.budget);
      payload.append('timeline', formData.timeline);
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
        updateSubOptions();
      } catch (error) {
        showNotification('Network issue detected. Retrying with secure fallback submission...', false);
        submitViaFallbackEndpoint(payload);
        return;
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send Request';
      }
    }

    dismissSuccessBanner?.addEventListener('click', () => {
      successBanner.style.display = 'none';
    });

    interestSelect?.addEventListener('change', updateSubOptions);

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
    updateSubOptions();

