# Port Said Nutrition Conference: sponsor site design

> Superseded in part, 2026-11-01: the built look is the Gold Lighthouse (one gold 3D tower on four Port Said photographs, frosted navy and gold cards, Bodoni Moda + Hanken Grotesk). Where this text describes the low-poly harbour, procession scene, poster drawing or old fonts, `D:ault\port-said-nutrition\HANDOFF.md` wins.

Status: draft for Dr Refaat's approval. Nothing is built until he approves this document.
Date: 2026-11-01. Next step after approval: an implementation plan.

## 1. Intent

Build the conference agenda into an interactive English site for sponsors, in the spirit of https://techno-square-live.vercel.app/ (boards with a counter, previous and next, and sub-pages). It is not a single landing page.

A company representative opens the link on a phone, understands what this conference is within a few seconds, sees exactly what each package buys and what it costs, and calls or emails M Square.

The site's idea is **a day on the harbour**. One day over Port Said stands for one human life. Dawn to night follows the conference theme, "From Early Life To Healthy Aging": a baby at dawn, an elder at night, and the sponsor's decision in the lighthouse beam after dark.

## 2. Audience

Sponsors only: pharmaceutical and nutrition company decision makers, reached by a link sent on the phone. Doctors who want to attend are not served as a separate audience.

## 3. Goals

1. A sponsor can name their tier, its price and its benefits in under a minute.
2. The first screen is unmistakably this conference, in this city, organised by M Square.
3. Package choice feels concrete: the sponsor sees the stand, logo size and roll ups change with the tier.
4. Every fact matches the agenda exactly.
5. It runs smoothly on an ordinary Android phone.

## 4. Non-goals

- No form, login, payment, booking or back end.
- No attendee registration flow.
- No Arabic version.
- No content management; content changes are a code edit.
- No analytics in the first release.
- Desktop only has to work. It gets no special design effort.

## 5. Anti-goals: the site fails if

- Any fact, price or claim is not in the agenda.
- It shows attendance numbers, past-event photos, partner logos, or "only X slots left".
- It carries historical text about the city.
- A phone stutters, overheats, or leaves the sponsor waiting on a blank screen.
- Prices or packages exist only inside the 3D scene.
- The three identities melt into one blend (section 7).
- It looks like a generic pharma template or a SaaS pricing page.

## 6. Constraints

- **Content:** `Port Said Nutrition Conference.pdf` only (source copy `Brain/_sources/src-Port_Said_Nutrition_Conference-pdf.md`). The older Summit draft is not a source. The facts in section 12 were checked against the rendered pages.
- **Dr Refaat's rule:** if it is not written in the agenda, it is not on the site. No inferred rule, grouping, unit or sum. The builder drops such a thing and does not ask him about it.
- **Language:** English, with the agenda's spelling (for example "Gold", "SPONSORS", "Prof. Yassmin Gamal").
- **Platform:** React, deployed on Vercel. Phone first: 99% of visits are on phones.
- **Packages:** no package installs in this vault. New npm packages in the site's own project need a yes first. Deployment needs Dr Refaat's OK.

## 7. Three identities

Each has a job and stays recognisable. They meet at sunset.

| Identity | Role | Visual material | Where it leads |
|---|---|---|---|
| Port Said | The place | Lighthouse, domed building, water and sea light | The world of the whole site |
| The conference | The subject | The procession from baby to elder, leaves, apple, theme line, green, teal and blue | Dawn and day |
| M Square | The organiser | Navy `#090968`, gold `#AA8531`, logo | Night, packages, contact |

The M Square logo appears only under "Organized by". The Port Said Medical Syndicate logo appears with no role text.

**To confirm by eye:** the lighthouse and domed building are in the agenda's art. Canal ships and wooden-balcony houses are my additions. Dr Refaat sees a drawn scene before any 3D is built, and either can be cut.

## 8. Decisions

### Made by Dr Refaat

- Direction: "a day on the harbour".
- An interactive multi-page site like techno-square-live.
- Three separate identities.
- Audience is sponsors.
- Phone is what matters.
- Prices shown in full.
- Agenda content only.
- Packages and agenda shown as printed, including the mismatch in section 12.
- Syndicate logo with no description.
- All speaker names shown.

### Made by me, open to his correction

- **Site structure** in section 9.
- **Registration and accommodation** live inside `/sponsors` as the cost of the company's team. There is no `/attend` page.
- **Stack:** Next.js, React, TypeScript, three.js, gsap, lenis, as in techno-square-live, with its board and navigation approach reused and a new identity. Plain three.js, not React Three Fiber: same code base as the reference and less to load.
- **Project location:** new repository at `D:\vault\port-said-nutrition`, with `PRODUCT.md` there.
- **Domain:** the default Vercel address for the first release.
- **Contact:** printed phones as `tel:` links and the email as a `mailto:` link that carries the chosen tier. Not a form.
- **Scene:** a real low-poly 3D harbour built in code, with a moving camera. The procession figures are flat silhouettes, as in the agenda's art. No art is needed from Dr Refaat. The poster is a render of the same scene from the same camera.
- **Stand on `/sponsors`:** shows the tier only, with a blank "Your logo" panel. Sizes stay as printed (6X2, 8X) with no units added.
- **Repository and hosting:** a new private git repository with static export, deployed to Dr Refaat's Vercel account. His approval of this document covers installing the stack named above. Any other package needs a yes.
- **Testing:** Chrome device throttling during the build, then Dr Refaat opens the preview on his own phone.
- **PDF logos:** extract at the highest resolution the PDF allows. If either logo is not sharp, stop and ask him for the original. Never redraw or invent a logo.

## 9. Site map

### Home `/`: boards through the day

Vertical boards with a counter and previous/next, driven by swipe or scroll. The sky, light and procession move with progress.

| Board | Time of day | Content |
|---|---|---|
| 1 | Dawn | Name, theme line, 28-29 January 2027, Grand Hotel Port Said. Baby in the scene. |
| 2 | Morning | The theme: the procession grows with progress, baby to elder. |
| 3 | Day | The programme at a glance: 2 days, 7 sessions on Day 1, Day 2 sessions, 4 company symposia. Links to `/agenda`. |
| 4 | Afternoon | Conference presidents and coordinator. |
| 5 | Sunset | The sponsor's place in the day: symposium slots and the exhibition area. Conference colours hand over to M Square's. |
| 6 | Night | The lighthouse beam sweeps across the four tiers. Tap a tier to go to `/sponsors`. |
| 7 | Night | Organized by M Square, syndicate logo, phones, email, venue. |

### Agenda `/agenda`

- Day 1 / Day 2 toggle.
- Each session expands to its talks, times and speakers.
- Company symposia are highlighted as sponsor moments.

### Sessions `/sessions/[n]`

Seven pages, one per Day 1 session: title, talks, speakers, one small visual tied to its subject, next and previous. Light illustrated motion, not a second 3D scene.

### Sponsors `/sponsors`

The commercial heart.

1. **Tier selector:** Diamond, Platinum, Gold, Silver. On selection a 3D stand changes to the tier's area, the logo scales to its size, and the roll ups appear in number. A plain HTML comparison of all four tiers sits under it.
2. **A la carte and team cost:** shown as printed price lists. There is no calculator or total, because the agenda does not say how items combine or what a room price covers.
3. **Contact:** phones and an email carrying the chosen tier.

## 10. Experience rules

- All text and prices are real HTML, readable without the scene.
- One 3D scene, on the home page, and the stand on `/sponsors` is the only other one. The scene loads after the page, behind a drawn poster of the same view.
- No WebGL, reduced motion, or a weak phone: the static poster stays, and every board and tool still works.
- The 3D loads only when needed and never blocks the text.
- Swipe and scroll must feel native, with no trapped scrolling.
- Visible keyboard focus, readable contrast at each time of day, and a real accessible name for each control.
- Motion answers the visitor's progress or tap. Ambient motion is limited to water, light and the beam.

**Phone targets:** text visible under 2.5 seconds on 4G on a mid-range Android; steady 30 frames per second or the scene steps down; pixel ratio capped; three.js in its own lazy chunk. The builder sets the exact budgets in the plan and measures on a real device profile.

## 11. Left to the builder

Typefaces, within these limits: one characterful display face and one text face, self-hosted, not Poppins or Inter. Exact palette steps around the fixed brand colours. Scene modelling, camera, board transitions, motion timing, session visuals, file structure. Follow `/impeccable` (`PRODUCT.md` first, `reference/new-work.md`, `reference/craft-floor.md`, then `impeccable detect --json` after the UI is built) and `/frontend-design`.

Logos: M Square from `M Square identity/` (SVG and PNG). The conference roundel and syndicate logo exist only in the PDF: extract them from it, and ask if the quality is too low.

## 12. Content

All content goes in one typed data file, with no fact typed into a component.

### Event

- Port Said Nutrition Conference. From Early Life To Healthy Aging.
- 28-29 January 2027. Grand Hotel Port Said.
- Conference Presidents: Prof. Marwa Sabry, Prof. Shaimaa Faiad. Conference Coordinator: Prof. Asmaa Eid.
- Organized by M Square. 01002906884 - 01064731374. admin@mtechsquare.com

### Sponsorship packages

| | Diamond | Platinum | Gold | Silver |
|---|---|---|---|---|
| Price | 100K EGP | 80K EGP | 60K EGP | 40K EGP |
| Sponsors | 3 | 5 | 6 | 10 |
| Session | 20 Mins | 10 Mins | none | none |
| Logo size | 8X | 4X | 3X | 1X |
| Social Media Promotion | Yes | Yes | Yes | Yes |
| Free registrations | 5 | 4 | 2 | 1 |
| Exhibition area | 6X2 | 4X2 | 3X2 | 2X2 |
| Roll ups | 3 | 2 | 1 | none |

### A la carte

Symposium (15 minutes) 50,000 EGP. Stand 3X2 30,000 EGP. Logo Size 6X 20,000 EGP. Logo Size 4X 15,000 EGP. Logo Size 2X 10,000 EGP.

### Team cost

Full registration: Egyptian Drs 2000 EGP, Non Egyptian Drs 100 USD. Includes access to all sessions, access to exhibition area, coffee break, lunch, certificate of attendance.
Accommodation: Single Room 5000 EGP, Double Room 7500 EGP, Triple Room 9000 EGP.

### Known mismatch, shown as printed

Packages promise 110 session minutes (3 x 20 + 5 x 10). The agenda has 4 company symposia of 10 minutes each, 40 minutes. Dr Refaat's ruling: show both as printed.

### Day 1

| Time | Item | Speaker |
|---|---|---|
| 09:00 - 09:30 AM | Arrival and Registration | |
| | **Session 1: The Critical 1,000 Days: Nutrition, Immunity, and Neurodevelopment** | |
| 09:30 - 09:45 AM | The Science of Eating for Two: Evidence-Based Gestational Nutrition | Prof. Shaimaa Faiad |
| 09:45 - 10:00 AM | Optimizing the Extrauterine Growth: Evidence-Based Preterm Nutrition | Prof. Osama Hussein |
| 10:00 - 10:15 AM | The Immunological Window: Breastfeeding Dynamics in the First 1,000 Days | Prof. Gihan Fouad |
| 10:15 - 10:30 AM | Closing the Gap: Feeding the First 1,000 Days | Prof. Sanaa Youssef |
| 10:30 - 10:40 AM | Company Symposium 1 | |
| | **Session 2: A New Era in Nutrition** | |
| 10:40 - 10:55 AM | New Era in the Biotic Family | Prof. Enas Raafat |
| 10:55 - 11:10 AM | AI Meets Nutrition: The Future of Clinical Practice | Dr. May Mostafa |
| 11:10 - 11:25 AM | Nutrigenomics | Prof. Peter Safwat |
| | **Session 3: Nutrition in the ICU** | |
| 11:25 - 11:40 AM | Multidisciplinary Case-Based Approach to Nutrition in Critical Care: Real Case, Real Decisions | Prof. Marwa Sabry, Dr. Hanan Mostafa |
| 11:40 - 11:55 AM | Nutrition in the Critically Ill Child | Dr. Ahmed Said Amer |
| 11:55 - 12:05 PM | Company Symposium 2 | |
| 12:05 - 12:45 PM | Opening Ceremony | |
| 12:45 - 01:45 PM | Coffee Break | |
| | **Session 4: Immunonutrition** | |
| 01:45 - 02:00 PM | Nutrition in Autoimmune Diseases | Prof. Shaimaa Aweila |
| 02:00 - 02:15 PM | Multiple Sclerosis and Diet | Prof. Dina Zamzam |
| 02:15 - 02:30 PM | Protect and Nourish: The Essentials of the First 1,000 Days | Prof. Osama Arafa |
| 02:30 - 02:40 PM | Company Symposium 3 | |
| | **Session 5: Obesity & Metabolic Diseases** | |
| 02:40 - 02:55 PM | Obesity as a Chronic Disease: A Multidisciplinary Approach | Prof. Asmaa Eid |
| 02:55 - 03:10 PM | Obesity Hypoventilation Syndrome | Prof. Ahmed Beshir |
| 03:10 - 03:25 PM | Cardiometabolic Disease and the Role of GLP-1 Agonists | Dr. Mohamed Emam |
| 03:25 - 03:40 PM | Nutrition in CKD Patients | Dr. Mohamed Elshemy |
| 03:40 - 03:50 PM | Company Symposium 4 | |
| | **Session 6: Endocrine Nutrition** | |
| 03:50 - 04:05 PM | Nutritional Management of New Types of Diabetes | Dr. Amr Omar |
| 04:05 - 04:20 PM | From Plates to Glands: Unravelling Nutritional vs Endocrinal Hypoglycemia in Pediatrics | Dr. Dina Elbayaa |
| 04:20 - 04:35 PM | Chicken or the Egg? Does High TSH Cause Obesity, or Does Obesity Raise TSH? | Dr. Sara Amr |
| | **Session 7: From Adolescence to Menopause: The Changing Landscape of Obesity & Nutrition** | |
| 04:35 - 04:50 PM | Road Map to Childhood & Adolescent Obesity | Prof. Yassmin Gamal |
| 04:50 - 05:05 PM | The Last Update on Polycystic Ovary Syndrome | Dr. Mai Montaser |
| 05:05 - 05:20 PM | Perimenopausal Nutrition Challenges | Prof. Heba Omar |

### Day 2

| Time | Item | Speaker |
|---|---|---|
| 09:00 - 10:30 AM | Early Life: Whole Assessment of a Developing Kid | Prof. Enas Raafat |
| 10:30 - 12:00 PM | Food Record | Prof. Asmaa Eid |

## 13. Done means

- Every price, name and time in the data file is checked by a script against the source copy `Brain/_sources/src-Port_Said_Nutrition_Conference-pdf.md`, and by eye on the phone.
- The whole site works with the scene off.
- Phone targets in section 10 met on a real device profile.
- Dr Refaat approved the drawn scene, then the deployed preview.
