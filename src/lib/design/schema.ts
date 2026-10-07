import { z } from 'zod';

/** Lowercase words joined by single hyphens. Names both the note and its folder under public/design. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const PIECE_LAYOUTS = ['document', 'screen'] as const;
export type PieceLayout = (typeof PIECE_LAYOUTS)[number];

/** True for a date that exists: it survives a round trip through Date in UTC. */
function isCalendarDate(value: string): boolean {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/**
 * gray-matter turns an unquoted YAML date into a Date at UTC midnight; keep the YYYY-MM-DD the
 * author wrote. A Date with a time of day came from a timestamp, so it is passed on whole and
 * fails the pattern.
 */
const dateString = z.preprocess(
  (value) => {
    if (!(value instanceof Date)) return value;
    const iso = value.toISOString();
    return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso;
  },
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a YYYY-MM-DD date')
    .refine(isCalendarDate, 'expected a date that exists'),
);

export const PieceFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: dateString,
  description: z.string().min(1).optional(),
  layout: z.enum(PIECE_LAYOUTS),
});

export type PieceFrontmatter = z.infer<typeof PieceFrontmatterSchema>;
