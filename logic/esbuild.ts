


/**
 * Definiuje dostępne zadania.
 */
export enum EnumTask {
  NONE = "-",
  MAIN_CSS = "main.css",
  MAIN_MJS = "main.mjs",
  WASM_MJS = "wasm-dot.mjs",
  PWA_LOADER = "pwa-loader.js",
  PWA_SW = "sw.js",
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


import { fromFileUrl, join } from "$deno-path";
import { assert } from "$deno-assert";
import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";



/**
 * Zarządza procesem budowania z esbuild .
 */
export default class ClassEsbuildManager {
  static #instanceSingleton: ClassEsbuildManager | null = null;
  // --- Konfiguracja ścieżek i zadań ---
  readonly #pathRoot: string;
  readonly #pathDeno: string;
  readonly #pathDist: string;
  readonly #mapTaskConfig: ReadonlyMap<EnumTask, TypeTaskConfig>;
  #taskCurrent: EnumTask = EnumTask.NONE;


  private constructor() {
    this.#pathRoot = fromFileUrl(new URL("../", import.meta.url));
    this.#pathDeno = join(this.#pathRoot, "deno.jsonc");
    this.#pathDist = join(this.#pathRoot, "docs/gen");

    this.#mapTaskConfig = new Map<EnumTask, TypeTaskConfig>([
      [
        EnumTask.MAIN_MJS,
        {
          subject: "Główna aplikacja (TSX -> MJS)",
          entryPoints: ["code/app/main.tsx"],
          outputFilename: "main",
          outputExt: ".mjs",
          options: {
            usePreact: true,
            external: ["https://esm.sh/@hpcc-js/wasm@2.23.0"] //["$hpcc-graphviz"],
          },
        },
      ],
      [
        EnumTask.MAIN_CSS,
        {
          subject: "Główny arkusz stylów (CSS)",
          entryPoints: ["code/app/main.css"],
          outputFilename: "main",
          outputExt: ".css",
          options: {
            isCssOnly: true,
          },
        },
      ],
      [
        EnumTask.WASM_MJS,
        {
          subject: "Loader biblioteki Graphviz (TS -> MJS)",
          entryPoints: ["code/lib/wasm/loader-wasm-dot.ts"],
          outputFilename: "wasm-dot",
          outputExt: ".mjs",
        },
      ],
      [
        EnumTask.PWA_LOADER, {
          subject: "PWA Loader (TS -> JS)",
          entryPoints: ["code/pwa/loader.ts"],
          outputFilename: "pwa-loader",
          outputExt: ".js",
        },
      ],
      [
        EnumTask.PWA_SW, {
          subject: "Service Worker (TS -> JS)",
          entryPoints: ["code/pwa/sw.ts"],
          outputFilename: "sw",
          outputExt: ".js",
        },
      ],
    ]);
  }

  public static ES__INIT(): ClassEsbuildManager {
    if (this.#instanceSingleton === null) {
      this.#instanceSingleton = new ClassEsbuildManager();
    }
    return this.#instanceSingleton;
  }

  public ES__STOP(): void {
    console.log("⚙️ Zatrzymywanie serwisu esbuild...");
    esbuild.stop();
    console.log("✅ Serwis esbuild został zatrzymany.");
  }

  public get task(): EnumTask {
    return this.#taskCurrent;
  }

  public set task(mode: EnumTask) {
    this.#taskCurrent = mode;
  }

  public async runBuild(): Promise<void> {
    const configTask = this.#mapTaskConfig.get(this.#taskCurrent);

    if (!configTask) {
      if (this.#taskCurrent !== EnumTask.NONE) {
        console.error(`❌ Nie znaleziono konfiguracji dla zadania: ${this.#taskCurrent}`);
      }
      return;
    }

    try {
      await this.#executeBuild(configTask);
      this.task = EnumTask.NONE;
    } catch (err) {
      console.error(`\n❌ Krytyczny błąd podczas budowania '${configTask.subject}':`, err.message);
      Deno.exit(1);
    }
  }

  public printConfig(): void {
    console.log("--- Konfiguracja Managera Esbuild ---");
    console.log("  - Ścieżka główna:", this.#pathRoot);
    console.log("  - Ścieżka docelowa:", this.#pathDist);
    console.log("  - Aktualne zadanie:", this.#taskCurrent);
    console.log("-------------------------------------");
  }

  async #executeBuild(configTask: TypeTaskConfig): Promise<void> {
    // Sprawdź istnienie wszystkich plików wejściowych
    for (const entryPoint of configTask.entryPoints) {
      const pathEntryPointAbsolute = join(this.#pathRoot, entryPoint);
      await this.#assertFileExists(pathEntryPointAbsolute);
    }
    
    const pathOutputRelative = join("docs/gen", `${configTask.outputFilename}${configTask.outputExt}`);
    const pathOutputAbsolute = join(this.#pathRoot, pathOutputRelative);
    const optionsTask = configTask.options || {};

    console.log(`📦 Bundlowanie '${configTask.subject}'...`);
    console.time(`✅ Zakończono '${configTask.subject}' w`);

    const commonOptions: esbuild.BuildOptions = {
        entryPoints: configTask.entryPoints, // Przekaż tablicę
        outfile: pathOutputRelative,
        bundle: true,
        minify: true,
        metafile: true,
        logLevel: "info",
    };

    const specificOptions = this.#getEsbuildSpecificOptions(optionsTask);
    
    const esbuildCurrentSet = {
      ...commonOptions,
      ...specificOptions,
    };
    console.log("esbuildCurrentSet",esbuildCurrentSet);
    const result = await esbuild.build(esbuildCurrentSet);
    
    console.timeEnd(`✅ Zakończono '${configTask.subject}' w`);
    await this.#writeMetaFiles(pathOutputAbsolute, result.metafile);
  }

  async #writeMetaFiles(pathBuiltFile: string, metafile?: esbuild.Metafile): Promise<void> {
    if (metafile) {
      const pathMetafile = `${pathBuiltFile}.meta.json`;
      await Deno.writeTextFile(pathMetafile, JSON.stringify(metafile, null, 2));
      console.log(`  - Plik metafile zapisany: ${pathMetafile.replace(this.#pathRoot, ".")}`);
    }
    const taskEnum = this.#taskCurrent;
    await this.manageTimestampForTask(taskEnum, EnumTimestampMode.SET);
  }

  async manageTimestampForTask(taskEnum: EnumTask, mode: EnumTimestampMode): Promise<string | null> {
    const configTask = this.#mapTaskConfig.get(taskEnum);
    if (!configTask) {
        console.error(`❌ Nie można zarządzać datą: brak konfiguracji dla zadania ${taskEnum}`);
        return null;
    }
    const pathOutputRelative = join("docs/gen", `${configTask.outputFilename}${configTask.outputExt}`);
    const pathBuiltFile = join(this.#pathRoot, pathOutputRelative);
    const pathLastBuild = `${pathBuiltFile}.lastBuild.txt`;

    switch (mode) {
      case EnumTimestampMode.GET:
        try {
          const timestamp = await Deno.readTextFile(pathLastBuild);
          return timestamp.trim();
        } catch (err) {
          if (err instanceof Deno.errors.NotFound) return null;
          console.error(`❌ Błąd podczas odczytu pliku znacznika czasu "${pathLastBuild}":`, err.message);
          return null;
        }

      case EnumTimestampMode.SET: {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset();
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
        const offsetMinutes = Math.abs(timezoneOffset) % 60;
        const offsetSign = timezoneOffset <= 0 ? "+" : "-";
        const pad = (num: number) => String(num).padStart(2, '0');
        const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}${offsetSign}${pad(offsetHours)}:${pad(offsetMinutes)}`;

        await Deno.writeTextFile(pathLastBuild, timestamp);
        console.log(`  - Znacznik czasu zapisany: ${pathLastBuild.replace(this.#pathRoot, ".")}`);
        return null;
      }
    }
  }

  async #assertFileExists(path: string): Promise<void> {
    try {
      const stat = await Deno.stat(path);
      assert(stat.isFile, `Ścieżka nie jest plikiem: ${path}`);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        throw new Error(`Plik wejściowy nie istnieje: ${path}`);
      }
      throw new Error(`Błąd dostępu do pliku "${path}": ${err.message}`);
    }
  }

  #getEsbuildSpecificOptions(optionsTask: TypeTaskOptions): esbuild.BuildOptions {
    if (optionsTask.isCssOnly) {
        return {
            loader: { ".css": "css" },
        };
    }

    const jsOptions: esbuild.BuildOptions = {
        format: "esm",
        plugins: [...denoPlugins({ configPath: this.#pathDeno })],
        sourcemap: "linked",
        target: ["esnext"],
    };

    if (optionsTask.usePreact) {
        jsOptions.loader = { ".ts": "ts", ".tsx": "tsx" };
        jsOptions.jsx = "automatic";
        jsOptions.jsxImportSource = "preact";
    }

    if (optionsTask.external) {
        jsOptions.external = optionsTask.external;
    }

    return jsOptions;
  }
}
