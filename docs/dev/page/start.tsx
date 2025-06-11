/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { signal, useSignal } from "$tsx-preact-signal";
import { useEffect, useState } from "$tsx-preact/hooks";

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

// Definiujemy typ, aby TypeScript wiedział, jak wygląda nasz plik JSON.
// Zapewnia to bezpieczeństwo i autouzupełnianie.
type LayoutSettings = {
  "main-accordion-fields": "ROW" | "COL";
};

export function PageStart() {
  const ANCHOR_ID = "my-first-accordion";

  // 1. Tworzymy zmienną stanu do przechowywania wczytanych ustawień.
  // Początkowo jest `null`, co oznacza, że dane się jeszcze nie załadowały.
  const [settings, setSettings] = useState<LayoutSettings | null>(null);

  // 2. Używamy `useEffect`, aby wczytać dane tylko raz, gdy komponent się zamontuje.
  useEffect(() => {
    fetch("/setting/layout.json") // Ścieżka jest względna do roota serwera
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parsujemy odpowiedź jako JSON
      })
      .then((data: LayoutSettings) => {
        setSettings(data); // Zapisujemy wczytane dane w stanie
      })
      .catch((error) => {
        console.error("Błąd podczas wczytywania pliku layout.json:", error);
      });
  }, []); // Pusta tablica zależności `[]` gwarantuje, że efekt uruchomi się tylko raz.

  // 3. Renderowanie warunkowe. Dopóki dane się nie wczytają, pokazujemy komunikat.
  if (!settings) {
    return <div style={{ padding: "2rem" }}>Ładowanie ustawień układu...</div>;
  }

  // 4. Gdy dane są już dostępne, renderujemy właściwą aplikację,
  // przekazując wczytaną wartość do propa `divider`.

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
        <p>
          Układ paneli wczytany z pliku JSON:{" "}
          <strong>{settings["main-accordion-fields"]}</strong>
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
          <AccordionFields
            anchorTag={ANCHOR_ID}
            divider={settings["main-accordion-fields"]}
          >
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
