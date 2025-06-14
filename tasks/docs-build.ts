/**
 * @file ./tasks/docs-build.ts
 * @author https://github.com/j-Cis * 
 * * @lastmodified 2025-06-14T18:11:32.178Z+02:00
 * @description Budowanie wydania.
 */
import { build } from "./utils/esbuild.ts";



build("Główna aplikacja","main","docs/dev/main.tsx",true,true,["https://esm.sh/@hpcc-js/wasm@2.23.0"]);
