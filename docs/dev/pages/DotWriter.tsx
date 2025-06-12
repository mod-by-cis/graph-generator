/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T16:50:12.009Z+02:00
 * @description Komponent edytora do pisania kodu w języku DOT.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { VNode } from "$tsx-preact";
import { useEffect, useRef } from "$tsx-preact/hooks";
import {
  dotContentSignal,
  updateDotContent,
} from "../core/state-dot-current.ts";
import * as monaco from "$editor-monaco";

// Flaga, aby upewnić się, że rejestracja języka i motywu wykona się tylko raz
let isMonacoInitialized = false;

function initializeMonaco() {
  if (isMonacoInitialized) return;

  // 1. Rejestracja niestandardowego języka "dot"
  monaco.languages.register({ id: "dot" });

  // 2. Definicja podświetlania składni dla języka "dot"
  monaco.languages.setMonarchTokensProvider("dot", {
    tokenizer: {
      root: [
        [/(graph|digraph|strict|node|edge|subgraph)/, "keyword"],
        [/[a-zA-Z_][\w_]*/, "identifier"],
        [/".*?"/, "string"],
        [/(\/\/.*$)|(#.*$)/, "comment"],
        [/\/\*/, { token: "comment", next: "@comment" }],
        [/[{}\[\];=,-]/, "delimiter"],
        [/->|--/, "operator"],
      ],
      comment: [
        [/[^\/*]+/, "comment"],
        [/\/\*/, "comment", "@push"],
        ["\\*/", "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],
    },
  });

  // 3. Definicja niestandardowego motywu kolorystycznego
  monaco.editor.defineTheme("myDotTheme", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
      { token: "string", foreground: "CE9178" },
      { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      { token: "identifier", foreground: "9CDCFE" },
      { token: "operator", foreground: "D4D4D4" },
      { token: "delimiter", foreground: "FFD700" },
    ],
    colors: {
      "editor.background": "#1E1E1E",
    },
  });

  isMonacoInitialized = true;
}

/**
 * Komponent edytora opartego na Monaco Editor do pisania w języku DOT.
 */
export default function PageDotWriter(): VNode {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const updateTimeout = useRef<number | null>(null);

  // Efekt, który tworzy i niszczy instancję edytora
  useEffect(() => {
    if (editorContainerRef.current) {
      // Upewnij się, że język jest zarejestrowany
      initializeMonaco();

      // Tworzymy edytor wewnątrz naszego diva
      const editor = monaco.editor.create(editorContainerRef.current, {
        value: dotContentSignal.peek(), // .peek() odczytuje wartość bez subskrypcji
        language: "dot",
        theme: "myDotTheme",
        automaticLayout: true, // Edytor automatycznie dopasuje się do rozmiaru kontenera
        wordWrap: "on",
        fontSize: 14,
        tabSize: 2,
        scrollBeyondLastLine: false,
      });

      editorRef.current = editor;

      // Słuchamy zmian w treści edytora
      const subscription = editor.onDidChangeModelContent(() => {
        const currentValue = editor.getValue();

        // Opóźniona aktualizacja globalnego stanu
        if (updateTimeout.current) clearTimeout(updateTimeout.current);
        updateTimeout.current = setTimeout(() => {
          updateDotContent(currentValue);
        }, 20000);
      });

      // Funkcja czyszcząca - kluczowa dla uniknięcia wycieków pamięci
      return () => {
        subscription.dispose(); // Usuń subskrypcję
        editor.dispose(); // Zniszcz instancję edytora
      };
    }
  }, []); // Pusta tablica `[]` gwarantuje, że edytor stworzy się tylko raz

  const forceUpdateSignal = () => {
    if (editorRef.current) {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      updateDotContent(editorRef.current.getValue());
    }
  };

  const toggleWordWrap = () => {
    if (editorRef.current) {
      const currentOptions = editorRef.current.getOptions();
      const currentWordWrap = currentOptions.get(
        monaco.editor.EditorOption.wordWrap,
      );
      editorRef.current.updateOptions({
        wordWrap: currentWordWrap === "on" ? "off" : "on",
      });
    }
  };

  return (
    <div class="dot-writer-container">
      <div class="dot-writer-toolbar">
        <button type="button" onClick={toggleWordWrap}>
          Przełącz zawijanie
        </button>
        <button type="button" onClick={forceUpdateSignal}>
          Aktualizuj Stan
        </button>
      </div>
      {/* Ten div będzie hostem dla Monaco Editor */}
      <div class="dot-writer-editor" ref={editorContainerRef}></div>
    </div>
  );
}
