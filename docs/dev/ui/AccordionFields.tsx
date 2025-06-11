/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { ComponentChildren, VNode } from "$tsx-preact";
import { useEffect, useMemo } from "$tsx-preact/hooks";
import {
  getAccordionState,
  registerAccordion,
  unregisterAccordion,
} from "../core/state-accordion.ts";
import { AccordionField, AccordionFieldProps } from "./AccordionField.tsx";
import { CustomCSSProperties } from "../style/types.ts";

type ContainerProps = {
  anchorTag: string;
  divider?: "ROW" | "COL";
  children: ComponentChildren;
};

/**
 * Pomocnicza funkcja do parsowania proporcji (np. '2:1') na wartości flex.
 * @param ratio - String w formacie 'number:number'.
 * @returns Tablica z dwiema wartościami liczbowymi.
 */
function parseRatio(ratio: string): [number, number] {
  const parts = ratio.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  // Domyślna, bezpieczna wartość w razie błędu
  return [1, 1];
}

/**
 * Główny kontener, który renderuje widoczne panele.
 */
function AccordionFields(
  { anchorTag, divider = "ROW", children }: ContainerProps,
): VNode {
  // Pobieramy sygnał stanu dla tej instancji akordeonu.
  const state = getAccordionState(anchorTag);

  // Używamy `useMemo`, aby wyodrębnić tytuły i zawartość z dzieci
  // tylko raz, chyba że dzieci się zmienią.
  const fields = useMemo(() => {
    const extracted: { title: string; content: VNode }[] = [];
    const childrenArray = Array.isArray(children) ? children : [children];

    for (const child of childrenArray) {
      if (
        child && typeof child === "object" && "type" in child &&
        child.type === AccordionField
      ) {
        const props = child.props as AccordionFieldProps;
        extracted.push({ title: props.title, content: child });
      }
    }
    return extracted;
  }, [children]);

  // Efekt do rejestracji i wyrejestrowania w globalnym magazynie.
  useEffect(() => {
    const titles = fields.map((f) => f.title);
    if (titles.length > 0) {
      registerAccordion(anchorTag, titles);
    }

    // Funkcja czyszcząca - wywoływana, gdy komponent jest odmontowywany.
    return () => {
      unregisterAccordion(anchorTag);
    };
  }, [anchorTag, fields]); // Uruchom ponownie, jeśli zmieni się anchor lub lista pól.

  // Jeśli stan nie jest jeszcze dostępny, nie renderuj nic.
  if (!state) {
    return <div class="af-container af-loading">Inicjalizacja...</div>;
  }

  const renderContent = () => {
    // Tryb Dzielony (Split)
    if (
      state.value.mode === "split" && state.value.visiblePanels[0] &&
      state.value.visiblePanels[1]
    ) {
      const [title1, title2] = state.value.visiblePanels;
      const panel1 = fields.find((f) => f.title === title1);
      const panel2 = fields.find((f) => f.title === title2);

      const [flex1, flex2] = parseRatio(state.value.ratio);

      const style1: CustomCSSProperties = { flex: flex1 };
      const style2: CustomCSSProperties = { flex: flex2 };

      if (!panel1 || !panel2) {
        return <div>Błąd: Nie można znaleźć jednego z paneli.</div>;
      }

      return (
        <>
          <div class="af-panel" style={style1}>{panel1.content}</div>
          {/* Opcjonalnie: można dodać wizualny separator między panelami */}
          <div class="af-visual-divider"></div>
          <div class="af-panel" style={style2}>{panel2.content}</div>
        </>
      );
    }

    // Tryb Pojedynczy (Single) - domyślny
    const firstVisibleTitle = state.value.visiblePanels[0];
    const panelToShow = fields.find((f) => f.title === firstVisibleTitle);

    return (
      <div class="af-panel af-panel-single">
        {panelToShow
          ? panelToShow.content
          : <div>Wybierz panel do wyświetlenia...</div>}
      </div>
    );
  };

  return (
    <div class={`af-container af-${divider.toLowerCase()}`}>
      {renderContent()}
    </div>
  );
}

export { AccordionField, AccordionFields };
export { AccordionFieldsPilot } from "./AccordionFieldsPilot.tsx";
