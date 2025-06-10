/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */

import { JSX } from "$tsx-preact";
export type CustomCSSProperties = JSX.CSSProperties & {
  [key: `--${string}`]: string | number;
};
