/* PDFStow animated demos — a ShipCrop-style "video player" that is NOT a
   video: short scenes built from page elements, animated with CSS, stepped
   by this script. No media files, no uploads, loads instantly.
   v1 (pilot): Merge PDF only. Add a tool by adding an entry to DEMOS. */
(function () {
  'use strict';

  var GRIP = '<svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true"><circle cx="2.5" cy="3" r="1.4"/><circle cx="7.5" cy="3" r="1.4"/><circle cx="2.5" cy="8" r="1.4"/><circle cx="7.5" cy="8" r="1.4"/><circle cx="2.5" cy="13" r="1.4"/><circle cx="7.5" cy="13" r="1.4"/></svg>';
  var CURSOR = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 7-6.5 1.5L9 18z" fill="#13233c" stroke="#fff" stroke-width="1.6"/></svg>';

  function row(name, pages, cls) {
    return '<div class="demo-row ' + (cls || '') + '"><span class="demo-grip">' + GRIP + '</span>' +
      '<span class="demo-pdf">PDF</span><span class="demo-rname">' + name + '</span>' +
      '<span class="demo-rpages">' + pages + '</span></div>';
  }

  var DEMOS = {
    merge: {
      title: 'Merge PDF — watch how it works',
      dur: [2600, 2600, 3200, 3000],
      captions: [
        'Add your PDFs — as many as you like',
        'Drag to put them in your order',
        'One click — merging happens on your device',
        'One file, ready to download'
      ],
      scenes: [
        /* 1 — files arrive */
        '<div class="demo-drop"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><p>Drop your PDFs here</p></div>' +
        '<div class="demo-rows">' +
          row('report.pdf', '6 pages', 'd-in1') +
          row('invoice.pdf', '4 pages', 'd-in2') +
          row('notes.pdf', '2 pages', 'd-in3') +
        '</div>',
        /* 2 — reorder */
        '<p class="demo-scene-label">Your files</p><div class="demo-rows demo-rows-swap">' +
          row('report.pdf', '6 pages', 'd-swap-a') +
          row('invoice.pdf', '4 pages', 'd-swap-b') +
          row('notes.pdf', '2 pages', '') +
        '</div><span class="demo-cursor d-cur2">' + CURSOR + '</span>',
        /* 3 — merge */
        '<div class="demo-rows demo-rows-mini">' +
          row('invoice.pdf', '4 pages', '') +
          row('report.pdf', '6 pages', '') +
          row('notes.pdf', '2 pages', '') +
        '</div>' +
        '<div class="demo-action"><span class="demo-merge-btn">Merge PDF</span><span class="demo-cursor d-cur3">' + CURSOR + '</span><span class="demo-click-ring"></span></div>' +
        '<div class="demo-prog"><span class="demo-prog-fill"></span></div>' +
        '<p class="demo-prog-label"><span class="d-lbl-a">Merging…</span><span class="d-lbl-b">Done</span></p>',
        /* 4 — result */
        '<div class="demo-final">' +
          '<span class="demo-check"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline class="demo-check-path" points="20 6 9 17 4 12"/></svg></span>' +
          '<div class="demo-final-file"><span class="demo-pdf">PDF</span><span class="demo-rname">merged.pdf</span><span class="demo-rpages">12 pages</span></div>' +
          '<span class="demo-dl-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download</span>' +
        '</div>' +
        '<p class="demo-note">Nothing was uploaded — it all happens on your device.</p>'
      ]
    }
  };

  var SLUG_TO_ID = { 'merge-pdf': 'merge' };

  function currentToolId() {
    if (document.body && document.body.dataset && document.body.dataset.tool) return document.body.dataset.tool;
    var seg = location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return SLUG_TO_ID[seg] || null;
  }

  /* ---------- Watch-demo button ---------- */
  function ensureButton() {
    var title = document.getElementById('toolTitle');
    if (!title || !title.parentNode) return;
    var id = currentToolId();
    var existing = document.getElementById('demoWatchBtn');
    if (!id || !DEMOS[id]) { if (existing) existing.remove(); return; }
    if (existing) return;
    var row = title.parentNode;
    if (!row.classList || !row.classList.contains('demo-title-row')) {
      row = document.createElement('div');
      row.className = 'demo-title-row';
      title.parentNode.insertBefore(row, title);
      row.appendChild(title);
    }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'demo-watch-btn';
    b.id = 'demoWatchBtn';
    b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg> See how it works';
    b.addEventListener('click', function () { openDemo(id); });
    row.appendChild(b);
  }

  /* ---------- Player ---------- */
  var overlay = null, els = {}, timer = null, idx = 0, activeDemo = null, lastFocus = null;

  function buildPlayer() {
    overlay = document.createElement('div');
    overlay.className = 'demo-overlay hidden';
    overlay.id = 'demoOverlay';
    overlay.innerHTML =
      '<div class="demo-window" role="dialog" aria-modal="true" aria-labelledby="demoTitle">' +
        '<div class="demo-head">' +
          '<span class="demo-dots"><i></i><i></i><i></i></span>' +
          '<span class="demo-title" id="demoTitle"></span>' +
          '<button type="button" class="demo-close" id="demoClose" aria-label="Close demo"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
        '</div>' +
        '<div class="demo-screen">' +
          '<span class="demo-tag"><i></i>DEMO</span>' +
          '<span class="demo-wm">PDFStow</span>' +
          '<div class="demo-scenes" id="demoScenes"></div>' +
        '</div>' +
        '<div class="demo-foot">' +
          '<div class="demo-segs" id="demoSegs"></div>' +
          '<p class="demo-caption" id="demoCaption"></p>' +
          '<button type="button" class="demo-replay hidden" id="demoReplay"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Replay</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    els.title = overlay.querySelector('#demoTitle');
    els.scenes = overlay.querySelector('#demoScenes');
    els.segs = overlay.querySelector('#demoSegs');
    els.caption = overlay.querySelector('#demoCaption');
    els.replay = overlay.querySelector('#demoReplay');
    overlay.querySelector('#demoClose').addEventListener('click', closeDemo);
    els.replay.addEventListener('click', function () { play(); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDemo(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) closeDemo();
    });
  }

  function stopTimers() { if (timer) { clearTimeout(timer); timer = null; } }

  function setScene(i) {
    idx = i;
    var kids = els.scenes.children;
    for (var k = 0; k < kids.length; k++) kids[k].classList.toggle('active', k === i);
    els.caption.textContent = activeDemo.captions[i];
    var segs = els.segs.children;
    for (var s = 0; s < segs.length; s++) {
      var fill = segs[s].firstChild;
      fill.style.transition = 'none';
      fill.style.width = s < i ? '100%' : '0%';
    }
    var cur = segs[i].firstChild;
    /* force reflow so the width transition runs */
    void cur.offsetWidth;
    cur.style.transition = 'width ' + activeDemo.dur[i] + 'ms linear';
    cur.style.width = '100%';
    timer = setTimeout(function () {
      if (i + 1 < activeDemo.scenes.length) { setScene(i + 1); }
      else { els.replay.classList.remove('hidden'); }
    }, activeDemo.dur[i]);
  }

  function play() {
    stopTimers();
    els.replay.classList.add('hidden');
    /* rebuild scene DOM so CSS animations restart from zero */
    els.scenes.innerHTML = activeDemo.scenes.map(function (h) { return '<div class="dscene">' + h + '</div>'; }).join('');
    els.segs.innerHTML = activeDemo.scenes.map(function () { return '<span class="demo-seg"><i></i></span>'; }).join('');
    setScene(0);
  }

  function openDemo(id) {
    activeDemo = DEMOS[id];
    if (!activeDemo) return;
    if (!overlay) buildPlayer();
    els.title.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" fill="#c5a059"/></svg> ' + activeDemo.title;
    lastFocus = document.activeElement;
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    play();
    var c = overlay.querySelector('#demoClose');
    if (c) c.focus();
  }

  function closeDemo() {
    stopTimers();
    if (!overlay) return;
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- Wiring ---------- */
  function init() {
    ensureButton();
    var title = document.getElementById('toolTitle');
    if (title && 'MutationObserver' in window) {
      new MutationObserver(function () { ensureButton(); }).observe(title, { childList: true, characterData: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
