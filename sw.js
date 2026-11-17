/* PDFStow service worker — v4.6.1 offline support.
   Strategy:
   - Install: precache the same-origin shell (each file added individually,
     so one failure never fails the whole install).
   - Navigations: network-first, cached index.html as the offline fallback.
   - Same-origin static: stale-while-revalidate (?v= versioning bounds staleness).
   - Cross-origin (pinned CDN libraries, pdf.js worker, Tesseract engine/data):
     cache-first, stored on first successful fetch — lazy tools therefore
     work offline from their second use onward.
   - Analytics hosts (Google Analytics / Tag Manager, Microsoft Clarity)
     are bypassed entirely: the fetch handler returns without respondWith,
     so analytics traffic is never cached and never stale-served.
   Only GET requests are handled; range requests are left to the network. */
const CACHE = 'pdfstow-v4.6.1';
const SHELL = [
  './', 'index.html',
  'app.js?v=50', 'app.js',
  'styles.css?v=50', 'styles.css',
  'trust.html', 'about/', 'privacy/', 'terms/', 'contact/', 'manifest.json',
  'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'logo-icon.webp',
  'og-image.png', 'xlsx.full.min.js', '404.html'
];
/* Eager CDN libraries + the pdf.js worker. These load before the worker
   controls the page, so they are precached at install (all four hosts send
   CORS headers; each add is caught individually like the shell files). */
const CDN = [
  'https://unpkg.com/pdf-lib-plus-encrypt@1.1.0/dist/pdf-lib-plus-encrypt.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.concat(CDN).map(u => c.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  /* Analytics bypass: never intercept, never cache (v4.4.0). */
  const h = url.hostname;
  if (h === 'googletagmanager.com' || h.endsWith('.googletagmanager.com') ||
      h === 'google-analytics.com' || h.endsWith('.google-analytics.com') ||
      h === 'analytics.google.com' || h.endsWith('.analytics.google.com') ||
      h === 'clarity.ms' || h.endsWith('.clarity.ms')) return;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const r = await fetch(req);
        if (r && r.status === 200) { c.put(req, r.clone()); c.put('index.html', r.clone()); }
        return r;
      } catch (err) {
        return (await c.match(req)) || (await c.match('index.html')) || (await c.match('./')) || Response.error();
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r && r.status === 200) c.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
    return;
  }

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req);
    if (hit) return hit;
    const r = await fetch(req);
    if (r && (r.status === 200 || r.type === 'opaque')) c.put(req, r.clone());
    return r;
  })());
});
