# Chaewon Lim — Portfolio

Personal design portfolio for [Chaewon Lim](https://chaewon.works) — interactive artist turned product designer (MDES, Carnegie Mellon University, seeking a 2027 summer design internship).

**Live:** [chaewon.works](https://chaewon.works)

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
npm run dev      # local dev server → http://localhost:3000
npm run build    # production build
npm run start    # serve the built app
```

## Structure

```
app/              Next.js routes & pages (home, about, contact, design-system, case-studies)
app/components/   shared components (header, footer, logo, cursor, parallax/fade)
public/           static assets (photos, icons, resume)
scripts/          one-off inspection & regression scripts
```

## Deployment

Deployed on Vercel — `vercel --prod` publishes to `chaewon.works`.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

Source code is MIT licensed. All portfolio content, case studies, images, and personal branding are © Chaewon Lim — all rights reserved.
