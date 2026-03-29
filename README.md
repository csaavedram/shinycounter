# Shiny Hunter Counter

A Vite + React + Tailwind app for tracking Pokemon shiny hunts locally in the browser.

## Features

- Fully client-side with localStorage persistence
- Dynamic game rules and method filtering
- Probability engine with roll-based calculations
- Live encounter timer and keyboard increment (SPACE)
- Capture history with shiny sprites
- Manual capture entry
- Export/import full data as JSON

## Local Development

```bash
npm install
npm run dev
```

## Run Tests

```bash
npm run test
```

## Production Build

```bash
npm run build
```

## Step-by-Step Deploy (GitHub Pages)

1. Commit and push to your `main` branch.
2. In GitHub, open your repository settings.
3. Go to **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. The workflow at `.github/workflows/deploy.yml` will run automatically on pushes to `main`.
6. The pipeline runs:
	- `npm ci`
	- `npm run test`
	- `npm run lint`
	- `npm run build`
	- deploy `dist` to GitHub Pages
7. After success, open the Pages URL shown in the workflow summary.

The Vite base path is configured as `/shinycounter/` in `vite.config.js`, which matches this repository name.

## Legal

This is a fan-made project and is not affiliated with Nintendo, Game Freak, or The Pokemon Company. Pokemon is a trademark of its respective owners. Data and sprites from PokeAPI.
