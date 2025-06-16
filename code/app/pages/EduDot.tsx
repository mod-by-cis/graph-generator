/**
 * @file ./code/app/pages/EduDot.tsx
 * @author https://github.com/j-Cis
 * @description Komponent strony edukacyjnej o języku DOT.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import {
  dotContentSignal,
  updateDotContent,
} from "../core/state-dot-current.ts";
import { getAccordionState } from "../core/state-accordion.ts";

// --- Komponenty Pomocnicze dla Czystości Kodu ---

/**
 * Komponent do wyświetlania bloku kodu z interaktywnym przyciskiem.
 * @param title - Tytuł przykładu.
 * @param code - Fragment kodu DOT do wyświetlenia i załadowania.
 */
const CodeExample = ({ title, code }: { title: string; code: string }) => {
  const handleShowExample = () => {
    // 1. Aktualizujemy globalny sygnał z kodem DOT
    updateDotContent(code);

    // 2. Próbujemy automatycznie przełączyć widok na panel renderujący
    const stateSignal = getAccordionState("graph-sections");
    if (stateSignal) {
      const currentState = stateSignal.peek();

      // Znajdujemy panel "Efekt..", który ma viewID=4
      const writerPanelTitle = currentState.fieldTitles[4];
      const renderPanelTitle = currentState.fieldTitles[5];

      if (writerPanelTitle && renderPanelTitle) {
        // Zmieniamy stan akordeonu, aby pokazać panel z renderem
        stateSignal.value = {
          ...currentState,
          mode: "split",
          arrow: "COL",
          ratio: "2:3",
          visiblePanels: [writerPanelTitle, renderPanelTitle],
        };
      } else {
        console.warn(
          "Nie można znaleźć panelu 'Efekt..'. Sprawdź `viewID` w main.tsx.",
        );
      }
    }
  };

  return (
    <div class="code-example">
      <div class="code-header">
        <span>{title}</span>
        <button
          onClick={handleShowExample}
          title="Wyświetl ten przykład w rendererze"
        >
          Pokaż efekt
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
};

/**
 * Komponent do renderowania pojedynczej sekcji dokumentacji.
 */
const DocSection = (
  { title, children }: { title: string; children: VNode | string },
) => (
  <section class="edu-section">
    <h2>{title}</h2>
    <div class="edu-content">
      {children}
    </div>
  </section>
);

// --- Główny Komponent Strony ---

// --- POPRAWKA: Używamy eksportu nazwanego, a nie domyślnego ---
export function PageEduDot(): VNode {
  return (
    <div class="edu-page-wrapper">
      <h1>Wprowadzenie do Języka DOT</h1>
      <p class="edu-intro">
        DOT to prosty język tekstowy służący do opisu grafów. Jego czytelna
        składnia pozwala na łatwe definiowanie węzłów, krawędzi i ich atrybutów,
        a silnik Graphviz automatycznie generuje z niego wizualizacje.
      </p>

      <DocSection title="1. Rodzaje Grafów">
        <p>
          Grafy mogą być skierowane (gdzie krawędzie mają kierunek, jak
          strzałki) lub nieskierowane (gdzie krawędzie to zwykłe połączenia).
        </p>
        <CodeExample
          title="Graf nieskierowany (graph)"
          code={`graph MyFirstGraph {\n  // Podwójny myślnik "--" tworzy połączenie\n  A -- B;\n  B -- C;\n  A -- C;\n}`}
        />
        <CodeExample
          title="Graf skierowany (digraph)"
          code={`digraph MyDirectedGraph {\n  // Strzałka "->" tworzy skierowaną krawędź\n  A -> B;\n  B -> C;\n  C -> A; // Tworzy cykl\n}`}
        />
      </DocSection>

      <DocSection title="2. Definiowanie Węzłów (Nodes)">
        <p>
          Węzły to podstawowe elementy grafu. Można im nadawać etykiety i
          zmieniać ich wygląd za pomocą atrybutów w nawiasach kwadratowych
          `[...]`.
        </p>
        <CodeExample
          title="Proste węzły i atrybuty"
          code={`digraph NodeAttributes {\n  A [label="Start", shape=box, style=filled, color=lightblue];\n  B [label="Krok Pośredni"];\n  C [label="Koniec", shape=ellipse, style=filled, fillcolor=lightcoral];\n\n  A -> B -> C;\n}`}
        />
      </DocSection>

      <DocSection title="3. Definiowanie Krawędzi (Edges)">
        <p>
          Krawędzie łączą węzły. Im również można nadawać atrybuty, takie jak
          etykiety, kolory czy style linii.
        </p>
        <CodeExample
          title="Krawędzie z atrybutami"
          code={`digraph EdgeAttributes {\n  A -> B [label="Przejście 1", color=blue];\n  B -> C [label="Decyzja", style=dashed, arrowhead=dot];\n  C -> A [label="Powrót", color=red, penwidth=2];\n}`}
        />
      </DocSection>

      <DocSection title="4. Atrybuty Globalne i Subgrafy">
        <p>
          Można ustawić domyślne atrybuty dla wszystkich węzłów lub krawędzi w
          grafie. Subgrafy pozwalają grupować węzły.
        </p>
        <CodeExample
          title="Atrybuty globalne i subgraf"
          code={`digraph GlobalAttributes {\n  node [shape=record, style=rounded];\n  edge [color=green];\n\n  subgraph cluster_01 {\n    label = "Grupa A";\n    color=blue;\n    nodeA1 -> nodeA2;\n  }\n  \n  subgraph cluster_02 {\n    label = "Grupa B";\n    nodeB1 -> nodeB2;\n  }\n\n  nodeA2 -> nodeB1 [label="Link"];\n}`}
        />
      </DocSection>

      <DocSection title="Przydatne Linki i Dalsza Nauka">
        <ul class="edu-links-list">
          <li>
            🔗{" "}
            <a
              href="https://graphviz.org/documentation/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Oficjalna Dokumentacja Graphviz
            </a>{" "}
            - Najlepsze i najbardziej kompletne źródło wiedzy.
          </li>
          <li>
            🔗{" "}
            <a
              href="https://graphviz.org/doc/info/attrs.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pełna Lista Atrybutów
            </a>{" "}
            - Wszystkie możliwe opcje do stylizacji węzłów, krawędzi i grafów.
          </li>
          <li>
            🔗{" "}
            <a
              href="https://graphviz.org/gallery/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Galeria Przykładów
            </a>{" "}
            - Ogromna galeria inspirujących grafów stworzonych za pomocą DOT.
          </li>
        </ul>
      </DocSection>
    </div>
  );
}
