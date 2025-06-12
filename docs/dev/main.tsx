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

function LayoutStart() {
  const ANCHOR_ID = "graph-sections";

  return (
    <>
      <AccordionFieldsPilot forAnchor={ANCHOR_ID} />

      <AccordionFields
        anchorTag={ANCHOR_ID}
      >
        <AccordionField title="Grafy">
          <PageEduGraphs />
        </AccordionField>
        <AccordionField title="Dot">
          <PageEduDot />
        </AccordionField>

        <AccordionField title="Wstaw..">
          <PageDotInsert />
        </AccordionField>

        <AccordionField title="Pisz..">
          <PageDotWriter />
        </AccordionField>

        <AccordionField title="Efekt..">
          <PageDotRender />
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
