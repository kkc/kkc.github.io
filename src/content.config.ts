import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const posts = defineCollection({loader:glob({pattern:'**/*.md',base:'./src/content/posts'}),schema:z.object({title:z.string(),date:z.string(),description:z.string(),tags:z.array(z.string()).default([]),permalink:z.string()})});
const notes = defineCollection({
  loader: glob({pattern: '**/*.md', base: './src/content/notes'}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(['reading', 'concept', 'experiment', 'devlog']),
    topics: z.array(z.enum(['systems', 'go', 'storage', 'build', 'ai', 'devlog'])).min(1),
    tags: z.array(z.string()).default([]),
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(['draft', 'published']).default('draft'),
    sourceDate: z.string().optional(),
    sources: z.array(z.object({label: z.string(), url: z.url()})).default([]),
    relatedPosts: z.array(z.string()).default([]),
  }),
});
export const collections={posts, notes};
