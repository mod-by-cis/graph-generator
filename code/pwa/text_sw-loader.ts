/**
 * @file ./code/pwa/sw-loader.ts
 * @author https://github.com/j-Cis
 * @description Rejestruje Service Worker i zarządza aktualizacjami w TS.
 * Wersja ostateczna, zgodna z działającą logiką JS.
 */

export default function TEXT__PWA_SW_LOADER():string{
  return `
  /**
   * @file ./docs/pwa/pwa-loader.js
   * @author https://github.com/j-Cis
   * @description Rejestruje Service Worker i nasłuchuje na dostępne aktualizacje.
   */

  // Upewnij się, że przeglądarka wspiera Service Workery
  if ('serviceWorker' in navigator) {
    // Zaczekaj, aż strona się w pełni załaduje
    window.addEventListener('load', () => {
      // Zarejestruj plik sw.js. Kluczowy jest poprawny \`scope\`.
      navigator.serviceWorker.register('/graph-generator/pwa/sw.js', { scope: '/graph-generator/' })
        .then(registration => {
          console.log('[PWA Loader] Service Worker został pomyślnie zarejestrowany. Zakres:', registration.scope);
          
          // Nasłuchuj na zdarzenie 'updatefound', które oznacza, że pobierana jest nowa wersja SW.
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
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
          });
        })
        .catch(error => {
          console.error('[PWA Loader] Błąd podczas rejestracji Service Workera:', error);
        });
    });
  }       
  
  `;
  
}




