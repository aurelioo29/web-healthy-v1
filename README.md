# Healthy Web

A modern frontend for the **Healthy** platform, built with **Next.js (App Router)**. Ships with i18n scaffolding, basic SEO, and a clean project structure for fast iteration.

## ✨ Features

- App Router with SSR/ISR/SSG support
- i18n-ready folder layout (messages & middleware friendly)
- Typed API helper and clear data-fetching pattern
- Basic SEO (meta/OG ready to extend)
- Data Dynamic Full

## 🧱 Tech Stack

- Next.js (React)
- Node.js 18+ runtime
- (Optional) Tailwind CSS / PostCSS
- Native Fetch API for backend integration

## ✅ Requirements

- **Node.js 18+** (LTS recommended)
- **npm / yarn / pnpm**

## 🚀 Quickstart

```bash
# Clone
git clone https://github.com/aurelioo29/web-healthy-v1 healthy-web
cd healthy-web

# Install
npm install

# Configure environment
cp .env.example .env.local

# (Edit .env.local)

# Run dev
npm run dev
# Visit http://localhost:3000
```

## 🔧 Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run start     # run compiled build
npm run lint      # lint (if configured)
```

## 🗂️ Suggested Project Structure

```bash
app/            # routes, layouts, metadata
components/     # UI components
i18n/           # i18n utilities/middleware (optional)
lib/            # helpers (api client, constants, utils)
messages/       # translations (e.g., en.json, id.json)
public/         # static assets
utils/          # utility button logic
```

## 🤝 Contributing

PRs are welcome. Please keep commits scoped and ensure lint passes.
