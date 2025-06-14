/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-14T15:02:38.027Z+02:00
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

  // Rejestracja dostawcy formatowania dla języka DOT
  monaco.languages.registerDocumentFormattingEditProvider('dot', {
    provideDocumentFormattingEdits(model: any) {
      // Prosta logika formatowania: wcięcie każdej linii
      const text = model.getValue();
      const lines = text.split('\n');
      const formatted = lines.map((line: string) => line.trim() ? '  ' + line.trim() : '').join('\n');
      
      return [{
        range: model.getFullModelRange(),
        text: formatted,
      }];
    }
  });

  isMonacoInitialized = true;
}

export default function PageDotWriter(): VNode {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any | null>(null);
  const updateTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (editorContainerRef.current && window.monaco) {
      const monaco = window.monaco;
      initializeMonaco(monaco);

      const editor = monaco.editor.create(editorContainerRef.current, {
        value: dotContentSignal.peek(),
        language: "dot",
        theme: "myDotTheme",
        automaticLayout: true,
        wordWrap: "on",
        mouseWheelZoom: false,
      });
      editorRef.current = editor;

      const subscription = editor.onDidChangeModelContent(() => {
        if (updateTimeout.current) clearTimeout(updateTimeout.current);
        updateTimeout.current = setTimeout(() => {
          updateDotContent(editor.getValue());
        }, 20000);
      });

      return () => {
        if (editorRef.current) {
          subscription.dispose();
          editorRef.current.dispose();
          editorRef.current = null;
        }
      };
    }
  }, []);

  const forceUpdateSignal = () => {
    if (editorRef.current) {
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
      updateDotContent(editorRef.current.getValue());
    }
  };

  const toggleWordWrap = () => {
    if (editorRef.current && window.monaco) {
      const currentWordWrap = editorRef.current.getOption(
        window.monaco.editor.EditorOption.wordWrap,
      );
      editorRef.current.updateOptions({
        wordWrap: currentWordWrap === "on" ? "off" : "on",
      });
    }
  };
  
  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument').run();
  };

  const handleCopy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.getValue())
        .then(() => console.log("Skopiowano do schowka!"))
        .catch(err => console.error("Błąd kopiowania:", err));
    }
  };
  
  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
  };
  
  const handlePaste = async () => {
    if (editorRef.current) {
      try {
        const text = await navigator.clipboard.readText();
        editorRef.current.executeEdits('', [{
          range: editorRef.current.getSelection(),
          text: text
        }]);
      } catch (err) {
        console.error("Błąd wklejania:", err);
      }
    }
  };

  return (
    <div class="dot-writer-container">
      <div class="dot-writer-toolbar">
        {/* --- ZAKTUALIZOWANE PRZYCISKI Z IKONAMI --- */}
        <button type="button" onClick={toggleWordWrap} title="Przełącz zawijanie">↰</button>
        <button type="button" onClick={forceUpdateSignal} title="Wymuś aktualizację stanu">✓</button>
        <div class="toolbar-separator"></div>
        <button type="button" onClick={handleFormat} title="Formatuj kod">🪄</button>
        <button type="button" onClick={handleCopy} title="Kopiuj całość">📋</button>
        <button type="button" onClick={handlePaste} title="Wklej">📥</button>
        <div class="toolbar-separator"></div>
        <button type="button" class="clear-btn" onClick={handleClear} title="Wyczyść edytor">🗑️</button>
      </div>
      <div class="dot-writer-editor" ref={editorContainerRef}></div>
    </div>
  );
}
