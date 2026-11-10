# Portfolio update — 6 targeted changes

Edit in place; About and Contact content untouched (only corners squared).

1. **Hero + floating header** — Hero becomes charcoal with cream text, orange "run" and orange flow accents. Header inset 16–24px from edges, charcoal, square corners, hairline border + shadow. Past the hero it shrinks in height and gains blur + stronger shadow; reverses smoothly at top.
2. **No rounded corners anywhere** — header, buttons, cards, tags, rail dots, widgets all square. Global radius reset plus removal of `rounded-*` classes.
3. **Deployment-flow diagram replaces the terminal** — 5 square nodes Commit → Build → Test → Deploy → Monitor with icons, thin connecting lines, mono labels below. A glowing orange dot loops left-to-right; each node lights orange as it passes, then settles. Vertical layout on phones. Reduced motion: static with one node highlighted.
4. **Pipeline rail** — capsule removed; line, dots and labels float on the page. Runs near-full viewport height with 5 evenly spaced stages. Keeps scroll fill, active state, both directions, fade-in after hero, dots-only on tablet, hidden on phones.
5. **Work section** — 2-column grid of 6 cards, checkerboard charcoal/cream (row-alternating so no adjacent cards match; single column alternates too). Each card: orange "BUILD / CI/CD" tag + "PROJECT / 01", title, one-liner, Problem/Approach columns, orange "✓ Outcome: …", square tech tags, divider, command + result line. Text colours invert per card.
6. **Toolchain** — 5 cards with icons: Activity (CI/CD), Layers (Infrastructure), Network/hexagon (Orchestration), Eye (Observability), Cloud (Cloud). Orange mono label, spaced tool list, square corners. Infrastructure shown as featured with orange border; hover turns icon and border orange. Section background unchanged.

## Technical
- Files: `styles.css` (radius 0, header scrolled state, card surface classes), `Header.tsx` (scroll state), `Hero.tsx` (new `DeployFlow`, section mode dark), `routes/index.tsx` (hero mode → dark), `PipelineRail.tsx`, `Work.tsx`, `Sections.tsx` (toolchain + radius cleanup).
- Verify with Playwright at 1440 / 1024 / 390.
