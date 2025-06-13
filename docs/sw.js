/**
 * @file ./docs/sw.js
 * @author https://github.com/j-Cis
 * @description Service Worker dla Progressive Web App (PWA).
 * Odpowiada za działanie aplikacji w trybie offline poprzez
 * zapisywanie kluczowych zasobów w pamięci podręcznej przeglądarki.
 */

// Unikalna nazwa dla naszej pamięci podręcznej. Zmiana tej nazwy
// spowoduje, że Service Worker pobierze wszystkie pliki na nowo.
const CACHE_NAME = 'graph-generator-cache-v1';

// Lista wszystkich plików, które są niezbędne do działania aplikacji offline.
// To najważniejsza część konfiguracji.
const FILES_TO_CACHE = [
  // Pliki HTML i podstawowe zasoby
  '/',
  'index.html',
  'manifest.json',

  // Style CSS
  'css/reset.css',
  'css/main.css',
  'css/ui/AccordionFields.css',
  'css/ui/DotWriter.css',
  'css/ui/DotRender.css',

  // Ikony (jeśli istnieją w folderze /icons/)
  'icons/icon-192.png',
  'icons/icon-512.png',

  // Wygenerowane skrypty JavaScript
  'gen/main.js',
  'gen/wasm-dot.js',

  // Zdalne zależności, które musimy mieć offline
  // Monaco Editor
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js',
  // Graphviz (silnik WASM)
  'https://cdn.jsdelivr.net/npm/@hpcc-js/wasm@2.23.0/dist/graphviz.wasm'
];

/**
 * Krok 1: Instalacja Service Workera.
 * Ten event jest wywoływany tylko raz, przy pierwszej instalacji.
 * Otwieramy naszą pamięć podręczną i dodajemy do niej wszystkie kluczowe pliki.
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalacja...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Zapisywanie kluczowych zasobów w pamięci podręcznej.');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/**
 * Krok 2: Aktywacja Service Workera.
 * Ten event jest wywoływany po instalacji. To dobre miejsce,
 * aby usunąć stare, nieużywane wersje pamięci podręcznej.
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Aktywacja...');
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

/**
 * Krok 3: Przechwytywanie żądań sieciowych (Fetch).
 * To serce działania offline. Za każdym razem, gdy aplikacja próbuje
 * pobrać jakiś plik, ten event jest wywoływany.
 */
self.addEventListener('fetch', (event) => {
  // Stosujemy strategię "Cache First" (Najpierw pamięć podręczna).
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Jeśli żądany plik znajduje się w naszej pamięci podręcznej,
      // zwracamy go natychmiast, bez odwoływania się do sieci.
      if (response) {
        // console.log('[ServiceWorker] Znaleziono w cache:', event.request.url);
        return response;
      }
      // Jeśli pliku nie ma w cache, próbujemy go normalnie pobrać z sieci.
      // console.log('[ServiceWorker] Nie znaleziono w cache, pobieranie z sieci:', event.request.url);
      return fetch(event.request);
    })
  );
});
