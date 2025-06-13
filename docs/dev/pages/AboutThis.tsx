/**
 * @file ./docs/dev/pages/AboutThis.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-13T23:36:31.401Z+02:00
 * @description Komponentem sekcji tematycznej AboutThis.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */

import { VNode } from "$tsx-preact";
import { useState, useEffect } from "$tsx-preact/hooks";
import { getAccordionState } from "../core/state-accordion.ts";

// --- Komponenty Pomocnicze dla Czystości Kodu ---

const FlagIcon = ({ flag }: { flag: string }) => (
  <span class="about-this-flag-icon" role="presentation">{flag}</span>
);

const InfoSection = ({ title, flags, children }: { title: string, flags: string[], children: VNode }) => (
  <section class="about-this-section">
    <header class="about-this-header">
      <div class="flag-container">
        {flags.map(flag => <FlagIcon key={flag} flag={flag} />)}
      </div>
      <h1>{title}</h1>
    </header>
    <div class="about-this-content">
      {children}
    </div>
  </section>
);

// --- Główny Komponent Strony ---

export default function PageAboutThis(): VNode {
  // Stan do zarządzania promptem instalacji PWA
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      // Zapobiegaj wyświetleniu domyślnego monitu przez przeglądarkę
      e.preventDefault();
      // Zapisz zdarzenie, aby można było je wywołać później
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Funkcja wywoływana przez przycisk "Przykład"
  const handleShowExample = () => {
    const anchor = "graph-sections";
    const state = getAccordionState(anchor);
    if (state) {
      state.value = {
        ...state.value,
        mode: 'split',
        arrow: 'COL',
        ratio: '3:2',
        // Używamy tytułów, które są zdefiniowane w main.tsx
        visiblePanels: ['Pisz..', 'Zobacz..'],
      };
    } else {
      console.warn(`[AboutThis] Nie znaleziono stanu dla kotwicy: ${anchor}`);
    }
  };
  
  // Funkcja wywoływana przez przycisk "Dodaj do urządzenia"
  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      // Pokaż monit instalacji
      deferredPrompt.prompt();
      // Czekaj na decyzję użytkownika
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      // Wyczyść zapisane zdarzenie
      setDeferredPrompt(null);
    }
  };

  const englishFlags = ["🇬🇧", "🇺🇸", "🇨🇦", "🇦🇺", "🇪🇺", "🇳🇿", "🇮🇪"];

  return (
    <div class="about-this-wrapper">
      {/* --- Sekcja Polska --- */}
      <InfoSection title="byCis/GraphGen" flags={["🇵🇱"]}>
        <p>
          Pozwólcie, Waćpaństwo, że przedstawię niniejsze instrumentarium. Aplikacja ta, zrodzona z miłości do porządku i klarowności, służy do kreacji wizualizacji z dynamicznie pisanego kodu w języku DOT. Jest to kunszt, który pozwala idee ulotne w konkretny i zrozumiały obraz przyoblec.
        </p>
        
        <h4>Aplikacja Progresywna (PWA)</h4>
        <p>
          Baczyć należy, iż aplikacja ta z najnowszymi prawidłami sztuki jest zgodna i jako Aplikacja Progresywna (PWA) działać może. Oznacza to, iż po dodaniu jej do pulpitu Państwa urządzenia, będzie ona dostępna jeno jednym kliknięciem, bez potrzeby otwierania przeglądarki, takoż i bez dostępu do sieci.
        </p>
        <p>
          Aby tego dokonać, proszę wybrać w menu przeglądarki (zwykle pod trzema kropkami) opcję <strong>"Zainstaluj aplikację"</strong> lub <strong>"Dodaj do ekranu głównego"</strong>.
        </p>
        {deferredPrompt && (
          <button class="pwa-install-button" onClick={handlePwaInstall}>Zainstaluj Aplikację na Urządzeniu</button>
        )}

        <h4>Nawigacja i Obsługa</h4>
        <p>
          W prawym dolnym rogu ekranu znajdziecie, Mości Państwo, klawisz (☰), który jest pilotem do zarządzania widocznymi panelami. Stan informacji wprowadzonych w każdym z nich jest pieczołowicie przechowywany. Tedy, przełączanie widoków nie skutkuje utratą Państwa cennej pracy.
        </p>
        <button class="example-button" onClick={handleShowExample}>Pokaż przykład użycia</button>

        <h4>Informacje i Kontakt</h4>
        <ul class="links-list">
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator" target="_blank" rel="noopener noreferrer">Repozytorium Projektu na GitHubie</a></li>
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator/issues" target="_blank" rel="noopener noreferrer">Zgłaszanie błędów i propozycji (Issues)</a></li>
          <li>🔗 <a href="https://m.facebook.com/story.php?story_fbid=pfbid0Hg67PK6XYQD1wL5Tx6iM2wJEQVcWZF5K4JDaezVqDzGM96P5jRYkeuLMRNc7cEs1l&id=61572384113191" target="_blank" rel="noopener noreferrer">Podziel się opinią na Facebooku</a></li>
          <li>🔗 <a href="https://mod-by-cis.github.io/graph-generator/" target="_blank" rel="noopener noreferrer">Adres aplikacji</a></li>
        </ul>
        
        <p class="note-section">
          Sekcje "o Dot.." oraz "o grafach.." pozostają na ten moment puste, czekając na sposobny czas i natchnienie autora.
        </p>
      </InfoSection>

      {/* --- Sekcja Angielska --- */}
      <InfoSection title="byCis/GraphGen" flags={englishFlags}>
        <p>
          <strong>Graph Generator</strong> is an interactive tool created from a passion for data visualization. Its primary purpose is to enable the easy and rapid creation, editing, and rendering of graphs using the DOT language from Graphviz.
        </p>
        
        <h4>Progressive Web App (PWA)</h4>
        <p>
          This application is PWA-compliant. This means that after adding it to your device's home screen, it will be available with a single tap, without the need to open a browser, and will also work offline.
        </p>
        <p>
          To do this, please select **"Install app"** or **"Add to Home Screen"** from your browser's menu (usually under the three dots).
        </p>
        {deferredPrompt && (
          <button class="pwa-install-button" onClick={handlePwaInstall}>Install App on Your Device</button>
        )}

        <h4>Navigation and Usage</h4>
        <p>
          In the bottom-right corner of the screen, you will find a button (☰) that serves as a remote for managing the visible panels. The state of information entered in each panel is carefully preserved, so switching views will not result in the loss of your valuable work.
        </p>
        <button class="example-button" onClick={handleShowExample}>Show Example Usage</button>

        <h4>Information & Contact</h4>
        <ul class="links-list">
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator" target="_blank" rel="noopener noreferrer">Project Repository on GitHub</a></li>
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator/issues" target="_blank" rel="noopener noreferrer">Report Bugs and Suggest Features (Issues)</a></li>
          <li>🔗 <a href="https://m.facebook.com/story.php?story_fbid=pfbid0Hg67PK6XYQD1wL5Tx6iM2wJEQVcWZF5K4JDaezVqDzGM96P5jRYkeuLMRNc7cEs1l&id=61572384113191" target="_blank" rel="noopener noreferrer">Share Your Feedback on Facebook</a></li>
          <li>🔗 <a href="https://mod-by-cis.github.io/graph-generator/" target="_blank" rel="noopener noreferrer">Application Address</a></li>
        </ul>
        
        <p class="note-section">
          The "About Dot.." and "About Graphs.." sections are currently empty and will be filled when the author finds the time and inspiration.
        </p>
      </InfoSection>
    </div>
  );
}
