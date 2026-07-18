# Schema de Proyectos

Contrato de datos para los proyectos del portfolio. **Single source of truth**: los archivos `.mdx` en `src/content/projects/` son leídos tanto por el sitio (Astro) como por el chat-bot (Go) para responder preguntas.

## 📄 Formato del archivo

`src/content/projects/<slug>.mdx`:

```mdx
---
title: string          # Nombre visible del proyecto
slug: string           # URL-safe, único
stack: string[]        # Tech stack (ej: ["Next.js", "Stripe"])
status: 'live' | 'archived' | 'wip'
demoUrl?: string       # URL del demo deployado (opcional)
repoUrl?: string       # URL del repo (opcional)
date: Date             # Fecha de inicio/realización
---

## Propósito
Texto libre en markdown explicando el proyecto.

## Decisiones técnicas
Texto libre en markdown.

## Retos
Texto libre en markdown.
```

El **body del markdown** es texto libre — el sitio lo renderiza con componentes MDX, y el chat-bot lo usa como descripción para responder preguntas.

## 🔒 Validación (Zod)

Astro valida el frontmatter en build/runtime vía `src/content.config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    stack: z.array(z.string()),
    status: z.enum(['live', 'archived', 'wip']),
    demoUrl: z.string().url().optional(),
    repoUrl: z.string().url().optional(),
    date: z.date(),
  }),
});

export const collections = { projects };
```

## 📤 Contrato JSON para el chat-bot

El endpoint `GET /projects.json` expone los proyectos en formato plano. **El chat-bot DEBE consumir este endpoint** (no los `.mdx` directo), para mantener una sola fuente de verdad.

**Shape de cada item:**

```ts
type ProjectJSON = {
  slug: string;
  title: string;
  stack: string[];
  status: 'live' | 'archived' | 'wip';
  demoUrl?: string;
  description: string;   // body del .mdx, en markdown plano
};
```

**Endpoint completo:**

```
GET https://victorvargas.dev/projects.json
→ Content-Type: application/json
→ Body: ProjectJSON[]
```

## 🔄 Flujo de datos

```
[M DX files]  ──┬──→  [Astro build]  ──→  [Sitio renderizado]
                │
                └──→  [GET /projects.json]  ──→  [chat-bot Go consume]
```

## ➕ Cómo agregar un proyecto nuevo

1. Crear `src/content/projects/<slug>.mdx` con frontmatter válido
2. El sitio lo recoge automáticamente en `/proyectos` y `/proyectos/<slug>`
3. Al re-deploy, `/projects.json` lo incluye
4. El chat-bot refresca su cache en el siguiente ciclo (o al reiniciar)

## 📚 Para el equipo de rony-chat-bot

Ver [`../../../rony-chat-bot/docs/architecture.md`](../../../rony-chat-bot/docs/architecture.md) para detalles de cómo el bot consume este endpoint (frecuencia de refresh, formato del prompt con la descripción, etc.).

## ✅ Acceptance Criteria

Checklist de validación. Marcar con `[x]` al completar.

### Schema MDX

- [ ] Cada `.mdx` en `src/content/projects/` valida contra el schema Zod
- [ ] Campos requeridos están presentes: `title`, `slug`, `stack`, `status`, `date`
- [ ] `slug` es único en toda la collection (constraint a nivel Zod o build)
- [ ] `status` solo acepta los valores del enum (`live` | `archived` | `wip`)
- [ ] `demoUrl` y `repoUrl` son URLs válidas (validación `z.string().url()`)
- [ ] El body markdown no está vacío (descripción requerida para el chat-bot)

### Endpoint `/projects.json`

- [ ] Retorna un array JSON válido (parseable con `JSON.parse`)
- [ ] Cada item cumple el shape `ProjectJSON` exactamente
- [ ] `slug` está presente y es único dentro del array
- [ ] `stack` es array de strings (puede ser vacío)
- [ ] `description` contiene el body markdown completo, sin truncar
- [ ] Content-Length es razonable (<100KB para 20 proyectos)

### Contrato con el chat-bot

- [ ] El chat-bot consume `/projects.json` en lugar de leer `.mdx` directo
- [ ] El chat-bot maneja cambios en el array (proyectos agregados/eliminados sin redeploy)
- [ ] Si el endpoint retorna 5xx, el chat-bot usa su último cache conocido y loggea warning
- [ ] Breaking changes en el schema se documentan en CHANGELOG antes de mergear

### Tests sugeridos

- [ ] Unit test: el schema Zod rechaza un `.mdx` con `status: "deleted"`
- [ ] Integration test: `GET /projects.json` retorna 200 y parseable
- [ ] Snapshot test: el shape de `ProjectJSON` no cambia sin version bump explícito
