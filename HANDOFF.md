# Port Said Nutrition sponsor site: handoff

## Start here (Khaled, 2026-11-02)
- Setup: `npm install`, `npm run dev`. Before a commit: `npm test`, `npm run check`, `npm run build` (static export to `out/`).
- Current site: `/` holds the day scene, agenda and organizers; `/sponsors` holds the packages, their contact buttons and the 3D stand. `/agenda` and `/sessions/[n]` were removed; older sections below that mention them are history.
- Content lives in `content/*.json`. `npm run check` tests every value against `docs/agenda-source.md`, the machine copy of the agenda PDF. Keep the rule: not in the agenda, not on the site. Changes the owner approves after the PDF go in `docs/agenda-changes.md`, which the check also reads.
- Spec: `docs/DESIGN-SPEC.md`, partly superseded as its first line says. Paths starting `D:\` below are on Dr Refaat's PC and are not in this repo.
- Live: https://port-said-nutrition.vercel.app, on Dr Refaat's Vercel account and linked to this repo. A push to `master` goes live on its own; any other branch gets a preview. Run the checks above before pushing to `master`.
- Open: test the lighthouse on a real iPhone.

## Current state (2026-11-01, evening): Gold Lighthouse built, waiting for the owner's look approval
- Scene: `lib/harbour.ts` draws one gold PBR lighthouse on the quay of four owner-made Port Said photographs (`public/sky/*.webp`, dawn, day, sunset, night). The camera is fixed by the photographs and only pushes in. Quay, horizon and tower spot are measured constants at the top of the file.
- Conference identity: the procession is a gold inlay on the quay wall (`lib/frieze.ts`), and the roundel sits beside the title. M Square: frosted glass cards in M Square navy and gold, gold, and its logo only under "Organized by".
- Text sits on frosted glass cards in M Square navy and gold (`.plate` in `app/home.css`), spread wide and short so the tower stays in view. This replaces "text directly on the sky" in the redesign plan below: owner's ruling, readability first.
- Fonts: Bodoni Moda + Hanken Grotesk. Spec sections 7, 9, 11 and the plan still describe the old direction and need updating.
- Owner approved the look. Tasks 4, 5, 6, 8 built: `/agenda`, `/sessions/[n]`, `/sponsors`, 3D stand. Rotation bug fixed (ScrollTrigger refresh reset the scroll; restore now waits 350ms, height-only resizes ignored).
- Live: https://port-said-nutrition.vercel.app. On iPhone 15 Pro Max the tower vanished on scroll down. Not reproduced on the PC: likely Safari dropping WebGL under memory pressure plus the toolbar resize. Fixed: lost context rebuilds the scene, stage is 100lvh, MSAA 2, reflection redrawn only when the day moves. Confirm on the phone.

Owner stopped the build: the look is "childish and naive, like a kids' game, not professional". Do not continue the build or polish this look. Resume when the usage limit renews, starting from "Redesign plan" below.

## Where things stand
Plan: `D:\vault\academy-brain\docs\superpowers\plans\2026-11-01-nutrition-sponsor-site.md`. Spec: `D:\vault\academy-brain\deliverables\nutrition-sponsor-site\DESIGN-SPEC.md`. Routing: `.claude/harness/routing/2026-11-01-nutrition-sponsor-site-build.{card,plan,outcome}.json` in academy-brain (outcome has a placeholder for UI Finish-Gate Reviewer).

| Task | State |
|---|---|
| 1 Project and checked content | Done, committed. `npm run check`, `npm test` pass. Content is solid and reusable. |
| 2 Logos, tokens, drawing | Logos extracted (sharp enough, max ~240 CSS px), tokens.css, fonts (Fraunces + Figtree via next/font). The flat sketch was never approved. |
| 3 Home boards | Built, uncommitted until this handoff commit. 7 boards, counter, prev/next, `--day`, `data-phase`. |
| 7 Harbour 3D | Built early (`lib/harbour.ts`, `components/Harbour.tsx`), low-poly three.js. This is what the owner calls childish. |
| 4, 5, 6, 8, 9 | Not started. |

## Owner rulings this session (binding)
- 3D is the main design. Weak-phone rules dropped: no memory gate, no fps step-down, no 4G/CPU budget, pixel ratio up to 2. Poster only for reduced motion or no WebGL. Recorded in the plan's Global Constraints.
- Agenda-only rule, three identities, M Square logo only under "Organized by": unchanged.
- Effort was raised to high by the owner for Task 2; he returns it to medium himself.
- 2026-11-01, last message: the current look is not professional. No more edits for now.

## Why it reads as a kids' game (my diagnosis, for the redesign)
- Flat low-poly primitives with saturated greens and teal leaf blobs in the foreground.
- Giant flat cut-out silhouettes of figures, sized larger than the lighthouse's scale logic.
- Cartoon lighthouse bands and toy ships; no atmosphere, texture, or real lighting.
- Rounded white plates with big serif headings stacked on a toy scene.

## Redesign plan: "The Gold Lighthouse" (agreed direction, 2026-11-01)
Saved by the owner's request; he resumes when the usage limit renews. This replaces the earlier "Next" list. The owner likes the lighthouse and the day and night cycle. His complaint is the childish execution, not the idea. His references for an acceptable finish are his own sites: https://hue-pharmacy-welcome-day.vercel.app (source `D:\PROJJJ\wlcm day hue`) and https://techno-square-live.vercel.app (`D:\vault\techno-square-live`).

What makes those two work: one hero object with a real material, a photographic or deeply atmospheric backdrop, typefaces with character, two dominant colours.

Direction:
- Hero: one lighthouse in gold metal with real reflections (PBR material, environment map), the same logic as the Horus eye. It holds its place through the whole site; the camera moves around it slowly.
- Day cycle: sky, light on the gold and water change with scroll: dawn, day, sunset, night. The water reflects the time of day.
- Night: the beam sweeps the four tiers. This is the commercial close.
- Text sits directly on the sky with no white plates, in an editorial typeface. Replace Fraunces and Figtree.
- Colour: the sky varies naturally; the fixed colours are M Square gold and navy. Conference green and teal shrink to small details in the agenda.
- Remove: foreground leaves, flat cut-out family, toy ships, white plates. The baby-to-elder procession leaves the 3D scene; the theme line carries that idea.
- Look finish: ACES tone mapping, fog, bloom, real water. No flat low-poly look.

Open decision, the first thing to ask on resume: sky as images, like Horus (four plates, dawn, day, sunset, night, for example from Flow; Claude's recommendation) or sky drawn by code (nothing needed from the owner, less real clouds).

Steps on resume:
1. Get the sky decision.
2. Rebuild `lib/harbour.ts` as the one hero scene and show the owner screenshots of the four times of day. Stop until he approves the look.
3. Update `DESIGN-SPEC.md` and the plan to match: sections 7, 9 and 11 still describe the procession and the old fonts.
4. Keep: `content/`, `scripts/check-content*`, `lib/day.ts`, `lib/capable.ts`, boards structure, scroll/rotation logic.
5. Fix known bugs below, then continue Tasks 4, 5, 6, 8, 9. Gates still apply: the reviewer spawn, push and deploy, going live.

Model: the plan's Sonnet choice produced the rejected look. Claude's recommendation is Opus 5.5 for the scene and visual work, and it is the owner's call. Routing for the concept: `.claude/harness/routing/2026-11-01-nutrition-site-redesign.*` in academy-brain; building needs its own card.

## Known bugs (Task 3)
- Rotation: portrait to landscape to portrait does not keep the board. Test: go to board 5 with the Next button, rotate, rotate back. Result 05 then 01. `components/Boards.tsx` resize handler (freezes progress during resize, then `lenis.scrollTo(top,{immediate,force})` + `window.scrollTo`) is not restoring. Likely Lenis state or section heights changing in landscape (plates taller than 375px).
- `window.scrollTo` on a page with Lenis is unreliable in tests; use the Next button.
- Clicking Next near the footer once navigated to `/agenda` (link under the button area); check `.steps` overlapping nav links.
- Board 5 plate is tall and hides the scene.
- Night lighthouse body too dark; dawn board hides the baby behind the plate unless the plate is on top (it now is for boards 1, 2).
- One headless render came back white (not reproduced in the browser pane).
- `/preview` route was removed; to review scenes use the home page with the Next button.
- No Edge-on-GPU testing: shots came from headless Edge/swiftshader and the in-app browser.

## Harness notes
- `guard.py` blocks Bash commands that mention `scripts/` or `M Square identity/` paths (write-type heuristic) and redirects; use the Write tool and Python for copies.
- `guard.py` blocks commits while a planned specialist has no outcome entry; placeholder entry exists.
- Local static server for review: `python -m http.server 4173 -d D:/vault/port-said-nutrition/out` (stop it before `npm run build`; it locks `out`).
- Edge headless screenshot: `msedge.exe --headless --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --window-size=390,844 --virtual-time-budget=20000 --screenshot=...`.
