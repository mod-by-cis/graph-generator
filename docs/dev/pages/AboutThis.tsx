/**
 * @file ./docs/dev/pages/AboutThis.tsx
 * @author https://github.com/j-Cis
 *
 * @lastmodified 2025-06-13T21:15:00.000Z
 * @description Komponent strony "O Aplikacji" z sekcjami językowymi.
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
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- POPRAWIONA LOGIKA PRZYCISKU ---
  const handleShowExample = () => {
    const anchor = "graph-sections";
    const stateSignal = getAccordionState(anchor);
    if (stateSignal) {
      // Pobieramy aktualny stan, aby mieć dostęp do listy tytułów
      const currentState = stateSignal.peek();
      
      // Znajdujemy tytuły na podstawie ich pozycji (indeksu),
      // która odpowiada `viewID` zdefiniowanemu w `main.tsx`.
      // To jest klucz do niezawodnego działania.
      const title1 = currentState.fieldTitles[3]; // Tytuł dla panelu o viewID=3
      const title2 = currentState.fieldTitles[4]; // Tytuł dla panelu o viewID=4

      // Jeśli udało się znaleźć oba tytuły, aktualizujemy stan
      if (title1 && title2) {
        stateSignal.value = {
          ...currentState,
          mode: 'split',
          arrow: 'COL',
          ratio: '3:2',
          visiblePanels: [title1, title2],
          // Opcjonalnie: zamykamy panel "O Aplikacji", aby pokazać przykład
          // isOpen: false 
        };
      } else {
        console.error("Błąd: Nie można znaleźć paneli o viewID 3 i 4. Sprawdź, czy są one zdefiniowane w main.tsx.");
      }
    } else {
      console.warn(`[AboutThis] Nie znaleziono stanu dla kotwicy: ${anchor}`);
    }
  };
  
  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install outcome: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  const englishFlags = ["🇬🇧", "🇺🇸", "🇨🇦", "🇦🇺", "🇪🇺", "🇳🇿", "🇮🇪"];

  return (
    <div class="about-this-wrapper">
      {/* --- Sekcja Polska --- */}
      <InfoSection title="byCis/GraphGen" flags={["🇵🇱"]}>
        <p>
          Pozwólcie, Waćpaństwo, że przedstawię niniejsze instrumentarium. Aplikacja ta, zrodzona z miłości do porządku i klarowności, służy do kreacji wizualizacji z dynamicznie pisanego kodu w języku DOT.
        </p>
        
        <h4>Aplikacja Progresywna (PWA)</h4>
        <p>
          Aplikacja ta z najnowszymi prawidłami sztuki jest zgodna i jako Aplikacja Progresywna (PWA) działać może. Oznacza to, iż po dodaniu jej do pulpitu Państwa urządzenia, będzie ona dostępna jeno jednym kliknięciem, bez potrzeby otwierania przeglądarki, takoż i bez dostępu do sieci. Aby tego dokonać, proszę wybrać w menu przeglądarki opcję <strong>"Zainstaluj aplikację"</strong> lub <strong>"Dodaj do ekranu głównego"</strong>.
        </p>
        {deferredPrompt && (
          <button class="pwa-install-button" onClick={handlePwaInstall}>Zainstaluj Aplikację</button>
        )}

        <h4>Nawigacja i Obsługa</h4>
        <p>
          W prawym dolnym rogu ekranu znajdziecie, Mości Państwo, klawisz (☰), który jest pilotem do zarządzania widocznymi panelami. Stan informacji wprowadzonych w każdym z nich jest pieczołowicie przechowywany. Tedy, przełączanie widoków nie skutkuje utratą Państwa cennej pracy.
        </p>
        <button class="example-button" onClick={handleShowExample}>Pokaż przykład użycia</button>

        <h4>Informacje i Kontakt</h4>
        <ul class="links-list">
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator" target="_blank" rel="noopener noreferrer">Repozytorium Projektu</a></li>
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator/issues" target="_blank" rel="noopener noreferrer">Zgłaszanie błędów</a></li>
          <li>🔗 <a href="https://m.facebook.com/story.php?story_fbid=pfbid0Hg67PK6XYQD1wL5Tx6iM2wJEQVcWZF5K4JDaezVqDzGM96P5jRYkeuLMRNc7cEs1l&id=61572384113191" target="_blank" rel="noopener noreferrer">Podziel się opinią</a></li>
          <li>🔗 <a href="https://mod-by-cis.github.io/graph-generator/" target="_blank" rel="noopener noreferrer">Adres aplikacji</a></li>
        </ul>
        
        <p class="note-section">
          Sekcje "o Dot.." oraz "o grafach.." pozostają na ten moment puste, czekając na sposobny czas i natchnienie autora.
        </p>
      </InfoSection>

      {/* --- Sekcja Angielska --- */}
      <InfoSection title="byCis/GraphGen" flags={englishFlags}>
        <p>
          <strong>Graph Generator</strong> is an interactive tool for data visualization. It allows for easy creation, editing, and rendering of graphs using the DOT language.
        </p>
        
        <h4>Progressive Web App (PWA)</h4>
        <p>
          This app is PWA-compliant. After adding it to your home screen, it will be available with a single tap, offline, and without the browser UI. To do this, please select **"Install app"** or **"Add to Home Screen"** from your browser's menu.
        </p>
        {deferredPrompt && (
          <button class="pwa-install-button" onClick={handlePwaInstall}>Install App</button>
        )}

        <h4>Navigation and Usage</h4>
        <p>
          In the bottom-right corner, you will find a button (☰) that serves as a remote for managing the visible panels. The state of each panel is preserved, so switching views will not result in any loss of your work.
        </p>
        <button class="example-button" onClick={handleShowExample}>Show Example</button>

        <h4>Information & Contact</h4>
        <ul class="links-list">
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator" target="_blank" rel="noopener noreferrer">Project Repository</a></li>
          <li>🔗 <a href="https://github.com/mod-by-cis/graph-generator/issues" target="_blank" rel="noopener noreferrer">Report Bugs</a></li>
          <li>🔗 <a href="https://m.facebook.com/story.php?story_fbid=pfbid0Hg67PK6XYQD1wL5Tx6iM2wJEQVcWZF5K4JDaezVqDzGM96P5jRYkeuLMRNc7cEs1l&id=61572384113191" target="_blank" rel="noopener noreferrer">Share Feedback</a></li>
          <li>🔗 <a href="https://mod-by-cis.github.io/graph-generator/" target="_blank" rel="noopener noreferrer">Application Address</a></li>
        </ul>
        
        <p class="note-section">
          The "About Dot.." and "About Graphs.." sections are currently empty.
        </p>
      </InfoSection>
    </div>
  );
}
