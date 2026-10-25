import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const postFields = {
  title: z.string().trim().min(1),
  date: z.coerce.date(),
  description: z.string().trim().optional(),
  pinned: z.boolean().default(false),
}

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object(postFields),
})

export const collections = { blog }
