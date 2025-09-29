# GitHub Copilot Repository Instructions

These instructions guide AI assistants (including GitHub Copilot Chat / PR Agents / Autofix) on how to work effectively in this repository.

## Project Overview
- Framework: Astro (static site generation + islands)
- Language: TypeScript + MD/MDX content
- Content location: `src/content/blog`
- Layouts: `src/layouts`
- Components: `src/components`
- Global styles: `src/styles/global.css`
- Config: `astro.config.mjs`, `tsconfig.json`, `content.config.ts`

## Goals / Priorities
1. Keep the codebase minimal, readable, and idiomatic Astro.
2. Prefer standard Astro & TypeScript features over additional dependencies.
3. Optimize for accessibility (semantic HTML, alt text, heading order, color contrast).
4. Maintain consistent styling and formatting.
5. Avoid over‑engineering—defer complex build tooling unless clearly justified.

## Conventions
- Components: PascalCase (`Header.astro`, `BaseHead.astro`).
- Utility/constants: `camelCase` exports inside `*.ts` files (e.g., `consts.ts`).
- Dates: Use the existing `FormattedDate.astro` component for blog posts.
- Imports: Use relative paths unless the path becomes brittle—avoid introducing path aliasing without need.
- Content frontmatter fields expected in blog posts:
  - `title` (string, required)
  - `description` (string, required for SEO)
  - `pubDate` (ISO date string)
  - `updatedDate` (optional ISO date string)
  - `heroImage` (optional path under `src/assets`)
  - `draft` (boolean; draft posts should not appear in production lists or RSS)

## Adding Blog Posts
1. Create a new `.md` or `.mdx` file in `src/content/blog`.
2. Follow existing frontmatter shape.
3. Provide meaningful `description` ( <= ~160 chars ).
4. Include alt-friendly hero image if using `heroImage`.
5. Keep headings starting at `h2` inside the body (Astro layout will supply the page `h1`).

## Accessibility Guidelines
- Every image: include descriptive `alt`. Avoid redundant phrases ("Image of...").
- Link text: meaningful, no raw URLs unless necessary.
- Maintain heading hierarchy; no skipping levels.
- Color contrast must meet WCAG AA.

## Performance Guidelines
- Prefer `<Image />` optimizations only if a future migration justifies it; currently keep static assets simple.
- Reuse shared components instead of duplicating markup.
- Avoid large client-side scripts; prefer server/SSG rendering.

## Testing & Validation
- Run `npm run build` before committing significant structural changes.
- RSS (`src/pages/rss.xml.js`) should continue to generate valid XML (no drafts, correct dates).
- Validate new MDX syntax locally.

## What AI Should NOT Do
- Do not introduce heavy runtime dependencies (e.g., large UI libraries) without explicit request.
- Do not refactor broadly for style-only changes.
- Do not change established component names without updating all imports.
- Do not expose unpublished drafts in lists or feeds.
- Do not add java script that runs in the browser unless absolutely necessary.

## Incremental Improvements Welcomed
- Adding simple unit tests around date formatting if a test harness is introduced later.
- Adding schema validation for content collection if missing / incomplete.
- Improving SEO metadata in `BaseHead.astro` (but keep minimal and readable).

## Security / Safety
- No user-generated content execution expected—keep assumptions conservative.
- If adding external scripts, use `async`/`defer` and justify necessity.

## PR / Commit Style
- Small, focused commits.
- Conventional summary lines preferred (e.g., `content: add post about X`, `feat: add accessible skip link`).

## How to Ask for Clarification (For AI Agents)
If a task request is ambiguous (e.g., "improve layout"), enumerate 2–3 concrete interpretation options and proceed with the most conservative unless instructed otherwise.

## Ready-Made Responses (Short Forms)
- Missing context: "Please specify which file or component you want to modify."
- Rejecting scope creep: "This change would add a new dependency surface; please confirm before proceeding."

## Roadmap Ideas (Do Not Implement Without Approval)
- Dark mode toggle (prefers-color-scheme based)
- Image optimization pipeline
- Simple tag taxonomy & tag index page
- Basic search (client-side or static index)

---
Last updated: 2025-09-28
