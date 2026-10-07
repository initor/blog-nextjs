import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { getAllPieces, getPieceBySlug, PieceContentError } from '@/lib/design/pieces';

const ALL_FILES = ['index.html', 'thumb-light.png', 'thumb-dark.png'];
let root: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'design-pieces-'));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function writeNote(slug: string, frontmatter: string, body = '') {
  await mkdir(path.join(root, 'src/content/design'), { recursive: true });
  await writeFile(path.join(root, 'src/content/design', `${slug}.mdx`), `---\n${frontmatter}\n---\n${body}`);
}

async function writeFiles(slug: string, files: string[] = ALL_FILES) {
  await mkdir(path.join(root, 'public/design', slug), { recursive: true });
  for (const file of files) await writeFile(path.join(root, 'public/design', slug, file), 'x');
}

async function addPiece(slug: string, date: string, body = '') {
  await writeNote(slug, `title: '${slug}'\ndate: '${date}'\nlayout: document`, body);
  await writeFiles(slug);
}

describe('getAllPieces', () => {
  it('returns nothing when there are no pieces yet', async () => {
    await expect(getAllPieces(root)).resolves.toEqual([]);
  });

  it('returns pieces newest first, breaking date ties by slug', async () => {
    await addPiece('older', '2026-04-11');
    await addPiece('newer-b', '2026-10-05');
    await addPiece('newer-a', '2026-10-05');
    const slugs = (await getAllPieces(root)).map((piece) => piece.slug);
    expect(slugs).toEqual(['newer-a', 'newer-b', 'older']);
  });

  it('reads the frontmatter and the trimmed note', async () => {
    await writeNote(
      'logo',
      "title: 'Rolling Update'\ndate: '2026-10-05'\nlayout: screen\ndescription: 'Pods replaced one at a time.'",
      '\nWhy one at a time.\n\n',
    );
    await writeFiles('logo');
    expect(await getAllPieces(root)).toEqual([
      {
        slug: 'logo',
        frontMatter: { title: 'Rolling Update', date: '2026-10-05', layout: 'screen', description: 'Pods replaced one at a time.' },
        note: 'Why one at a time.',
      },
    ]);
  });

  it('treats a whitespace-only body as no note', async () => {
    await addPiece('quiet', '2026-10-05', '\n   \n');
    const [piece] = await getAllPieces(root);
    expect(piece.note).toBe('');
  });

  it('accepts an unquoted date', async () => {
    await writeNote('plain-date', "title: 'Plain'\ndate: 2026-10-05\nlayout: document");
    await writeFiles('plain-date');
    const [piece] = await getAllPieces(root);
    expect(piece.frontMatter.date).toBe('2026-10-05');
  });

  it.each(ALL_FILES)('fails when %s is missing', async (missing) => {
    await writeNote('half', "title: 'Half'\ndate: '2026-10-05'\nlayout: document");
    await writeFiles('half', ALL_FILES.filter((file) => file !== missing));
    await expect(getAllPieces(root)).rejects.toThrow(`design/half: missing public/design/half/${missing}`);
  });

  it('lets the browser check list pieces before their thumbnails exist', async () => {
    await writeNote('fresh', "title: 'Fresh'\ndate: '2026-10-05'\nlayout: document");
    await writeFiles('fresh', ['index.html']);
    const pieces = await getAllPieces(root, { requireThumbnails: false });
    expect(pieces.map((piece) => piece.slug)).toEqual(['fresh']);
  });

  it('fails when a folder under public/design has no note', async () => {
    await writeFiles('orphan');
    await expect(getAllPieces(root)).rejects.toThrow('design/orphan: public/design/orphan/ has no note');
  });

  it('ignores stray files in public/design', async () => {
    await addPiece('real', '2026-10-05');
    await writeFile(path.join(root, 'public/design', '.DS_Store'), 'x');
    await expect(getAllPieces(root)).resolves.toHaveLength(1);
  });

  it('fails on a slug that is not lowercase words joined by hyphens', async () => {
    await writeNote('Pod-Network', "title: 'Pods'\ndate: '2026-10-05'\nlayout: document");
    await writeFiles('Pod-Network');
    await expect(getAllPieces(root)).rejects.toThrow(
      'design/Pod-Network: the slug must be lowercase words joined by hyphens',
    );
  });

  it('fails on invalid frontmatter and names the field', async () => {
    await writeNote('bad', "title: 'Bad'\ndate: '2026-10-05'\nlayout: gallery");
    await writeFiles('bad');
    await expect(getAllPieces(root)).rejects.toThrow(/design\/bad: invalid frontmatter \(layout:/);
  });

  it('names the note when its YAML does not parse', async () => {
    await writeNote('bad-yaml', "title: Pods: the request path\ndate: '2026-10-05'\nlayout: document");
    await writeFiles('bad-yaml');
    await expect(getAllPieces(root)).rejects.toThrow(/^design\/bad-yaml: frontmatter is not valid YAML \(/);
  });

  it('reports every problem at once', async () => {
    await writeFiles('orphan');
    await writeNote('half', "title: 'Half'\ndate: '2026-10-05'\nlayout: document");
    await writeFiles('half', ['index.html']);
    const error = await getAllPieces(root).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(PieceContentError);
    expect((error as Error).message.split('\n')).toHaveLength(3);
  });
});

describe('getPieceBySlug', () => {
  it('finds a piece by slug and returns undefined for an unknown one', async () => {
    await addPiece('logo', '2026-10-05');
    expect((await getPieceBySlug('logo', root))?.frontMatter.title).toBe('logo');
    expect(await getPieceBySlug('missing', root)).toBeUndefined();
  });
});
