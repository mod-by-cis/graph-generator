/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { getAccordionState } from "../core/state.ts";

type PilotProps = {
  forAnchor: string;
};

/**
 * Komponent "pilota", który kontroluje stan powiązanego akordeonu.
 */
export function AccordionFieldsPilot({ forAnchor }: PilotProps): VNode {
  // Pobieramy sygnał stanu dla akordeonu, którym mamy sterować.
  const state = getAccordionState(forAnchor);

  // Jeśli stan dla danego 'anchor' nie istnieje (jeszcze), nie renderujemy nic.
  if (!state) {
    console.warn(`[Pilot] No state found for anchor: ${forAnchor}`);
    return <></>;
  }

  // Funkcja do przełączania widoczności panelu kontrolnego.
  const handleToggleOpen = () => {
    // Modyfikujemy wartość sygnału. Wszystkie komponenty, które go
    // subskrybują (czyli nasz pilot i kontener), automatycznie się zaktualizują.
    state.value = { ...state.value, isOpen: !state.value.isOpen };
  };

  return (
    <div class="af-pilot-wrapper">
      {/* Główny przycisk-wyzwalacz */}
      <button
        class="af-pilot-trigger"
        onClick={handleToggleOpen}
        title="Otwórz kontroler paneli"
      >
        ☰
      </button>

      {/* Panel kontrolny - renderowany warunkowo, gdy stan.isOpen jest true */}
      {state.value.isOpen && (
        <div class="af-controls-panel">
          <div class="af-controls-header">
            <h3>Sterowanie ({forAnchor})</h3>
            <button onClick={handleToggleOpen} class="af-close-btn">×</button>
          </div>
          <p>Dostępne pola:</p>
          <ul>
            {/* Dynamicznie generujemy listę na podstawie danych z magazynu */}
            {state.value.fieldTitles.map((title) => (
              <li key={title}>{title}</li>
            ))}
          </ul>
          {/* Tu w przyszłości dodamy resztę logiki (split, ratio etc.) */}
        </div>
      )}
    </div>
  );
}
