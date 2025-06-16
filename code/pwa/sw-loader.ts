/**
 * @file ./code/pwa/sw-loader.ts
 * @author https://github.com/j-Cis
 * @description Rejestruje Service Worker i zarządza aktualizacjami w TS.
 * Wersja ostateczna, zgodna z działającą logiką JS.
 */

// Upewniamy się, że przeglądarka wspiera Service Workery
if ('serviceWorker' in navigator) {
  // Czekamy, aż strona się w pełni załaduje
  window.addEventListener('load', () => {
    
    // Używamy POPRAWNEJ ścieżki do naszego wygenerowanego pliku sw.js
    navigator.serviceWorker.register('/graph-generator/pwa/sw.js', { scope: '/graph-generator/' })
      .then(registration => {
        console.log('[PWA Loader] Service Worker został pomyślnie zarejestrowany. Zakres:', registration.scope);
        
        // Nasłuchujemy na zdarzenie 'updatefound', które oznacza, że pobierana jest nowa wersja SW.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            console.log('[PWA Loader] Znaleziono nową wersję Service Workera. Stan:', newWorker.state);

            newWorker.addEventListener('statechange', () => {
              // Gdy nowy SW jest zainstalowany i gotowy do przejęcia kontroli...
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // ...wtedy wiemy, że aktualizacja jest dostępna.
                console.log('[PWA Loader] Aktualizacja gotowa do instalacji. Wysyłam zdarzenie "swUpdate".');
                // Wysyłamy niestandardowe zdarzenie, na które nasza aplikacja Preact będzie nasłuchiwać.
                const updateEvent = new CustomEvent('swUpdate', { detail: newWorker });
                window.dispatchEvent(updateEvent);
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('[PWA Loader] Błąd podczas rejestracji Service Workera:', error);
      });
  });
}
