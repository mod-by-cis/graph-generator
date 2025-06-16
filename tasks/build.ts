/**
 * @file ./tasks/build.ts
 * @description Główny skrypt budujący — użycie flagi `--targetFor`
 */

import { parseArgs } from "$deno-cli";
import ClassEsbuildManager, { EnumTask } from "../logic/esbuild.ts";


const args = parseArgs(Deno.args, {
  string: ["targetFor"],
  boolean: ["help"],
});

const mode = args.targetFor?.toLowerCase();
const showHelp = args.help === true;

const HELP_USAGE = `
🛠️ Użycie:
  deno run --allow-read --allow-write --allow-net --allow-env --allow-run ./tasks/build.ts --targetFor=<typ>

Dostępne tryby (--targetFor):
  main     Buduje wersję główną z ServiceWorkerem, bez WASM
  wasm     Buduje tylko i wyłącznie z WebAssembly
  pwa      Buduje tylko zasoby PWA

Przykłady:
  deno run -A ./tasks/build.ts --targetFor=main
  deno run -A ./tasks/build.ts --targetFor=wasm
  deno run -A ./tasks/build.ts --targetFor=pwa
`;

if (showHelp || !mode || !["main", "wasm", "pwa"].includes(mode)) {
  console.log(HELP_USAGE);
  Deno.exit(showHelp ? 0 : 1);
}


const builder = ClassEsbuildManager.ES__INIT();

switch (mode) {
  case "main":
    builder.task = EnumTask.MAIN_MJS;
    await builder.runBuild();

    builder.task = EnumTask.MAIN_CSS;
    await builder.runBuild();

    builder.task = EnumTask.PWA_SW_VERSION;
    await builder.runBuild();
    break;

  case "wasm":
    builder.task = EnumTask.WASM_MJS;
    await builder.runBuild();
    break;

  case "pwa":
    console.log("🚀 Buduję zasoby PWA...");

    builder.task = EnumTask.PWA_MANIFEST;
    await builder.runBuild();

    builder.task = EnumTask.PWA_SW_VERSION;
    await builder.runBuild();

    builder.task = EnumTask.PWA_SW_LOADER;
    await builder.runBuild();

    console.log("✅ Zasoby PWA zbudowane.");
    break;
}

builder.ES__STOP();
