import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localizedString = z.object({
  es: z.string().min(1),
  en: z.string().min(1),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
  schema: z.object({
    title: localizedString,
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    stack: z.array(z.string()),
    status: z.enum(['live', 'archived', 'wip']),
    demoUrl: z.url().optional(),
    repoUrl: z.url().optional(),
    date: z.coerce.date(),
    summary: localizedString.optional(),
    image: z.string().optional(),
  }),
});

export const collections = { projects };
