# Sistema de Diseño — Portfolio

Documentación del sistema visual: paleta, tipografía, spacing, componentes UI.

> 📌 Esta doc describe **cómo se ve** el sitio. Para arquitectura técnica del código, ver [`architecture.md`](./architecture.md).

## 🎨 Paleta de colores

| Token             | Hex       | Uso                              |
| :---------------- | :-------- | :------------------------------- |
| `--bg-primary`    | `#0a0a0a` | Background principal (dark mode) |
| `--bg-secondary`  | `#1a1a1a` | Cards, secciones alternas        |
| `--accent`        | `#00d9ff` | Cyan eléctrico (brand)           |
| `--text-primary`  | `#fafafa` | Texto principal                  |
| `--text-secondary`| `#a1a1a1` | Texto muted, captions            |
| `--error`         | `#ff5555` | Mensajes de error                |
| `--success`       | `#50fa7b` | Confirmaciones                   |

## ✍️ Tipografía

- **Sans-serif (UI):** Inter
- **Mono (código):** JetBrains Mono
- **Scale:** 12, 14, 16, 20, 24, 32, 48 px

## 📏 Spacing scale (Tailwind)

4, 8, 12, 16, 24, 32, 48, 64 px

## 🧱 Componentes base

- **Button** — variantes: `primary`, `secondary`, `ghost`
- **Card** — borde sutil + hover effect
- **Tag** — para tech stack (chips)
- **ChatWidget** — ver [`architecture.md`](./architecture.md) § Islands

## ⚙️ Tokens para Tailwind config

Mapeo de tokens semánticos a valores en `tailwind.config.mjs`:

```js
theme: {
  extend: {
    colors: {
      bg: {
        primary: '#0a0a0a',
        secondary: '#1a1a1a',
      },
      accent: '#00d9ff',
      text: {
        primary: '#fafafa',
        secondary: '#a1a1a1',
      },
      error: '#ff5555',
      success: '#50fa7b',
    },
  },
}
```

## 📐 Principios

- **Dark mode first** — devs y recruiters esperan dark mode por default
- **Mobile-first** — recruiters ven desde phones; diseño responsive desde 320px
- **Accesibilidad** — WCAG 2.1 AA mínimo (contraste, focus visible, alt text)
- **Tailwind utility-first** — evitar CSS custom salvo casos muy específicos
