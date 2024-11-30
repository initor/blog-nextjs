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
        sans: ['var(--font-atkinson)', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-links': 'var(--foreground)',
            fontFamily: 'var(--font-atkinson), sans-serif',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-atkinson), sans-serif',
              fontWeight: '700',
              color: 'var(--foreground)',
            },
            p: {
              color: 'var(--foreground)',
              lineHeight: '1.65',
              fontSize: '1.125rem',
            },
            a: {
              color: 'var(--foreground)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              '&:hover': {
                opacity: 0.8,
              },
            },
            code: {
              color: 'var(--foreground)',
              backgroundColor: 'rgb(244 244 245)',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: 'rgb(244 244 245)',
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
