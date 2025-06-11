import { signal } from "$tsx-preact-signal";

// Definicja typu dla bezpieczeństwa
type LayoutSettings = {
  "main-accordion-fields": "ROW" | "COL";
};

// 1. Tworzymy globalny, eksportowany sygnał.
// Domyślnie jego wartość to `null`, co oznacza "ładowanie".
export const layoutSettingsSignal = signal<LayoutSettings | null>(null);

// 2. Uruchamiamy wczytywanie danych od razu, gdy ten moduł zostanie zaimportowany.
// Nie jest to powiązane z żadnym komponentem, to jednorazowa akcja dla całej aplikacji.
fetch('/setting/layout.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }
    return response.json();
  })
  .then((data: LayoutSettings) => {
    // 3. Gdy dane przyjdą, po prostu aktualizujemy wartość sygnału.
    layoutSettingsSignal.value = data;
  })
  .catch(error => {
    console.error("Krytyczny błąd: Nie udało się wczytać pliku layout.json.", error);
    // Opcjonalnie: można tu ustawić sygnał na stan błędu, np.
    // layoutSettingsSignal.value = { error: true };
  });
