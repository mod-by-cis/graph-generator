/**
 * Definiuje dostępne zadania.
 */
export enum EnumTask {
  NONE = "-",
  MAIN_CSS = "main.css",
  MAIN_MJS = "main.mjs",
  WASM_MJS = "wasm-dot.mjs",
  PWA_MANIFEST = "manifest.webmanifest",
  PWA_SW_LOADER = "pwa-loader.js",
  PWA_SW_VERSION = "sw.js",
}


/**
 * Definiuje tryb operacji na pliku znacznika czasu.
 */
export enum EnumTimestampMode {
  GET,
  SET,
}

/**
 * Definiuje opcjonalne modyfikatory.
 */
export interface TypeTaskOptions {
  isCssOnly?: boolean;
  usePreact?: boolean;
  external?: string[];
  define?: { APP_VERSION?: string },
}

/**
 * Definiuje konfiguracje dla pojedynczego zadania.
 */
export interface TypeTaskConfig {
  // Wymagane właściwości
  subject: string;
  entryPoints: string[]; 
  outputFilename: string;
  outputExt: ".mjs" | ".css" | ".js" | ".webmanifest";
  // Opcjonalna grupa modyfikatorów
  options?: TypeTaskOptions;
}

import { TimeSnap } from "../utils/TimeSnap.ts";
export const VERSION = TimeSnap.stampWRITE('-');
export const TASK_RESERVE_CONFIG: ReadonlyMap<EnumTask, TypeTaskConfig> = new Map<EnumTask, TypeTaskConfig>([
  [
    EnumTask.MAIN_MJS, {
      subject: "Główna aplikacja (TSX -> MJS)",
      entryPoints: ["code/app/main.tsx"],
      outputFilename: "main",
      outputExt: ".mjs",
      options: {
        define: { "APP_VERSION": JSON.stringify(VERSION) },
        usePreact: true,
        external: ["https://esm.sh/@hpcc-js/wasm@2.23.0"],
      },
    },
  ],
  [
    EnumTask.MAIN_CSS, {
      subject: "Główny arkusz stylów (CSS)",
      entryPoints: ["code/app/main.css"],
      outputFilename: "main",
      outputExt: ".css",
      options: { isCssOnly: true },
    },
  ],
  [
    EnumTask.WASM_MJS, {
      subject: "Loader biblioteki Graphviz (TS -> MJS)",
      entryPoints: ["code/builds/loader-wasm-dot.ts"],
      outputFilename: "wasm-dot",
      outputExt: ".mjs",
    },
  ],
]);
