# qrmaker

A small, browser-only QR code generator for URLs/links, with live preview and download.

## Goals

- Generate QR codes from URLs
- Customize shape (square or rounded), colors, and size
- Live preview in the browser
- Download as SVG and PNG
- Max portability: runs as a static page (hosted or opened locally)

## Scope (MVP)


| Feature          | Notes                                           |
| ---------------- | ----------------------------------------------- |
| URL / link input | Plain string encoding (start with `https://…`)  |
| Module shape     | Square and rounded                              |
| Colors           | Foreground and background                       |
| Dimensions       | Output size in pixels                           |
| Live preview     | Updates as options change                       |
| Download         | SVG and PNG                                     |
| Delivery         | Static web app; optional single-file HTML build |


## Tech

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) — browser-first QR generation with shape/color support
- **Vite** — local dev server and production build
- Vanilla HTML / CSS / JS (no framework unless we later need one)

The first (and possibly only) use case is an interactive browser UI. `qr-code-styling` matches that better than an isomorphic/Node-oriented library.

## Build approach

Keep the toolchain light:

1. **Dev:** `npm run dev` → Vite serves the app with fast reload.
2. **Prod:** Vite bundles JS/CSS, then inlines them into **one HTML file** (via `vite-plugin-singlefile`).

That gives:

- A normal, pleasant edit/reload loop
- A single portable artifact (`dist/index.html`) for local double-click use or static hosting
- No CDN dependency at runtime in the production build (fully offline once built)



### Commands (planned)

```bash
npm install
npm run dev      # local UI
npm run build    # → dist/index.html (single file)
npm run preview  # serve the production build
```



### Alternatives considered


| Approach                              | Verdict                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Hand-written single HTML + CDN script | Fine for a 10-minute spike; weaker for iteration, offline, and version pinning |
| Vite multi-file `dist/` (default)     | Fine for static hosting; less convenient for “one file to share”               |
| No bundler at all                     | Too awkward once we import the library as a module                             |


**Decision:** Vite + single-file production build.

## Project layout (planned)

```
qrmaker/
  README.md
  package.json
  vite.config.js
  index.html          # app shell
  src/
    main.js           # wire UI ↔ qr-code-styling
    style.css
```



## Success criteria

- Enter a URL → preview updates
- Toggle square / rounded, colors, size → preview matches
- Download SVG and PNG that scan correctly on a phone
- `npm run build` produces a single HTML file that works when opened locally

