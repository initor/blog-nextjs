import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PIECE_FILES } from './assets';
import { PieceFrontmatterSchema, SLUG_PATTERN, type PieceFrontmatter } from './schema';

export interface Piece {
  slug: string;
  frontMatter: PieceFrontmatter;
  /** The note: the MDX body, trimmed. Empty when the piece has no note. */
  note: string;
}

/** The content tree is inconsistent. The message lists every problem, one per line. */
export class PieceContentError extends Error {
  constructor(problems: string[]) {
    super(problems.join('\n'));
    this.name = 'PieceContentError';
  }
}

export function notesDir(root: string): string {
  return path.join(root, 'src/content/design');
}

export function piecesDir(root: string): string {
  return path.join(root, 'public/design');
}

async function list(dir: string, kind: 'files' | 'folders'): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => (kind === 'files' ? entry.isFile() : entry.isDirectory()))
      .map((entry) => entry.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

/** The parsed note, or a problem description when its frontmatter is invalid. */
async function readNote(root: string, slug: string): Promise<Piece | string> {
  const source = await fs.readFile(path.join(notesDir(root), `${slug}.mdx`), 'utf8');
  let file: ReturnType<typeof matter>;
  try {
    file = matter(source);
  } catch (error) {
    // gray-matter's YAML errors don't say which file they came from.
    const reason = error instanceof Error ? error.message.split('\n')[0] : String(error);
    return `design/${slug}: frontmatter is not valid YAML (${reason})`;
  }
  const { data, content } = file;
  const parsed = PieceFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'frontmatter'}: ${issue.message}`);
    return `design/${slug}: invalid frontmatter (${issues.join('; ')})`;
  }
  return { slug, frontMatter: parsed.data, note: content.trim() };
}

/**
 * Every piece, newest first. Throws PieceContentError when the notes, their files and
 * the folders under public/design disagree, so a half-added piece fails `next build`.
 * The browser check passes requireThumbnails: false because it is what writes them.
 */
export async function getAllPieces(
  root: string = process.cwd(),
  { requireThumbnails = true }: { requireThumbnails?: boolean } = {},
): Promise<Piece[]> {
  const slugs = (await list(notesDir(root), 'files'))
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => name.slice(0, -'.mdx'.length));
  const folders = await list(piecesDir(root), 'folders');
  const required: readonly string[] = requireThumbnails ? PIECE_FILES : ['index.html'];

  const problems: string[] = [];
  const valid = slugs.filter((slug) => SLUG_PATTERN.test(slug));
  for (const slug of slugs) {
    if (!valid.includes(slug)) problems.push(`design/${slug}: the slug must be lowercase words joined by hyphens`);
  }
  for (const slug of valid) {
    for (const file of required) {
      if (!(await exists(path.join(piecesDir(root), slug, file)))) {
        problems.push(`design/${slug}: missing public/design/${slug}/${file}`);
      }
    }
  }
  for (const folder of folders) {
    if (!slugs.includes(folder)) {
      problems.push(`design/${folder}: public/design/${folder}/ has no note at src/content/design/${folder}.mdx`);
    }
  }

  const pieces: Piece[] = [];
  for (const slug of valid) {
    const piece = await readNote(root, slug);
    if (typeof piece === 'string') problems.push(piece);
    else pieces.push(piece);
  }
  if (problems.length > 0) throw new PieceContentError(problems);

  return pieces.sort(
    (a, b) => b.frontMatter.date.localeCompare(a.frontMatter.date) || a.slug.localeCompare(b.slug),
  );
}

export async function getPieceBySlug(slug: string, root: string = process.cwd()): Promise<Piece | undefined> {
  return (await getAllPieces(root)).find((piece) => piece.slug === slug);
}
