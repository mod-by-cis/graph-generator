/**
 * @file ./tasks/docs-serve.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T13:02:17.500Z
 * @description Server deweloperski.
 */
import { serveDir } from "$deno-http/file-server";
import { fromFileUrl, join, relative  } from "$deno-path";


const rootPath = fromFileUrl(new URL("../", import.meta.url));
const docsPath = `${rootPath}docs`;
const devPath = join(docsPath, "dev");
const lastBuildPath = join(docsPath, "gen", "lastBuild.txt");

// --- Konfiguracja Live Reload ---
const clients = new Set<WebSocket>();

// Zmienna, która śledzi, czy oczekujemy na przebudowanie projektu
let isDevChangePending = false;

// Ta funkcja nie wymaga ŻADNYCH dodatkowych importów.
async function watchForChanges() {
  console.log(`👀 Obserwator plików uruchomiony w '${docsPath}'`);
  const watcher = Deno.watchFs(docsPath);

  for await (const event of watcher) {    
    // Sprawdzamy, czy którykolwiek ze zmienionych plików pasuje do naszej logiki
    let shouldReload = false;
    //let buildCompleted = false;

    for (const path of event.paths) {
      // 1. Zmiana w plikach deweloperskich (`/docs/dev/`)
      if (path.startsWith(devPath)) {
        isDevChangePending = true;
        console.log(`📝 Zmiana w plikach deweloperskich. Oczekiwanie na 'deno task gen'...`);
        continue;
      }

      // 2. Zmiana w pliku `lastBuild.txt`
      if (path === lastBuildPath) {
        if (isDevChangePending) {
          console.log(`✅ Build zakończony. Odświeżam stronę...`);
          isDevChangePending = false;
          shouldReload = true;
          break;
        }
        continue;
      }

      // 3. Zmiana w jakimkolwiek innym pliku (np. CSS, HTML, JSON)
      const relativePath = relative(docsPath, path);
      if (!relativePath.startsWith("dev") && !relativePath.startsWith("gen")) {
        console.log(`🔄 Zmiana w pliku statycznym: ${relativePath}. Odświeżam...`);
        shouldReload = true;
        break;
      }
    }
    // Po sprawdzeniu wszystkich ścieżek, decydujemy, czy wysłać sygnał
    if (shouldReload) {
      for (const socket of clients) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("reload");
        }
      }
    }

    /*
    if (event.kind === "modify" || event.kind === "create" || event.kind === "remove") {
      console.log(` Zmiany w plikach: ${event.paths.join(', ')}. Odświeżam...`);
      // Wyślij sygnał "reload" do wszystkich podłączonych klientów
      for (const socket of clients) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("reload");
        }
      }
    }
    */
  }
}
watchForChanges().catch(err => console.error("Błąd obserwatora:", err));
// ---------------------------------

Deno.serve({ port: 8008 }, async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // 1. Specjalny endpoint dla WebSocket
  if (pathname === "/__live_reload_ws") {
    if (req.headers.get("upgrade") !== "websocket") {
      return new Response("Expected websocket upgrade", { status: 426 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);
    socket.onopen = () => clients.add(socket);
    socket.onclose = () => clients.delete(socket);
    socket.onerror = (e) => console.error("Błąd WebSocket:", e);
    return response;
  }

  // 2. Serwowanie plików statycznych  
  const response = await serveDir(req, {
    fsRoot: docsPath,
    quiet: true,
  });

  console.log(`[${req.method}] ${pathname} - ${response.status}`);

  // 3. Wstrzyknięcie skryptu Live Reload do plików HTML
  if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
    const originalHtml = await response.text();
    const modifiedHtml = originalHtml.replace(
      "</body>",
      `  <script>
        const socket = new WebSocket(\`ws://\${window.location.host}/__live_reload_ws\`);
        socket.addEventListener('message', (event) => {
          if (event.data === 'reload') {
            console.log('🔄 Otrzymano sygnał odświeżenia z serwera...');
            window.location.reload();
          }
        });
        socket.addEventListener('close', () => console.warn('Połączenie Live Reload zerwane.'));
      </script>
    </body>`
    );

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    headers.delete("content-length");

    return new Response(modifiedHtml, { status: response.status, headers });
  }

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  return new Response(response.body, { status: response.status, headers });
});

console.log("🚀 Serwer deweloperski uruchomiony na http://localhost:8008");
