/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T15:23:41.319Z+02:00
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

  // Efekt do opóźnionej aktualizacji globalnego stanu
  useEffect(() => {
    // Anuluj poprzedni timer, jeśli istnieje
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    // Ustaw nowy timer
    updateTimeout.current = setTimeout(() => {
      console.log("Auto-updating signal after 20 seconds...");
      updateDotContent(localText);
    }, 20000); // 20 sekund

    // Funkcja czyszcząca, która anuluje timer, gdy komponent się odmontuje
    return () => {
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
    };
  }, [localText]); // Uruchom ponownie ten efekt za każdym razem, gdy zmieni się lokalny tekst

  const handleTextChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setLocalText(target.value);
  };

  const forceUpdateSignal = () => {
    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }
    console.log("Force-updating signal now!");
    updateDotContent(localText);
  };

  // Obliczamy liczbę wierszy, aby dynamicznie generować numery
  const lineCount = useMemo(() => localText.split("\n").length, [localText]);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Funkcja do wizualizacji białych znaków
  const renderTextWithWhitespace = (text: string) => {
    return text
      .replace(/ /g, "·") // Zastąp spacje kropkami
      .replace(/\n/g, "¬\n"); // Pokaż znak końca linii
  };

  return (
    <div class="dot-writer-container">
      <div class="dot-writer-toolbar">
        <button onClick={() => setWordWrap((prev) => !prev)}>
          {wordWrap ? "Wyłącz zawijanie" : "Włącz zawijanie"}
        </button>
        <button onClick={forceUpdateSignal}>
          Aktualizuj Stan
        </button>
      </div>
      <div class="dot-writer-editor">
        <div class="line-numbers">
          {lineNumbers.map((n) => <div key={n}>{n}</div>)}
        </div>
        <textarea
          class={`editor-input ${wordWrap ? "wrap" : "no-wrap"}`}
          value={localText}
          onInput={handleTextChange}
          spellcheck={false}
        />
        {/* Nakładka do pokazywania białych znaków */}
        <pre class={`editor-overlay ${wordWrap ? "wrap" : "no-wrap"}`}>
          {renderTextWithWhitespace(localText)}
        </pre>
      </div>
    </div>
  );
}
