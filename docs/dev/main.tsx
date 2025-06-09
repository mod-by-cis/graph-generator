/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { render } from "$tsx-preact";
import { PageStart } from "./page/start.tsx";

// Bezpieczny montaż aplikacji
const rootElement = document.getElementById("root");

if (rootElement) {
  render(<PageStart />, rootElement);
} else {
  console.error(
    'Nie znaleziono elementu startowego #root. Upewnij się, że w pliku HTML istnieje element <div id="root"></div>.',
  );
}
