/**
 * @file ./code/pwa/manifest.ts
 * @author https://github.com/j-Cis
 * @description Definicja manifestu PWA w TypeScript, z dynamiczną listą ikon.
 */
import { allIcons } from "../config/path.ts";

const publicPath = "/graph-generator";

// Dynamiczne tworzenie pełnej listy ikon na podstawie konfiguracji
const icons = Object.values(allIcons.png).map(icon => {
  const iconEntry: { src: string; sizes: string; type: string; purpose?: string } = {
    src: `${publicPath}/${icon.file}`,
    sizes: `${icon.sizePX}x${icon.sizePX}`,
    type: "image/png"
  };
  // Zgodnie z Twoim plikiem, dodajemy `purpose` dla ikon 192 i 512
  if (icon.sizePX === 192) {
    iconEntry.purpose = "any";
  } else if (icon.sizePX === 512) {
    iconEntry.purpose = "any maskable";
  }
  return iconEntry;
});

// Tworzymy obiekt manifestu, odzwierciedlający w 100% Twój plik JSON
const manifest = {
  name: "Graph Generator",
  short_name: "GraphGen",
  description: "Aplikacja do wizualizacji i edycji grafów w języku DOT.",
  scope: `${publicPath}/`,
  start_url: `${publicPath}/`,
  display: "standalone",
  background_color: "#FCFDE4",
  theme_color: "#FCFDE4",
  categories: [
    "education",
    "graphics",
    "utilities"
  ],
  icons: icons
};

export default manifest;
