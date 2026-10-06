self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('result-store-v4').then((cache) => cache.addAll([
      './',
      './index.html',
      './style.css',
      './script.js',
      './icon.svg',
      './manifest.json',
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});
