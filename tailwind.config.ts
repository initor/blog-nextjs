import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'sans-serif'],
        serif: ['var(--font-title)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-links': 'var(--link-color)',
            fontFamily: 'var(--font-body), sans-serif',
            h1: {
              fontFamily: 'var(--font-title), sans-serif',
              fontWeight: '700',
              color: 'var(--foreground)',
            },
            'h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-heading), sans-serif',
              fontWeight: '700',
              color: 'var(--foreground)',
            },
            p: {
              color: 'var(--foreground)',
              lineHeight: '1.58',
              fontSize: '1rem',
            },
            a: {
              color: 'var(--link-color)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationThickness: '1px',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: 'var(--link-color-hover)',
              },
            },
            code: {
              color: 'inherit',
              fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              backgroundColor: 'transparent',
              padding: '0',
              borderRadius: '0',
              fontWeight: 'inherit',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'transparent',
              code: {
                backgroundColor: 'transparent',
                padding: '0',
              },
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'media',
}

export default config
