/* Cache the complete public app; learner progress stays in localStorage. */
const CACHE = 'mongol-hsk-v19';
const FILES = ['./', './index.html', './css/style.css?v=20261101-nahia2', './js/app.js?v=20261101-nahia2',
  './js/hanzi-writer.min.js', './js/data_bundle.js?v=20261101-nahia2', './manifest.json', './css/learning.css?v=20261101-nahia2', './js/learning.js?v=20261101-nahia2', './js/radical_data.js?v=20261101-nahia2', './js/picture_data.js?v=20261101-nahia2', './js/radical_lessons.js?v=20261101-nahia2', './js/radical_lessons_data.js?v=20261101-nahia2', './css/radical_lessons.css?v=20261101-nahia2', './js/word_trees.js?v=20261101-nahia2', './css/word_trees.css?v=20261101-nahia2', './js/related_words.js?v=20261101-nahia2', './css/related_words.css?v=20261101-nahia2', './css/nahia_theme.css?v=20261101-nahia2', './js/presentation.js?v=20261101-nahia2', './assets/fonts/Manrope.ttf', './assets/nahia-icon.svg', './assets/nahia-icon-192.png', './assets/nahia-icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mongol-hsk-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request, { cache: 'no-cache' }).then(response => {
    if (response.ok && (FILES.some(file => new URL(file, self.location.href).href === event.request.url) || new URL(event.request.url).pathname.includes('/assets/picture-cards/'))) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
