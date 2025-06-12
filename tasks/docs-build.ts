/**
 * @file ./tasks/docs-build.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T13:04:37.531Z+02:00
 * @description Budowanie wydania.
 */
import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";
import { fromFileUrl, join } from "$deno-path";

console.log("🚀 Rozpoczynam budowanie projektu...");
console.time("✅ Projekt zbudowany w");

// Ta logika jest nam potrzebna TYLKO do znalezienia pliku deno.jsonc
const projectDeno = join(fromFileUrl(new URL("../", import.meta.url)), "deno.jsonc");


try {
  const result = await esbuild.build({
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
    sourcemap: true, //"inline",
    target: ["esnext"],
    // preact
    jsx: "automatic",
    jsxImportSource: "preact",
    loader: { ".ts": "ts", ".tsx": "tsx" },
    logLevel: "info",
    // pure: ['console.log', 'console.warn'],
  });

  console.timeEnd("✅ Projekt zbudowany w");
  if (result.metafile) {
    // Używamy JSON.stringify z dodatkowymi argumentami, aby plik był czytelny
    await Deno.writeTextFile("docs/gen/meta.json", JSON.stringify(result.metafile, null, 2));
    console.log(`✅ Plik metafile został zapisany w: ${"docs/gen/meta.json"}`);
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
