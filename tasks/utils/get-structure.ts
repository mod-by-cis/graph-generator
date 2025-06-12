/**
 * @file ./tasks/utils/get-structure.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T13:56:38.962Z+02:00
 * @description Pomocnicze, wyświetla strukture projektu.
 */

import {
  StructurePaths,
  type StructurePathsOptions,
} from"$byCIS-read-structure-dir";

const AA: StructurePathsOptions = {
  includeDirs: true,
  skip: [
    /\.git(\/|\\)?/,
    /\temp(\/|\\)?/,
  ],
};
const A = new StructurePaths(AA);
await A.pathsGET();
A.logPLOT();
