/**
 * @file ./code/pwa/sw.ts
 * @author https://github.com/j-Cis
 * @description Service Worker w TypeScript, wiernie odtwarzający logikę z sw.js.
 */
// @ts-nocheck
import { allIcons, dirWithBuild } from "../config/path.ts";

declare const self: ServiceWorkerGlobalScope;

// Zmiana tej nazwy wymusi aktualizację u wszystkich użytkowników
const CACHE_NAME = 'graph-generator-cache-v4.1'; // Nowa, czysta wersja
const publicPath = "/graph-generator";

// --- POPRAWIONA LISTA PLIKÓW ---
const CRITICAL_FILES = [
  `${publicPath}/`,
  `${publicPath}/index.html`,
  `${publicPath}/${dirWithBuild}/manifest.webmanifest`,
];

const GENERATED_FILES = [
  `${publicPath}/${dirWithBuild}/pwa-loader.js`,
  `${publicPath}/${dirWithBuild}/pwa-loader.js.lastBuild.txt`,
  `${publicPath}/${dirWithBuild}/sw.js`,
  `${publicPath}/${dirWithBuild}/sw.js.lastBuild.txt`,
  `${publicPath}/${dirWithBuild}/wasm-dot.mjs`,
  `${publicPath}/${dirWithBuild}/wasm-dot.mjs.lastBuild.txt`,
  `${publicPath}/${dirWithBuild}/main.mjs`,
  `${publicPath}/${dirWithBuild}/main.mjs.lastBuild.txt`,
  `${publicPath}/${dirWithBuild}/main.css`,
  `${publicPath}/${dirWithBuild}/main.css.lastBuild.txt`,
];

const ICON_FILES = Object.values(allIcons.png).map(icon => `${publicPath}/${icon.file}`);
const FAVICON = `${publicPath}/${allIcons.ico}`;

// --- PRZYWRÓCONA ZALEŻNOŚĆ Z CDN ---
const CDN_DEPENDENCIES = [
  'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js'
];

// Łączymy wszystkie listy
const FILES_TO_CACHE = [
  ...CRITICAL_FILES, 
  ...GENERATED_FILES, 
  ...ICON_FILES, 
  FAVICON,
  ...CDN_DEPENDENCIES
];

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
      console.error("Nie udało się zapisać jednego z plików. Sprawdź, czy ścieżki są poprawne:", FILES_TO_CACHE);
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
      // Pozwól nowemu SW przejąć kontrolę nad wszystkimi otwartymi kartami.
    }).then(() => self.clients.claim())
  );
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

*/

//  preferowana strategia "Network falling back to cache"
self.addEventListener('fetch', (event) => {
  // Użyjemy prostej i niezawodnej strategii: "Network falling back to cache".
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// 4. Komunikacja z aplikacją
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
