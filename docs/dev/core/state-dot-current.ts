/**
 * @file ./docs/dev/core/state-dot-current.ts
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T15:14:08.694Z+02:00
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
export const dotContentSignal = signal<string>("graph G {\n  \n}");

/**
 * Funkcja pomocnicza do jawnej aktualizacji sygnału.
 * @param newContent Nowa treść kodu DOT do zapisania w stanie.
 */
export function updateDotContent(newContent: string): void {
  dotContentSignal.value = newContent;
}
