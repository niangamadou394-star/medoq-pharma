const CACHE = 'medoq-v2';
// Chemins relatifs au sous-dossier (fonctionne en localhost ET sur GitHub Pages /medoq-pharma/)
const BASE = self.location.pathname.replace('/sw.js', '');
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/landing.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API calls : réseau en priorité
  if (url.hostname !== self.location.hostname) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  // App shell : cache d'abord, fallback réseau, puis index.html
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    })).catch(() => caches.match(BASE + '/index.html'))
  );
});
