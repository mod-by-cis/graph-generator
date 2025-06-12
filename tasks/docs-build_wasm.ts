/**
 * @file ./tasks/docs-build_wasm.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T20:29:05.642Z+02:00
 * @description Budowanie wydania wasm-dot.
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
    // --- ZADANIE 1: Zbuduj osobny plik dla Graphviz WASM ---
    console.log("📦 Bundlowanie biblioteki Graphviz...");
    const result1 = await esbuild.build({
      entryPoints: ["./tasks/utils/wasm-loader.ts"],
      outfile: "docs/gen/wasm-dot.js",
      plugins: [...denoPlugins({ configPath: projectDeno })],
      bundle: true,
      minify: true,
      format: "esm",
      metafile: true,
      sourcemap: true, 
    });
    console.log("✅ Biblioteka Graphviz została zbudowana.");

    console.timeEnd("✅ Projekt zbudowany w");
    if (result1.metafile) {
      // Używamy JSON.stringify z dodatkowymi argumentami, aby plik był czytelny
      await Deno.writeTextFile("docs/gen/wasm-dot.meta.json", JSON.stringify(result1.metafile, null, 2));
      console.log(`✅ Plik metafile został zapisany w: ${"docs/gen/wasm-dot.meta.json"}`);
    }
    const buildTimestamp = new Date().toISOString();
    const fileContent = `${buildTimestamp}\n`;
    await Deno.writeTextFile("docs/gen/lastBuild_wasm.txt", fileContent);
    console.log(`✅ Data tego budowania zapisana w: ${"docs/gen/lastBuild_wasm.txt"}`);

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
