/** @jsxRuntime automatic */
/** @jsxImportSource $tsx-preact */
import { ComponentChildren, VNode } from "$tsx-preact";

// Definicja propsów. Każde pole musi mieć tytuł.
export type AccordionFieldProps = {
  title: string;
  children: ComponentChildren;
};

/**
 * Komponent reprezentujący pojedynczy panel (pole) w akordeonie.
 * Jego jedynym zadaniem jest przechowywanie `title` i `children`.
 * Nie renderuje niczego bezpośrednio - jest tylko nośnikiem danych dla rodzica.
 */
export function AccordionField(
  { children }: AccordionFieldProps,
): VNode | null {
  // Zwracamy dzieci wewnątrz fragmentu. Rodzic <AccordionFields>
  // odczyta propsy i zdecyduje, co z tym zrobić.
  return <>{children}</>;
}
