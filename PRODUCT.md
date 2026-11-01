# Product

<!-- impeccable:product-schema 1 -->

Source: derived from the owner-approved design spec, sections 1 to 5 (`D:\vault\academy-brain\deliverables\nutrition-sponsor-site\DESIGN-SPEC.md`). No separate interview was held; every fact below comes from that approved document.

## Platform

web

## Stack

Next.js 16 static export, React 19, TypeScript, plain three.js, gsap, lenis, as in `D:\vault\techno-square-live`. Deployed to the owner's Vercel account on the default address. Chosen by the owner's approval of the spec.

## Users

Sponsors only: decision makers at pharmaceutical and nutrition companies, reaching the site from a link sent on the phone. 99% of visits are on phones. Their job: understand what this conference is within a few seconds, see what each package buys and costs, then call or email M Square. Doctors who want to attend are not a separate audience.

## Product Purpose

An interactive English site that turns the Port Said Nutrition Conference agenda into a sponsor pitch. Success: a sponsor can name their tier, its price and its benefits in under a minute; the first screen is unmistakably this conference, in this city, organised by M Square; every fact matches the agenda exactly; it runs smoothly on an ordinary Android phone.

## Positioning

One day over the Port Said harbour stands for one human life, dawn to night, following the theme "From Early Life To Healthy Aging". Package choice is concrete: the sponsor sees the stand, logo size and roll ups change with the tier. A neighbouring conference site cannot truthfully copy this city, this theme or these packages.

## Operating Context

The visitor opens a link on a phone, scrolls or swipes through boards (counter, previous and next), and ends at a phone call or an email to M Square that carries the chosen tier. The organiser, M Square, owns the commercial follow-up.

## Capabilities and Constraints

- Home `/` with seven boards through the day; `/agenda`; `/sessions/[n]` for the seven Day 1 sessions; `/sponsors` with tier selector, comparison, a la carte, team cost and contact.
- All content from `Port Said Nutrition Conference.pdf` only (source copy `Brain/_sources/src-Port_Said_Nutrition_Conference-pdf.md`). If it is not in the agenda, it is not on the site. No inferred rule, grouping, unit or sum.
- No form, login, payment, booking, back end, calculator, Arabic version, content management or analytics.
- Prices shown in full as printed. Packages and agenda shown as printed, including the 110 vs 40 session minutes mismatch, with no comment.
- All text and prices are real HTML; the 3D scenes are lazy and optional; reduced motion, no WebGL or a weak phone keep the drawn poster and everything works.
- Phone targets: text visible under 2.5 seconds on 4G on a mid-range Android; steady 30 frames per second or the scene steps down; pixel ratio capped at 1.5.

## Brand Commitments

Three identities stay distinct and meet at sunset: Port Said is the place (lighthouse, domed building, water, sea light); the conference is the subject (procession from baby to elder, green, teal and blue) and leads dawn and day; M Square is the organiser (navy `#090968`, gold `#AA8531`) and leads night, packages and contact. The M Square logo appears only under "Organized by". The Port Said Medical Syndicate logo appears with no role text. Never redraw or invent a logo. English, with the agenda's spelling.

## Evidence on Hand

The agenda PDF and its source copy; M Square logo files in `D:\vault\academy-brain\M Square identity\`; the conference roundel and syndicate logo exist only inside the PDF (page 1). Absent and not to be fabricated: attendance numbers, past-event photos, partner logos, "slots left", historical text about the city, any testimonial.

## Product Principles

1. The agenda is the only source of truth: a fact not printed there is dropped, not asked about.
2. Money is shown plainly and exactly as printed: no total, no calculator, no combination logic.
3. Phone first and content first: text works before any scene loads, and every scene can fail without loss.
4. The three identities keep separate jobs; the transition at sunset is the only blend.
5. Show what a package buys by changing a stand, not by adding claims.

## Accessibility & Inclusion

Visible keyboard focus, readable contrast at each time of day, a real accessible name for every control, reduced motion respected, no trapped scrolling.
