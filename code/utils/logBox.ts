import {
  bgRgb24,
  rgb24,
  bold,
  italic,
  dim,
  inverse,
  hidden,
  reset,
  strikethrough,
  underline,
  type Rgb,
} from "jsr:@std/fmt@^1.0.8/colors";


type Color = number | Rgb;
type StyleFunction = (text: string) => string;

interface logBoxColorOptions {
  color: Color;
  bgColor: Color;
  boxColor?: Color;
}

interface StyleTarget {
  txt?: boolean;
  box?: boolean;
}
type ComplexStyle = StyleTarget | boolean;

interface logBoxStyleOptions {
  bold?: ComplexStyle;
  dim?: ComplexStyle;
  inverse?: ComplexStyle;
  hidden?: ComplexStyle;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  reset?: boolean;
  padding?: number;
}

const STYLES_MAP: Record<string, StyleFunction> = {
  italic,
  strikethrough,
  underline,
  reset,
  bold,
  dim,
  inverse,
  hidden,
};

function logBox(
  text: string,
  { color, bgColor, boxColor: rawBoxColor }: logBoxColorOptions,
  styles: logBoxStyleOptions = {}
): void {
  const boxColor = rawBoxColor ?? color;
  const padding = Math.max(0, Math.floor(styles.padding ?? 0));

  // Funkcja, która tworzy "kompozytora" stylów dla danego celu ('txt' lub 'box')
  const createComposer = (target: 'txt' | 'box'): StyleFunction => {
    const activeStyleFns: StyleFunction[] = [];
    for (const key in styles) {
      const styleName = key as keyof logBoxStyleOptions;
      if (styleName === 'padding') continue;
      const styleValue = styles[styleName as keyof Omit<logBoxStyleOptions, 'padding'>];
      if (!STYLES_MAP[styleName]) continue;

      // Sprawdź, czy styl jest obiektem targetu (np. { txt: true })
      if (typeof styleValue === 'object') {
        // Przypadek 1: Styl jest obiektem, np. { txt: true }
        if (styleValue?.[target]) {
          activeStyleFns.push(STYLES_MAP[styleName]);
        }
      } else if (typeof styleValue === 'boolean' && styleValue) {
        // Przypadek 2: Styl jest booleanem
        const isComplexStyle = ['bold', 'dim', 'inverse', 'hidden'].includes(styleName);

        if (isComplexStyle) {
          // Jeśli to styl złożony (np. bold: true), traktujemy go jako skrót "zastosuj do obu"
          // Ta gałąź wykona się zarówno dla targetu 'txt', jak i 'box'
          activeStyleFns.push(STYLES_MAP[styleName]);
        } else {
          // Jeśli to styl prosty (np. italic: true), dotyczy tylko tekstu
          if (target === 'txt') {
            activeStyleFns.push(STYLES_MAP[styleName]);
          }
        }
      }
    }
    return (input: string) => activeStyleFns.reduce((acc, fn) => fn(acc), input);
  };

  const applyTxtStyles = createComposer('txt');
  const applyBoxStyles = createComposer('box');

  const lines = text.split('\n');
  const maxWidth = Math.max(...lines.map((line) => line.length));

  const horizontalPaddingWidth = padding + padding==0?1:padding==1?3:2; 
  const horizontalPaddingStr = ' '.repeat(horizontalPaddingWidth);
  const innerWidth = maxWidth + 2 * horizontalPaddingWidth;

  const contentLines = lines.map((line) => {
    const paddedText = `${horizontalPaddingStr}${line.padEnd(maxWidth, ' ')}${horizontalPaddingStr}`;
    const styledContent = applyTxtStyles(paddedText);
    return rgb24(styledContent, color);
  });
  
  const topBorder = rgb24(`╭${'─'.repeat(innerWidth)}╮`, boxColor);
  const bottomBorder = rgb24(`╰${'─'.repeat(innerWidth)}╯`, boxColor);
  const sideBorder = rgb24('│', boxColor);

  const top = applyBoxStyles(bgRgb24(' '+topBorder+' ', bgColor));
  const bottom = applyBoxStyles(bgRgb24(' '+bottomBorder+' ', bgColor));
  const middle = contentLines.map(line => 
      applyBoxStyles(bgRgb24(` ${sideBorder}${line}${sideBorder} `, bgColor))
  );

  const verticalPaddingLine = applyBoxStyles(
    bgRgb24(` ${sideBorder}${' '.repeat(innerWidth)}${sideBorder} `, bgColor)
  );

  console.log(top);
  for (let i = 0; i < padding; i++) {
    console.log(verticalPaddingLine);
  }
  middle.forEach((line) => console.log(line));
  for (let i = 0; i < padding; i++) {
    console.log(verticalPaddingLine);
  }
  console.log(bottom);
}

export default logBox;
export { logBox };
export type {logBoxColorOptions, logBoxStyleOptions};
