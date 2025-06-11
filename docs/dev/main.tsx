/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */

import { render } from "$tsx-preact";
import {
  AccordionField,
  AccordionFields,
  AccordionFieldsPilot,
} from "./ui/AccordionFields.tsx";
import { layoutSettingsSignal } from "./core/settings.ts";

function LayoutStart() {
  const ANCHOR_ID = "my-first-accordion";

  // Odczytujemy aktualną wartość sygnału.
  // Preact automatycznie przerysuje ten komponent, gdy wartość się zmieni.
  const settings = layoutSettingsSignal.value;

  // Renderowanie warunkowe pozostaje, ale jest oparte na sygnale.
  if (!settings) {
    return <div style={{ padding: "2rem" }}>Ładowanie ustawień układu...</div>;
  }

  return (
    <>
      <AccordionFieldsPilot forAnchor={ANCHOR_ID} />

      <AccordionFields
        anchorTag={ANCHOR_ID}
        divider={settings["main-accordion-fields"]}
      >
        <AccordionField title="Ustawienia Główne">
          <div>
            <h3>Zawartość panelu 1</h3>
            <p>Tutaj znajdują się opcje konfiguracji.</p>
            <label>
              Opcja A: <input type="checkbox" />
            </label>
          </div>
        </AccordionField>

        <AccordionField title="Profil Użytkownika">
          <div>
            <h3>Panel Profilu</h3>
            <p>Informacje o zalogowanym użytkowniku.</p>
          </div>
        </AccordionField>

        <AccordionField title="Pomoc i Wsparcie">
          <div>
            <h3>Sekcja Pomocy</h3>
            <p>FAQ i linki do dokumentacji.</p>
          </div>
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
