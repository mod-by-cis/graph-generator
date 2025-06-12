/**
 * @file ./tasks/docs-build.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T20:30:54.206Z+02:00
 * @description Budowanie wydania.
 */
import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";
import { fromFileUrl, join } from "$deno-path";

// --- Główna funkcja budująca ---
async function build() {
  console.log("🚀 Rozpoczynam budowanie projektu...");
  console.time("✅ Projekt zbudowany w");

  // Ta logika jest nam potrzebna TYLKO do znalezienia pliku deno.jsonc
  const projectRoot = fromFileUrl(new URL("../", import.meta.url));
  const projectDeno = join(projectRoot, "deno.jsonc");
  const genPath = join(projectRoot, "docs", "gen");


  try {
    

    // --- ZADANIE 2: Zbuduj główny plik aplikacji, traktując Graphviz jako zewnętrzny ---
    console.log("📦 Bundlowanie głównej aplikacji...");
    const result2 = await esbuild.build({
      entryPoints: ["docs/dev/main.tsx"],
      outfile: "docs/gen/main.js", 
      // Dodajemy wtyczkę, która nauczy esbuild obsługiwać Deno
      plugins: [...denoPlugins({
          // Wskazujemy ścieżkę do pliku konfiguracyjnego, aby wtyczka znalazła Import Map
          configPath: projectDeno
      })],
      bundle: true,
      format: "esm",
      minify: true,
      metafile: true,
      // KLUCZOWA ZMIANA: Mówimy esbuild, aby NIE dołączał tej biblioteki do bundla.
      external: ["https://esm.sh/@hpcc-js/wasm@2.23.0"], // ["$hpcc-graphviz"],
      sourcemap: true, //"inline",
      target: ["esnext"],
      // preact
      jsx: "automatic",
      jsxImportSource: "preact",
      loader: { ".ts": "ts", ".tsx": "tsx" },
      logLevel: "info",
      // pure: ['console.log', 'console.warn'],
    });
    console.log("✅ Główna aplikacja została zbudowana.");

    console.timeEnd("✅ Projekt zbudowany w");
    
    if (result2.metafile) {
      // Używamy JSON.stringify z dodatkowymi argumentami, aby plik był czytelny
      await Deno.writeTextFile("docs/gen/main.meta.json", JSON.stringify(result2.metafile, null, 2));
      console.log(`✅ Plik metafile został zapisany w: ${"docs/gen/main.meta.json"}`);
    }
    const buildTimestamp = new Date().toISOString();
    const fileContent = `${buildTimestamp}\n`;
    await Deno.writeTextFile("docs/gen/lastBuild.txt", fileContent);
    console.log(`✅ Data tego budowania zapisana w: ${"docs/gen/lastBuild.txt"}`);

  } catch (error) {
    console.error("❌ Błąd podczas budowania:", error);
    // Zakończ proces z kodem błędu, aby poinformować inne narzędzia (np. CI/CD)
    Deno.exit(1);
  } finally {
    // Zatrzymaj proces esbuild niezależnie od wyniku
    esbuild.stop();
  }
}


build();
