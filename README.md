# Jafar Alhadithy

A static Astro portfolio with a charcoal introduction, about section, selected work, and independently colored projects.

## Local development

Run `npm install`, then `npm run dev`. A project-local Node 24 runtime is included for Astro; your system Node installation is unchanged.
Build with `npm run build`. Preview the production output with `npm run preview`.

## Editing

- `src/pages/index.astro`: copy, project markup, images, and Vimeo embed.
- `src/styles/global.css`: layout and responsive styles.
- `public/`: supplied WebP images and custom-domain CNAME.
- `.hero-background` is intentionally empty for future background media.
- Navy is scoped to `.project-patek`. Future projects can define their own colors.
- Vimeo autoplay and looping are disabled.

## Publishing

Nothing is deployed automatically. Build output is in `dist/`, including CNAME. GitHub Pages will need an Astro build-and-deploy workflow or a publishing branch containing the output; the source root is no longer a buildless site. Review locally before publishing.
