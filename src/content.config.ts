import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blogs = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blogs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    readTime: z.string().optional(),
    featuredImage: z.string().nullable().optional(),
    draft: z.boolean().default(false),
  }),
});

const learnings = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/learnings" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
    topic: z.string().optional(),
  }),
});

export const collections = { blogs, learnings };
