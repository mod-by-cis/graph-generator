/**
 * @file ./tasks/utils/wasm-loader.ts
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-12T18:55:46.897Z+02:00
 * @description Ten plik importuje ciężką bibliotekę Graphviz,
 * aby można było ją zbudować jako osobny, niezależny plik.
 */
import { Graphviz } from "$hpcc-graphviz";

// Ustawiamy Graphviz jako globalną zmienną, aby był dostępny
// dla naszego głównego kodu aplikacji.
(window as any).Graphviz = Graphviz;
