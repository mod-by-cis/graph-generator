


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

import TEXT__PWA_SW from "../pwa/text_sw.ts";
import TEXT__PWA_SW_LOADER from "../pwa/text_sw-loader.ts";
import OBJECT_PWA_MANIFEST from "../pwa/manifest.ts"
import { TimeSnap } from "../utils/TimeSnap.ts";
import logBox,{type logBoxColorOptions, type logBoxStyleOptions} from "../utils/logBox.ts";

const sH1:logBoxColorOptions = {color:0xC0BD94, bgColor:0x5D5730,boxColor:0x403C21};
const sH2:logBoxColorOptions = {color:0x94C0C0, bgColor:0x30535D,boxColor:0x213940};
const sH3:logBoxColorOptions = {color:  0xAC94C0, bgColor:0x53305D,boxColor:0x352140};
const sH4:logBoxColorOptions = {color:  0xC09494, bgColor:0x5D3030,boxColor:0x402121};
const sT1:logBoxStyleOptions = {bold:true};

/**
 * Zarządza procesem budowania z esbuild .
 */
export default class ClassEsbuildManager {
  static #instanceSingleton: ClassEsbuildManager | null = null;
  // --- Konfiguracja ścieżek i zadań ---
  readonly #pathRoot: string;
  readonly #pathDeno: string;
  readonly #pathOutputAPP: string;
  readonly #pathOutputPWA: string;
  readonly #taskReserve: ReadonlyMap<EnumTask, TypeTaskConfig>;
  #taskCurrent: EnumTask = EnumTask.NONE;
  #pointsEntry: string[] = [];

  private constructor() {
    this.#pathRoot = fromFileUrl(new URL("../../", import.meta.url));
    this.#pathDeno = join(this.#pathRoot, "deno.jsonc");
    logBox(`#pathRoot = ${this.#pathRoot}`, sH4,{bold:true});
    this.#pathOutputAPP = join(this.#pathRoot, "docs/gen");
    this.#pathOutputPWA = join(this.#pathRoot, "docs/pwa");
    this.#taskReserve = new Map<EnumTask, TypeTaskConfig>([
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
          entryPoints: ["code/builds/loader-wasm-dot.ts"],
          outputFilename: "wasm-dot",
          outputExt: ".mjs",
        },
      ],
    ]);
  }

  // ###################-- KONFIGURACJA --###################

  static ES__INIT(): ClassEsbuildManager {
    if (this.#instanceSingleton === null) {
      this.#instanceSingleton = new ClassEsbuildManager();
    }
    return this.#instanceSingleton;
  }

  ES__STOP(): void {
    console.log("⚙️ Zatrzymywanie serwisu esbuild...");
    esbuild.stop();
    console.log("✅ Serwis esbuild został zatrzymany.");
  }

  get task(): EnumTask {
    return this.#taskCurrent;
  }

  set task(mode: EnumTask) {
    this.#taskCurrent = mode;
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

  // ###################-- POMOCNICZE --###################

  async #writeFileAsPWA(taskChosen:EnumTask): Promise<void> {
      await Deno.writeTextFile(
        join(this.#pathOutputPWA, taskChosen),
        this.#taskCurrent === EnumTask.PWA_SW_VERSION ? TEXT__PWA_SW(TimeSnap.stampWRITE('-')) : this.#taskCurrent === EnumTask.PWA_SW_LOADER ? TEXT__PWA_SW_LOADER() : this.#taskCurrent === EnumTask.PWA_MANIFEST ? JSON.stringify(OBJECT_PWA_MANIFEST, null, 2):''
      );
      const description = this.#taskCurrent === EnumTask.PWA_SW_VERSION ? 'ServiceWorker PWA' : this.#taskCurrent === EnumTask.PWA_SW_LOADER ? 'Loader PWA/SW' : this.#taskCurrent === EnumTask.PWA_MANIFEST ? 'Manifest PWA':'';
      console.log(`✅ ${description} zapisany w: ${join(this.#pathOutputPWA,taskChosen)}`);
      this.#timestampSET(this.#pathOutputPWA,taskChosen);
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
    const configTask = this.#taskReserve.get(taskEnum);
    if (!configTask) {
        console.error(`❌ Nie można zarządzać datą: brak konfiguracji dla zadania ${taskEnum}`);
        return null;
    }

    switch (mode) {
      case EnumTimestampMode.GET:
        return await this.#timestampGET(join(this.#pathRoot,"docs/gen"),`${configTask.outputFilename}${configTask.outputExt}`);

      case EnumTimestampMode.SET: {
        await this.#timestampSET(join(this.#pathRoot,"docs/gen"),`${configTask.outputFilename}${configTask.outputExt}`);
        return null;
      }
    }
  }
  async #timestampGET(pathForTimestamp:string|URL, nameOfTimestamp:string): Promise<string | null>{
    const pathABS = join(pathForTimestamp,nameOfTimestamp+'.lastBuild.txt');
    const pathREL = pathABS.replace(this.#pathRoot, ".");
    try {
      const timestamp = await Deno.readTextFile(pathABS);
      return timestamp.trim();
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) return null;
      console.error(`❌ Błąd podczas odczytu pliku znacznika czasu "${pathREL}":`, err.message);
      return null;
    }
  }
  async #timestampSET(pathForTimestamp:string|URL, nameOfTimestamp:string): Promise<string>{
    const stamp = TimeSnap.stampWRITE('_');
    const pathABS = join(pathForTimestamp,nameOfTimestamp+'.lastBuild.txt');
    const pathREL = pathABS.replace(this.#pathRoot, ".");
    await Deno.writeTextFile(pathABS, stamp);
    console.log(`  - Znacznik czasu zapisany: ${pathREL}`);
    return stamp;
  }

  // ###################-- WERYFIKACJA --###################

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

  // ###################-- ZASADNICZE --###################

  async runBuild(): Promise<void> {
    //logBox(`#taskCurrent = ${this.#taskCurrent}`, sH1,{bold:true});

    const taskHasPWA = this.#taskCurrent === EnumTask.PWA_SW_VERSION || this.#taskCurrent === EnumTask.PWA_SW_LOADER || this.#taskCurrent === EnumTask.PWA_MANIFEST;
    if(taskHasPWA){
      await this.#writeFileAsPWA(this.#taskCurrent);
      return;
    }

    const taskIsWASM = this.#taskCurrent === EnumTask.WASM_MJS;
    const taskIsMAIN = this.#taskCurrent === EnumTask.MAIN_MJS || this.#taskCurrent === EnumTask.MAIN_CSS;


    const configTask = this.#taskReserve.get(this.#taskCurrent);
    if (!configTask) {
      if (this.#taskCurrent !== EnumTask.NONE) {
        console.error(`❌ Nie znaleziono konfiguracji dla zadania: ${this.#taskCurrent}`);
      }
      this.#pointsEntry = [];
      return;
    } else {
      this.#pointsEntry = configTask.entryPoints;
    }
    //logBox(`#pointsEntry = ${this.#pointsEntry.join('\n#pointsEntry = ')}`, sH2,{bold:true});


    try {
      await this.#executeBuild(configTask);
      
      this.task = EnumTask.NONE;
    } catch (err) {
      console.error(`\n❌ Krytyczny błąd podczas budowania '${configTask.subject}':`, err.message);
      Deno.exit(1);
    }
  }

  async #executeBuild(configTask: TypeTaskConfig): Promise<void> {
    
    console.log(configTask);
    // Sprawdź istnienie wszystkich plików wejściowych
    for (const entryPoint of configTask.entryPoints) {
      //logBox(`entryPoint = ${entryPoint}`, sH3,{bold:true});
      //logBox(`#pathRoot = ${this.#pathRoot}`, sH3,{bold:true});
      const pathEntryPointAbsolute = join(this.#pathRoot, entryPoint);
      //console.log(`pathEntryPointAbsolute = ${pathEntryPointAbsolute}`);
      //logBox(`#pathRoot = ${this.#pathRoot}`, sH3,{bold:true});
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
  
}
