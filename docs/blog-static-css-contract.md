# Blog Static CSS Contract

This project exposes a stable stylesheet for backend-rendered blog pages.

## Stable URL

Use this URL in published blog HTML:

- `/assets/blog/styles.v1.css`

Because this file lives under `public/`, Vite copies it as-is to `dist/assets/blog/styles.v1.css`.

## Source Of Truth

- Source file: `src/assets/blog/styles.v1.src.css`
- Build config: `vite.blog-css.config.ts`
- Compiled artifact: `public/assets/blog/styles.v1.css`

Build command:

```bash
pnpm build:blog-css
```

## Required HTML Contract

Backend-generated blog pages must include:

1. A stylesheet link to the stable URL.
2. `class="lwd-blog"` on `<body>` (or root wrapper) for style scoping.

Example:

```html
<link rel="stylesheet" href="https://<your-domain>/assets/blog/styles.v1.css" />
<body class="lwd-blog">
  <main class="blog-post-container">
    <article class="blog-post">
      <header class="blog-post__header">
        <h1 class="blog-post__title">...</h1>
        <time class="blog-post__date">...</time>
      </header>
      <div class="blog-post__content">...</div>
    </article>
  </main>
</body>
```

## Supported Content Styling (v1)

`styles.v1.css` supports typical rendered markdown/article content under `.blog-post__content`, including:

- headings (`h1`-`h6`)
- paragraphs
- links
- ordered and unordered lists
- blockquotes
- code/pre blocks
- tables
- images/video/iframe

## Versioning Policy

- `styles.v1.css` is immutable for breaking changes.
- If markup contract or visuals require breaking changes, publish `styles.v2.css`.
- Keep older versions available so previously published pages remain stable.

## Ownership

- Frontend owns `public/assets/blog/styles.v*.css` and versioning.
- Backend owns HTML generation and inclusion of the correct CSS URL.
