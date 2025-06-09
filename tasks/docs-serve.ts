import { serveDir } from "$deno-http/file-server";
import { fromFileUrl } from "$deno-path/from-file-url";


const rootPath = fromFileUrl(new URL("../", import.meta.url));
const docsPath = `${rootPath}docs`;
// --- Konfiguracja Live Reload ---
const clients = new Set<WebSocket>();

// Ta funkcja nie wymaga ŻADNYCH dodatkowych importów.
async function watchForChanges() {
  console.log(`👀 Obserwator plików uruchomiony w '${docsPath}'`);
  const watcher = Deno.watchFs(docsPath);
  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create" || event.kind === "remove") {
      console.log(` Zmiany w plikach: ${event.paths.join(', ')}. Odświeżam...`);
      // Wyślij sygnał "reload" do wszystkich podłączonych klientów
      for (const socket of clients) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("reload");
        }
      }
    }
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
