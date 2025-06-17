/**
 * @file ./code/app/core/state-accordion.ts
 * @author https://github.com/j-Cis
 * 
 * @lastmodified 2025-06-12T13:19:01.961Z+02:00
 * @description kontrolowanie stanu związane z komponentem AccordionFields.
 */

import { signal, Signal } from "$tsx-preact-signal";

// --- Definicja Struktury Stanu ---

/**
 * Definiuje, jak wygląda obiekt stanu dla pojedynczej instancji
 * komponentu AccordionFields.
 */
export interface AccordionState {
  // Czy cały interfejs pilota jest otwarty? Wracamy do tego prostego stanu.
  isOpen: boolean;
  // Który widok jest aktywny WEWNĄTRZ otwartego panelu?
  activePanel: 'main' | 'ratio';
  // Lista tytułów wszystkich dostępnych pól (paneli).
  // To jest kluczowe, aby pilot wiedział, jakie przyciski wyświetlić.
  fieldTitles: string[];
  // W jakim trybie jest akordeon: 'single' (jeden panel) czy 'split' (dwa panele).
  mode: 'single' | 'split';
  // Który etap wyboru w trybie split jest aktywny.
  splitStep: 'idle' | 'selecting_second' | 'selecting_ratio';
  // Tablica z tytułami widocznych paneli.
  // np. ['a1', null] dla trybu single, ['a1', 'a2'] dla trybu split.
  visiblePanels: [string | null, string | null];
  // Stosunek podziału w trybie split, np. '1:1'.
  ratio: string;
  arrow: "ROW" | "COL"
}

// --- Globalny Magazyn Stanu ---

/**
 * Główny, globalny magazyn przechowujący stany wszystkich akordeonów na stronie.
 * Używamy Map, gdzie kluczem jest unikalny `anchorTag` (np. "aa77"),
 * a wartością jest sygnał (Signal) zawierający obiekt stanu dla tego akordeonu.
 * * Dlaczego `Signal<Map<...>>`? Aby komponenty mogły reagować na dodawanie
 * lub usuwanie całych instancji akordeonów.
 */
const accordionStore = signal(new Map<string, Signal<AccordionState>>());

// Definiujemy typ dla pól przekazywanych do funkcji rejestrującej
type FieldData = {
  title: string;
  viewID: number;
};

// --- Funkcje Pomocnicze (Publiczne API Naszego Magazynu) ---

/**
 * Rejestruje nową instancję akordeonu w globalnym magazynie.
 * Komponent <AccordionFields> wywoła tę funkcję, gdy zostanie zamontowany.
 * @param anchorTag Unikalny identyfikator dla pary Kontroler-Akordeon.
 * @param titles Tablica z tytułami wszystkich pól-dzieci, które przekazał użytkownik.
 */
function registerAccordion(
  anchorTag: string, 
  fields: FieldData[], 
  initialArrow: "ROW" | "COL",
  firstViewID: [number] | [number, number] | undefined
): void {
  // Sprawdzamy, czy instancja o tym anchorTag już nie istnieje
  if (accordionStore.value.has(anchorTag) || fields.length === 0) {
    console.log(`AccordionFields with anchorTag "${anchorTag}" is already registered.`);
    return;
  }
  let initialMode: 'single' | 'split' = 'single';
  let initialVisiblePanels: [string | null, string | null] = [fields[0].title, null];

  // Logika ustawiania stanu na podstawie `firstViewID`
  if (firstViewID) {
    if (firstViewID.length === 2) { // Tryb dzielony
      const panel1 = fields.find(f => f.viewID === firstViewID[0]);
      const panel2 = fields.find(f => f.viewID === firstViewID[1]);
      if (panel1 && panel2) {
        initialMode = 'split';
        initialVisiblePanels = [panel1.title, panel2.title];
      }
    } else if (firstViewID.length === 1) { // Tryb pojedynczy
      const panel = fields.find(f => f.viewID === firstViewID[0]);
      if (panel) {
        initialMode = 'single';
        initialVisiblePanels = [panel.title, null];
      }
    }
  }

  // Tworzymy sygnał z domyślnym, początkowym stanem dla tego akordeonu.
  const initialState: AccordionState = {
    isOpen: false,
    activePanel: 'main', // Domyślnie pokazujemy główny widok
    fieldTitles: fields.map(f => f.title), // Wyciągamy same tytuły // Pilot od razu wie, jakie ma panele!
    mode: initialMode,
    splitStep: 'idle', // Domyślny stan etapu
    visiblePanels: initialVisiblePanels,
    ratio: '1:1',
    arrow: initialArrow, // Ustawiamy początkowy kierunek
  };

  const newStateSignal = signal(initialState);

  // Aktualizujemy globalną mapę, dodając nowy wpis.
  // Używamy spread (...) aby stworzyć nową mapę, co jest wymagane przez Signals
  // do wykrycia zmiany i poinformowania subskrybentów.
  accordionStore.value = new Map([...accordionStore.value, [anchorTag, newStateSignal]]);
}

/**
 * Wyrejestrowuje instancję akordeonu z globalnego magazynu.
 * Komponent <AccordionFields> wywoła tę funkcję, gdy zostanie odmontowany.
 * @param anchorTag Identyfikator akordeonu do usunięcia.
 */
function unregisterAccordion(anchorTag: string): void {
  const newStore = new Map(accordionStore.value);
  if (newStore.delete(anchorTag)) {
    accordionStore.value = newStore;
  }
}

/**
 * Zwraca sygnał stanu dla konkretnej instancji akordeonu.
 * Zarówno <AccordionFields> jak i <AccordionFieldsPilot> użyją tej funkcji,
 * aby uzyskać dostęp do swojego stanu i móc na niego reagować.
 * @param anchorTag Identyfikator akordeonu.
 * @returns Sygnał (Signal) ze stanem lub `undefined`, jeśli nie znaleziono.
 */
function getAccordionState(anchorTag: string): Signal<AccordionState> | undefined {
  return accordionStore.value.get(anchorTag);
}


export {
  registerAccordion,
  unregisterAccordion,
  getAccordionState
};
