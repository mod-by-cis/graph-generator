/**
 * @file ./tasks/docs-build_wasm.ts
 * @author https://github.com/j-Cis
 * * @lastmodified 2025-06-14T18:11:32.178Z+02:00
 * @description Budowanie wydania wasm-dot.
 */

import ClassEsbuildManager, { EnumTask, EnumTimestampMode } from "../logic/esbuild.ts";

const builder = ClassEsbuildManager.ES__INIT();
builder.task = EnumTask.WASM_MJS;
await builder.runBuild();
builder.ES__STOP();
