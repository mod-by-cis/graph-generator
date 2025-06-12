/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T16:15:05.754Z+02:00
 * @description Komponent edytora do pisania kodu w języku DOT.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { useEffect, useMemo, useRef, useState } from "$tsx-preact/hooks";
import {
  dotContentSignal,
  updateDotContent,
} from "../core/state-dot-current.ts";

/**
 * Komponent edytora do pisania kodu w języku DOT.
 */
export default function PageDotWriter(): VNode {
  // Stan lokalny, aby uniknąć aktualizacji globalnego sygnału przy każdym naciśnięciu klawisza
  const [localText, setLocalText] = useState<string>(dotContentSignal.value);
  const [wordWrap, setWordWrap] = useState<boolean>(true); // Domyślnie włączone

  // Stan do przechowywania obliczonych wysokości dla każdej linii
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  const updateTimeout = useRef<number | null>(null);
  // Refy do elementów DOM w celu synchronizacji przewijania
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLPreElement>(null);

  // Efekt do opóźnionej aktualizacji globalnego stanu
  useEffect(() => {
    // Anuluj poprzedni timer, jeśli istnieje
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    // Ustaw nowy timer
    updateTimeout.current = setTimeout(() => {
      updateDotContent(localText);
    }, 20000); // 20 sekund

    // Funkcja czyszcząca, która anuluje timer, gdy komponent się odmontuje
    return () => {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, [localText]); // Uruchom ponownie ten efekt za każdym razem, gdy zmieni się lokalny tekst

  // Efekt, który mierzy wysokość linii w nakładce <pre>
  useEffect(() => {
    if (overlayRef.current) {
      // Dzielimy renderowany tekst na linie, aby zmierzyć każdą z osobna
      // Usuwamy ostatnią pustą linię dodaną przez renderTextWithWhitespace
      const renderedLines = overlayRef.current.innerHTML.split("\n").slice(
        0,
        -1,
      );
      const newHeights: number[] = [];

      // Tworzymy tymczasowy element do mierzenia
      const measureNode = document.createElement("div");
      measureNode.style.visibility = "hidden";
      measureNode.style.position = "absolute";
      // Musi mieć te same style, co nakładka, aby pomiar był dokładny
      measureNode.className = `editor-overlay ${wordWrap ? "wrap" : "no-wrap"}`;
      document.body.appendChild(measureNode);

      // Mierzymy wysokość każdej wyrenderowanej linii
      for (const line of renderedLines) {
        measureNode.innerHTML = line || "&nbsp;"; // Używamy &nbsp; dla pustych linii
        newHeights.push(measureNode.offsetHeight);
      }

      document.body.removeChild(measureNode);
      setLineHeights(newHeights);
    }
  }, [localText, wordWrap]); // Mierz ponownie, gdy zmieni się tekst lub opcja zawijania

  const handleTextChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setLocalText(target.value);
  };

  const forceUpdateSignal = () => {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    console.log("Force-updating signal now!");
    updateDotContent(localText);
  };

  // Obliczamy liczbę wierszy, aby dynamicznie generować numery
  const lineCount = useMemo(() => localText.split("\n").length, [localText]);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Synchronizacja przewijania ---
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current && overlayRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      // Synchronizuj pozycję pionową numerów wierszy
      lineNumbersRef.current.scrollTop = scrollTop;
      // Synchronizuj pozycję poziomą i pionową nakładki
      overlayRef.current.scrollTop = scrollTop;
      overlayRef.current.scrollLeft = scrollLeft;
    }
  };

  // Funkcja do wizualizacji białych znaków
  const renderTextWithWhitespace = (text: string) => {
    // Dodajemy pustą linię na końcu, aby zapobiec "ucięciu" ostatniej linii przy przewijaniu
    return (text + "\n")
      .replace(/ /g, "·") // Zastąp spacje kropkami
      .replace(/\n/g, "¬\n"); // Pokaż znak końca linii
  };

  return (
    <div class="dot-writer-container">
      <div class="dot-writer-toolbar">
        <button onClick={() => setWordWrap((prev) => !prev)}>
          Zawijanie: {wordWrap ? "Wł." : "Wył."}
        </button>
        <button onClick={forceUpdateSignal}>Aktualizuj Stan</button>
      </div>
      <div class="dot-writer-editor">
        {/* Kolumna z numerami wierszy - teraz używa dynamicznych wysokości */}
        <div ref={lineNumbersRef} class="line-numbers">
          {lineHeights.map((height, index) => (
            <div
              key={index}
              class="line-number"
              style={{ height: `${height}px` }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div class="editor-main-area">
          <textarea
            ref={textareaRef}
            class={`editor-input ${wordWrap ? "wrap" : "no-wrap"}`}
            value={localText}
            onInput={handleTextChange}
            onScroll={handleScroll} // Podpinamy handler przewijania
            spellcheck={false}
          />
          <pre
            ref={overlayRef}
            aria-hidden="true"
            class={`editor-overlay ${wordWrap ? "wrap" : "no-wrap"}`}
          >
            {renderTextWithWhitespace(localText)}
          </pre>
        </div>
      </div>
    </div>
  );
}
