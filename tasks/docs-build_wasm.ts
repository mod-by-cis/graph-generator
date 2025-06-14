/**
 * @file ./tasks/docs-build_wasm.ts
 * @author https://github.com/j-Cis
 * * @lastmodified 2025-06-14T18:11:32.178Z+02:00
 * @description Budowanie wydania wasm-dot.
 */
import { build } from "./utils/esbuild.ts";


build("Biblioteka Graphviz","wasm-dot","./tasks/utils/wasm-loader.ts",false,false,[]);


