import { FrontmatterSchema } from '@/lib/mdx/schemas';
import { ZodError } from 'zod';

describe('FrontmatterSchema', () => {
  describe('valid inputs', () => {
    it('parses minimal valid input with title and date', () => {
      const result = FrontmatterSchema.parse({
        title: 'Hello',
        date: '2024-01-01',
      });
      expect(result.title).toBe('Hello');
      expect(result.date).toBe('2024-01-01');
    });

    it('defaults tags to empty array when not provided', () => {
      const result = FrontmatterSchema.parse({
        title: 'Hello',
        date: '2024-01-01',
      });
      expect(result.tags).toEqual([]);
    });

    it('parses full valid input with all optional fields', () => {
      const result = FrontmatterSchema.parse({
        title: 'Hello',
        date: '2024-01-01',
        tags: ['a', 'b'],
        category: 'dev',
        description: 'desc',
        ogImage: '/img.png',
      });
      expect(result.title).toBe('Hello');
      expect(result.date).toBe('2024-01-01');
      expect(result.tags).toEqual(['a', 'b']);
      expect(result.category).toBe('dev');
      expect(result.description).toBe('desc');
      expect(result.ogImage).toBe('/img.png');
    });

    it('accepts explicit empty tags array', () => {
      const result = FrontmatterSchema.parse({
        title: 'Hello',
        date: '2024-01-01',
        tags: [],
      });
      expect(result.tags).toEqual([]);
    });
  });

  describe('invalid inputs', () => {
    it('throws ZodError when title is missing', () => {
      expect(() =>
        FrontmatterSchema.parse({ date: '2024-01-01' })
      ).toThrow(ZodError);
    });

    it('throws ZodError when title is empty string', () => {
      expect(() =>
        FrontmatterSchema.parse({ title: '', date: '2024-01-01' })
      ).toThrow(ZodError);
    });

    it('throws ZodError when date is missing', () => {
      expect(() =>
        FrontmatterSchema.parse({ title: 'Hello' })
      ).toThrow(ZodError);
    });

    it('throws ZodError when date is empty string', () => {
      expect(() =>
        FrontmatterSchema.parse({ title: 'Hello', date: '' })
      ).toThrow(ZodError);
    });

    it('throws ZodError when both title and date are missing', () => {
      expect(() => FrontmatterSchema.parse({})).toThrow(ZodError);
    });
  });

  describe('edge cases', () => {
    it('strips unknown fields from the result', () => {
      const result = FrontmatterSchema.parse({
        title: 'Hello',
        date: '2024-01-01',
        unknown: 'field',
      });
      expect(result).not.toHaveProperty('unknown');
      expect(result.title).toBe('Hello');
    });

    it('throws ZodError when tags contain non-string elements', () => {
      expect(() =>
        FrontmatterSchema.parse({
          title: 'Hello',
          date: '2024-01-01',
          tags: [123],
        })
      ).toThrow(ZodError);
    });
  });
});
