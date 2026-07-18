# Portfolio — Victor Hugo Vargas

> 🌐 Sitio web de portfolio personal + chat widget para responder preguntas sobre proyectos.

Portfolio de Victor Hugo Vargas. El sitio web está construido con **Astro + React + Tailwind**, e integra un chat widget que responde preguntas sobre los proyectos documentados.

## 🧱 Stack

- **[Astro 7](https://docs.astro.build)** — framework principal (islands architecture) con `@astrojs/node` standalone
- **[React 19](https://react.dev)** — componentes interactivos (chat widget, hero interactivo)
- **[Tailwind CSS 4](https://tailwindcss.com)** — utility-first styling via `@tailwindcss/vite`
- **[Partytown](https://partytown.builder.io)** — integración registrada para offload de scripts third-party

## 🚀 Quickstart

```bash
pnpm install
pnpm dev          # http://localhost:4321
```

## 📦 Comandos

| Comando            | Acción                                            |
| :----------------- | :------------------------------------------------ |
| `pnpm dev`         | Dev server en `localhost:4321`                    |
| `pnpm build`       | Build de producción a `./dist/`                   |
| `pnpm preview`     | Preview del build local antes de deploy           |
| `pnpm astro`       | CLI commands (`astro add`, `astro check`, etc.)   |
| `pnpm astro check` | TypeScript + Astro diagnostics                    |

## 📁 Estructura

```
portfolio/
├── docs/
│   ├── architecture.md       # Arquitectura técnica (routing, data flow, API)
│   ├── DESIGN.md             # Sistema visual (paleta, tipografía, componentes)
│   └── projects-schema.md    # Schema de proyectos MDX + contrato JSON para el chat-bot
├── public/                   # Assets estáticos (imágenes, favicon)
├── src/
│   ├── content/projects/     # ← Proyectos como .mdx (single source of truth)
│   ├── components/           # Componentes Astro y React
│   ├── layouts/              # Layouts base
│   ├── pages/
│   │   ├── index.astro
│   │   ├── proyectos/        # /proyectos + /proyectos/[slug]
│   │   └── api/
│   │       └── chat.ts       # Proxy → ../rony-chat-bot
│   └── styles/
├── astro.config.mjs
└── archive/html-static/      # HTML estático viejo (referencia, no se importa)
```

## 🧩 Integración con el chat

El chat widget es una isla React que se hidrata con `client:load`. Por seguridad, **no llama directo al servicio de chat**: el request pasa por un proxy de Astro en `/api/chat`, que reenvía la request al servicio Go en [`../rony-chat-bot/`](../rony-chat-bot/).

```
[Browser]  →  [Astro /api/chat]  →  [rony-chat-bot :7331]
                (proxy + streaming passthrough)
```

Configurar la URL del backend en `.env`:

```bash
CHAT_BOT_URL=http://localhost:7331
```

Ver implementación detallada en [`docs/architecture.md`](./docs/architecture.md).

## 📚 Contenido de proyectos

Los proyectos del portfolio viven como archivos `.mdx` en `src/content/projects/`. Son la **única fuente de verdad** — el sitio renderiza desde ahí. **Importante**: el bot lee desde su propio `data/projects/*.md`, así que cada `.mdx` debe espejarse como `.md` en `../rony-chat-bot/data/projects/` (con el mismo kebab-case filename) y disparar `POST /api/reindex`.

- Schema completo: [`docs/projects-schema.md`](./docs/projects-schema.md)

## 🚢 Deploy

- **Frontend Astro** → Coolify (Docker container con `@astrojs/node` standalone)
- **Chat-bot Go** ([`../rony-chat-bot/`](../rony-chat-bot/)) → Coolify (mismo setup)
- **Dominio**: `victorvargas.dev`

## 🔗 Proyectos relacionados

Este portfolio es parte de un workspace más grande:

- [`../rony-llm-agent/`](../rony-llm-agent/) — Core del chat (LLM agent)
- [`../rony-chat-bot/`](../rony-chat-bot/) — Servicio HTTP que provee las respuestas al chat
- [`../rony-harness/`](../rony-harness/) — Otro proyecto principal de Victor

## 📄 Licencia

MIT — ver [`LICENSE`](./LICENSE).

## 🔧 Notas para AI agents

Ver [`AGENTS.md`](./AGENTS.md) para convenciones de dev server, env vars, stack quirks, y doc index.