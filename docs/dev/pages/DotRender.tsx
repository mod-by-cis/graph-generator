/**
 * @file ./docs/dev/pages/DotRender.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T18:09:08.210Z+02:00
 * @description Komponentem sekcji tematycznej DotRender.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { useEffect, useRef, useState } from "$tsx-preact/hooks";
import { dotContentSignal } from "../core/state-dot-current.ts";
// Poprawny import funkcji z biblioteki
import { Graphviz } from "$hpcc-graphviz";

/**
 * Komponent odpowiedzialny za renderowanie kodu DOT do obrazka SVG
 * przy użyciu nowoczesnego silnika @hpcc-js/wasm (Graphviz).
 */
export default function PageDotRender(): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(
    "Inicjalizacja silnika Graphviz...",
  );

  useEffect(() => {
    // Ta funkcja będzie teraz wywoływana za każdym razem, gdy sygnał się zmieni
    const renderGraph = async (dotCode: string) => {
      if (!containerRef.current) return;

      try {
        setStatus("Renderowanie grafu...");
        setError(null);

        // Najpierw musimy asynchronicznie załadować instancję silnika WASM
        const graphviz = await Graphviz.load();
        // Funkcja `graphviz.layout` jest teraz główną metodą
        const svgString = await graphviz.layout(dotCode, "svg", "dot");

        if (containerRef.current) {
          containerRef.current.innerHTML = svgString;
        }

        setStatus(""); // Zakończono, wyczyść status
      } catch (e) {
        console.error("Błąd renderowania Graphviz:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(`Błąd renderowania: ${errorMessage}`);
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
        setStatus("");
      }
    };

    // Nasłuchuj na zmiany i uruchamiaj renderowanie
    const unsubscribe = dotContentSignal.subscribe(renderGraph);

    // Wyrenderuj graf po raz pierwszy
    renderGraph(dotContentSignal.peek());

    return () => unsubscribe();
  }, []); // Ten efekt uruchamia się tylko raz, aby podpiąć subskrypcję

  return (
    <div class="dot-render-wrapper">
      {status && <div class="render-status">{status}</div>}
      {error && <div class="render-error">{error}</div>}

      <div
        ref={containerRef}
        class="render-container"
        style={{ display: status || error ? "none" : "block" }}
      />
    </div>
  );
}
