// Poinformowanie TypeScript, że typ 'number' ma teraz nową metodę 'sL'.
// Używamy "declaration merging", aby rozszerzyć globalny interfejs.
interface Number {
  /**
   * Formatuje liczbę do łańcucha znaków o podanej długości,
   * dodając wiodące zera.
   * @param length Docelowa długość łańcucha znaków.
   * @returns Sformatowany łańcuch znaków.
   */
  nL(length: number): string;
}

// Zaimplementowanie funkcjonalności na prototypie typu Number.
// Słowo kluczowe 'function' jest tu użyte celowo, aby poprawnie obsłużyć 'this',
// które w tym kontekście odnosi się do wartości liczbowej, na której metoda jest wywoływana.
Number.prototype.nL = function(length: number): string {
  return String(this).padStart(length, '0');
};
