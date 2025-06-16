/**
 * @file ./tasks/pwa-build.ts
 * @description Buduje wszystkie zasoby PWA (manifest, sw, loader).
 */
import ClassEsbuildManager, { EnumTask } from "../logic/esbuild.ts";

const builder = ClassEsbuildManager.ES__INIT();

console.log("🚀 Rozpoczynam budowanie zasobów PWA...");

//// 1. Wygeneruj plik manifest.webmanifest
builder.task = EnumTask.PWA_MANIFEST;
await builder.runBuild();

// 2. Zbuduj Service Worker
builder.task = EnumTask.PWA_SW_VERSION;
await builder.runBuild();

// 3. Zbuduj PWA Loader
builder.task = EnumTask.PWA_SW_LOADER;
await builder.runBuild();

builder.ES__STOP();
console.log("🎉 Zasoby PWA zostały zbudowane pomyślnie!");
