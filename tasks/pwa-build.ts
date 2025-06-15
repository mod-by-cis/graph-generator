/**
 * @file ./tasks/pwa-build.ts
 * @description Buduje wszystkie zasoby PWA (manifest, sw, loader).
 */
import ClassEsbuildManager, { EnumTask } from "../logic/esbuild.ts";
import manifestObject from "../code/pwa/manifest.ts";
import {fromFileUrl, join } from "$deno-path";

const builder = ClassEsbuildManager.ES__INIT();

console.log("🚀 Rozpoczynam budowanie zasobów PWA...");

// 1. Wygeneruj plik manifest.webmanifest
const rootPath = fromFileUrl(new URL("../", import.meta.url));
const manifestPath = join(rootPath, "docs", "gen", "manifest.webmanifest");
await Deno.writeTextFile(manifestPath, JSON.stringify(manifestObject, null, 2));
console.log(`✅ Manifest PWA zapisany w: ${manifestPath}`);

// 2. Zbuduj Service Worker
builder.task = EnumTask.PWA_SW;
await builder.runBuild();

// 3. Zbuduj PWA Loader
builder.task = EnumTask.PWA_LOADER;
await builder.runBuild();

builder.ES__STOP();
console.log("🎉 Zasoby PWA zostały zbudowane pomyślnie!");
