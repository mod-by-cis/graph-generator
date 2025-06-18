/**
 * @file ./logic/dev-serve.ts
 * @author https://github.com/j-Cis
 * @description Klasa zarządzająca serwerem deweloperskim z Live Reload.
 */
import { serveDir } from "$deno-http/file-server";
import { fromFileUrl, join, relative } from "$deno-path";
import logBox,{type logBoxColorOptions, type logBoxStyleOptions} from "../utils/logBox.ts";

const sH1:logBoxColorOptions = {color:0xC0BD94, bgColor:0x5D5730,boxColor:0x403C21};
const sH2:logBoxColorOptions = {color:0x94C0C0, bgColor:0x30535D,boxColor:0x213940};
const sH3:logBoxColorOptions = {color:  0xAC94C0, bgColor:0x53305D,boxColor:0x352140};
const sH4:logBoxColorOptions = {color:  0xC09494, bgColor:0x5D3030,boxColor:0x402121};
const sT1:logBoxStyleOptions = {bold:true};


// Definiujemy Enum dla obserwowanych celów budowania, aby kod był czytelny
export enum BuildTarget {
  MAIN_MJS,
  WASM_MJS,
  MAIN_CSS,
}

export default class ClassDevServer {
  static #instance: ClassDevServer | null = null;
  
  readonly #pathRoot: string;
  readonly #pathDocs: string;
  readonly #pathCode: string;

  // Mapa przechowująca flagi oczekiwania na poszczególne buildy
  #pendingBuilds = new Map<BuildTarget, boolean>([
    [BuildTarget.MAIN_MJS, false],
    [BuildTarget.WASM_MJS, false],
    [BuildTarget.MAIN_CSS, false],
  ]);
  
  #clients = new Set<WebSocket>();

  private constructor(private port = 8008) {
    this.#pathRoot = fromFileUrl(new URL("../../", import.meta.url));
    logBox(`#pathRoot:${this.#pathRoot}`,sH4);
    this.#pathDocs = join(this.#pathRoot, "docs");
    this.#pathCode = join(this.#pathRoot, "code");
  }

  public static INIT(port?: number): ClassDevServer {
    if (this.#instance === null) {
      this.#instance = new ClassDevServer(port);
    }
    return this.#instance;
  }
  
  /**
   * Uruchamia serwer i obserwatora plików.
   */
  public async start(): Promise<void> {
    this.#watchForChanges().catch(err => console.error("🔥 Błąd krytyczny obserwatora plików:", err));
    
    console.log(`🚀 Serwer deweloperski uruchomiony na http://localhost:${this.port}`);
    console.log(`📂 Serwuje pliki z folderu: ${this.#pathDocs}`);
    
    await Deno.serve({ port: this.port }, (req) => this.#handleRequest(req));
  }

  /**
   * Odczytuje znacznik czasu dla konkretnego celu budowania.
   * @param target Cel budowania (np. BuildTarget.MAIN_MJS)
   * @returns Data ostatniego budowania jako string, lub null.
   */
  public async getTimestampFor(target: BuildTarget): Promise<string | null> {
    const baseFilename = this.#getBuildTargetFilename(target);
    if (!baseFilename) return null;

    const timestampPath = join(this.#pathDocs, "gen", `${baseFilename}.lastBuild.txt`);
    try {
      const timestamp = await Deno.readTextFile(timestampPath);
      return timestamp.trim();
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) return null;
      console.error(`❌ Błąd odczytu znacznika czasu dla ${baseFilename}:`, error);
      return null;
    }
  }

  // Prywatna metoda pomocnicza do mapowania enum na nazwę pliku
  #getBuildTargetFilename(target: BuildTarget): string | null {
    switch (target) {
      case BuildTarget.MAIN_MJS: return "main.mjs";
      case BuildTarget.WASM_MJS: return "wasm-dot.mjs";
      case BuildTarget.MAIN_CSS: return "main.css";
      default: return null;
    }
  }
  
  /**
   * Główna pętla obserwująca zmiany w plikach projektu.
   */
  async #watchForChanges(): Promise<void> {
    // --- POPRAWIONY KOMUNIKAT ---
    console.log(`👀 Obserwator plików uruchomiony. Reakcja na zmiany w folderach 'code' i 'docs'...`);
    const watcher = Deno.watchFs(this.#pathRoot);

    for await (const event of watcher) {
      let shouldReload = false;

      for (const path of event.paths) {
        // Zmiana w kodzie źródłowym aplikacji
        if (path.startsWith(join(this.#pathCode, "app"))) {
          this.#pendingBuilds.set(BuildTarget.MAIN_MJS, true);
          this.#pendingBuilds.set(BuildTarget.MAIN_CSS, true);
          console.log(`📝 Zmiana w kodzie aplikacji. Oczekiwanie na przebudowanie...`);
          continue;
        }
        
        // Zmiana w kodzie WASM
        if (path.startsWith(join(this.#pathCode, "lib", "wasm"))) {
            this.#pendingBuilds.set(BuildTarget.WASM_MJS, true);
            console.log(`📝 Zmiana w loaderze WASM. Oczekiwanie na przebudowanie...`);
            continue;
        }

        // Zmiana w plikach `lastBuild.txt`
        if (path.endsWith("lastBuild.txt")) {
          if (path.includes("main.mjs") && this.#pendingBuilds.get(BuildTarget.MAIN_MJS)) {
            console.log(`✅ Build MAIN_MJS zakończony. Odświeżam...`);
            this.#pendingBuilds.set(BuildTarget.MAIN_MJS, false);
            shouldReload = true;
          } else if (path.includes("wasm-dot.mjs") && this.#pendingBuilds.get(BuildTarget.WASM_MJS)) {
            console.log(`✅ Build WASM_MJS zakończony. Odświeżam...`);
            this.#pendingBuilds.set(BuildTarget.WASM_MJS, false);
            shouldReload = true;
          } else if (path.includes("main.css") && this.#pendingBuilds.get(BuildTarget.MAIN_CSS)) {
            console.log(`✅ Build MAIN_CSS zakończony. Odświeżam...`);
            this.#pendingBuilds.set(BuildTarget.MAIN_CSS, false);
            shouldReload = true;
          }
        }
        
        // Zmiana w plikach statycznych (np. HTML, ikony)
        if (path.startsWith(this.#pathDocs) && !path.startsWith(join(this.#pathDocs, "gen"))) {
          const relativePath = relative(this.#pathDocs, path);
          console.log(`🔄 Zmiana w pliku statycznym: ${relativePath}. Odświeżam...`);
          shouldReload = true;
        }
      }

      if (shouldReload) {
        this.#broadcastReload();
      }
    }
  }
  
  /**
   * Wysyła sygnał "reload" do wszystkich podłączonych klientów WebSocket.
   */
  #broadcastReload(): void {
    for (const socket of this.#clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("reload");
      }
    }
  }

  /**
   * Obsługuje pojedyncze żądanie HTTP przychodzące do serwera.
   */
  async #handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    // Endpoint dla WebSocket (Live Reload)
    if (pathname === "/__live_reload_ws") {
      if (req.headers.get("upgrade") !== "websocket") {
        return new Response("Expected websocket upgrade", { status: 426 });
      }
      const { socket, response } = Deno.upgradeWebSocket(req);
      socket.onopen = () => this.#clients.add(socket);
      socket.onclose = () => this.#clients.delete(socket);
      socket.onerror = (e) => console.error("Błąd WebSocket:", e);
      return response;
    }

    // Serwowanie plików statycznych
    const response = await serveDir(req, {
      fsRoot: this.#pathDocs,
      quiet: true,
    });
    console.log(`[${req.method}] ${pathname} - ${response.status}`);

    // Wstrzyknięcie skryptu Live Reload do plików HTML
    if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
      const originalHtml = await response.text();
      const modifiedHtml = originalHtml.replace("</body>", this.#liveReloadScript + "</body>");
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store");
      headers.delete("content-length");
      return new Response(modifiedHtml, { status: response.status, headers });
    }

    // Dla innych plików, tylko dodaj nagłówki cache
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, headers });
  }

  // Prywatne pole ze skryptem do wstrzyknięcia
  readonly #liveReloadScript = `
  <script>
    const socket = new WebSocket(\`ws://\${window.location.host}/__live_reload_ws\`);
    socket.addEventListener('message', (event) => {
      if (event.data === 'reload') {
        console.log('🔄 Otrzymano sygnał odświeżenia z serwera...');
        window.location.reload();
      }
    });
    socket.addEventListener('close', () => console.warn('Połączenie Live Reload zerwane.'));
  </script>`;
}
