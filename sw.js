const CACHE_NAME = 'dictionary-cache-v2';
const urlsToCache = [
    'https://raw.githubusercontent.com/abhayattcc/odia-dictionary-by-abhayattcc/refs/heads/main/index.html',
    'https://unpkg.com/tesseract.js@4.1.0/dist/tesseract.min.js',
    'https://unpkg.com/tesseract.js@4.1.0/dist/worker.min.js',
    'https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz',
    'https://tessdata.projectnaptha.com/4.0.0/hin.traineddata.gz',
    'https://tessdata.projectnaptha.com/4.0.0/ori.traineddata.gz',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    'https://unpkg.com/pako@2.1.0/dist/pako.min.js',
    'https://raw.githubusercontent.com/abhayattcc/odia-dictionary-by-abhayattcc/refs/heads/main/english_odia.csv.gz',
    'https://raw.githubusercontent.com/abhayattcc/odia-dictionary-by-abhayattcc/refs/heads/main/odia_meaning.csv.gz',
    'https://raw.githubusercontent.com/abhayattcc/odia-dictionary-by-abhayattcc/refs/heads/main/english_hindi.csv.gz'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Service Worker: Caching assets');
            return cache.addAll(urlsToCache);
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(error => {
                console.error('Fetch failed:', error);
                throw error;
            });
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});