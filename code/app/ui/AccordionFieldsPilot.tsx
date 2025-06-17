/**
 * @file ./docs/dev/ui/AccordionFieldsPilot.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T13:23:07.062Z+02:00
 * @description Komponentem sterownika do komponentów AccordionFields i AccordionField.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { getAccordionState } from "../core/state-accordion.ts";

type PilotProps = {
  forAnchor: string;
  showAnchor?: boolean;
};

// Definicja dostępnych proporcji dla trybu dzielonego
const RATIOS = [
  "1:1",
  "2:1",
  "1:2",
  "3:1",
  "1:3",
  "3:2",
  "2:3",
  "4:1",
  "1:4",
  "3:4",
  "4:3",
];

/**
 * Komponent "pilota", który kontroluje stan powiązanego akordeonu.
 */
export function AccordionFieldsPilot(
  { forAnchor, showAnchor = true }: PilotProps,
): VNode {
  // Pobieramy sygnał stanu dla akordeonu, którym mamy sterować.
  const state = getAccordionState(forAnchor);

  // Jeśli stan dla danego 'anchor' nie istnieje (jeszcze), nie renderujemy nic.
  if (!state) {
    // Ta wiadomość jest normalna przy pierwszym renderowaniu
    // console.warn(`[Pilot] No state found for anchor: ${forAnchor}`);
    // deno-lint-ignore jsx-no-useless-fragment
    return <></>;
  }

  // Główny przełącznik, który otwiera i zamyka cały interfejs pilota
  const handleTogglePilot = () => {
    const nextIsOpen = !state.value.isOpen;
    state.value = {
      ...state.value,
      isOpen: nextIsOpen,
      // Przy otwieraniu ZAWSZE pokazuj panel główny, resetując wybór
      activePanel: nextIsOpen ? "main" : state.value.activePanel,
      splitStep: !nextIsOpen ? "idle" : state.value.splitStep,
    };
  };

  // Zmienia kierunek podziału
  const handleToggleArrow = () => {
    state.value = {
      ...state.value,
      arrow: state.value.arrow === "ROW" ? "COL" : "ROW",
    };
  };

  // Ustawia, że wewnątrz panelu chcemy widzieć wybór proporcji
  const showRatioSelector = () => {
    state.value = { ...state.value, activePanel: "ratio" };
  };

  /**
   * Finalizuje wybór, ustawia proporcje i zamyka menu.
   * @param ratio Wybrany stosunek, np. '1:1'.
   */
  const handleSelectRatio = (ratio: string) => {
    state.value = {
      ...state.value,
      ratio: ratio,
      isOpen: false,
      splitStep: "idle",
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
      visiblePanels: [title, null],
      isOpen: false,
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
      splitStep: "selecting_second",
      visiblePanels: [title, null],
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

  // --- Funkcje renderujące poszczególne widoki panelu ---

  const renderPanelContent = () => {
    // Widok wyboru proporcji
    if (state.value.activePanel === "ratio") {
      const [panel1, panel2] = state.value.visiblePanels;
      return (
        <div>
          <p class="non-select">
            Zmień proporcje dla<br /> [ <strong>{panel1}</strong> ] i{"  "}[
            {" "}
            <strong>{panel2}</strong> ]:
          </p>
          <div class="af-button-grid-col2">
            {RATIOS.map((ratio) => (
              <button
                type="button"
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

    // Widok główny (wieloetapowy)
    if (state.value.splitStep === "selecting_second") {
      const firstPanel = state.value.visiblePanels[0];
      const availablePanels = state.value.fieldTitles.filter((t) =>
        t !== firstPanel
      );
      return (
        <div>
          <p class="non-select">
            Panel wybrany: [ <strong>{firstPanel}</strong> ].
          </p>
          <p class="non-select">
            Wybierz drugi panel do pary:
          </p>
          <div class="af-button-grid">
            {availablePanels.map((title) => (
              <button
                type="button"
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
    if (state.value.splitStep === "selecting_ratio") {
      const [panel1, panel2] = state.value.visiblePanels;
      return (
        <div>
          <p class="non-select">
            Ustaw proporcje dla wybranych paneli:<br />
            [ <strong>{panel1}</strong> ] i [ <strong>{panel2}</strong> ]:
          </p>
          <div class="af-button-grid-col2">
            {RATIOS.map((ratio) => (
              <button
                type="button"
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
    return (
      <div>
        <p class="non-select">Wybierz [ panel |..] do wyświetlenia:</p>
        <div class="af-button-grid">
          {state.value.fieldTitles.map((title) => (
            <div key={title} class="af-title-group">
              <button
                type="button"
                class="af-select-btn"
                onClick={() =>
                  handleSelectPanel(title)}
              >
                {title}
              </button>
              <button
                type="button"
                class="af-select-split-btn"
                onClick={() =>
                  handleStartSplit(title)}
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
        type="button"
        class="af-pilot-trigger"
        onClick={handleTogglePilot}
        title="Otwórz kontroler paneli"
      >
        ☰
      </button>

      {/* Przyciski funkcyjne widoczne tylko w trybie 'split' */}
      {state.value.isOpen && state.value.mode === "split" && (
        <>
          <button
            type="button"
            class="af-pilot-rotate"
            onClick={handleToggleArrow}
            title="Obróć"
          >
            {state.value.arrow === "COL" ? "↵" : "↴"}
          </button>
          <button
            type="button"
            class="af-pilot-rotate"
            onClick={showRatioSelector}
            style={state.value.arrow === "COL"
              ? { transform: "rotate(90deg)" }
              : {}}
            title="Zmień proporcje"
          >
            ◫
          </button>
        </>
      )}

      {/* Warunkowe renderowanie paneli na podstawie stanu `openPanel` */}
      {state.value.isOpen && (
        <div class="af-controls-panel">
          <div class="af-controls-header">
            <h3>Sterowanie wyświetlaniem.{showAnchor && ({ forAnchor })}</h3>
            <button
              type="button"
              onClick={handleTogglePilot}
              class="af-close-btn"
              title="Zamknij"
            >
              ×
            </button>
          </div>
          {renderPanelContent()}
        </div>
      )}
    </div>
  );
}
