## GitHub Copilot Instructions (Project-Specific)

Purpose: Enable AI agents to make high‑quality, minimal changes to this Astro blog without introducing accidental complexity.

### 1. Architecture & Data Flow
- SSG Astro blog. Content lives under `src/content/blog` (Markdown + MDX) registered via `defineCollection` in `content.config.ts` with a Zod schema (no `draft` field yet—don't assume it exists).
- Dynamic routing: `src/pages/blog/[...slug].astro` maps each collection entry (`post.id`) to a page that renders `BlogPost.astro` layout. Listing page is `src/pages/blog/index.astro` (sorts by `pubDate` descending).
- Layout composition: `BlogPost.astro` pulls in `BaseHead`, `Header`, `Footer`, and uses `FormattedDate` for both `pubDate` and optional `updatedDate`.
- RSS: `src/pages/rss.xml.js` uses `getCollection('blog')` and spreads `post.data` into feed items; any frontmatter additions will appear in RSS automatically—be deliberate when adding new keys.
- Global look & tokens: CSS custom properties & shared styles are in `src/styles/global.css` (auto-included via Astro config / layout import chain).

### 2. Conventions & Patterns
- File naming: Components PascalCase (`Header.astro`), layouts PascalCase, content files kebab-case (`first-post.md`).
- Dates: Always format with the `FormattedDate.astro` component; never inline `toLocaleDateString()` in pages.
- Images: Use `<Image />` from `astro:assets` when already the pattern (hero and listing thumbnails). Provide empty `alt=""` only when decorative (current hero usage); if adding meaningful images, supply descriptive alt text.
- Frontmatter required: `title`, `description`, `pubDate`; optional: `updatedDate`, `heroImage`. Keep descriptions ≤ ~160 chars for SEO (`BaseHead`).
- Imports: Prefer relative paths. No path aliases currently—do not introduce.

### 3. Adding / Modifying Content
1. Create `src/content/blog/new-post.md` or `.mdx`.
2. Provide required frontmatter matching schema (a missing required field will fail type-check / build).
3. Start body headings at `##` (layout renders the `h1`).
4. If adding `updatedDate`, ensure it is logically ≥ `pubDate`.
5. If you introduce a new frontmatter field, update `content.config.ts` schema and consider RSS impact.

### 4. Accessibility & Semantics
- Maintain heading order (no skipping levels in content bodies).
- Only keep empty alt (`alt=""`) for purely decorative images; otherwise describe succinctly.
- Link text should be meaningful; avoid raw URLs as text.

### 5. Performance & Restraint
- Avoid client-side JS unless absolutely necessary—current site is fully static.
- Reuse existing layout/components; don't duplicate inline head/meta logic (extend `BaseHead.astro` if needed).
- Do not add heavy dependencies (UI kits, runtime state libs) without explicit instruction.

### 6. Build & Validation Workflow
- Install: `npm install` (see `package.json`).
- Dev: `npm run dev` (served at `http://localhost:4321`).
- Production check: `npm run build` then (optionally) `npm run preview`.
- After structural/content changes: run build to catch schema or MDX errors early.
- RSS integrity: ensure new posts appear with proper link pattern `/blog/<post.id>/` and dates serialize correctly.

### 7. Safe Change Checklist (Pre-commit for AI)
Before finishing a PR that changes pages/content/components:
- [ ] All new frontmatter satisfies schema; no unused fields added silently.
- [ ] Dates use `FormattedDate` component.
- [ ] No accidental removal of required meta in `BaseHead`.
- [ ] Any new image has appropriate `alt` (or justified empty alt if decorative).
- [ ] Build passes locally.

### 8. What NOT to Do
- Don't invent a `draft` frontmatter filter (schema doesn't define it yet).
- Don't rename existing component/layout files without updating every import.
- Don't inline styles that duplicate global patterns unless truly component-specific.
- Don't add global scripts or analytics without explicit request.

### 9. Incremental Improvement Opportunities (Low-Risk)
- Add optional `draft` boolean to schema + filter in listing & RSS (only if requested).
- Enhance `BaseHead.astro` with structured data (minimal, readable) if SEO need arises.
- Introduce simple date formatting unit test (once a test harness exists).

### 10. Communication & Ambiguity Handling
If a user request is vague (e.g., "improve layout"), propose 2–3 concrete, minimal options referencing actual files (e.g., spacing adjustments in `BlogPost.astro`, improving mobile grid in `blog/index.astro`). Proceed only after confirmation or choose the least invasive.

### 11. Commit Style
- Use focused commits: `content: add post about X`, `feat: improve blog listing responsive breakpoints`, `fix: correct alt text for hero image`.

### 12. Ready Responses
- Need file target: "Please specify which file or component you want to modify."
- Scope caution: "This would add a new dependency surface; please confirm before proceeding."

---
Last updated: 2025-09-28
