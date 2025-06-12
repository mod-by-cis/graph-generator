/**
 * @file ./docs/dev/main.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T13:15:20.370Z+02:00
 * @description Główny plik.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */

import { render } from "$tsx-preact";
import {
  AccordionField,
  AccordionFields,
  AccordionFieldsPilot,
} from "./ui/AccordionFields.tsx";
import PageEduGraphs from "./pages/EduGraphs.tsx";
import PageEduDot from "./pages/EduDot.tsx";
import PageDotWriter from "./pages/DotWriter.tsx";
import PageDotRender from "./pages/DotRender.tsx";
import PageDotInsert from "./pages/DotInsert.tsx";
import PageAboutThis from "./pages/AboutThis.tsx";

function LayoutStart() {
  const ANCHOR_ID = "graph-sections";

  return (
    <>
      <AccordionFieldsPilot
        forAnchor={ANCHOR_ID}
        showAnchor={false}
      />

      <AccordionFields
        anchorTag={ANCHOR_ID}
        firstViewID={[3, 4]}
      >
        <AccordionField viewID={0} title="o grafach..">
          <PageEduGraphs />
        </AccordionField>
        <AccordionField viewID={1} title="o dot..">
          <PageEduDot />
        </AccordionField>

        <AccordionField viewID={2} title="Wstaw..">
          <PageDotInsert />
        </AccordionField>

        <AccordionField viewID={3} title="Pisz..">
          <PageDotWriter />
        </AccordionField>

        <AccordionField viewID={4} title="Efekt..">
          <PageDotRender />
        </AccordionField>

        <AccordionField viewID={5} title="o tym..">
          <PageAboutThis />
        </AccordionField>
      </AccordionFields>
    </>
  );
}

// Bezpieczny montaż aplikacji
const rootElement = document.getElementById("root");

if (rootElement) {
  render(<LayoutStart />, rootElement);
} else {
  console.error(
    'Nie znaleziono elementu startowego #root. Upewnij się, że w pliku HTML istnieje element <div id="root"></div>.',
  );
}
