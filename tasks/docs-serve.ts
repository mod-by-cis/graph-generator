/**
 * @file ./tasks/docs-serve.ts
 * @author https://github.com/j-Cis
 * @description Uruchamia serwer deweloperski.
 */
import ClassDevServer from "../logic/dev-serve.ts";

// Inicjalizuj i uruchom serwer na domyślnym porcie 8008
const server = ClassDevServer.INIT(8008);
await server.start();
