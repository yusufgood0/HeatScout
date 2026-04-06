# Vite PWA App

A production-ready Progressive Web App starter built with **Vite**, **TypeScript**, and **vite-plugin-pwa**.

## Features

- ⚡ Vite for blazing-fast dev and build
- 🟦 TypeScript with strict mode
- 📱 Full PWA support — installable, offline-ready
- 🔄 Auto service worker updates via Workbox
- 🚀 GitHub Actions workflow for Pages deployment

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push to a GitHub repository
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Push to `main` — the workflow handles everything

> **Note:** If your repo is not at the root (e.g. `https://user.github.io/repo-name/`), set the Vite `base` option in `vite.config.ts`:
> ```ts
> export default defineConfig({ base: '/repo-name/', ... })
> ```

## PWA Icons

Replace the placeholder icons in `public/` with real images:

| File | Size |
|------|------|
| `pwa-192x192.png` | 192×192 |
| `pwa-512x512.png` | 512×512 |
| `apple-touch-icon.png` | 180×180 |

You can generate them from your logo at [realfavicongenerator.net](https://realfavicongenerator.net).

## Stack

- [Vite](https://vitejs.dev)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app)
- [Workbox](https://developer.chrome.com/docs/workbox)
- [TypeScript](https://www.typescriptlang.org)
