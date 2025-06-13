/**
 * @file ./docs/sw.js
 * @author https://github.com/j-Cis
 * @description Service Worker dla Progressive Web App (PWA).
 * Wersja z poprawną listą plików do cache'owania.
 */

// Zmieniamy wersję, aby wymusić aktualizację po stronie klienta.
const CACHE_NAME = 'graph-generator-cache-v1c';

// Używamy pełnych, absolutnych ścieżek, zgodnych z manifestem i strukturą na GitHub Pages.
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

  // --- Wygenerowane Skrypty (Najważniejsza Poprawka) ---
  '/graph-generator/gen/main.js',
  '/graph-generator/gen/wasm-dot.js', // Poprawny plik zamiast surowego WASM

  // --- Ikony ---
  '/graph-generator/icons/icon-192.png',
  '/graph-generator/icons/icon-512.png',

  // --- Zależności z CDN ---
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js'
];

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalacja v4...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Zapisywanie plików w pamięci podręcznej...');
      // Używamy jednej operacji addAll. Jeśli któryś plik zwróci błąd 404,
      // zobaczymy to w konsoli i będziemy wiedzieć, którą ścieżkę poprawić.
      return cache.addAll(FILES_TO_CACHE);
    }).catch(err => {
      console.error("[ServiceWorker] Błąd podczas `addAll` w trakcie instalacji:", err);
      // Wypisz listę plików, aby łatwiej zdebugować, który zawiódł
      console.error("Nie udało się zapisać jednego z plików:", FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Aktywacja v4...');
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
        return caches.match('/graph-generator/');
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
