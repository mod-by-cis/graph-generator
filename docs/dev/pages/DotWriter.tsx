/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T17:07:38.027Z+02:00
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

// Deklarujemy TypeScriptowi, że w globalnym zasięgu `window`
// może istnieć obiekt `monaco`. To usuwa błędy typów.
declare global {
  interface Window {
    monaco: any;
  }
}

// Flaga, aby upewnić się, że konfiguracja wykona się tylko raz
let isMonacoInitialized = false;
function initializeMonaco(monaco: any) {
  if (isMonacoInitialized) return;

  monaco.languages.register({ id: "dot" });
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
    colors: { "editor.background": "#1E1E1E" },
  });
  isMonacoInitialized = true;
}

export default function PageDotWriter(): VNode {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any | null>(null);
  const updateTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Sprawdzamy, czy `monaco` zostało już wczytane przez skrypt w HTML
    if (editorContainerRef.current && window.monaco) {
      const monaco = window.monaco;
      initializeMonaco(monaco);

      const editor = monaco.editor.create(editorContainerRef.current, {
        value: dotContentSignal.peek(),
        language: "dot",
        theme: "myDotTheme",
        automaticLayout: true,
        wordWrap: "on",
      });
      editorRef.current = editor;

      const subscription = editor.onDidChangeModelContent(() => {
        if (updateTimeout.current) clearTimeout(updateTimeout.current);
        updateTimeout.current = setTimeout(() => {
          updateDotContent(editor.getValue());
        }, 20000);
      });

      return () => {
        subscription.dispose();
        editor.dispose();
      };
    }
  }, []); // Uruchom tylko raz, po zamontowaniu

  const forceUpdateSignal = () => {
    if (editorRef.current) {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      updateDotContent(editorRef.current.getValue());
    }
  };

  const toggleWordWrap = () => {
    if (editorRef.current) {
      const currentWordWrap = editorRef.current.getOption(
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
        <button onClick={toggleWordWrap}>Przełącz zawijanie</button>
        <button onClick={forceUpdateSignal}>Aktualizuj Stan</button>
      </div>
      <div class="dot-writer-editor" ref={editorContainerRef}></div>
    </div>
  );
}
