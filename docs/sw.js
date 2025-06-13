/**
 * @file ./docs/sw.js
 * @author https://github.com/j-Cis
 * @description Service Worker dla Progressive Web App (PWA).
 * Wersja z niezawodnym zapisywaniem do cache, która oddziela
 * pliki krytyczne od opcjonalnych, aby zwiększyć odporność na błędy.
 */

// Unikalna nazwa dla naszej pamięci podręcznej. Zmiana tej nazwy
// (np. na v2) spowoduje, że Service Worker pobierze wszystkie pliki na nowo.
const CACHE_NAME = 'graph-generator-cache-v1b';

// Lista plików, które są KLUCZOWE dla działania aplikacji.
// Jeśli któregoś z nich nie uda się zapisać, cała instalacja zawiedzie.
const CRITICAL_FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/main.css',
  './gen/main.js',
  './gen/wasm-dot.js'
];

// Lista plików, które są OPCJONALNE lub pochodzą z zewnętrznych źródeł.
// Jeśli nie uda się ich zapisać, aplikacja nadal powinna działać.
const OPTIONAL_FILES_TO_CACHE = [
  './css/ui/AccordionFields.css',
  './css/ui/DotWriter.css',
  './css/ui/DotRender.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js',
  './gen/graphviz.wasm' // Ładujemy naszą lokalną kopię
];


/**
 * Krok 1: Instalacja Service Workera.
 * Używamy nowej, bardziej niezawodnej logiki.
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Instalacja...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Zapisywanie kluczowych zasobów...');
      
      // Najpierw próbujemy zapisać pliki krytyczne.
      // Jeśli to się nie uda, cały proces instalacji zawiedzie.
      return cache.addAll(CRITICAL_FILES_TO_CACHE).then(() => {
        console.log('[ServiceWorker] Zapisywanie opcjonalnych zasobów...');
        
        // Następnie próbujemy zapisać pliki opcjonalne, każdy z osobna.
        // Nawet jeśli jeden z nich zawiedzie, nie przerwie to instalacji.
        const promises = OPTIONAL_FILES_TO_CACHE.map((url) => {
          // Używamy cache.add() dla każdego pliku i łapiemy błędy indywidualnie.
          return cache.add(url).catch(err => {
            console.warn(`[ServiceWorker] Nie udało się zapisać opcjonalnego pliku: ${url}`, err);
          });
        });
        
        return Promise.all(promises);
      });
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
        return response;
      }
      // Jeśli pliku nie ma w cache, próbujemy go normalnie pobrać z sieci.
      return fetch(event.request);
    })
  );
});
