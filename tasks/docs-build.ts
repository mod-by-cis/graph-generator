import * as esbuild from "$esbuild/mod.js";
import { denoPlugins } from "$esbuild-deno";
import { fromFileUrl, join } from "$deno-path";

console.log("🚀 Rozpoczynam budowanie projektu...");
console.time("✅ Projekt zbudowany w");

// Ta logika jest nam potrzebna TYLKO do znalezienia pliku deno.jsonc
const projectDeno = join(fromFileUrl(new URL("../", import.meta.url)), "deno.jsonc");


try {
  await esbuild.build({
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
    sourcemap: "inline",
    target: ["esnext"],
    // preact
    jsx: "automatic",
    jsxImportSource: "preact",
    loader: { ".ts": "ts", ".tsx": "tsx" },
    logLevel: "info",
  });

  console.timeEnd("✅ Projekt zbudowany w");
} catch (error) {
  console.error("❌ Błąd podczas budowania:", error);
  // Zakończ proces z kodem błędu, aby poinformować inne narzędzia (np. CI/CD)
  Deno.exit(1);
} finally {
  // Zatrzymaj proces esbuild niezależnie od wyniku
  esbuild.stop();
}
