# Arquitectura — Portfolio Web

Documentación técnica del código Astro/React: componentes, routing, data flow, integraciones.

## 🗺️ Routing

```
/                       → src/pages/index.astro          (landing)
/proyectos              → src/pages/proyectos/index.astro (listado)
/proyectos/[slug]       → src/pages/proyectos/[slug].astro (detalle, generado desde content collection)
/api/chat               → src/pages/api/chat.ts          (proxy streaming, POST)
/projects.json          → src/pages/projects.json.ts     (JSON para chat-bot, GET)
```

## 📦 Content Collections

Los proyectos viven como archivos `.mdx` en `src/content/projects/`. Astro los tipifica vía Zod en `src/content.config.ts`.

**Ejemplo de archivo** (`src/content/projects/tienda-ropa.mdx`):

```mdx
---
title: "Tienda de Ropa Online"
slug: "tienda-ropa"
stack: ["Next.js", "Stripe", "PostgreSQL"]
status: "live"             # live | archived | wip
demoUrl: "https://..."
repoUrl: "https://github.com/..."
date: 2025-03-15
---

## Propósito
Plataforma e-commerce para...

## Decisiones técnicas
...
```

**Schema completo:** ver [`projects-schema.md`](./projects-schema.md).

**Páginas dinámicas:**

- `/proyectos` lista todos (ordenados por `date` desc)
- `/proyectos/[slug]` renderiza el MDX con layout + componentes

## 🔌 Endpoints

### `POST /api/chat` — Proxy al chat-bot

Recibe un JSON del cliente y lo reenvía como streaming al backend Go. **Razón de existir**: evita exponer el puerto interno del chat-bot y permite CORS restrictivo en el frontend.

```ts
// src/pages/api/chat.ts
import type { APIRoute } from 'astro';

const CHAT_BOT_URL = import.meta.env.CHAT_BOT_URL || 'http://localhost:7331';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const resp = await fetch(`${CHAT_BOT_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return new Response(resp.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
};
```

### `GET /projects.json` — Datos para el chat-bot

Exporta la content collection en formato plano que el chat-bot puede consumir.

```ts
// src/pages/projects.json.ts
import { getCollection } from 'astro:content';

export async function GET() {
  const projects = await getCollection('projects');
  return new Response(JSON.stringify(
    projects.map(({ data, body }) => ({
      slug: data.slug,
      title: data.title,
      stack: data.stack,
      status: data.status,
      demoUrl: data.demoUrl,
      description: body,
    }))
  ), { headers: { 'Content-Type': 'application/json' } });
}
```

## 🏝️ Islands Architecture

Por defecto, Astro renderiza HTML estático. Los únicos componentes hidratados son islas explícitas (`client:*`).

- **Componentes `.astro`** → Server-rendered, sin JS en el cliente
- **Componentes `.tsx` (React)** → Hidratados solo donde se necesita interactividad

**Único cliente actual:** el chat widget, con `client:load` (hidrata al cargar la página).

```astro
---
// src/pages/index.astro
import Chat from '../components/Chat';
---
<Chat client:load />
```

## ⚡ Partytown

Scripts third-party (analytics, ads) van con `type="text/partytown"` para correr en Web Worker y no bloquear el main thread.

```astro
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXX"></script>
```

Config de forward (qué eventos del main thread llegan al worker) está en `astro.config.mjs`.

## 📐 Convenciones

- **Naming**: PascalCase para componentes, kebab-case para archivos `.mdx`
- **Imports**: usar alias `~/` para `src/` (configurar en `tsconfig.json`)
- **TypeScript strict** habilitado en todo el proyecto
- **Sin comentarios innecesarios** — el código debe ser autoexplicativo

## ✅ Acceptance Criteria

Checklist verificable de "qué tiene que pasar" para considerar la spec implementada. Marcar con `[x]` al completar.

### Routing

- [ ] `GET /` retorna 200 con HTML de la landing
- [ ] `GET /proyectos` lista todos los proyectos ordenados por `date` desc
- [ ] `GET /proyectos/<slug>` retorna 200 con el detalle para cada `.mdx` válido
- [ ] `GET /proyectos/<slug-inexistente>` retorna 404

### Content Collections

- [ ] `src/content.config.ts` define la collection `projects` con schema Zod
- [ ] `pnpm build` falla si algún `.mdx` tiene frontmatter inválido
- [ ] Slugs son únicos (validación falla si hay duplicados)
- [ ] Campos requeridos (`title`, `slug`, `stack`, `status`, `date`) son obligatorios

### Endpoint `POST /api/chat`

- [ ] Responde 200 con `Content-Type: text/event-stream`
- [ ] Stream es passthrough: chunks del backend llegan al cliente sin buffering completo
- [ ] Lee `CHAT_BOT_URL` desde `import.meta.env` (default `http://localhost:7331`)
- [ ] Errores del backend (5xx) se propagan al cliente con status code original
- [ ] Request sin body válido retorna 400

### Endpoint `GET /projects.json`

- [ ] Responde 200 con `Content-Type: application/json`
- [ ] Body es un array de `ProjectJSON` válido (ver [`projects-schema.md`](./projects-schema.md))
- [ ] Incluye todos los proyectos de la collection, sin filtrar
- [ ] El campo `description` contiene el body markdown sin transformaciones

### Islands Architecture

- [ ] Solo el chat widget usa directiva `client:*` (resto del sitio es HTML estático)
- [ ] El bundle JS del cliente es `<50KB` gzipped para la landing sin chat
- [ ] `Chat` se hidrata con `client:load` y responde a interacción en <100ms

### Partytown

- [ ] Scripts third-party usan `type="text/partytown"`
- [ ] El bundle de Partytown (~25KB) se carga una sola vez y queda cacheado
- [ ] Los eventos configurados en `forward` se propagan correctamente al worker

### Build & Deploy

- [ ] `pnpm build` completa sin errores ni warnings
- [ ] `pnpm preview` sirve el sitio idéntico al de producción
- [ ] `.env.example` documenta todas las variables requeridas
- [ ] El deploy a Vercel/Netlify funciona con zero-config
