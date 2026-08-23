# SmartGen Text Converter Suite

A premium single-page, client-side toolkit for moving content between Plain Text, Markdown, and HTML. The interface is built as an editorial workbench: choose a conversion plate, paste source text, and copy or save the result without sending content to a server.

## Included tools

The workbench includes Plain Text to HTML, Markdown to HTML, HTML to Markdown, HTML to Plain Text, and Plain Text to Markdown. Each tool updates in place and includes a sample state, character counts, copy feedback, and a download action.

## Privacy and implementation

All transformations run in the browser. There is no upload queue, account requirement, or server-side conversion endpoint. The frontend is a React 19 and Tailwind 4 static project scaffolded for the Manus WebDev environment.

## SEO metadata

The document head includes an optimized title, meta description, canonical URL, Open Graph and Twitter metadata, a favicon reference, and an Organization JSON-LD block for SmartGen Labs. The canonical target is set to `https://bayzed123.github.io/SmartGenQR.oi/` for the requested repository destination.

## Local development

Run `pnpm install`, then `pnpm dev` to start the Vite development server. Run `pnpm check` for TypeScript validation and `pnpm build` for a production build.

## Repository export

The repository export is intended to live under `text-converter-suite/` in `bayzed123/SmartGenQR.oi` so the existing SmartGen site remains intact. The generated image URLs are lifecycle-managed project assets and are referenced directly by the UI as required by the WebDev asset workflow.
