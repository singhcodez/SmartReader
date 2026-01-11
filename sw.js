const CACHE_NAME = 'smart-reader-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './logo.png',
  './js/main.js',
  './js/config.js',
  './js/state.js',
  './js/ui.js',
  './js/viewer.js',
  './js/dictionary.js',
  // External Libraries (Crucial for Offline)
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  // Fonts & CMaps (Optional but good for stability)
  'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
  'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/'
];

// 1. Install Event (Cache Assets)
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Fetch Event (Serve from Cache first, then Network)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
