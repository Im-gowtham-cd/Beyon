# Beyon — UI/UX Design System & Prompt

**How to use this:** the Master Prompt below is a paste-ready block for AI UI tools (v0, Lovable, Bolt, Figma Make, Galileo, etc.) or as a creative brief for a designer/dev team. Everything after it breaks the system down into exact specs — colors, type, the signature texture technique, components — and translates it into Beyon's actual screens (student / institution / company / proctored exam app).

---

## Master Prompt (copy-paste)

> Design **Beyon**, a dark-mode-first web and mobile platform for student skill-development, assessment, and campus recruitment, as a bold, energetic, gamified SaaS product — think a fintech analytics dashboard crossed with a leaderboard. Base canvas is near-black **#131313**, never pure black. Primary accent is an electric chartreuse-yellow **#E1FB15**, reserved for Beyon Coins, primary buttons, active nav states, and each screen's single hero metric. Secondary accent is an emerald mint **#32D583**, used only for growth, success, "verified," and "placed" states. Text is white on dark surfaces; card surfaces sit one step up from the canvas in a derived dark-gray scale, with hairline borders instead of drop shadows (shadows barely read on near-black). Typography pairs a bold, characterful display face (Clash Grotesk) for headlines, hero numbers, and the logotype with a clean geometric body face (General Sans) for UI text, labels, and tables; numerals are tabular throughout. Shape language: an unusually large border radius (24–40px) on every surface, and a couple of hero cards per screen break out of the rectangle entirely into soft, asymmetric organic "blob" silhouettes with a color-matched glow (40–60px blur) lifting them off the black background. Small circular icon-buttons — dark fill, thin white line icon — sit in the top-right corner of every card. Elements layer and overlap for depth: circular badges perch on the seam of a blob shape, backed by a soft dark radial vignette, connected to their label by a thin 1px line. The signature detail is a **texture-fill system** used instead of flat color on all data visualizations and stat chips: diagonal hatch-line fill for secondary/inactive data, dot/stipple halftone fill for highlighted/active data, and flat solid fill reserved for exactly one primary hero metric per card — applied consistently across bar charts, donut charts, progress rings, and stacked stat badges. Navigation is pill-shaped with a solid-color active state, in a top bar (no left sidebar). Layout is an asymmetric bento grid of rounded cards, not a uniform grid. Overall mood: premium, tactile, confident, slightly playful — never flat, never generic-SaaS-blue.

---

## 1. Design Philosophy

Beyon's core mechanic is a currency — Beyon Coins — earned through effort and spent on opportunity. That's why this particular visual language fits so well: it already reads as a rewards system (badges, layered "coin-stack" cards, glowing accents, achievement-style circular labels), while staying credible enough for institutions and recruiters to trust with real academic and hiring data. The system has to do two jobs at once:

- **For students** — feel like a game you want to open daily: streaks, coins, leaderboards, glow, texture, motion.
- **For institutions and companies** — feel like a serious analytics product: legible data, calm hierarchy, no texture noise on anything decision-critical.

The same tokens serve both by dialing texture and glow **up** on student/gamified surfaces and **down** on administrative and proctoring surfaces. That dial is called out explicitly in the screen specs in §9.

---

## 2. Color System

### Core palette (from your reference — use exactly)

| Token | Hex | Role |
|---|---|---|
| `primary` | `#E1FB15` | Beyon Coins, primary buttons/CTAs, active nav & tab states, single hero metric per card |
| `secondary` | `#32D583` | Growth, success, "verified," "placed," secondary chart series |
| `neutral-white` | `#FFFFFF` | Text on dark surfaces, occasional light card surfaces |
| `neutral-black` | `#131313` | Base canvas — the only background black; never `#000000` |

### Derived neutrals (not labeled in your source — extrapolated so the system actually functions)

| Token | Hex | Role |
|---|---|---|
| `surface` | `#1A1A1A` | Default dark card background |
| `surface-elevated` | `#232325` | Hover/pressed state, nested cards |
| `border` | `#2A2A2C` | Hairline card borders, replaces drop shadow |
| `text-secondary` | `#B5B5B8` | Sub-labels, captions |
| `text-muted` | `#8A8A8E` | Timestamps, tertiary metadata |

### Extended semantic colors (new — a real product needs these; a 4-color brand board doesn't include them)

| Token | Hex | Role |
|---|---|---|
| `warning` | `#FFB020` | Pending review, low coin balance, expiring eligibility |
| `error` | `#FF5C5C` | Proctoring violations, failed submissions, destructive actions |

**Contrast rule:** always pair `primary` with **black** text, never white — it's too light for white text to clear AA. `secondary` can take either; black is safer on large fills.

---

## 3. Typography

I can't lift an exact font file from a screenshot with certainty — but here's my closest real, licensable match, plus an alternate if you want something further from anything else out there.

**Recommended pairing**

| Role | Font | Weight | Why |
|---|---|---|---|
| Display / Headlines / Logotype | **Clash Grotesk** (Fontshare, free for commercial use) | Semibold / Bold | Same confident, slightly-quirky geometric energy as "Dashboard" and the big stat numbers in your reference |
| UI / Body / Labels / Tables | **General Sans** (Fontshare, free for commercial use) | Regular / Medium | Clean grotesque, holds up at small sizes for nav labels, card text, table rows |
| Numerals — coins, scores, ranks | **General Sans** with `tabular-nums`, or swap to **Space Grotesk** for extra "data" personality | Semibold | Beyon leans on numbers even harder than the reference (coins, ranks, scores everywhere) — tabular alignment matters more here |

**Alternate pairing** (bolder, more editorial): **Cabinet Grotesk** (display) + **Switzer** (body) — same family of free Fontshare faces, sharper and less rounded if Clash Grotesk feels too soft.

**Fallback stack:** `-apple-system, "Segoe UI", Inter, sans-serif`

**Scale:** hero numbers 40–56px Bold · page titles 28–32px Semibold · card titles 16–18px Semibold · body/labels 13–14px Regular/Medium · captions 11–12px Regular in `text-muted`.

---

## 4. Shape Language & Grid

- **Radius scale:** `sm` 12px (chips, tags) · `md` 20px (list rows, inputs) · `lg` 32px (standard cards) · `xl` 40px (hero cards).
- **Organic blobs:** one or two hero cards per screen, max, break the rectangle into an asymmetric wave/cloud silhouette instead of a rounded rect — reserve this for the single most important metric on the page (Coins balance, Institution Rating). Never use a blob under a table, list, or form.
- **Layering over flat placement:** circular badges and secondary stat pills overlap the edge of the shape behind them instead of sitting in their own isolated box. This is the single most distinctive habit in your reference — it's easy to lose by accident, so it's worth protecting deliberately.
- **Glow:** primary and secondary colored shapes carry a soft, color-matched outer glow (40–60px blur, 15–25% opacity) that lifts them off the black canvas.
- **No left sidebar.** Navigation is a top pill-bar, not a fixed sidebar — a deliberate departure from typical dashboard convention, and core to the reference's identity.
- **Grid:** asymmetric bento — one large hero cell, 2–3 medium cells, 1–2 small cells per row, 16–24px gaps, 24–32px page padding. Never a uniform equal-size card grid.

---

## 5. Signature Texture System (the detail that makes this unmistakable)

Every chart, progress ring, and stat badge uses **fill texture as a second data channel**, layered on top of color:

| Fill | Where to use | How to build it |
|---|---|---|
| **Diagonal hatch** | Inactive / past / secondary data (previous week's bars, unselected donut segment) | `repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 8px)` at 15–20% opacity over the base fill |
| **Dot / stipple halftone** | Highlighted / active data (the selected bar, the "in progress" segment) | `repeating-radial-gradient` dots ~3px diameter, ~10px pitch, 20–30% opacity over the base fill |
| **Flat solid** | Exactly one primary hero metric per card | Plain fill, no texture — this is what makes the hero number pop against the textured secondary data |

Rule of thumb: **never mix all three fills on one chart.** Your reference is disciplined about this — hatch for "not now," dots for "look here," solid for "the one number that matters."

---

## 6. Core Components

*(Structural patterns below are standard dashboard vocabulary, re-skinned into the texture/blob/glow language above — top pill-nav instead of a sidebar.)*

- **Top nav bar** — logo lockup left; pill-shaped segmented tabs with icon + label (active = solid `primary` fill, black text); search / notification bell / coin-balance pill / avatar right.
- **Hero wallet card** — largest card on any dashboard, organic blob, `primary` fill, glow. Shows the one number that matters most for that role (coins / rating / active drives). Small overlapping circular sub-badges add secondary context.
- **KPI stat card** — stacked label → big tabular number → small colored delta arrow. Flat dark surface, no texture, no blob.
- **Radial / gauge card** — donut or semicircle gauge, texture-filled per §5, big percentage centered, one-line caption below.
- **Chart card** — bar or line chart, texture-filled per §5, floating pill tooltip on hover with the exact value, legend as inline colored dots (not a boxed key).
- **Activity feed card** — circular icon or avatar per row, two-line label (title + timestamp), right-aligned value or status tag.
- **Progress / eligibility card** — label + fat rounded bar + current/target flanking text ("coins toward next assessment," "profile completeness").
- **Filter chip row** — removable pill tags (`Weekly ×`), plus one icon-only filter button — reuse this exactly, it reads very true-to-brand.
- **Status pill** — small rounded pill, colored by state: `secondary` green = verified/placed/eligible, `warning` amber = pending, `error` red = ineligible/violation, gray = default.
- **Icon-button** — small circle, dark fill, 1.5–2px white line icon, top-right of any card as an expand/view-more affordance.

---

## 7. Iconography & Imagery

- **Icon set:** [Lucide Icons](https://lucide.dev) — thin 1.5–2px stroke, geometric, open-source, matches the reference's line-icon weight closely.
- **Avatars:** always circular, real photography where available.
- **Company/institution logos:** contained in a small rounded-square or circular chip with a hairline border, never floating unbounded.
- **Coin motif:** a simple circular coin glyph (outer ring + inner "B" monogram), rendered in `primary` with a subtle bevel/gradient. Reuse this exact glyph everywhere a coin value appears — balance, transaction row, reward toast — so it becomes as recognizable as a currency symbol.
- **Product/illustration imagery:** clean and isolated, no busy backgrounds — matches the reference's isolated product-shot treatment.

---

## 8. Motion & Micro-interactions

- Cards lift 2–4px and their glow intensifies slightly on hover — nothing else moves.
- Coin balance counts up (not a hard cut) when coins are earned; pair with a brief glow pulse on the wallet card.
- Chart bars/rings animate in on first load only, never on every re-render.
- Respect `prefers-reduced-motion` — fall back to instant state changes.
- On the proctored assessment app specifically: no ambient motion at all beyond the timer and functional state changes — see §9.8.

---

## 9. Screen-by-Screen: Beyon Application

### 9.1 Student Web Dashboard
Top pill-nav: *Dashboard · Practice · Assessments · Opportunities · Portfolio*, search + bell + a coin-balance pill (coin glyph + count, `primary` fill) + avatar. Hero blob card: Coins balance (e.g. "2,450"), with a small overlapping streak badge ("18-day streak"). Beside it, a radial gauge card for overall Skill Score with a `secondary` ring. Bento row below: Practice Activity bar chart (hatch = earlier days, dot = today, solid = personal best), Upcoming Assessments list (company logo, coin-cost eligibility badge), Leaderboard snippet (top 3, circular vignette rank badges), Recommended Opportunities feed (match % tag).

### 9.2 Student Mobile App
Mirrors your reference mobile layout closely: top bar (menu · page title · filter · avatar), hero blob "Coins" card containing a stipple-textured ring showing skill-category breakdown, stacked list cards below (next test, latest badge earned), bottom nav with one elevated circular active icon — Practice, the most-used action — carrying a thin progress ring, same treatment as the reference's raised center icon.

### 9.3 Institution Dashboard
Top pill-nav: *Overview · Students · Companies · Placements · Analytics*. Hero gauge card: **Institution Rating** (e.g. "4.6"), dot-textured ring, breakdown chips underneath (Avg. CGPA, Placement %, Avg. Package, Top Company Tier). Bento grid: placement-willing vs. non-willing split (donut, primary/secondary), Placement Trends bar chart (hatch = past terms, solid = current, tooltip on the peak bar), Company Partnerships list (logo + tier pill), Top Performing Students list.

### 9.4 Company Dashboard
Top pill-nav: *Overview · Drives · Candidates · Institutions · Analytics*. Hero blob card: **Active Drives** count, layered progress sub-badges (application rate, completion rate, hatch/dot per §5). Bento grid: candidate funnel chart (Applied → Assessed → Shortlisted → Hired, texture-filled per stage), targeted-institution list, assessment performance analytics, Top Candidates list ranked by skill score.

### 9.5 Skill Profile & Digital Portfolio
Public-facing page. Banner is an organic blob in `primary`, avatar overlapping its seam — same circle-over-shape technique as your color-palette reference. Skill radar/bar chart (texture-filled), certification badge grid, coin/achievement trophy case, portfolio project cards below.

### 9.6 Leaderboard & Achievements
Ranked list; top 3 get the circular vignette-badge treatment (gold / mint / gray rings). Coin counts in `primary`, always tabular. Filter chips at top (`Weekly ×`, `By Branch ×`) — reuse the reference's exact chip style.

### 9.7 Practice & Assessment Browser (in-app, non-proctored)
Calmer than the marketing cards — standard `lg` radius, no blob, no glow. Topic pill, difficulty badge, question/editor area, timer, step-dot progress, `primary` submit button.

### 9.8 Beyon Desktop Assessment App (secure, timed, proctored)
**Deliberately the most restrained screen in the system** — trust and focus outrank brand personality here. No sidebar, no bento cards, no blob shapes, no hatch/dot texture, no glow, no ambient motion. Keep: dark canvas, `primary` for the single active/selected state, same typography. Header: exam title, candidate name, large high-contrast countdown timer, a small live proctoring-status indicator (webcam thumbnail + "Recording" dot). Center: one question card at a time, plain `lg` radius, answer options as selectable pills (`primary` fill when chosen). Full-screen/tab-switch violations use the new `error` red as a hard, unmissable banner — the only place red appears anywhere in the system.

### 9.9 Feed & Notifications
Card-based social feed for company/institution/student posts, `secondary`-green verified checkmarks, notification list with an unread dot in `primary`.

### 9.10 Opportunities (independent search & apply)
For students not placement-willing through their institution: a searchable/filterable listing using the same list-card + filter-chip pattern as the leaderboard, so it feels like the same product rather than a bolted-on job board.

---

## 10. Do's and Don'ts

**Do**
- Keep radius large and consistent everywhere — the fastest way to lose brand fidelity is letting this slip.
- Apply hatch = secondary, dot = highlighted, solid = one hero metric, every time, no exceptions.
- Pair every colored delta/status with an icon or arrow, not color alone.
- Turn texture and glow **down** on institution/company admin screens and the proctoring app; turn them **up** on student/gamified screens.

**Don't**
- Use pure `#000000` anywhere — always `#131313`.
- Put a blob shape under a data table, form, or the proctored exam UI.
- Introduce a new accent color outside primary / secondary / warning / error.
- Mix all three texture fills on one chart.

---

## 11. Developer Tokens

```css
:root {
  /* Core */
  --color-primary: #E1FB15;
  --color-secondary: #32D583;
  --color-white: #FFFFFF;
  --color-black: #131313;

  /* Derived neutrals */
  --color-surface: #1A1A1A;
  --color-surface-elevated: #232325;
  --color-border: #2A2A2C;
  --color-text-secondary: #B5B5B8;
  --color-text-muted: #8A8A8E;

  /* Extended semantic */
  --color-warning: #FFB020;
  --color-error: #FF5C5C;

  /* Radius */
  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 32px;
  --radius-xl: 40px;

  /* Glow */
  --shadow-glow-primary: 0 0 60px rgba(225, 251, 21, 0.22);
  --shadow-glow-secondary: 0 0 60px rgba(50, 213, 131, 0.2);

  /* Type */
  --font-display: 'Clash Grotesk', 'General Sans', sans-serif;
  --font-body: 'General Sans', -apple-system, 'Segoe UI', sans-serif;
}
```
