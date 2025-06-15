
import { fromFileUrl, join } from "$deno-path";
//import { exists, existsSync } from "$deno-fs";
import { assert } from "$deno-assert";
import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";

export enum ToDoList {
  NONE = "-",
  MAIN_CSS = "main.css",
  MAIN_MJS = "main.mjs",
  WASM_MJS = "wasm-dot.mjs",
}


export default class EsBuildConfig {
  static #instance: EsBuildConfig | null = null;

  readonly #pathRoot: string;
  readonly #pathDeno: string;
  readonly #pathDist: string;
  readonly #pathMainTSX: string;
  readonly #pathMainCSS: string;
  readonly #pathDotWASM: string;
  #toDo: ToDoList = ToDoList.NONE;

  private constructor() {
    this.#pathRoot = fromFileUrl(new URL("../../", import.meta.url));
    this.#pathDeno = join(this.#pathRoot, "deno.jsonc");
    this.#pathDist = "docs/gen";
    this.#pathMainTSX = "code/app/main.tsx";
    this.#pathMainCSS = "code/app/main.css";
    this.#pathDotWASM = "code/lib/wasm/loader-wasm-dot.ts";

  }  

  static getInstance(): EsBuildConfig {
    if (this.#instance === null) {
      this.#instance = new EsBuildConfig();
    }
    return this.#instance;
  }

  get toDo(): ToDoList {
    return this.#toDo;
  }
  set toDo(mode: ToDoList) {
    this.#toDo = mode;
  }

  async #assertFileExists(path: string | URL): Promise<void> {
    try {
      const stat = await Deno.stat(path);
      assert(stat.isFile, `Nie jest to plik: ${path}`);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        throw new Error(`Plik nie istnieje: ${path}`);
      } else if (err instanceof Error){
        throw new Error(`Błąd podczas sprawdzania pliku "${path}": ${err.message}`);
      } else {
        throw new Error(`Inny problem podczas sprawdzania pliku "${path}": ${String(err)}`);
      }
    }
  }
  async #esbuild (
    subject: string, 
    files:{inputPaths:string[],outputName:string,outputExtWithDot:string},
    config: {
      todoHasPreact?:boolean;
      todoIsDotWASM?:boolean;
      todoIsOnlyCSS?:boolean;
      hasExternal?:boolean;
      listExternal?:string[];
    } = {
      todoHasPreact:false,
      todoIsOnlyCSS:false,
      todoIsDotWASM:false,
      hasExternal:false,
      listExternal:[]
    }
  ){
    console.log(`📦 Bundlowanie '${subject}'...`);
    try {
      const result = await esbuild.build({
        entryPoints: files.inputPaths,
        outfile: `${this.#pathDist}/${files.outputName}${files.outputExtWithDot}`,
        bundle: true,
        minify: true,
        metafile: true,
        ...(config.todoIsOnlyCSS ? {
          loader: { ".css": "css"},
        } : {
          format: "esm",
          plugins: [...denoPlugins({ configPath: this.#pathDeno })],
          sourcemap: true, 
          target: ["esnext"],
          logLevel: "info",
        }),
        ...(!config.todoHasPreact ? {} : {
          jsx: "automatic",
          jsxImportSource: "preact",
          loader: { ".ts": "ts", ".tsx": "tsx" },
        }),
        ...(!config.hasExternal ? {} : {
          external: config.listExternal,
        }),
      });
      console.log(`✅ '${subject}' zostało zbudowane.`);
      console.timeEnd(`✅ Zbudowany '${subject}' w`);

      if(result.metafile){
        // Używamy JSON.stringify z dodatkowymi argumentami, aby plik był czytelny
        await Deno.writeTextFile(`${this.#pathDist}/${files.outputName}${files.outputExtWithDot}.meta.json`, JSON.stringify(result.metafile, null, 2));
        console.log(`✅ Plik metafile został zapisany w: "./${this.#pathDist}/${files.outputName}${files.outputExtWithDot}.meta.json"`);
        const buildTimestamp = new Date().toISOString();
        const fileContent = `${buildTimestamp}\n`;
        await Deno.writeTextFile(`${this.#pathDist}/${files.outputName}${files.outputExtWithDot}.lastBuild.txt`, fileContent);
        console.log(`✅ Data tego budowania zapisana w: "./${this.#pathDist}/${files.outputName}${files.outputExtWithDot}.lastBuild.txt"`);
      }
    } catch (error) {
      console.error("❌ Błąd podczas budowania:", error);
    }
  }

  async makeBuild(){
    switch (this.toDo) {
      case ToDoList.WASM_MJS:
        try {
          await this.#assertFileExists(this.#pathDotWASM);
          await this.#esbuild(
            "Biblioteka Graphviz",
            {inputPaths:[this.#pathDotWASM], outputName:"wasm-dot", outputExtWithDot:".mjs"}
          );
        } catch(err) {
          console.error("[BŁĄD]", err);
          Deno.exit(1);          
        } finally {
          esbuild.stop();
        }   
        break;

      case ToDoList.MAIN_MJS:
        try {
          await this.#assertFileExists(this.#pathMainTSX);
          await this.#esbuild(
            "Główna aplikacja",
            {inputPaths:[this.#pathMainTSX], outputName:"main", outputExtWithDot:".mjs"},
            {todoHasPreact:true, hasExternal:true, listExternal:["https://esm.sh/@hpcc-js/wasm@2.23.0"]}
          );
        } catch(err) {
          console.error("[BŁĄD]", err);
          Deno.exit(1);          
        } finally {
          esbuild.stop();
        }        
        break;
      case ToDoList.MAIN_CSS:
        try {
          await this.#assertFileExists(this.#pathMainCSS);
          await this.#esbuild(
            "Arkusz stylów",
            {inputPaths:[this.#pathMainCSS], outputName:"main", outputExtWithDot:".css"},
            {todoIsOnlyCSS:true}
          );
        } catch(err) {
          console.error("[BŁĄD]", err);
          Deno.exit(1);          
        } finally {
          esbuild.stop();
        }        
      
      break;
      default:
        break;
    }
  }

  printConfig() :void {
    console.log("pathRoot:", this.#pathRoot);
    console.log("pathDeno:", this.#pathDeno);
    console.log("current mode:", this.toDo);
  }
}




//console.log(new TextDecoder().decode(resCMD.stdout));


