/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T15:39:56.076Z+02:00
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
  const [wordWrap, setWordWrap] = useState<boolean>(false);
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
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
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
        <div ref={lineNumbersRef} class="line-numbers">
          {lineNumbers.map((n) => <div key={n}>{n}</div>)}
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
