import { signal } from "$tsx-preact-signal";

// Definicja typu dla bezpieczeństwa
type LayoutSettings = {
  "main-accordion-fields": "ROW" | "COL";
};

// 1. Tworzymy globalny, eksportowany sygnał.
// Domyślnie jego wartość to `null`, co oznacza "ładowanie".
export const layoutSettingsSignal = signal<LayoutSettings | null>(null);

// 2. Sprawdzamy, w jakim środowisku działa aplikacja, na podstawie nazwy hosta.
const hostname = window.location.hostname;
let settingsUrl: string;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // --- Środowisko deweloperskie ---
  // Na localhost wczytujemy plik serwowany lokalnie.
  settingsUrl = '/setting/layout.json';
} else if (hostname === 'mod-by-cis.github.io') {
  // --- Środowisko produkcyjne (GitHub Pages) ---
  // Na stronie produkcyjnej musimy odwołać się do "surowego" pliku w repozytorium GitHub.
  settingsUrl = 'https://raw.githubusercontent.com/mod-by-cis/graph-generator/main/docs/setting/layout.json';
} else {
  // Bezpieczny fallback na wypadek uruchomienia w innym, nieprzewidzianym środowisku.
  console.warn(`Nieznany hostname: "${hostname}". Używam domyślnej ścieżki /setting/layout.json`);
  settingsUrl = '/setting/layout.json';
}

// 3. Używamy ustalonego URL do wczytania danych.
console.log(`[INFO] Wczytuję ustawienia układu z: ${settingsUrl}`);

// 4. Uruchamiamy wczytywanie danych od razu, gdy ten moduł zostanie zaimportowany.
// Nie jest to powiązane z żadnym komponentem, to jednorazowa akcja dla całej aplikacji.
fetch(settingsUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  })
  .then((data: LayoutSettings) => {
    // Gdy dane przyjdą, aktualizujemy wartość sygnału.
    layoutSettingsSignal.value = data;
  })
  .catch(error => {
    console.error(`KRYTYCZNY BŁĄD: Nie udało się wczytać pliku layout.json z adresu ${settingsUrl}.`, error);
    // Opcjonalnie: można tu ustawić sygnał na stan błędu, np.
    // layoutSettingsSignal.value = { error: true };
  });
