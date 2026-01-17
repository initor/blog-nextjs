# Personal Blog

A personal blog built with Next.js 15, React 19, and MDX.

**Live site**: [www.waynewen.com](https://www.waynewen.com)

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Content**: [MDX](https://mdxjs.com) for blog posts
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Deployment**: [Vercel](https://vercel.com)

## Prerequisites

- Node.js 20+ (recommended: use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- npm (comes with Node.js)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── config/        # Site configuration
├── content/       # MDX blog posts
├── fonts/         # Custom fonts
└── lib/           # Utility functions
```

## Adding Blog Posts

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
date: "2026-01-17"
description: "A brief description"
---

Your content here...
```

## Deployment

This site auto-deploys to Vercel on push to the main branch via GitHub integration.
