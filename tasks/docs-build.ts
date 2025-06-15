/**
 * @file ./tasks/docs-build.ts
 * @author https://github.com/j-Cis * 
 * * @lastmodified 2025-06-15T18:11:32.178Z+02:00
 * @description Budowanie wydania.
 */

import ClassEsbuildManager, { EnumTask, EnumTimestampMode } from "../logic/esbuild.ts";

const builder = ClassEsbuildManager.ES__INIT();

builder.task = EnumTask.MAIN_MJS;
await builder.runBuild();
builder.task = EnumTask.MAIN_CSS;
await builder.runBuild();

builder.ES__STOP();
