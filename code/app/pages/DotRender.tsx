/**
 * @file ./docs/dev/pages/DotRender.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T21:46:03.495Z+02:00
 * @description Komponentem sekcji tematycznej DotRender.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { useEffect, useRef, useState } from "$tsx-preact/hooks";
import { dotContentSignal } from "../core/state-dot-current.ts";
// Poprawny import funkcji z biblioteki
//import { Graphviz } from "$hpcc-graphviz";
// Deklarujemy TypeScriptowi, że w globalnym zasięgu `window`
// może istnieć obiekt `Graphviz`. To usuwa błędy typów.
declare global {
  interface Window {
    Graphviz: any;
  }
}

/**
 * Komponent odpowiedzialny za renderowanie kodu DOT do obrazka SVG
 * przy użyciu nowoczesnego silnika @hpcc-js/wasm (Graphviz).
 */
export function PageDotRender(): VNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgGroupRef = useRef<SVGGElement | null>(null); // Ref do grupy <g> wewnątrz SVG
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>(
    "Inicjalizacja silnika Graphviz...",
  );

  // --- NOWY STAN DLA NAWIGACJI ---
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

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
          const svgElement = containerRef.current.querySelector("svg");

          if (svgElement) {
            // 1. Usuwamy sztywne wymiary w punktach (pt).
            svgElement.removeAttribute("width");
            svgElement.removeAttribute("height");

            // 2. Ustawiamy nowe atrybuty, aby SVG wypełniało 100% rodzica.
            svgElement.setAttribute("width", "100%");
            svgElement.setAttribute("height", "100%");

            // 3. Ustawiamy, jak SVG ma zachować proporcje.
            // "xMidYMid meet" skaluje obrazek, aby był w pełni widoczny,
            // zachowując proporcje i centrując go w dostępnej przestrzeni.
            svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
            //svgElement.setAttribute("preserveAspectRatio", "none");

            // Znajdujemy główną grupę <g> i zapisujemy ją do refa
            svgGroupRef.current = svgElement.querySelector("g");
          }
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

  // --- EFEKT DO AKTUALIZACJI TRANSFORMACJI SVG ---
  useEffect(() => {
    if (svgGroupRef.current) {
      svgGroupRef.current.setAttribute(
        "transform",
        `translate(${pan.x} ${pan.y}) scale(${zoom})`,
      );
    }
  }, [zoom, pan]);

  // --- HANDLERY DLA PRZYCISKÓW ---
  const handleZoom = (factor: number) => {
    setZoom((prevZoom) => Math.max(0.1, prevZoom * factor));
  };

  const handlePan = (dx: number, dy: number) => {
    const PAN_STEP = 10; // Krok przesuwania w pikselach
    setPan((prevPan) => ({
      x: prevPan.x + dx * PAN_STEP,
      y: prevPan.y + dy * PAN_STEP,
    }));
  };

  return (
    <div class="dot-render-wrapper">
      {status && <div class="render-status">{status}</div>}
      {error && <div class="render-error">{error}</div>}

      {/* --- NOWY KOD: PANEL KONTROLNY --- */}
      <div class="render-controls">
        <button
          class="render-controls_ZP"
          type="button"
          title="Powiększ"
          onClick={() => handleZoom(1.25)}
        >
          +
        </button>
        <button
          class="render-controls_ZM"
          type="button"
          title="Pomniejsz"
          onClick={() => handleZoom(1 / 1.25)}
        >
          -
        </button>
        <button
          class="render-controls_TL"
          type="button"
          title="Góra-Lewo"
          onClick={() => handlePan(-1, -1)}
        >
          {/**/}
          ⇖
        </button>
        <button
          class="render-controls_TT"
          type="button"
          title="Góra"
          onClick={() => handlePan(0, -1)}
        >
          {/**/}
          ⇑
        </button>
        <button
          class="render-controls_TR"
          type="button"
          title="Góra-Prawo"
          onClick={() => handlePan(1, -1)}
        >
          {/**/}
          ⇗
        </button>
        <button
          class="render-controls_LL"
          type="button"
          title="Lewo"
          onClick={() => handlePan(-1, 0)}
        >
          {/**/}
          ⇐
        </button>
        <button
          class="render-controls_RR"
          type="button"
          title="Prawo"
          onClick={() => handlePan(1, 0)}
        >
          {/**/}
          ⇒
        </button>
        <button
          class="render-controls_BL"
          type="button"
          title="Dół-Lewo"
          onClick={() => handlePan(-1, 1)}
        >
          {/**/}
          ⇙
        </button>
        <button
          class="render-controls_BB"
          type="button"
          title="Dół"
          onClick={() => handlePan(0, 1)}
        >
          {/**/}
          ⇓
        </button>
        <button
          class="render-controls_BR"
          type="button"
          title="Dół-Prawo"
          onClick={() => handlePan(1, 1)}
        >
          {/**/}
          ⇘
        </button>
      </div>

      <div
        ref={containerRef}
        class="render-container"
        style={{ display: status || error ? "none" : "block" }}
      />
    </div>
  );
}
