# Portfolio — Victor Hugo Vargas

> 🌐 **Sitio web de portfolio personal + chat widget para responder preguntas sobre proyectos.**

Este repositorio contiene el portfolio web de Victor Hugo Vargas. Actualmente está en HTML estático (versión MVP), con plan de migración a **Astro + React**.

## 📦 Estado actual

```
portfolio/
├── index.html              # Landing page (HTML estático)
├── dashboard.html          # Dashboard alternativo
├── example/                # Componentes de ejemplo
└── README.md               # ← este archivo
```

## 🎯 Roadmap de migración a Astro

### Fase 1: Setup Astro (1 día)

```bash
# Limpiar HTML actual (mantener como referencia)
mkdir -p archive/html-static
mv *.html archive/html-static/

# Inicializar Astro con TypeScript estricto
npm create astro@latest . -- \
  --template minimal \
  --typescript strict \
  --add react \
  --add tailwind \
  --install

# Estructura inicial
src/
├── pages/
│   └── index.astro          # Reemplazo de index.html
├── components/
│   ├── Hero.astro
│   ├── Projects.astro
│   └── Chat.tsx              # ← React component del chat
├── layouts/
│   └── BaseLayout.astro
└── styles/
    └── global.css
```

### Fase 2: Migrar contenido (1-2 días)

- Copiar contenido de `archive/html-static/index.html` a `src/pages/index.astro`
- Dividir en componentes reutilizables
- Migrar estilos inline a Tailwind
- Agregar imágenes optimizadas en `public/`

### Fase 3: Integrar chat widget (1 día)

El chat se integra con [`../rony-chat-bot/`](../rony-chat-bot/) (otro proyecto del workspace).

#### 3.1 Instalar dependencia

```bash
# chat-bot es un servicio HTTP independiente, no se importa
# Solo necesitamos configurar la URL del proxy
echo 'CHAT_BOT_URL=http://localhost:7331' > .env
```

#### 3.2 Crear API route proxy

```typescript
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

#### 3.3 Crear React component

Ver implementación completa en [`../rony-chat-bot/docs/architecture.md`](../rony-chat-bot/docs/architecture.md) §5.3. Copia manualmente el bloque de código TypeScript de esa sección a:

```bash
mkdir -p src/components
# Crear src/components/Chat.tsx con el contenido de §5.3 de rony-chat-bot/docs/architecture.md
```

#### 3.4 Usar en página

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Chat from '../components/Chat';
---

<BaseLayout title="Victor Hugo Vargas">
  <Hero />
  <Projects />
  <Chat client:load />   <!-- ← widget de chat -->
</BaseLayout>
```

### Fase 4: Deployment (1 día)

Recomendaciones:
- **Vercel** o **Netlify** para el frontend Astro (gratis, CDN global)
- **Fly.io** o **Railway** para el chat-bot Go (necesita always-on)
- Dominio custom: `victorvargas.dev`

```
victorvargas.dev          → Astro en Vercel (HTTPS)
api.victorvargas.dev      → chat-bot en Fly.io (HTTPS)
                          (Astro hace proxy de /api/chat → api.victorvargas.dev)
```

## 🎨 Diseño visual

> 📌 **Convención de nombres:**
> - `docs/architecture.md` — Arquitectura técnica del código Astro/React (componentes, routing, data flow)
> - `docs/DESIGN.md` — **Sistema de diseño visual** (paleta de colores, tipografía, spacing, componentes UI)
>
> Estos son archivos separados porque en frontend significan cosas distintas.

Consideraciones generales:
- **Dark mode first** — devs prefieren dark
- **TailwindCSS** — utility-first, rápido de iterar
- **Mobile-first** — recruiters ven desde phones
- **Accesibilidad** — WCAG 2.1 AA mínimo

### `docs/DESIGN.md` (a crear cuando migres a Astro)

Cuando definas el sistema visual, documéntalo aquí. Contenido típico:

```markdown
# Sistema de Diseño — Portfolio

## Paleta de colores
- Background primary: #0a0a0a (casi negro, dark mode)
- Background secondary: #1a1a1a
- Accent: #00d9ff (cyan eléctrico, brand color)
- Text primary: #fafafa
- Text secondary: #a1a1a1
- Error: #ff5555
- Success: #50fa7b

## Tipografía
- Sans-serif: Inter (UI)
- Mono: JetBrains Mono (código)
- Scale: 12, 14, 16, 20, 24, 32, 48px

## Spacing scale (Tailwind)
- 4, 8, 12, 16, 24, 32, 48, 64 px

## Componentes base
- Button (primary, secondary, ghost)
- Card (con borde sutil, hover effect)
- Tag (para tech stack)
- ChatWidget (ver ../rony-chat-bot/docs/architecture.md §5.3)

## Tokens (para Tailwind config)
[ejemplo de extension del theme de Tailwind]
```

## 📚 Recursos

- [Astro docs](https://docs.astro.build)
- [Astro + React integration](https://docs.astro.build/en/guides/integrations-guide/react/)
- [TailwindCSS con Astro](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
- [Chat-bot architecture doc](../rony-chat-bot/docs/architecture.md) — Integración detallada

## 📄 Licencia

MIT — ver [`LICENSE`](./LICENSE).

## 🔗 Proyectos relacionados

- [`rony-llm-agent`](../rony-llm-agent/) — Core del chat
- [`harness`](../rony-harness/) — El otro proyecto principal de Victor
- [`chat-bot`](../rony-chat-bot/) — Servicio HTTP que provee las respuestas