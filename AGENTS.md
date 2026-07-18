# AGENTS.md

Astro 7 + React 19 + Tailwind 4 portfolio site. Landing page is fully wired with content collection, projects pages, chat widget, and `/api/chat` SSE proxy to `rony-chat-bot`.

## Quickstart

```bash
pnpm install
pnpm dev
```

- Node `>=22.12.0` (enforced by `package.json` engines).
- Dev server: `http://localhost:4321`.
- No test, lint, typecheck, or format scripts exist. `pnpm astro check` is the only static-analysis entrypoint and is **not** wired into a script.

## Layout

```
portfolio/
├── astro.config.mjs        # @astrojs/node standalone, integrations + tailwind vite plugin
├── tsconfig.json           # extends astro/tsconfigs/strict, JSX react-jsx
├── pnpm-workspace.yaml     # only holds allowBuilds / release-age excludes (not a real workspace)
├── .npmrc                  # save-prefix=  (deps pinned exact, no caret)
├── docs/                   # architecture.md, DESIGN.md, projects-schema.md
├── public/                 # favicon, static assets
├── src/
│   ├── pages/
│   │   ├── index.astro               # landing (server-rendered)
│   │   ├── api/chat.ts               # POST /api/chat SSE proxy
│   │   └── proyectos/[index|[slug]].astro
│   ├── content.config.ts             # Zod schema for projects collection
│   ├── content/projects/*.mdx        # 3 placeholder projects (kebab-case slugs)
│   ├── components/                   # React islands
│   │   ├── LandingExperience.tsx     # top-level island (client:load)
│   │   ├── Hero.tsx                  # personal ↔ matched fade transition
│   │   ├── Chat.tsx                  # SSE consumer + markdown renderer
│   │   ├── ProjectCard.tsx           # compact + hero variants
│   │   └── ProjectGrid.tsx
│   ├── layouts/BaseLayout.astro      # HTML shell, fonts, Nav
│   ├── styles/global.css             # @theme tokens + @import "tailwindcss"
│   ├── types/project.ts              # ProjectData type shared with React
│   └── env.ts                        # CHAT_BOT_URL env reader
└── archive/html-static/              # older static HTML, do not import
```

## Dev server

This CLI wraps `astro dev` with a background mode. Always use it; don't block the session on a foreground server.

```bash
astro dev --background      # start (returns immediately)
astro dev status            # check
astro dev logs              # tail
astro dev stop              # stop
```

The plain `pnpm dev` script also works if you specifically need a foreground server.

## Environment

- `CHAT_BOT_URL` — backend URL for the `/api/chat` proxy. Defaults to `http://localhost:7331`. Set in `.env` (gitignored). The `rony-chat-bot` service must be running locally for chat to work.
- `.env` and `.env.production` are gitignored — never commit them.

## Stack & config quirks

- **Astro 7** (not v5/v6) with `@astrojs/node` standalone adapter. `output: 'server'`, so individual pages can opt into prerendering with `export const prerender = true` (currently `/proyectos` and `/proyectos/[slug]`).
- **React 19** via `@astrojs/react`. JSX is `react-jsx` in `tsconfig.json`.
- **Tailwind 4** via `@tailwindcss/vite` plugin in `astro.config.mjs`. There is **no `tailwind.config.mjs`** — Tailwind 4 is configured inside CSS (`src/styles/global.css` uses `@import "tailwindcss";` plus a `@theme {}` block for palette tokens). `docs/DESIGN.md` still references a `tailwind.config.mjs` mapping; ignore that section.
- **Partytown** registered as integration. No third-party scripts wired up yet.
- **TypeScript strict** via `astro/tsconfigs/strict`. TypeScript version is pinned to `^6` because `astro check` doesn't yet support TS 7.0 (TS 7.0 dropped the programmatic API that the Astro language server depends on).
- Generated `.astro/` (types + dev state) is gitignored but present locally.
- Dependencies are pinned exact (no `^`). `.npmrc` sets `save-prefix=` so `pnpm add` won't reintroduce the caret.

## Conventions

- Components: PascalCase. `.mdx` files in content: kebab-case slug.
- TypeScript strict everywhere.
- No comments unless they explain something non-obvious.
- Import alias `~/` → `src/` — referenced in docs but not yet configured in `tsconfig.json`; add it before using.

## Doc index

- `docs/architecture.md` — routing, content collections, endpoints, islands, Partytown, acceptance criteria. (Several items marked "not yet" are now implemented; verify against `src/`.)
- `docs/projects-schema.md` — `.mdx` frontmatter contract and `/projects.json` shape. The endpoint is not implemented; only the content collection is.
- `docs/DESIGN.md` — design tokens (palette, type, spacing). The `tailwind.config.mjs` snippet is stale — Tailwind 4 doesn't use that file.

VS Code: the Astro extension (`astro-build.astro-vscode`) is recommended; a "Development server" launch config is in `.vscode/launch.json`.

## Sibling repos (not in this workspace)

`README.md` links to `../rony-llm-agent/`, `../rony-chat-bot/`, `../rony-harness/` — separate repos on disk, not packages of this one. This site talks to `rony-chat-bot` over HTTP via `/api/chat`. The bot reads project `.md` files directly from its own `data/projects/` directory, so each project added here must be mirrored there too (with matching kebab-case filename) and the bot reindexed (`POST /api/reindex` or `chat-bot reindex`).
