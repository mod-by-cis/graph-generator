


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

import TEXT__PWA_SW from "../code/pwa/text_sw.ts";
import TEXT__PWA_SW_LOADER from "../code/pwa/text_sw-loader.ts";
import OBJECT_PWA_MANIFEST from "../code/pwa/manifest.ts"
import { TimeSnap } from "./TimeSnap.ts";

/**
 * Zarządza procesem budowania z esbuild .
 */
export default class ClassEsbuildManager {
  static #instanceSingleton: ClassEsbuildManager | null = null;
  // --- Konfiguracja ścieżek i zadań ---
  readonly #pathRoot: string;
  readonly #pathDeno: string;
  readonly #pathDist: string;
  readonly #pathPWA: string;
  readonly #mapTaskConfig: ReadonlyMap<EnumTask, TypeTaskConfig>;
  #taskCurrent: EnumTask = EnumTask.NONE;


  private constructor() {
    this.#pathRoot = fromFileUrl(new URL("../", import.meta.url));
    this.#pathDeno = join(this.#pathRoot, "deno.jsonc");
    this.#pathDist = join(this.#pathRoot, "docs/gen");
    this.#pathPWA = join(this.#pathRoot, "docs/pwa");

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
          entryPoints: ["code/app/lib/wasm/loader-wasm-dot.ts"],
          outputFilename: "wasm-dot",
          outputExt: ".mjs",
        },
      ],
      //[
      //  EnumTask.PWA_SW_LOADER, {
      //    subject: "PWA Loader (TS -> JS)",
      //    entryPoints: ["code/pwa/loader.ts"],
      //    outputFilename: "pwa-loader",
      //    outputExt: ".js",
      //  },
      //],
      //[
      //  EnumTask.PWA_SW_VERSION, {
      //    subject: "Service Worker (TS -> JS)",
      //    entryPoints: ["code/pwa/sw.ts"],
      //    outputFilename: "sw",
      //    outputExt: ".js",
      //  },
      //],
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
    if(this.#taskCurrent === EnumTask.PWA_SW_VERSION || this.#taskCurrent === EnumTask.PWA_SW_LOADER || this.#taskCurrent === EnumTask.PWA_MANIFEST){
      
      if(this.#taskCurrent === EnumTask.PWA_SW_VERSION){
        Deno.writeTextFile(
          join(this.#pathPWA,EnumTask.PWA_SW_VERSION),
          TEXT__PWA_SW(this.#timestampNEW.ts('-','-','-'))
        );
        console.log(`✅ ServiceWorker PWA zapisany w: ${join(this.#pathPWA,EnumTask.PWA_SW_VERSION)}`);
        this.#timestampSET(this.#pathPWA,EnumTask.PWA_SW_VERSION);
      }
      if(this.#taskCurrent === EnumTask.PWA_SW_LOADER){
        Deno.writeTextFile(
          join(this.#pathPWA,EnumTask.PWA_SW_LOADER),
          TEXT__PWA_SW_LOADER()
        );
        console.log(`✅ Loader PWA/SW zapisany w: ${join(this.#pathPWA,EnumTask.PWA_SW_LOADER)}`);
        this.#timestampSET(this.#pathPWA,EnumTask.PWA_SW_LOADER);
      }
      if(this.#taskCurrent === EnumTask.PWA_MANIFEST){
        Deno.writeTextFile(
          join(this.#pathPWA,EnumTask.PWA_MANIFEST),
          JSON.stringify(OBJECT_PWA_MANIFEST, null, 2)
        );
        console.log(`✅ Manifest PWA zapisany w: ${join(this.#pathPWA,EnumTask.PWA_MANIFEST)}`);
        this.#timestampSET(this.#pathPWA,EnumTask.PWA_MANIFEST);
      }

      return;
    }


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
    //const pathOutputRelative = join("docs/gen", `${configTask.outputFilename}${configTask.outputExt}`);
    //const pathBuiltFile = join(this.#pathRoot, pathOutputRelative);
    //const pathLastBuild = `${pathBuiltFile}.lastBuild.txt`;

    switch (mode) {
      case EnumTimestampMode.GET:
        return await this.#timestampGET(join(this.#pathRoot,"docs/gen"),`${configTask.outputFilename}${configTask.outputExt}`);
        //try {
        //  const timestamp = await Deno.readTextFile(pathLastBuild);
        //  return timestamp.trim();
        //} catch (err) {
        //  if (err instanceof Deno.errors.NotFound) return null;
        //  console.error(`❌ Błąd podczas odczytu pliku znacznika czasu "${pathLastBuild}":`, err.message);
        //  return null;
        //}

      case EnumTimestampMode.SET: {
        await this.#timestampSET(join(this.#pathRoot,"docs/gen"),`${configTask.outputFilename}${configTask.outputExt}`);
        //const timestamp = this.#timestampNEW.ts();
        //const timezones = this.#timestampNEW.tz();
        //await Deno.writeTextFile(pathLastBuild, timestamp+timezones);
        //console.log(`  - Znacznik czasu zapisany: ${pathLastBuild.replace(this.#pathRoot, ".")}`);
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
    //const timestamp = this.#timestampNEW.ts();
    //const timezones = this.#timestampNEW.tz();
    const stamp = TimeSnap.stampWRITE('_');
    const pathABS = join(pathForTimestamp,nameOfTimestamp+'.lastBuild.txt');
    const pathREL = pathABS.replace(this.#pathRoot, ".");
    await Deno.writeTextFile(pathABS, stamp);
    console.log(`  - Znacznik czasu zapisany: ${pathREL}`);
    return stamp;
  }

  get #timestampNEW(): {
    Y: number;
    MDd: [number,number,number];
    HMSz: [number,number,number,number];
    Z: [string,number,number];
    l: (zer: number, num: number) => string;
    ts: (sD?:string,sDT?:string,sT?:string) => string;
    tz: (sT?:string,sS?:string,sign?:boolean) => string;
  } {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const offsetMinutes = Math.abs(timezoneOffset) % 60;
    const offsetSign = timezoneOffset <= 0 ? "+" : "-";
    const offsetName = timezoneOffset <= 0 ? "plus" : "minus";
    const pad = (num: number) => String(num).padStart(2, '0');    
    return {
      Y:now.getFullYear(), 
      MDd:[now.getMonth() + 1, now.getDate(),(1+(now.getDay() + 6) % 7)], 
      HMSz:[now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds()],
      Z:[offsetSign,offsetHours,offsetMinutes],
      l:(zer:number, num: number) => String(num).padStart(zer, '0'),
      ts:(sD:string='-',sDT:string='T',sT:string=':') => `${now.getFullYear()}${sD}${pad(now.getMonth() + 1)}${sD}${pad(now.getDate())}${sD}${(1+(now.getDay() + 6) % 7)}${sDT}${pad(now.getHours())}${sT}${pad(now.getMinutes())}${sT}${pad(now.getSeconds())}${sT}${pad(now.getMilliseconds())}`,
      tz:(sT:string=':',sS:string='',sign: boolean=true) =>`${sS}${sign?offsetSign:offsetName}}${sS}${pad(offsetHours)}${sT}${pad(offsetMinutes)}`
    };    
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
