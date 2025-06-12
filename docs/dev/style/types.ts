/**
 * @file ./docs/dev/style/types.ts
 * @author https://github.com/j-Cis
 * @version 0.0.1
 * @lastmodified 2025-06-12T13:16:36.109Z
 * @description typy dla dynamicznego css.
 */

import { JSX } from "$tsx-preact";
export type CustomCSSProperties = JSX.CSSProperties & {
  [key: `--${string}`]: string | number;
};
