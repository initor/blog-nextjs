import { z } from "zod";

/**
 * Schema for raw frontmatter as parsed by gray-matter.
 * Does NOT include readingTime (computed after parsing).
 */
export const FrontmatterSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

/** Raw frontmatter type inferred from schema (no readingTime) */
export type Frontmatter = z.infer<typeof FrontmatterSchema>;
