# graph-generator

- [**WEB:** https://mod-by-cis.github.io/graph-generator/](https://mod-by-cis.github.io/graph-generator/)

- [**GIT:** https://github.com/mod-by-cis/graph-generator](https://github.com/mod-by-cis/graph-generator)


```structure-dir

graph-generator/
│
├─┬─ .github/
│ └─┬─ workflows/
│   └── docs-build.yml
│
├─┬─ .vscode/
│ └── settings.json
│
├─┬─ code/
│ │
│ ├─┬─ app/
│ │ │
│ │ ├─┬─ core/
│ │ │ ├── state-accordion.ts
│ │ │ └── state-dot-current.ts
│ │ │   
│ │ ├─┬─ pages/
│ │ │ ├── AboutThis.css
│ │ │ ├── AboutThis.tsx
│ │ │ ├── DotInsert.tsx
│ │ │ ├── DotRender.css
│ │ │ ├── DotRender.tsx
│ │ │ ├── DotWriter.css
│ │ │ ├── DotWriter.tsx
│ │ │ ├── EduDot.tsx
│ │ │ ├── EduGraphs.tsx
│ │ │ ├── _mod.css
│ │ │ └── _mod.ts
│ │ │ 
│ │ ├─┬─ types/
│ │ │ └── css.ts
│ │ │   
│ │ ├── main.css
│ │ └── main.tsx
│ │
│ ├─┬─ config/
│ │ └── path.ts
│ │
│ └─┬─ lib/
│   │   
│   ├─┬─ ui/
│   │ ├── AccordionField.tsx
│   │ ├── AccordionFields.css
│   │ ├── AccordionFields.tsx
│   │ └── AccordionFieldsPilot.tsx
│   │   
│   ├─┬─ wasm/
│   │ └── loader-wasm-dot.ts
│   │  
│   └─┬─ pwa/
│     ├── loader.ts
│     ├── manifest.ts
│     └── sw.ts
│
│
├─┬─ docs/
│ │
│ ├─┬─ gen/
│ │ │
│ │ ├── main.css
│ │ ├── main.css.lastBuild.txt
│ │ ├── main.css.meta.json
│ │ │
│ │ ├── main.mjs
│ │ ├── main.mjs.lastBuild.txt
│ │ ├── main.mjs.map
│ │ ├── main.mjs.meta.json
│ │ │
│ │ ├── manifest.webmanifest
│ │ │
│ │ ├── pwa-loader.js
│ │ ├── pwa-loader.js.lastBuild.txt
│ │ ├── pwa-loader.js.map
│ │ ├── pwa-loader.js.meta.json
│ │ │
│ │ ├── sw.js
│ │ ├── sw.js.lastBuild.txt
│ │ ├── sw.js.map
│ │ ├── sw.js.meta.json
│ │ │
│ │ ├── wasm-dot.mjs
│ │ ├── wasm-dot.mjs.lastBuild.txt
│ │ ├── wasm-dot.mjs.map
│ │ └── wasm-dot.mjs.meta.json
│ │
│ ├─┬─ ico/
│ │ ├── favicon.ico
│ │ ├── icon-016.png
│ │ ├── icon-032.png
│ │ ├── icon-048.png
│ │ ├── icon-128.png
│ │ ├── icon-144.png
│ │ ├── icon-152.png
│ │ ├── icon-167.png
│ │ ├── icon-180.png
│ │ ├── icon-192.png
│ │ ├── icon-256.png
│ │ ├── icon-384.png
│ │ ├── icon-512.png
│ │ ├── icon-max.png
│ │ ├── icon-xxl.png
│ │ └── icon-xxm.png
│ │
│ └── index.html
│
├─┬── logic/
│ ├── dev-serve.ts
│ └── esbuild.ts
│
├─┬─ tasks/
│ ├── docs-build.ts
│ ├── docs-build_wasm.ts
│ ├── pwa-build.ts
│ └── docs-serve.ts
│
├── deno.jsonc
├── deno.lock
├── favicon.ico
├── LICENSE
└── README.md
```
