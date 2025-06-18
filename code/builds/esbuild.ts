import { fromFileUrl, join } from "$deno-path";
import { assert } from "$deno-assert";
import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";
import TEXT__PWA_SW from "../pwa/text_sw.ts";
import TEXT__PWA_SW_LOADER from "../pwa/text_sw-loader.ts";
import OBJECT_PWA_MANIFEST from "../pwa/manifest.ts"
import logBox, { type logBoxColorOptions, type logBoxStyleOptions } from "../utils/logBox.ts";
import {VERSION, TASK_RESERVE_CONFIG, EnumTask, EnumTimestampMode, type TypeTaskOptions, type TypeTaskConfig } from "./deff.ts"
import { TimeSnap } from "../utils/TimeSnap.ts";


/**
 * Zarządza procesem budowania.
 */

export default class ClassEsbuildManager {
  static #instanceSingleton: ClassEsbuildManager | null = null;
  #taskCurrent: EnumTask = EnumTask.NONE;
  readonly #taskReserve: ReadonlyMap<EnumTask, TypeTaskConfig>;
  readonly #pathRoot: string;
  readonly #pathDeno: string;
  readonly #pathOutputAPP: string;
  readonly #pathOutputPWA: string;

  private constructor(taskConfig: ReadonlyMap<EnumTask, TypeTaskConfig>) {
    this.#taskReserve = taskConfig;
    this.#pathRoot = fromFileUrl(new URL("../../", import.meta.url));
    this.#pathDeno = join(this.#pathRoot, "deno.jsonc");
    logBox(`#pathRoot = ${this.#pathRoot}`, { color: 0xC09494, bgColor: 0x5D3030, boxColor: 0x402121 }, { bold: true });
    this.#pathOutputAPP = join(this.#pathRoot, "docs/gen");
    this.#pathOutputPWA = join(this.#pathRoot, "docs/pwa");
  }

  // ###################-- KONFIGURACJA --###################

  static ES__INIT(taskConfig: ReadonlyMap<EnumTask, TypeTaskConfig>): ClassEsbuildManager {
    if (this.#instanceSingleton === null) {
      this.#instanceSingleton = new ClassEsbuildManager(taskConfig);
    }
    return this.#instanceSingleton;
  }

  ES__STOP(): void {
    console.log("⚙️ Zatrzymywanie serwisu esbuild...");
    esbuild.stop();
    console.log("✅ Serwis esbuild został zatrzymany.");
  }

  get task(): EnumTask {return this.#taskCurrent; }
  set task(mode: EnumTask) {  this.#taskCurrent = mode; }

  // ###################-- GŁÓWNY DYSPONENT --###################

  async runBuild(): Promise<void> {
    const isPwaTask = this.#taskCurrent === EnumTask.PWA_SW_VERSION || this.#taskCurrent === EnumTask.PWA_SW_LOADER || this.#taskCurrent === EnumTask.PWA_MANIFEST;
    
    try {
      if (isPwaTask) {
        await this.#executeForPWA(this.#taskCurrent);
      } else {
        await this.#executeForAPP();
      }
    } catch (err) {
      console.error(`\n❌ Krytyczny błąd podczas budowania '${this.#taskCurrent}':`, err.message);
      Deno.exit(1);
    }
  }

  async runBuild2(): Promise<void> {
    const taskHasPWA = this.#taskCurrent === EnumTask.PWA_SW_VERSION || this.#taskCurrent === EnumTask.PWA_SW_LOADER || this.#taskCurrent === EnumTask.PWA_MANIFEST;
    if (taskHasPWA) {
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

  // ###################-- METODY WYKONAWCZE --###################

  async #executeForAPP(): Promise<void> {
    const configTask = this.#taskReserve.get(this.#taskCurrent);
    if (!configTask) {
      if (this.#taskCurrent !== EnumTask.NONE) {
        console.error(`❌ Nie znaleziono konfiguracji dla zadania: ${this.#taskCurrent}`);
      }
      return;
    }

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
      entryPoints: configTask.entryPoints,
      outfile: pathOutputRelative,
      bundle: true,
      minify: true,
      metafile: true,
      logLevel: "info",
    };

    const specificOptions = this.#getEsbuildSpecificOptions(optionsTask);
    const esbuildCurrentSet = { ...commonOptions, ...specificOptions };

    console.log("esbuildCurrentSet", esbuildCurrentSet);
    const result = await esbuild.build(esbuildCurrentSet);
    console.timeEnd(`✅ Zakończono '${configTask.subject}' w`);

    await this.#writeMetaFiles(pathOutputAbsolute, result.metafile);
    this.task = EnumTask.NONE;
  }

  async #executeForPWA(taskChosen: EnumTask): Promise<void> {
    const content =
      taskChosen === EnumTask.PWA_SW_VERSION ? TEXT__PWA_SW(VERSION) :
      taskChosen === EnumTask.PWA_SW_LOADER ? TEXT__PWA_SW_LOADER() :
      taskChosen === EnumTask.PWA_MANIFEST ? JSON.stringify(OBJECT_PWA_MANIFEST, null, 2)
      : '';

    const description =
      taskChosen === EnumTask.PWA_SW_VERSION ? 'ServiceWorker PWA' :
      taskChosen === EnumTask.PWA_SW_LOADER ? 'Loader PWA/SW' :
      taskChosen === EnumTask.PWA_MANIFEST ? 'Manifest PWA'
      : '';

    const outputPath = join(this.#pathOutputPWA, taskChosen);
    await Deno.writeTextFile(outputPath, content);
    console.log(`✅ ${description} zapisany w: ${outputPath}`);
    await TimeSnap.fileSAVE(this.#pathRoot, this.#pathOutputPWA, taskChosen, VERSION);
    this.task = EnumTask.NONE;
  }

  async #executeBuild(configTask: TypeTaskConfig): Promise<void> {
    console.log(configTask);

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
      entryPoints: configTask.entryPoints,
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

    console.log("esbuildCurrentSet", esbuildCurrentSet);
    const result = await esbuild.build(esbuildCurrentSet);
    console.timeEnd(`✅ Zakończono '${configTask.subject}' w`);
    await this.#writeMetaFiles(pathOutputAbsolute, result.metafile);
  }

  // ###################-- ZARZĄDZANIE ZNACZNIKAMI CZASU --###################

  public async manageTimestampForTask(taskEnum: EnumTask, mode: EnumTimestampMode): Promise<string | null> {
    const configTask = this.#taskReserve.get(taskEnum);
    if (!configTask) {
      console.error(`❌ Nie można zarządzać datą: brak konfiguracji dla zadania ${taskEnum}`);
      return null;
    }
    switch (mode) {
      case EnumTimestampMode.GET:
        return await TimeSnap.fileLOAD(this.#pathRoot, join(this.#pathRoot, "docs/gen"), `${configTask.outputFilename}${configTask.outputExt}`);
      case EnumTimestampMode.SET:
        await TimeSnap.fileSAVE(this.#pathRoot, join(this.#pathRoot, "docs/gen"), `${configTask.outputFilename}${configTask.outputExt}`, VERSION);
        return null;
    }
  }

  // ###################-- METODY POMOCNICZE --###################

  #getEsbuildSpecificOptions(optionsTask: TypeTaskOptions): esbuild.BuildOptions {
    if (optionsTask.isCssOnly) {
      return { loader: { ".css": "css" } };
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
    if (optionsTask.define) {
      jsOptions.define = optionsTask.define;
    }
    return jsOptions;
  }

  async #writeMetaFiles(pathBuiltFile: string, metafile?: esbuild.Metafile): Promise<void> {
    if (metafile) {
      const pathMetafile = `${pathBuiltFile}.meta.json`;
      await Deno.writeTextFile(pathMetafile, JSON.stringify(metafile, null, 2));
      console.log(`  - Plik metafile zapisany: ${pathMetafile.replace(this.#pathRoot, ".")}`);
    }
    await this.manageTimestampForTask(this.#taskCurrent, EnumTimestampMode.SET);
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

 // ###################-- WERYFIKACJA --###################

  async #assertFileExists2(path: string): Promise<void> {
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

  // ###################-- KONFIGURACJA --###################

  #getEsbuildSpecificOptions2(optionsTask: TypeTaskOptions): esbuild.BuildOptions {
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

    if (optionsTask.define) {
      jsOptions.define = optionsTask.define;
    }

    return jsOptions;
  }

  // ###################-- POMOCNICZE --###################

  async #writeFileAsPWA(taskChosen: EnumTask): Promise<void> {
    await Deno.writeTextFile(
      join(this.#pathOutputPWA, taskChosen),
      this.#taskCurrent === EnumTask.PWA_SW_VERSION ? TEXT__PWA_SW(VERSION) : this.#taskCurrent === EnumTask.PWA_SW_LOADER ? TEXT__PWA_SW_LOADER() : this.#taskCurrent === EnumTask.PWA_MANIFEST ? JSON.stringify(OBJECT_PWA_MANIFEST, null, 2) : ''
    );

    const description = this.#taskCurrent === EnumTask.PWA_SW_VERSION ? 'ServiceWorker PWA' : this.#taskCurrent === EnumTask.PWA_SW_LOADER ? 'Loader PWA/SW' : this.#taskCurrent === EnumTask.PWA_MANIFEST ? 'Manifest PWA' : '';
    console.log(`✅ ${description} zapisany w: ${join(this.#pathOutputPWA, taskChosen)}`);
    await TimeSnap.fileSAVE(this.#pathRoot,this.#pathOutputPWA, taskChosen,VERSION);
  }

  async #writeMetaFiles2(pathBuiltFile: string, metafile?: esbuild.Metafile): Promise<void> {

    if (metafile) {
      const pathMetafile = `${pathBuiltFile}.meta.json`;
      await Deno.writeTextFile(pathMetafile, JSON.stringify(metafile, null, 2));
      console.log(`  - Plik metafile zapisany: ${pathMetafile.replace(this.#pathRoot, ".")}`);
    }

    const taskEnum = this.#taskCurrent;
    await this.manageTimestampForTask(taskEnum, EnumTimestampMode.SET);
  }

  async manageTimestampForTask2(taskEnum: EnumTask, mode: EnumTimestampMode): Promise<string | null> {
    const configTask = this.#taskReserve.get(taskEnum);
    if (!configTask) {
      console.error(`❌ Nie można zarządzać datą: brak konfiguracji dla zadania ${taskEnum}`);
      return null;
    }

    switch (mode) {
      case EnumTimestampMode.GET:
        return await TimeSnap.fileLOAD(this.#pathRoot,join(this.#pathRoot, "docs/gen"), `${configTask.outputFilename}${configTask.outputExt}`);
        

      case EnumTimestampMode.SET: {
        await TimeSnap.fileSAVE(this.#pathRoot,join(this.#pathRoot, "docs/gen"), `${configTask.outputFilename}${configTask.outputExt}`,VERSION);
        return null;
      }
    }
  }
}
