/**
 * @file ./docs/sw.js
 * @author https://github.com/j-Cis
 * @description Service Worker dla Progressive Web App (PWA).
 * Wersja ostateczna z poprawną listą plików do cache'owania.
 */

// Nowa, unikalna nazwa, aby wymusić aktualizację na wszystkich urządzeniach.
const CACHE_NAME = 'graph-generator-cache-final-v1g';

// Pełna i poprawna lista plików do zapisania w pamięci podręcznej.
// Wszystkie ścieżki są absolutne, aby poprawnie działały na GitHub Pages.
const FILES_TO_CACHE = [
  // --- Pliki krytyczne ---
  '/graph-generator/',
  '/graph-generator/index.html',
  '/graph-generator/manifest.json',
  
  // --- Style ---
  '/graph-generator/css/reset.css',
  '/graph-generator/css/main.css',
  '/graph-generator/css/ui/AccordionFields.css',
  '/graph-generator/css/ui/DotWriter.css',
  '/graph-generator/css/ui/DotRender.css',

  // --- Wygenerowane Skrypty, Mapy i Metadane ---
  '/graph-generator/gen/main.js',
  '/graph-generator/gen/main.js.map',
  '/graph-generator/gen/main.meta.json',
  '/graph-generator/gen/wasm-dot.js',
  '/graph-generator/gen/wasm-dot.js.map',
  '/graph-generator/gen/wasm-dot.meta.json',
  '/graph-generator/gen/lastBuild.txt',
  
  // --- Ikony ---
  '/graph-generator/icons/icon-192.png',
  '/graph-generator/icons/icon-512.png',

  // --- Zależności z CDN ---
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js'
];

self.addEventListener('install', (event) => {
  console.log(`[ServiceWorker] Instalacja nowej wersji: ${CACHE_NAME}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Zapisywanie plików w pamięci podręcznej...');
      return cache.addAll(FILES_TO_CACHE);
    }).catch(err => {
      console.error("[ServiceWorker] Błąd podczas `addAll` w trakcie instalacji:", err);
      // Wypisz listę plików, aby łatwiej zdebugować, który zawiódł
      console.error("Nie udało się zapisać jednego z plików z listy. Sprawdź, czy wszystkie ścieżki są poprawne.", FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[ServiceWorker] Aktywacja nowej wersji: ${CACHE_NAME}`);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Usuwanie starej pamięci podręcznej:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Dla żądań nawigacyjnych (otwieranie strony) zawsze próbuj najpierw z sieci.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Jeśli sieć zawiedzie, zwróć główny plik z cache.
        return caches.match('/graph-generator/index.html');
      })
    );
    return;
  }
  
  // Dla wszystkich innych zasobów (CSS, JS) użyj strategii "Cache First".
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
