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

Pushes to `main` automatically build and publish the site at https://alhadithy.com through `.github/workflows/deploy.yml`. The workflow builds Astro, uploads `dist/`, and deploys it to GitHub Pages. The custom domain is retained through `public/CNAME` and the repository's Pages settings. Review locally before pushing.
