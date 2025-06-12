/**
 * @file ./docs/dev/style/types.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T13:16:36.109Z+02:00
 * @description typy dla dynamicznego css.
 */

import { JSX } from "$tsx-preact";
export type CustomCSSProperties = JSX.CSSProperties & {
  [key: `--${string}`]: string | number;
};
