# UI Localization Checker

UI Localization Checker is a React + Tailwind CSS review tool for sports apps and sports electronics UI. It accepts screenshots, runs OCR with Tesseract.js, and highlights likely localization QA issues such as overflow, RTL alignment problems, placeholder risks, truncation, and font fallback drift.

The current experience is designed for multilingual release review across workout summaries, wearable setup flows, GPS screens, recovery cards, and metrics-heavy product surfaces.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- Tesseract.js

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Usage

1. Open the app and choose a target locale.
2. Upload a PNG or JPG screenshot from a workout app or device UI.
3. Wait for OCR to extract visible copy and run localization heuristics.
4. Review flagged regions in the annotated preview.
5. Use the findings rail to inspect issue severity, suggested fixes, and extracted text.
6. Complete a manual pass for typography, spacing, and brand-tone validation before release handoff.

## GitHub Pages Deployment

The app is configured for a GitHub Pages project site with this Vite base path in [vite.config.ts](/Users/a/Documents/UI localization checker/vite.config.ts):

```ts
/ui-localization-checker/
```

This is the correct setup when the repository slug is `ui-localization-checker`.

If you deploy to a custom domain or a user/org root site instead, update the `base` value before building.

## Project Structure

```text
.
├── src
│   ├── components
│   ├── utils
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Screenshots

Add future UI captures here after the first release pass:

### Dashboard

Screenshot placeholder

### Review Workspace

Screenshot placeholder

### Findings Rail

Screenshot placeholder

## Notes

- The first OCR pass for a locale may download Tesseract language data in the browser.
- The issue detection layer is heuristic-based and should be treated as QA guidance, not a pixel-perfect layout engine.
- No GitHub Actions deployment workflow is included in this repository yet.
