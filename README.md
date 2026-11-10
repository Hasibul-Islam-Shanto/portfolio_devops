# Shanto — DevOps & Platform Engineer Portfolio (Astro)

Static-first portfolio built with **Astro**, **TypeScript**, and **Tailwind CSS v4**. All routes are pre-rendered to static HTML at build time with zero client-side React runtime, using small modular browser TypeScript controllers for interactive animations, canvas effects, and the interactive hero terminal.

## Prerequisites

- **Node.js**: v20+ (v22 recommended)
- **npm**: v10+

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local Astro development server:

```sh
npm run dev
```

The development server starts at `http://localhost:4321` by default.

## Available Scripts

| Command              | Description                                          |
| :------------------- | :--------------------------------------------------- |
| `npm run dev`        | Start the local Astro dev server with HMR            |
| `npm run build`      | Build the static production site into `dist/`        |
| `npm run preview`    | Locally preview the production build from `dist/`    |
| `npm run check`      | Run `astro check` for Astro + TypeScript diagnostics |
| `npm run lint`       | Run ESLint across TypeScript and config files        |
| `npm run format`     | Format repository files with Prettier                |
| `npm test`           | Run the Vitest unit and integration test suite once  |
| `npm run test:watch` | Run Vitest in interactive watch mode                 |

## Project Structure

```text
/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   └── portfolio/          # Kebab-case Astro components (.astro) & inline SVG icon map
│   │       ├── about.astro
│   │       ├── certifications.astro
│   │       ├── coming-soon.astro
│   │       ├── constellation-canvas.astro
│   │       ├── contact.astro
│   │       ├── custom-cursor.astro
│   │       ├── deploy-flow.astro
│   │       ├── deploy-pipeline.astro
│   │       ├── experience.astro
│   │       ├── header.astro
│   │       ├── hero.astro
│   │       ├── hero-terminal.astro
│   │       ├── how-i-work.astro
│   │       ├── icon.astro
│   │       ├── icons.ts
│   │       ├── pipeline-rail.astro
│   │       ├── testimonials.astro
│   │       ├── toolchain.astro
│   │       └── work.astro
│   ├── layouts/
│   │   └── base-layout.astro   # Global HTML shell, SEO/OG metadata, fonts, custom cursor
│   ├── pages/
│   │   ├── index.astro         # / (9-section DevOps pipeline portfolio)
│   │   ├── 404.astro           # Custom 404 page
│   │   ├── blog/
│   │   │   └── index.astro     # /blog (Coming Soon placeholder)
│   │   └── case-studies/
│   │       └── index.astro     # /case-studies (Coming Soon placeholder)
│   ├── scripts/                # Modular browser-side TypeScript controllers
│   │   ├── constellation-canvas.ts
│   │   ├── custom-cursor.ts
│   │   ├── deploy-flow.ts
│   │   ├── deploy-pipeline.ts
│   │   ├── experience.ts
│   │   ├── header.ts
│   │   ├── hero-terminal.ts
│   │   ├── pipeline-rail.ts
│   │   ├── reveal.ts
│   │   ├── toolchain.ts
│   │   ├── util.ts
│   │   └── work.ts
│   ├── styles/
│   │   └── global.css          # Tailwind CSS v4 entry + portfolio design tokens & animations
│   └── test/                   # Vitest + Astro Container API test suite
├── astro.config.mjs
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Deployment

Running `npm run build` outputs a purely static site in `dist/`:

- `dist/index.html` (`/`)
- `dist/blog/index.html` (`/blog`)
- `dist/case-studies/index.html` (`/case-studies`)
- `dist/404.html` (automatically served by static hosts such as Cloudflare Pages, Netlify, Vercel, and GitHub Pages for unmatched routes)

When deploying to a production domain, set the `site` property in `astro.config.mjs` (for example, `site: "https://shanto.dev"`) if you wish to emit canonical URLs or integrate `@astrojs/sitemap`.
