/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { getAccordionState } from "../core/state.ts";

type PilotProps = {
  forAnchor: string;
};

// Definicja dostępnych proporcji dla trybu dzielonego
const RATIOS = ["1:1", "2:1", "1:2", "3:1", "1:3"];

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
    const nextIsOpen = !state.value.isOpen;
    state.value = {
      ...state.value,
      isOpen: nextIsOpen,
      // Resetuj stan wyboru do początku, gdy użytkownik zamyka panel
      splitStep: !nextIsOpen ? "idle" : state.value.splitStep,
    };
  };

  /**
   * Obsługuje kliknięcie na nazwę panelu w menu pilota.
   * Ustawia akordeon w tryb 'single' i pokazuje wybrany panel.
   * @param title Tytuł panelu do wyświetlenia.
   */
  const handleSelectPanel = (title: string) => {
    state.value = {
      ...state.value,
      mode: "single",
      splitStep: "idle",
      visiblePanels: [title, null], // Ustaw wybrany panel jako jedyny widoczny
      isOpen: false, // Opcjonalnie: zamknij menu po wyborze
    };
  };

  /**
   * Rozpoczyna proces wyboru widoku dzielonego.
   * @param title Tytuł pierwszego panelu, który został wybrany.
   */
  const handleStartSplit = (title: string) => {
    state.value = {
      ...state.value,
      mode: "split",
      splitStep: "selecting_second", // Przejdź do etapu wyboru drugiego panelu
      visiblePanels: [title, null], // Zapamiętaj pierwszy wybrany panel
    };
  };

  /**
   * Finalizuje wybór, ustawia proporcje i zamyka menu.
   * @param ratio Wybrany stosunek, np. '1:1'.
   */
  const handleSelectRatio = (ratio: string) => {
    console.log(
      "Wybrano widok dzielony:",
      state.value.visiblePanels,
      "z proporcją:",
      ratio,
    );
    state.value = {
      ...state.value,
      ratio: ratio,
      splitStep: "idle", // Zakończ i zresetuj proces wyboru
      isOpen: false, // Zamknij panel kontrolny
    };
  };

  /**
   * Obsługuje wybór drugiego panelu w trybie dzielonym.
   * @param title Tytuł drugiego wybranego panelu.
   */
  const handleSelectSecondPanel = (title: string) => {
    const firstPanel = state.value.visiblePanels[0];
    state.value = {
      ...state.value,
      splitStep: "selecting_ratio", // Przejdź do etapu wyboru proporcji
      visiblePanels: [firstPanel, title], // Zapisz oba wybrane panele
    };
  };

  // --- RENDEROWANIE ---

  // Pomocnicza funkcja renderująca, aby główny return był czystszy
  const renderControls = () => {
    // Etap 2: Wybór drugiego panelu
    // Jeśli jesteśmy w trakcie wyboru drugiego panelu...
    if (state.value.splitStep === "selecting_second") {
      const firstPanel = state.value.visiblePanels[0];
      const availablePanels = state.value.fieldTitles.filter((t) =>
        t !== firstPanel
      );

      return (
        <div>
          <p>
            Wybierz drugi panel do pary z: <strong>{firstPanel}</strong>
          </p>
          <div class="af-button-group">
            {availablePanels.map((title) => (
              <button
                key={title}
                class="af-select-btn"
                onClick={() => handleSelectSecondPanel(title)}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Etap 3: Wybór proporcji
    if (state.value.splitStep === "selecting_ratio") {
      const [panel1, panel2] = state.value.visiblePanels;
      return (
        <div>
          <p>
            Ustaw proporcje dla <strong>{panel1}</strong> i{" "}
            <strong>{panel2}</strong>:
          </p>
          <div class="af-button-grid">
            {RATIOS.map((ratio) => (
              <button
                key={ratio}
                class="af-select-btn"
                onClick={() => handleSelectRatio(ratio)}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Etap 1 (Domyślny): Wybór trybu
    // Domyślny widok wyboru
    return (
      <div>
        <p>Wybierz tryb wyświetlania:</p>
        <div class="af-button-grid">
          {state.value.fieldTitles.map((title) => (
            // Używamy fragmentu, aby zgrupować przyciski dla każdego tytułu
            <div key={title} class="af-title-group">
              <button
                class="af-select-btn"
                onClick={() => handleSelectPanel(title)}
              >
                {title}
              </button>
              <button
                class="af-select-split-btn"
                onClick={() => handleStartSplit(title)}
                title={`Wybierz "${title}" jako pierwszy panel`}
              >
                |..
              </button>
            </div>
          ))}
        </div>
      </div>
    );
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
            <button
              onClick={handleToggleOpen}
              class="af-close-btn"
              title="Zamknij"
            >
              ×
            </button>
          </div>
          {renderControls()}
        </div>
      )}
    </div>
  );
}
