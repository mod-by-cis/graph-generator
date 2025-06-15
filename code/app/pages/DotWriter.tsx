/**
 * @file ./docs/dev/pages/DotWriter.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-14T18:02:38.027Z+02:00
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

// Deklaracje globalne
declare global {
  interface Window {
    monaco: any;
    showOpenFilePicker?: any;
    showSaveFilePicker?: any;
  }
}

// Flaga i funkcja inicjalizująca Monaco
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
  monaco.languages.registerDocumentFormattingEditProvider("dot", {
    provideDocumentFormattingEdits(model: any) {
      const text = model.getValue();
      const lines = text.split("\n");
      const formatted = lines.map((line: string) =>
        line.trim() ? "  " + line.trim() : ""
      ).join("\n");
      return [{
        range: model.getFullModelRange(),
        text: formatted,
      }];
    },
  });

  isMonacoInitialized = true;
}

export function PageDotWriter(): VNode {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any | null>(null);
  const updateTimeout = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const container = editorContainerRef.current;
      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };
      container.addEventListener('touchstart', preventZoom);
      container.addEventListener('touchmove', preventZoom);

      return () => {
        if (editorRef.current) {
          subscription.dispose();
          editorRef.current.dispose();
          editorRef.current = null;
        }
        container.removeEventListener('touchstart', preventZoom);
        container.removeEventListener('touchmove', preventZoom);
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
    editorRef.current?.getAction("editor.action.formatDocument").run();
  };

  const handleCopy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.getValue())
        .then(() => console.log("Skopiowano do schowka!"))
        .catch((err) => console.error("Błąd kopiowania:", err));
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.setValue("");
    }
  };

  const handlePaste = async () => {
    if (editorRef.current) {
      try {
        const text = await navigator.clipboard.readText();
        editorRef.current.executeEdits("", [{
          range: editorRef.current.getSelection(),
          text: text,
        }]);
      } catch (err) {
        console.error("Błąd wklejania:", err);
      }
    }
  };

  const handleSaveFile = async () => {
    if (!editorRef.current) return;
    const content = editorRef.current.getValue();
    if (window.showSaveFilePicker) {
      try {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: 'graph.dot',
          types: [{ description: 'Pliki DOT Graphviz', accept: { 'text/plain': ['.dot', '.gv'] } }],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Błąd zapisu pliku:", err);
      }
    } else {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'graph.dot';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenFile = async () => {
    if (window.showOpenFilePicker) {
      try {
        const [fileHandle] = await window.showOpenFilePicker({
          types: [{ description: 'Pliki DOT', accept: { 'text/plain': ['.dot', '.gv'] } }],
        });
        const file = await fileHandle.getFile();
        const content = await file.text();
        editorRef.current?.setValue(content);
      } catch (err) {
        if (err.name !== 'AbortError') console.error("Błąd otwierania pliku:", err);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        editorRef.current?.setValue(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div class="dot-writer-container">
      <div class="dot-writer-toolbar">
        <button type="button" onClick={forceUpdateSignal} title="Wymuś aktualizację stanu">✓</button>
        <div class="toolbar-separator"></div>
        <button type="button" onClick={handleCopy} title="Kopiuj całość">📋</button>
        <button type="button" onClick={handlePaste} title="Wklej">📥</button>
        <button type="button" onClick={handleFormat} title="Formatuj kod">🪄</button>
        <button type="button" onClick={toggleWordWrap} title="Przełącz zawijanie">↰</button>
        <div class="toolbar-separator"></div>
        <button type="button" class="clear-btn" onClick={handleClear} title="Wyczyść edytor">🗑️</button>
        
        {/* Przyciski do obsługi plików przeniesione na koniec */}
        <div class="toolbar-separator"></div>
        <button type="button" onClick={handleSaveFile} title="Zapisz plik">💾</button>
        <button type="button" onClick={handleOpenFile} title="Otwórz plik">📂</button>
      </div>
      <div class="dot-writer-editor" ref={editorContainerRef}></div>
      
      {/* Ukryty input, używany tylko jako fallback */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".dot,.gv,text/plain"
        onChange={handleFileChange}
      />
    </div>
  );
}
