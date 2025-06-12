/**
 * @file ./docs/dev/core/state-dot-current.ts
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T17:39:06.041Z+02:00
 * @description Współdzielony stan dla aktualnie edytowanego kodu w języku DOT.
 */

import { signal } from "$tsx-preact-signal";

/**
 * Sygnał przechowujący aktualną treść kodu DOT jako string.
 * Komponenty mogą subskrybować ten sygnał, aby reagować na jego zmiany.
 *
 * Przykład użycia w komponencie:
 * import { dotContentSignal } from "./state-dot-current.ts";
 *
 * function MyComponent() {
 * const currentDotCode = dotContentSignal.value;
 * // ...
 * }
 */
export const dotContentSignal = signal<string>(`
digraph Hypergraph {
  rankdir=LR;
  node [shape=circle];

  // Węzły
  A; B; C; D; E;

  // Hiperkrawędź z A, B → D
  edge [arrowhead=none];
  H1 [label="", shape=point, width=0.1]; // Węzeł pomocniczy
  A -> H1;
  B -> H1;
  edge [arrowhead=normal];
  H1 -> D;

  // Hiperkrawędź z C, D → E
  edge [arrowhead=none];
  H2 [label="", shape=point, width=0.1];
  C -> H2;
  D -> H2;
  edge [arrowhead=normal];
  H2 -> E;
}
`);

/**
 * Funkcja pomocnicza do jawnej aktualizacji sygnału.
 * @param newContent Nowa treść kodu DOT do zapisania w stanie.
 */
export function updateDotContent(newContent: string): void {
  dotContentSignal.value = newContent;
}
