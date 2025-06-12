/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { ComponentChildren, VNode } from "$tsx-preact";

// Definicja propsów. Każde pole musi mieć tytuł.
type AccordionFieldProps = {
  title: string;
  viewID: number;
  children: ComponentChildren;
};

/**
 * Komponent reprezentujący pojedynczy panel (pole) w akordeonie.
 * Jego jedynym zadaniem jest przechowywanie `title` i `children`.
 * Nie renderuje niczego bezpośrednio - jest tylko nośnikiem danych dla rodzica.
 */
function AccordionField(
  { children }: AccordionFieldProps,
): VNode | null {
  // Zwracamy dzieci wewnątrz fragmentu. Rodzic <AccordionFields>
  // odczyta propsy i zdecyduje, co z tym zrobić.
  return <>{children}</>;
}

export type { AccordionFieldProps };
export { AccordionField };
