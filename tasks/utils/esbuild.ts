/**
 * @file ./tasks/utils/esbuild.ts
 * @author https://github.com/j-Cis * 
 * * @lastmodified 2025-06-14T18:11:32.178Z+02:00
 * @description Bundler uniwersalny 
 */
import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";
import { fromFileUrl, join } from "$deno-path";

export async function build(subject: string, onlyNameOfFilesResult:string, inputFile:string, itIsPreact:boolean=false,hasExternal:boolean=false, externalList:string[]=[]) {
  console.log(`🚀 Rozpoczynam budowanie '${subject}' ...`);
  console.time(`✅ Zbudowany '${subject}' w`);

  // Ta logika jest nam potrzebna TYLKO do znalezienia pliku deno.jsonc
  const projectRoot = fromFileUrl(new URL("../../", import.meta.url));
  const projectDeno = join(projectRoot, "deno.jsonc");
  const genPath = join(projectRoot, "docs", "gen");
  //console.log(genPath);

  try {
    console.log(`📦 Bundlowanie '${subject}'...`);
    const result = await esbuild.build({
      format: "esm",
      entryPoints: [inputFile],
      outfile: `docs/gen/${onlyNameOfFilesResult}.js`,
      plugins: [...denoPlugins({ configPath: projectDeno })],
      bundle: true,
      minify: true,
      metafile: true,
      sourcemap: true, 
      target: ["esnext"],
      logLevel: "info",
      ...(!itIsPreact ? {} : {
        jsx: "automatic",
        jsxImportSource: "preact",
        loader: { ".ts": "ts", ".tsx": "tsx" },
      }),
      ...(!hasExternal ? {} : {
        external: externalList,
      })
    });
    console.log(`✅ '${subject}' zostało zbudowane.`);
    console.timeEnd(`✅ Zbudowany '${subject}' w`);

    if(result.metafile){
      // Używamy JSON.stringify z dodatkowymi argumentami, aby plik był czytelny
      await Deno.writeTextFile(`docs/gen/${onlyNameOfFilesResult}.meta.json`, JSON.stringify(result.metafile, null, 2));
      console.log(`✅ Plik metafile został zapisany w: "./docs/gen/${onlyNameOfFilesResult}.meta.json"`);
      const buildTimestamp = new Date().toISOString();
      const fileContent = `${buildTimestamp}\n`;
      await Deno.writeTextFile(`docs/gen/${onlyNameOfFilesResult}.lastBuild.txt`, fileContent);
      console.log(`✅ Data tego budowania zapisana w: "./docs/gen/${onlyNameOfFilesResult}.lastBuild.txt"`);
    }

  } catch (error) {
    console.error("❌ Błąd podczas budowania:", error);
    // Zakończ proces z kodem błędu, aby poinformować inne narzędzia (np. CI/CD)
    Deno.exit(1);
  } finally {
    // Zatrzymaj proces esbuild niezależnie od wyniku
    esbuild.stop();
  }
}
