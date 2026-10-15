/* IT Cost Estimator
 *
 * Every number on the page comes from DATA below: published vendor list prices
 * read from the vendors' own pages on DATA.asOf, plus the planning assumptions
 * spelled out in the page text. It is an estimate, not a quote. Prices that
 * vendors do not publish (Fortinet, Veeam, Splunk, Microsoft Sentinel, backup
 * storage, hardware) are deliberately NOT priced; the results say so instead.
 *
 * To refresh: re-read each vendor page listed in DATA.prices, update the
 * amounts and DATA.asOf, then rebuild.
 */
(function () {
  'use strict';

  var DATA = {
    asOf: '2026-10-15',
    fx: {
      usdInr: 95,
      note: 'Mid-market rate from X-Rates dated 1 Jan 2026. Indicative only: the rate moves, and USD-priced items move with it.',
      url: 'https://www.x-rates.com/calculator/?from=USD&to=INR&amount=1'
    },
    prices: {
      gBase:     { vendor: 'Google Workspace', plan: 'Base',               amount: 99,    cur: 'INR', unit: 'per user per month', note: 'Up to 20 users. Annual commitment, billed monthly. Excludes tax.', url: 'https://workspace.google.com/pricing?hl=en_in' },
      gStarter:  { vendor: 'Google Workspace', plan: 'Starter',            amount: 270,   cur: 'INR', unit: 'per user per month', note: 'Annual commitment, billed monthly. Excludes tax.', url: 'https://workspace.google.com/pricing?hl=en_in' },
      mBasic:    { vendor: 'Microsoft 365',    plan: 'Business Basic',     amount: 170,   cur: 'INR', unit: 'per user per month', note: 'Paid yearly. GST extra.', url: 'https://www.microsoft.com/en-in/microsoft-365/business/microsoft-365-plans-and-pricing' },
      mStandard: { vendor: 'Microsoft 365',    plan: 'Business Standard (listed with Copilot)', amount: 1955, cur: 'INR', unit: 'per user per month', note: 'Paid yearly. GST extra. Desktop Word, Excel and Outlook.', url: 'https://www.microsoft.com/en-in/microsoft-365/business/microsoft-365-plans-and-pricing' },
      mPremium:  { vendor: 'Microsoft 365',    plan: 'Business Premium (listed with Copilot)',  amount: 2660, cur: 'INR', unit: 'per user per month', note: 'Paid yearly. GST extra. Adds device and security management.', url: 'https://www.microsoft.com/en-in/microsoft-365/business/microsoft-365-plans-and-pricing' },
      defender:  { vendor: 'Microsoft',        plan: 'Defender for Business', amount: 250, cur: 'INR', unit: 'per user per month', note: 'Standalone price as listed. GST extra.', url: 'https://www.microsoft.com/en-in/microsoft-365/business/microsoft-365-plans-and-pricing' },
      onePass:   { vendor: '1Password',        plan: 'Business',           amount: 8.99,  cur: 'USD', unit: 'per user per month', note: 'Billed annually.', url: 'https://1password.com/pricing/business' },
      bitwarden: { vendor: 'Bitwarden',        plan: 'Teams (open source)', amount: 4.00, cur: 'USD', unit: 'per user per month', note: 'Hosted by Bitwarden.', url: 'https://bitwarden.com/pricing/business/' },
      ls84:      { vendor: 'AWS Lightsail',    plan: '4 vCPU, 16 GB, 320 GB SSD', amount: 84,  cur: 'USD', unit: 'per server per month', note: 'General-purpose Linux bundle. One example provider; others may be cheaper.', url: 'https://aws.amazon.com/lightsail/pricing/' },
      ls164:     { vendor: 'AWS Lightsail',    plan: '8 vCPU, 32 GB, 640 GB SSD', amount: 164, cur: 'USD', unit: 'per server per month', note: 'General-purpose Linux bundle. One example provider; others may be cheaper.', url: 'https://aws.amazon.com/lightsail/pricing/' }
    },
    wazuh: { note: 'Wazuh quickstart hardware table: 4 vCPU and 8 GiB RAM for 1-25 endpoints; 8 vCPU and 8 GiB RAM for 26-100 endpoints. Larger estates need a distributed deployment.', url: 'https://documentation.wazuh.com/current/quickstart.html' }
  };

  // People per team-size band (min, max). "200+" is modelled as 200-300.
  var BANDS = {
    'just-me': [1, 1, 'Just me'],
    '2-10': [2, 10, '2–10 people'],
    '11-25': [11, 25, '11–25 people'],
    '26-50': [26, 50, '26–50 people'],
    '51-200': [51, 200, '51–200 people'],
    '200+': [200, 300, '200+ people (modelled as 200–300)']
  };

  function inr(p) { return p.cur === 'USD' ? p.amount * DATA.fx.usdInr : p.amount; }
  function money(n) { return '₹' + (Math.round(n / 10) * 10).toLocaleString('en-IN'); }
  function range(lo, hi) { return Math.round(lo) === Math.round(hi) ? money(lo) : money(lo) + ' – ' + money(hi); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function compute(input) {
    var b = BANDS[input.size] || BANDS['2-10'];
    var min = b[0], max = b[1], P = DATA.prices;
    var rows = [], unpriced = [];
    var ent = { lo: 0, hi: 0 }, os = { lo: 0, hi: 0 };

    // 1. Business email and office apps: the same in both columns, because we
    // would not self-host email for a team of this size.
    var eLo, eHi, eBasis;
    if (input.apps) {
      eLo = min * inr(P.mStandard); eHi = max * inr(P.mPremium);
      eBasis = 'Microsoft 365 Business Standard to Premium (desktop Word, Excel and Outlook).';
    } else {
      eLo = min * inr(min <= 20 ? P.gBase : P.mBasic); eHi = max * inr(P.gStarter);
      eBasis = 'Google Workspace Base (up to 20 users) or Microsoft 365 Business Basic, up to Google Workspace Starter.';
    }
    rows.push({ label: 'Business email and office apps', ent: range(eLo, eHi), os: range(eLo, eHi), same: true, basis: eBasis + ' Same in both options: we would not self-host email at this size.' });
    ent.lo += eLo; ent.hi += eHi; os.lo += eLo; os.hi += eHi;

    // 2. Password manager (every security level)
    var pe = inr(P.onePass), po = inr(P.bitwarden);
    rows.push({ label: 'Password manager', ent: range(min * pe, max * pe), os: range(min * po, max * po), basis: '1Password Business vs Bitwarden Teams (open source, hosted by Bitwarden).' });
    ent.lo += min * pe; ent.hi += max * pe; os.lo += min * po; os.hi += max * po;

    // 3. Device security (standard and strong)
    if (input.security !== 'essential') {
      var d = inr(P.defender);
      rows.push({ label: 'Device security', ent: range(min * d, max * d), os: money(0), basis: 'Microsoft Defender for Business vs the protection and disk encryption built into the operating system (no extra licence).' });
      ent.lo += min * d; ent.hi += max * d;
    }

    // 4. Security monitoring (strong)
    if (input.security === 'strong') {
      var osCost = null, osText;
      if (input.hosting === 'own') {
        osCost = 0; osText = money(0) + ' rent';
      } else if (max <= 25) {
        osCost = inr(P.ls84); osText = money(osCost);
      } else if (max <= 100) {
        osCost = inr(P.ls164); osText = money(osCost);
      } else {
        osText = 'Needs a larger, distributed setup: quoted on a call';
        unpriced.push('Wazuh server sizing above 100 endpoints');
      }
      rows.push({
        label: 'Security monitoring',
        ent: 'Not priced: SIEM vendors (Splunk, Microsoft Sentinel) charge by log volume',
        os: osText,
        basis: input.hosting === 'own'
          ? 'Wazuh has no licence fee. It runs on a server you already own, so there is no monthly rent, but you supply the hardware, power and upkeep.'
          : 'Wazuh has no licence fee, but a cloud server big enough for it is a real cost. Priced as one AWS Lightsail server sized from the Wazuh hardware table.',
        unpricedEnt: true
      });
      unpriced.push('Enterprise SIEM (Splunk, Microsoft Sentinel)');
      if (osCost !== null) { os.lo += osCost; os.hi += osCost; }
    }

    // Things we never price here
    unpriced.push('Hardware (laptops, routers, servers): you provide it');
    unpriced.push('Backup storage and Veeam licences (quoted by vendors and partners)');
    if (input.work !== 'remote') unpriced.push('Office firewall and Wi-Fi equipment (Fortinet or pfSense hardware)');
    unpriced.push('GST');
    unpriced.push('JwithKP setup and support fees');

    return { band: b, rows: rows, ent: ent, os: os, unpriced: unpriced, entIncomplete: input.security === 'strong' };
  }

  function verdict(r) {
    var text;
    if (r.os.hi < r.ent.lo) text = 'On the lines priced here, the open-source option costs less every month in licences and hosting.';
    else if (r.os.lo > r.ent.hi) text = 'On the lines priced here, the open-source option costs more every month, mainly because hosting a monitoring server in the cloud costs more than per-user licences for a team this size.';
    else text = 'The two ranges overlap. Which one costs less depends on the plans you need, and on who will host and maintain the tools.';
    if (r.entIncomplete) text += ' The enterprise column leaves out SIEM licences, which vendors quote separately, so this comparison favours the enterprise option.';
    return text;
  }

  function $(id) { return document.getElementById(id); }

  function render() {
    var input = {
      size: $('est-size').value,
      work: $('est-work').value,
      hosting: $('est-hosting').value,
      apps: $('est-apps').checked,
      security: $('est-security').value
    };
    var r = compute(input);
    $('est-ent-range').textContent = range(r.ent.lo, r.ent.hi) + ' per month';
    $('est-ent-year').textContent = 'About ' + range(r.ent.lo * 12, r.ent.hi * 12) + ' per year';
    $('est-os-range').textContent = range(r.os.lo, r.os.hi) + ' per month';
    $('est-os-year').textContent = 'About ' + range(r.os.lo * 12, r.os.hi * 12) + ' per year';
    $('est-verdict').textContent = verdict(r);
    $('est-people').textContent = r.band[2];
    $('est-rows').innerHTML = r.rows.map(function (row) {
      return '<tr role="row"><th scope="row" role="rowheader">' + esc(row.label) + '</th><td role="cell" data-label="Enterprise">' + esc(row.ent) + '</td><td role="cell" data-label="Open source">' + esc(row.os) + '</td><td role="cell" class="est-basis" data-label="Basis">' + esc(row.basis) + '</td></tr>';
    }).join('');
    var seen = {};
    $('est-unpriced').innerHTML = r.unpriced.filter(function (u) { if (seen[u]) return false; seen[u] = 1; return true; })
      .map(function (u) { return '<li><i class="fas fa-xmark" aria-hidden="true"></i> ' + esc(u) + '</li>'; }).join('');
  }

  function renderSources() {
    var rows = Object.keys(DATA.prices).map(function (k) {
      var p = DATA.prices[k];
      var amt = p.cur === 'INR' ? money(p.amount) : 'US$' + p.amount.toFixed(2) + ' (about ' + money(inr(p)) + ')';
      return '<tr role="row"><th scope="row" role="rowheader">' + esc(p.vendor) + '</th><td role="cell" data-label="Plan">' + esc(p.plan) + '</td><td role="cell" data-label="Price">' + esc(amt) + ' ' + esc(p.unit) + '</td><td role="cell" data-label="Notes">' + esc(p.note) + '</td><td role="cell" data-label="Source"><a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">Vendor page</a></td></tr>';
    });
    rows.push('<tr role="row"><th scope="row" role="rowheader">Exchange rate</th><td role="cell" data-label="Plan">US$ to INR</td><td role="cell" data-label="Price">₹' + DATA.fx.usdInr + ' per US$</td><td role="cell" data-label="Notes">' + esc(DATA.fx.note) + '</td><td role="cell" data-label="Source"><a href="' + esc(DATA.fx.url) + '" target="_blank" rel="noopener noreferrer">Source</a></td></tr>');
    rows.push('<tr role="row"><th scope="row" role="rowheader">Wazuh</th><td role="cell" data-label="Plan">Server sizing</td><td role="cell" data-label="Price">—</td><td role="cell" data-label="Notes">' + esc(DATA.wazuh.note) + '</td><td role="cell" data-label="Source"><a href="' + esc(DATA.wazuh.url) + '" target="_blank" rel="noopener noreferrer">Wazuh docs</a></td></tr>');
    $('est-sources').innerHTML = rows.join('');
    var stamp = document.querySelectorAll('.est-asof');
    for (var i = 0; i < stamp.length; i++) stamp[i].textContent = new Date(DATA.asOf + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function init() {
    if (!$('est-form')) return;
    renderSources();
    ['est-size', 'est-work', 'est-hosting', 'est-apps', 'est-security'].forEach(function (id) {
      $(id).addEventListener('change', render);
    });
    $('est-form').addEventListener('submit', function (e) { e.preventDefault(); render(); });
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
