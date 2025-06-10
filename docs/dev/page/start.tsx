/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { signal, useSignal } from "$tsx-preact-signal";

import {
  WindowBlind,
  WindowBlindBox1,
  WindowBlindBox2,
} from "../ui/WindowBlind.tsx";

import {
  AccordionField,
  AccordionFields,
  AccordionFieldsPilot,
} from "../ui/AccordionFields.tsx";

export function PageStart() {
  const ANCHOR_ID = "my-first-accordion";

  return (
    <main>
      {
        /* 2. Umieszczamy "Pilota" w dowolnym miejscu.
            Kluczowy jest prop `forAnchor`, który łączy go z kontenerem.
      */
      }
      <AccordionFieldsPilot forAnchor={ANCHOR_ID} />

      <div style={{ padding: "2rem", height: "100%", boxSizing: "border-box" }}>
        <h1>Panel demonstracyjny AccordionFields</h1>
        <p>
          Poniżej znajduje się kontener paneli. Kontroler (przycisk ☰) powinien
          być widoczny w rogu ekranu.
        </p>

        <div
          style={{
            border: "2px solid #007bff",
            height: "400px",
            marginTop: "1rem",
          }}
        >
          {
            /* 3. Umieszczamy kontener paneli.
                Prop `anchorTag` musi pasować do `forAnchor` z pilota.
          */
          }
          <AccordionFields anchorTag={ANCHOR_ID} divider="ROW">
            {
              /* 4. Definiujemy poszczególne panele jako dzieci.
                  Każdy musi mieć unikalny `title`.
            */
            }
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
        </div>
      </div>
    </main>
  );
}

/*
<WindowBlind way="ROW" divis="30px">
        <WindowBlindBox1>
          A
        </WindowBlindBox1>
        <WindowBlindBox2>
          B
        </WindowBlindBox2>
      </WindowBlind>
      */
