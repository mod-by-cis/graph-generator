/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { ComponentChildren, VNode } from "$tsx-preact";
import { useEffect, useMemo } from "$tsx-preact/hooks";
import {
  getAccordionState,
  registerAccordion,
  unregisterAccordion,
} from "../core/state.ts";
import { AccordionField, AccordionFieldProps } from "./AccordionField.tsx";
// W przyszłości użyjemy WindowBlind do trybu split
// import { WindowBlind, WindowBlindBox1, WindowBlindBox2 } from "./WindowBlind.tsx";

type ContainerProps = {
  anchorTag: string;
  divider?: "ROW" | "COL";
  children: ComponentChildren;
};

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
    registerAccordion(anchorTag, titles);

    // Funkcja czyszcząca - wywoływana, gdy komponent jest odmontowywany.
    return () => {
      unregisterAccordion(anchorTag);
    };
  }, [anchorTag, fields]); // Uruchom ponownie, jeśli zmieni się anchor lub lista pól.

  // Jeśli stan nie jest jeszcze dostępny, nie renderuj nic.
  if (!state) {
    return <></>;
  }

  // Na razie renderujemy tylko pierwszy widoczny panel.
  const firstVisibleTitle = state.value.visiblePanels[0];
  const panelToShow = fields.find((f) => f.title === firstVisibleTitle);

  return (
    <div class={`af-container af-${divider.toLowerCase()}`}>
      {panelToShow ? panelToShow.content : <div>Wybierz panel...</div>}
    </div>
  );
}

export { AccordionField, AccordionFields };
export { AccordionFieldsPilot } from "./AccordionFieldsPilot.tsx";
