
  /**
   * @file ./docs/pwa/sw.js
   * @author https://github.com/j-Cis
   * @description Service Worker dla Progressive Web App (PWA).
   */
  
  // Nowa, unikalna nazwa, aby wymusić aktualizację na wszystkich urządzeniach.
  const CACHE_NAME = 'graph-gen-by-cis--cache-version-2025-06-16-1-20-11-22-958';
  
  // Pełna i poprawna lista plików do zapisania w pamięci podręcznej.
  // Wszystkie ścieżki są absolutne, aby poprawnie działały na GitHub Pages.
  const FILES_TO_CACHE = [
  
    // --- Pliki krytyczne ---
    '/graph-generator/',
    '/graph-generator/index.html',
    '/graph-generator/pwa/manifest.webmanifest',
  
    
    // --- Wygenerowane Skrypty i STyle---
    '/graph-generator/gen/main.mjs',
    '/graph-generator/gen/main.css',
    '/graph-generator/gen/wasm-dot.mjs',
  
    '/graph-generator/pwa/pwa-loader.js',
    '/graph-generator/pwa/sw.js',
  
    // --- Ikony ---
    '/graph-generator/ico/favicon.ico',
    '/graph-generator/ico/icon-048.png',
    '/graph-generator/ico/icon-128.png',
    '/graph-generator/ico/icon-144.png',
    '/graph-generator/ico/icon-152.png',
    '/graph-generator/ico/icon-180.png',
    '/graph-generator/ico/icon-384.png',
    '/graph-generator/ico/icon-512.png', 

    // --- ZNACZNIKI WERSJI ----
    '/graph-generator/pwa/manifest.webmanifest.lastBuild.txt',
    '/graph-generator/pwa/sw.js.lastBuild.txt',
    '/graph-generator/pwa/pwa-loader.js.lastBuild.txt',
    '/graph-generator/gen/wasm-dot.mjs.lastBuild.txt',
    '/graph-generator/gen/main.mjs.lastBuild.txt',
    '/graph-generator/gen/main.css.lastBuild.txt',
  
    // --- Zależności z CDN ---
    'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js'
  ]
  
  // 1. Instalacja Service Workera
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
    // Zmuś nowego Service Workera do natychmiastowej aktywacji po instalacji.
    self.skipWaiting();
  });
  
  // 2. Aktywacja Service Workera
  self.addEventListener('activate', (event) => {
    console.log(`[ServiceWorker] Aktywacja nowej wersji: ${CACHE_NAME}`);
    // Usuń wszystkie stare, nieużywane już wersje cache.
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
    // Pozwól nowemu SW przejąć kontrolę nad wszystkimi otwartymi kartami.
    return self.clients.claim();
  });
  
  // 3. Przechwytywanie zapytań sieciowych (Fetch)
  /*
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
  */
  self.addEventListener('fetch', (event) => {
    // Użyjemy prostej i niezawodnej strategii: "Network falling back to cache".
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Jeśli odpowiedź z sieci jest poprawna, zapiszmy ją w cache na przyszłość.
          if (response && response.status === 200 && event.request.method === 'GET') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Jeśli sieć zawiedzie (jesteś offline), spróbuj znaleźć odpowiedź w cache.
          return caches.match(event.request);
        })
    );
  });
  
  // 4. Komunikacja z aplikacją
  self.addEventListener('message', (event) => {
    // Nasłuchuj na wiadomość od przycisku "Zaktualizuj PWA"
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  
  