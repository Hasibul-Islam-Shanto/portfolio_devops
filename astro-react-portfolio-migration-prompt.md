# Migration Specification: React / TanStack Start Portfolio to Astro

## Role

Act as a senior frontend engineer specializing in Astro, TypeScript, web performance, accessibility, SEO, and careful framework migrations. You will migrate an existing portfolio website from its current React + TanStack Start setup to Astro while preserving its visual identity, content, interactions, responsive behavior, and quality.

Work directly in the existing repository. Inspect before changing anything. Do not blindly regenerate the site or replace its design with a generic portfolio template.

## Primary objective

Migrate the existing portfolio to **Astro with static output by default**, keeping client-side JavaScript only for interactions that genuinely require it. Preserve the current design and behavior as closely as possible while improving initial HTML availability, reducing unnecessary JavaScript, and maintaining SEO.

The migration is complete only when the Astro site builds successfully, all required routes work, key interactions are verified, and the project documentation explains how to develop, test, build, and deploy it.

## Existing project context

The repository currently has this approximate structure:

```text
/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── portfolio/
│   │   │   ├── ComingSoon.tsx
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── DeployFlow.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── PipelineRail.tsx
│   │   │   ├── Sections.tsx
│   │   │   ├── Work.tsx
│   │   │   └── hooks.ts
│   │   └── ui/                 # 45 unused shadcn/Radix components
│   ├── hooks/
│   │   └── use-mobile.tsx      # believed unused
│   ├── lib/                    # believed unused/platform-specific helpers
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── blog.tsx
│   │   └── case-studies.tsx
│   ├── test/
│   │   ├── setup.ts
│   │   ├── app-routing.test.tsx
│   │   └── custom-cursor.test.tsx
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

Treat this tree as a starting point, not as unquestionable truth. Inspect the real repository, `package.json`, framework configuration, scripts, imports, generated files, and tests before deciding what is safe to remove.

## Current site behavior to preserve

### Routes

- `/`: complete one-page portfolio.
- `/blog`: currently a “Coming Soon” placeholder.
- `/case-studies`: currently a “Coming Soon” placeholder.
- Not-found route: centered 404 page with a link back to `/`.

The home page is arranged as five main stages/sections:

1. `#build` — hero
2. `#test` — work/projects
3. `#deploy` — toolchain
4. `#monitor` — about
5. `#scale` — contact

Preserve all existing section IDs, meaningful link targets, and navigation behavior.

### Visual identity and styling

The existing design is intentional and must not be redesigned:

- Warm sand / paper: `#efe6d8`
- Ink navy / night: `#10151f`
- Coral signal red: `#e8503a`
- `.mode-light`: sand background and ink text
- `.mode-dark`: ink background and sand text
- `.mode-signal`: coral background and ink text
- Sharp-corner aesthetic, including the current global border-radius override except for intentionally round cursor elements
- Space Grotesk for display/body text
- JetBrains Mono for monospace content
- Existing CSS variables, custom animations, section spacing, responsive layout, project-card checkerboard tones, and interaction states

The current stylesheet uses Tailwind CSS v4 and custom CSS. Preserve the existing styling wherever possible; avoid unnecessary rewrites. Check the actual Tailwind integration and ensure the chosen Astro setup supports Tailwind v4 correctly.

Fonts are currently loaded through Google Fonts. Preserve the font families and weights. Prefer a privacy/performance-conscious loading strategy where practical, without introducing visual regressions or blocking rendering unnecessarily.

### Active components and behavior

Only the following portfolio components are known to be active. Verify all usage before removing anything.

#### Header

- Fixed top navigation.
- Uses a `scrolled` state when `window.scrollY > window.innerHeight * 0.6`.
- Toggles `.is-scrolled`, changing blur/shadow and vertical padding.
- Contains stage definitions, section/hash navigation, and social links.
- Navigation includes in-page links such as `/#test` and `/#scale`.

#### Hero

- Headline: “Making complex systems run like they should.”
- Word-by-word entrance animation: opacity `0 → 1`, vertical offset `40 → 0`, stagger delay `0.1 + i * 0.07`.
- Highlights “run” with the existing signal-text style.

#### DeployFlow

- Loops through five pipeline nodes: Commit, Build, Test, Deploy, Monitor.
- Uses a 900 ms interval.
- Advances the pipeline step from `-1` to `5`, increments the release counter from `#1841+`, and updates statuses such as `QUEUED`, `RUNNING`, and `HEALTHY`.
- Animates a horizontal progress line and glowing dot across nodes.

#### PipelineRail

- Fixed right-side scroll-progress indicator.
- Becomes visible after scrolling past 50% of the `#build` hero height.
- Determines active stage based on which section top has crossed the viewport midpoint.
- Calculates continuous progress between sections.
- Uses a spring animation with stiffness `140`, damping `26`.
- Current implementation uses `requestAnimationFrame` on scroll/resize. Preserve smooth behavior but avoid duplicate expensive scroll calculations.

#### Work

- Six static project cards with fields such as Stage, Category, Title, Frame, Problem, Approach, Outcome, Tags, CLI Command, and CLI Result.
- Alternating `.tone-m-*` and `.tone-d-*` classes form a checkerboard pattern on desktop and adapt to a single-column mobile layout.
- Uses `IntersectionObserver` with a `-15%` margin for in-view typing effects.
- Types `$ <cmd>` at approximately 22 ms per character, then `<res>` at approximately 18 ms per character.
- Displays a blinking `▋` cursor until typing is complete.
- Keep all actual project content and links from the repository; do not invent replacements.

#### Toolchain

- Five categories: CI/CD, Infrastructure, Orchestration, Observability, Cloud.
- Tracks the hovered/focused card.
- Defaults to “Infrastructure” with a “Core” badge when nothing is hovered or focused.

#### About

- Three numbered principles.
- Scroll-reveal behavior.
- Pure CSS orbital radar animation using `.spin-slow` and `.spin-rev`.

#### Contact

- Coral-red `mode-signal` section.
- Existing mailto CTA: `hello@shanto.dev`.
- Pulsing availability badge.

#### CustomCursor

- DOM/requestAnimationFrame-based custom cursor.
- Disabled on touch/coarse pointer devices and where hover is unavailable.
- Adds `.has-custom-cursor` to the HTML element to hide the native cursor.
- Moves an 8 px dot immediately on mouse movement.
- A 36 px ring trails using frame-rate-independent interpolation:
  `alpha = 1 - Math.pow(1 - 0.18, dt / 16.67)`.
- Ring expands to 56 px on interactive elements (`a`, `button`, `[data-cursor-interactive]`).
- Displays `data-cursor-label` text in the ring.
- Squeezes on mouse down for at least 100 ms.
- Creates a 400 ms expanding ripple for `[data-cursor-cta]` clicks.
- Ensure event listeners and animation frames are cleaned up if the script is initialized more than once or the page lifecycle requires it.
- Never make the custom cursor the only way to identify an interactive element. Preserve visible keyboard focus and standard cursor behavior on touch devices.

#### Existing utility hook

`useTyped()` and its `Mode` type live in `hooks.ts`. Port only the behavior and types that are actually needed. Do not retain React hooks in Astro-only components.

## Migration architecture

Use **Astro with static output** unless inspection identifies a concrete requirement that makes static output unsuitable. There is no known backend, database, API fetching, authentication, or global state store.

Use Astro's file-based routing:

```text
src/
├── layouts/
│   └── base-layout.astro
├── pages/
│   ├── index.astro
│   ├── blog/
│   │   └── index.astro
│   ├── case-studies/
│   │   └── index.astro
│   └── 404.astro
├── components/
│   └── ... Astro components and any deliberately retained React islands
├── scripts/
│   └── ... browser-side TypeScript modules where useful
├── styles/
│   └── global.css
└── content/                    # optional future blog content
```

Adjust the structure if the existing codebase or current Astro conventions make another arrangement clearer. Avoid creating files purely to match this example.

### Naming convention: kebab-case (mandatory)

All component filenames and component names in the Astro migration must use **kebab-case**.

Examples:
- `BaseLayout.astro` → `base-layout.astro`
- `Header.astro` → `header.astro`
- `Hero.astro` → `hero.astro`
- `DeployFlow.astro` → `deploy-flow.astro`
- `PipelineRail.astro` → `pipeline-rail.astro`
- `CustomCursor.tsx` / `custom-cursor.astro` → `custom-cursor.astro`
- `Work.astro` → `work.astro`
- `ComingSoon.astro` → `coming-soon.astro`
- `Toolchain.astro` → `toolchain.astro`

Apply kebab-case consistently to component files and any new component-related directories or standalone script filenames. Use PascalCase for component identifiers only where the framework or language requires it; Astro component imports may use conventional identifiers such as `Header` when needed by syntax, but the actual component filename must remain kebab-case (for example, import `../components/header.astro`). Do not leave migrated component files in PascalCase or camelCase. Update every import and test reference after renaming, and verify the build after the changes.

### Component strategy

Classify each component based on actual behavior:

- **Convert to `.astro`** when it is mostly static markup, props, and content.
- **Use plain browser-side TypeScript/DOM scripts** for simple effects such as scroll tracking, cursor movement, IntersectionObserver typing, and pipeline timers, where that is simpler and lighter than hydrating React.
- **Keep a React component as an Astro React island** only if the interaction would be materially easier or safer to preserve in React. Use the least eager hydration directive that still satisfies the design, and explain why the island is necessary.
- Do not automatically convert every component to React islands. That would preserve unnecessary client-side JavaScript and undermine the static-first goal.
- Do not force everything into Astro if doing so creates fragile, hard-to-maintain imperative code. Make a deliberate, documented trade-off.

The preferred initial approach is to convert the static page structure to Astro and keep animation code in small, isolated scripts. Retain React selectively when the benefit is clear.

### CSS and Tailwind

- Audit `src/styles.css` and identify the active portion before editing.
- Preserve design tokens, keyframes, responsive rules, mode classes, and cursor styles.
- Keep Tailwind CSS v4 working using a currently supported Astro integration.
- Avoid mixing incompatible Tailwind v3 and v4 configuration patterns.
- Ensure global styles load exactly once.
- Remove duplicate or dead CSS only after verifying it is unused.
- Do not rename classes or IDs without updating every related selector, script, test, and navigation link.

### Routing, metadata, and SEO

- Implement `/`, `/blog`, `/case-studies`, and a custom `404.astro`.
- Ensure direct requests to each route work after static deployment.
- Preserve section hash links and make them keyboard-accessible.
- Add appropriate page titles and descriptions for all pages.
- Set canonical URLs only when the production site origin is known from repository configuration or explicitly provided. Do not invent a domain.
- Preserve or improve Open Graph and social-sharing metadata if present.
- Inspect and preserve `public/robots.txt`; ensure it is appropriate for production and does not accidentally block the site.
- Add a sitemap if appropriate, using the actual production site URL only when it is known.
- Ensure headings, links, and project descriptions are present in the generated HTML.
- Use semantic HTML, meaningful link text, image alt text, and correct heading hierarchy.
- Avoid promising ranking improvements; focus on crawlable HTML, correct metadata, and measurable performance.

### Accessibility and motion

- Preserve keyboard navigation and visible focus states.
- Ensure all interactive controls have meaningful accessible names.
- Ensure hover-only behavior has an equivalent focus behavior where relevant.
- Respect `prefers-reduced-motion: reduce` for nonessential entrance, scroll, cursor, typing, and looping animations. In reduced-motion mode, display complete content without forcing visitors to wait for animated text.
- Do not hide meaningful content from assistive technology while animations run.
- Ensure custom cursor behavior is disabled on coarse pointers/touch devices and doesn't interfere with pointer events or text selection.
- Prevent layout shifts caused by delayed fonts, animation, or dynamically inserted content.

## Dependency and configuration cleanup

The current repository reportedly contains unused dependencies such as:

- `@tanstack/react-query`
- `react-hook-form`
- `zod`
- `recharts`
- `embla-carousel-react`
- `date-fns`
- `vaul`
- `sonner`
- `cmdk`
- Many unused shadcn/Radix UI components
- Platform-specific error reporting wrappers and an unused `cn()` helper

These are candidates for removal, not automatic deletions. Verify real imports and scripts first. Remove dependencies only when they are no longer needed by the migrated app, tests, build tooling, or retained React islands.

Keep only the minimum dependencies that the implementation actually uses, likely including Astro, TypeScript, Tailwind CSS v4 integration, and a Lucide icon package if the chosen implementation needs it. If retaining React islands, add and configure the Astro React integration and required React packages. Do not install a large animation library unless there is a demonstrated need.

Remove obsolete TanStack Start/Router and Vite configuration only after Astro is running and any required tooling has been migrated. Keep useful tests and tooling where practical.

## Testing and validation requirements

Do not mark the migration complete solely because the build passes.

### Build and route validation

- Install dependencies using the package manager and lockfile already used by the repository, unless there is a clear reason to change.
- Run formatting, linting, type checking, and tests if those scripts exist or can be retained.
- Run the production Astro build.
- Verify the generated output includes all four expected routes or the correct static-hosting equivalents.
- Confirm no broken local links, missing assets, hydration errors, or console errors.
- Confirm direct navigation and page refresh work on `/`, `/blog`, `/case-studies`, and a non-existent route.

### Visual and behavior validation

Test at minimum:

- Desktop, tablet, and mobile viewport widths.
- Header scroll transition and section navigation.
- Hero staggered headline animation.
- Pipeline node progression, status changes, release counter, and progress line.
- PipelineRail visibility, active stage, and progress behavior.
- Six project cards, checkerboard layout, and in-view terminal typing.
- Toolchain default/focus/hover states.
- About section reveal and orbital animation.
- Contact CTA and availability badge.
- Custom cursor hover labels, click ripple, mouse-down squeeze, and touch-device disablement.
- Keyboard-only navigation and reduced-motion mode.
- Font loading, contrast, and layout stability.

Preserve or adapt existing Vitest tests. Do not delete tests just because the framework changed. Update tests to validate the new routes and interactions, and add tests for critical regressions. If browser-based end-to-end tooling is available, use it for route and interaction verification; otherwise clearly state what was and was not tested.

### Performance validation

- Compare the current site and migrated production build where the original build is available.
- Measure Lighthouse Performance, Accessibility, Best Practices, and SEO on representative routes when possible.
- Inspect generated HTML to verify content is available before client JavaScript executes.
- Check JavaScript bundle sizes and avoid shipping the full React runtime if no React islands remain.
- Avoid arbitrary performance claims or fabricated benchmark numbers. Report actual measurements and the conditions under which they were obtained.
- Treat reduced JavaScript as a design objective, not as a reason to remove necessary behavior.

## Migration workflow

Proceed in small, verifiable stages:

1. **Inspect and report**
   - Read `package.json`, lockfile, `tsconfig.json`, Vite/Tailwind/Vitest configs, route files, active portfolio components, CSS, and tests.
   - Identify the package manager, current rendering behavior, existing scripts, production build setup, and actual imports.
   - Summarize the migration plan and any blockers before destructive cleanup.

2. **Create the Astro foundation**
   - Set up Astro and TypeScript.
   - Configure Tailwind CSS v4 correctly.
   - Create the base layout, metadata handling, global CSS import, and file-based routes.
   - Keep the original application recoverable in version control.

3. **Migrate the visual structure**
   - Port the homepage section structure and existing content.
   - Implement the placeholder routes and 404 page.
   - Confirm styling and responsive layout before porting complex interactions.

4. **Migrate interactions**
   - Port each interaction deliberately.
   - Prefer small, reusable browser scripts where appropriate.
   - Preserve animation timing and behavior closely.
   - Add cleanup and reduced-motion behavior.
   - Keep React islands only with a documented reason.

5. **Clean up**
   - Remove unused components, dependencies, and obsolete framework files after import and build verification.
   - Keep relevant tests, documentation, and project configuration.

6. **Validate**
   - Run checks and production build.
   - Test all routes, key animations, mobile behavior, keyboard access, and reduced-motion mode.
   - Review the generated output and performance measurements.

7. **Document and summarize**
   - Update `README.md` with prerequisites, install commands, dev server, tests, production build, preview, and deployment notes.
   - List files added, changed, removed, dependencies added/removed, and any retained React islands.
   - Report test/build commands and their actual results.
   - List remaining issues or unverified behavior honestly.

## Constraints

- Do not change the portfolio's branding, visual direction, copy, project data, or contact details unless a clear defect requires it.
- Do not invent project details, social URLs, canonical URLs, or performance results.
- Do not delete the original implementation before the migrated replacement works.
- Do not replace working custom design with generic starter-template UI.
- Do not add a backend, database, CMS, or API layer; none is currently required.
- Do not ship unused shadcn/Radix components or unnecessary libraries.
- Do not use `client:load` on every component by default.
- Do not leave links pointing to the old router's behavior.
- Do not ignore accessibility or reduced-motion support.
- Avoid broad unrelated refactors.
- If an assumption is uncertain, inspect the code or ask a focused question rather than guessing.
- If the task is being performed by an autonomous coding agent, make changes directly, run the checks available in the environment, and finish with a concise, factual report.

## Definition of done

The migration is complete when:

- [ ] Astro is the active application framework.
- [ ] Production build succeeds.
- [ ] `/`, `/blog`, `/case-studies`, and the 404 page work.
- [ ] The portfolio's visual identity and content are preserved.
- [ ] All listed interactions work or any intentional changes are documented.
- [ ] Responsive layout, keyboard access, and reduced-motion behavior are verified.
- [ ] The generated HTML contains the important portfolio content and SEO metadata.
- [ ] Client-side JavaScript is limited to required behavior.
- [ ] Unused dependencies and obsolete framework files are removed safely.
- [ ] Tests and documentation are updated.
- [ ] The final report distinguishes verified results from anything not tested.

## Final response format

When finished, provide:

1. **Migration summary** — what changed and why.
2. **Architecture decisions** — which components became Astro, which use browser scripts, and any React islands retained.
3. **Routes and SEO** — pages, metadata, canonical/sitemap status.
4. **Dependencies and cleanup** — added, retained, and removed packages.
5. **Validation results** — exact commands and pass/fail outcomes.
6. **Performance findings** — measured results only, with context.
7. **Remaining work** — anything incomplete, uncertain, or requiring manual review.
