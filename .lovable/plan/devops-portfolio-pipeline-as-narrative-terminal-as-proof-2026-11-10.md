# DevOps Portfolio — "Pipeline as narrative, terminal as proof"

A single animated page at `/` built exactly to the brief.

## Sections
1. **Sticky header** — wordmark, nav, Build·Test·Deploy·Monitor·Scale stepper (line fills with scroll, active dot orange), staging/production sliding pill toggle, CTA.
2. **Hero (cream)** — oversized headline with one orange word, role line, two CTAs, terminal widget typing `kubectl get deployments` with PENDING → RUNNING → STABLE badge, ticking radar/coordinate corner, scroll cue.
3. **Work (black)** — 6 blueprint cards (CI/CD, IaC, Kubernetes, Observability, GitOps, Chaos): eyebrow + icon, title, Problem → Approach → Outcome, mono tag pills staggering in, terminal line typing on view/hover, orange lift/glow; staggered reveal.
4. **Toolchain (cream)** — 5 layer groups with draw-in line icons; hover highlights one in orange, dims others.
5. **About/Principles (black)** — bio, 3 staggered principles, rotating orbit diagram.
6. **Contact (solid orange)** — big closing line, email CTA with animated arrow, pulsing "available" dot.

## Behaviour
- Theme toggle inverts every section's light/dark assignment with a staggered wave (per-section transition delay).
- `prefers-reduced-motion`: opacity-only fades, no typing loops or rotation.
- Fully responsive, keyboard accessible, realistic content (placeholder name/email to be replaced).

## Technical
- Fonts: Space Grotesk + JetBrains Mono via `<link>` in root head.
- Tokens in `src/styles.css`: cream, ink, orange; sections use `data-mode` light/dark classes.
- Framer Motion (`bun add framer-motion`) for reveals, `useScroll` for stepper.
- Components under `src/components/portfolio/*`; route head() with real title/description.
