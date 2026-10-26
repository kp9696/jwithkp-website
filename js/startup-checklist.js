/* Startup IT Checklist
 *
 * Ticks are kept in this browser's localStorage only (nothing is sent anywhere).
 * Storage can be blocked or throw (private windows, blocked site data), so every
 * read and write is wrapped and the checklist still works without it.
 */
(function () {
  'use strict';

  var KEY = 'jwkp-startup-checklist-v1';
  var boxes = document.querySelectorAll('.chk-list input[type="checkbox"]');
  if (!boxes.length) return;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function update() {
    var done = 0;
    for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) done++;
    document.getElementById('chk-done').textContent = done;
    document.getElementById('chk-total').textContent = boxes.length;
    var bar = document.getElementById('chk-bar');
    bar.max = boxes.length;
    bar.value = done;
    var lists = document.querySelectorAll('.chk-list');
    for (var g = 0; g < lists.length; g++) {
      var items = lists[g].querySelectorAll('input[type="checkbox"]');
      var n = 0;
      for (var k = 0; k < items.length; k++) if (items[k].checked) n++;
      var label = document.querySelector('[data-count-for="' + lists[g].getAttribute('data-group') + '"]');
      if (label) label.textContent = n + ' of ' + items.length;
    }
  }

  var state = load();
  for (var i = 0; i < boxes.length; i++) {
    boxes[i].checked = !!state[boxes[i].getAttribute('data-id')];
    boxes[i].addEventListener('change', function () {
      var s = load();
      if (this.checked) s[this.getAttribute('data-id')] = 1; else delete s[this.getAttribute('data-id')];
      save(s);
      update();
    });
  }

  document.getElementById('chk-reset').addEventListener('click', function () {
    for (var j = 0; j < boxes.length; j++) boxes[j].checked = false;
    save({});
    update();
  });
  document.getElementById('chk-print').addEventListener('click', function () { window.print(); });

  update();
}());
