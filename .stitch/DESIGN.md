# Design System: Stature Clinic — Editorial Medical Luxe

> **Source of truth for all UI regeneration.** This document is read by
> `taste-design`, `design-md`, `stitch-design`, `react-components`, and any
> other agent touching the Stature frontend. If a decision is not encoded
> here, check `lib/config/brand.ts` (content) and `app/globals.css` (CSS
> tokens), then update this file.

---

## 0. Principle

Stature is a clinical bone-lengthening practice for men (18–45, 160–170 cm)
who are researching a major surgical decision. The design must communicate
**medical authority**, **editorial restraint**, and **aspirational
confidence** — simultaneously. Think Loro Piana's quiet fabric page × the
Cleveland Clinic's information hierarchy × Apple Health's calibrated motion.

Every decision below flows from three commitments:

1. **Editorial discipline** — typography carries hierarchy, not size and color.
2. **Asymmetric intention** — symmetry is a choice, not a default.
3. **Perpetual micro-motion** — the page breathes; nothing is inert.

---

## 1. Visual Theme & Atmosphere

| Axis | Score | Reading |
|------|-------|---------|
| Density    | **4** | Gallery-balanced — generous air, never cluttered. |
| Variance   | **7** | Offset-asymmetric — deliberate tension, disciplined. |
| Motion     | **6** | Fluid CSS with perpetual micro-loops. Never cinematic. |
| Creativity | **9** | Confident, editorial, against AI-generic defaults. |

**Atmosphere in one paragraph.** A softly-lit ivory canvas (`#F5EFE4`)
holds deep forest typography (`#0F2A1D`) in the way a gallery wall holds
a single sculpture. Content sits off-center. Gold (`#D9C89E`) appears
only as hairline punctuation — under a hovered link, as a focus ring, on
a single badge. Headlines mix weights on the same line ("Mais **altura**.
_Mesma vida._") so the reader feels a serif that is breathing, not
performing. Numbers are cold and mechanical (monospace). Body is warm
and clean (Inter Tight). Images show real, confident men in cotidiano —
face cropped or soft-blurred — never stock smiles, never clinical horror.
Every scrollable surface has something alive in the background: a parallax
drift of ±8 px, a staggered reveal, a slow grain pulse. Nothing screams.

---

## 2. Anti-Patterns (Banned Forever)

Read this before every Stitch render and every React component. These are
non-negotiable. Anything on this list is a regeneration trigger.

### Typography
- ❌ `Inter` (plain) — replaced by **Inter Tight** below.
- ❌ Plain system `Garamond`, `Times New Roman`, `Georgia`, `Palatino`,
  `Book Antiqua` — replaced by **Cormorant Garamond** (display revival) below.
- ❌ Headlines in a single weight when there is room to mix. H1/H2 should
  have at least one weight shift (e.g., 400 roman + 300 italic).
- ❌ All-caps body copy. `text-transform: uppercase` only on `.eyebrow` and
  mono labels.
- ❌ Centered text in blocks longer than 3 lines.
- ❌ Emojis as icons. Use Lucide line icons (1px stroke) or custom SVG.
- ❌ AI copy clichés: "Elevate", "Unleash", "Seamless", "Next-Gen",
  "Redefining", "Revolutionary".

### Color
- ❌ Pure black (`#000000`). Use `--forest-900` (`#081A12`) instead.
- ❌ Neon outer glows, oversaturated accents (`>80%` saturation).
- ❌ Gradient text on large headers.
- ❌ More than 5 functional colors.
- ❌ Gold (`#D9C89E`) used as a large fill. Accent ≤ 5% of any surface.
- ❌ Warm/cool gray drift — commit to the forest/sage family.

### Layout
- ❌ Centered hero. Hero must be split or offset.
- ❌ 3 equal cards horizontally (the generic "feature row"). Replace with
  2-col zig-zag, 60/40 split, or asymmetric masonry.
- ❌ Elements overlapping text. Every element has its own spatial zone.
- ❌ `h-screen` — iOS Safari URL-bar jump. Always `min-h-[100dvh]`.
- ❌ Flexbox `calc()` percentage math. CSS Grid for layout.
- ❌ Horizontal overflow on mobile.

### Motion
- ❌ Animating `width`, `height`, `top`, `left`. Only `transform`, `opacity`,
  `filter`, `clip-path`.
- ❌ Linear easing. Always `cubic-bezier(0.22, 0.61, 0.36, 1)` (`--ease-luxe`)
  unless otherwise documented.
- ❌ Scroll-indicator chevrons, "Scroll to explore", bouncing arrows.
- ❌ Motion that ignores `prefers-reduced-motion`.

### Content
- ❌ Generic placeholder names ("John Doe", "Acme", "Lorem ipsum" in
  production).
- ❌ Fabricated statistics. If a number is not in `lib/config/brand.ts` or
  validated by the user, use `[métrica]` placeholder.
- ❌ Images of the circular Ilizarov external fixator. Forbidden across
  every surface of the site.
- ❌ Stock-photo clinical smiles. Patients are shown in real cotidiano
  (academia, trabalho, rua, direção), face cropped or soft-blurred.
- ❌ Broken Unsplash links. Use `picsum.photos` or vetted local assets.
- ❌ `LABEL // 2025`, `SYSTEM // YEAR` — lazy AI typographic convention.

---

## 3. Content Guardrails

### Must Preserve (across every redesign)
- Lengthening numbers: **8 cm fêmur / 6 cm tíbia**.
- Credentials: **+400 pacientes**, **pioneiro no Brasil em Fitbone**,
  **referência na América Latina**.
- Cities: São Paulo, Belo Horizonte, Brasília, Fortaleza, Florianópolis.
- Rehabilitation arc: dia 1 → 6 meses.
- Fitbone mechanics: haste intramedular motorizada, aprovada pela Anvisa,
  controlada por controle remoto, sem hardware externo.
- Dr. David de Mello: CRM-MG 72397 · RQE 38488.

### Must Remove
- Any image of the **Ilizarov circular external fixator** or visible
  external hardware.
- Hospital-generic blue/white palettes if they appear.
- Stock medical smiles.

---

## 4. Tokens

### 4.1 Colors (5 functional roles × 2 modes)

Proportion target on any rendered surface: **~70% background/surface,
~25% ink, ≤5% accent**. Signal is reserved for secondary text/hairlines
and is functionally a muted neutral, not an independent accent.

| Role        | Light Mode (`:root`)      | Dark Mode (`.dark`)         | Purpose |
|-------------|---------------------------|-----------------------------|---------|
| Background  | `#F5EFE4` (ivory-50)      | `#081A12` (forest-900)      | Page canvas, section fills. |
| Surface     | `#FFFFFF`                 | `#0F2A1D` (forest-800)      | Card, panel, modal. |
| Ink         | `#0F2A1D` (forest-800)    | `#EDE4D0` (ink-light)       | Primary text, logos, icons. |
| Accent      | `#D9C89E` (gold-500)      | `#D9C89E` (gold-500)        | CTA hairline, focus ring, single badge, hovered underline. |
| Signal      | `#3A5243` (sage-600)      | `rgba(237,228,208,0.7)`     | Secondary text, metadata, 1 px dividers. |

**Supporting tokens (already in `app/globals.css` — do not redefine):**

- `--forest-900 #081A12`, `--forest-800 #0F2A1D`, `--forest-700 #1B3A2A`
- `--gold-500 #D9C89E`, `--gold-600 #C5B485` (hover state)
- Border: `rgba(15, 42, 29, 0.14)` light / `rgba(217, 200, 158, 0.16)` dark

**Contrast floor (WCAG AA):**
- Ink on Background: forest-800 on ivory-50 = **12.4 : 1** ✓
- Ink on Surface (dark): ink-light on forest-800 = **11.1 : 1** ✓
- Signal on Background: sage-600 on ivory-50 = **4.6 : 1** ✓ (body OK)
- Accent on Background: gold-500 on ivory-50 = **1.4 : 1** — never text.
  Use accent only for hairlines, rings, icons on dark surface, or large
  non-text UI.
- Accent on Forest-800: gold-500 on forest-800 = **7.8 : 1** ✓

### 4.2 Typography

#### Family stack

| Stack      | Font                                   | Weights loaded   | Used for |
|------------|----------------------------------------|------------------|----------|
| `--font-display` (serif) | **Cormorant Garamond**    | 300, 400, 500, 600 + italic | H1, H2, H3, pullquotes, aesthetic large numbers. |
| `--font-sans` (grotesk)  | **Inter Tight**           | 300, 400, 500, 600 | All UI, body, labels, navigation, buttons. |
| `--font-mono` (mono)     | **IBM Plex Mono** (to add) — `weight 400, 500`. Fallback `JetBrains Mono`, then `ui-monospace`. | 400, 500 | Credential big numbers (+400, 5, 1º), data inline (`34 anos · 168 → 176 cm`), FAQ +/−, accordion counters, code. |

**Cormorant Garamond rationale (explicit).** The taste-design default bans
generic Garamond. Cormorant Garamond (Catharsis Fonts, 2015) is a
contemporary display revival with tight optical spacing, a strong italic,
and editorial feel — it is already the project's display face. Keep it.
Aspirational alternatives if a full typographic swap is ever commissioned:
**Instrument Serif** (variable, narrower) or **Fraunces** (variable, more
mass-forward).

**Inter Tight rationale.** Plain `Inter` is banned; **Inter Tight** is a
condensed cut with tighter metrics — noticeably distinct in UI. Keep it.
Aspirational alternatives: **Satoshi** or **Geist**.

**Must add to `app/layout.tsx`:** IBM Plex Mono via `next/font/google`:

```ts
import { IBM_Plex_Mono } from "next/font/google"
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
})
// add plexMono.variable to <html> className
```

#### Fluid scale (clamp-based)

Use `clamp(min, preferred, max)`. All values in `rem`. Line-height in
unitless.

| Token         | Family   | Size `clamp()`                     | Weight | Line-ht | Tracking | Usage |
|---------------|----------|------------------------------------|--------|---------|----------|-------|
| `display-1`   | serif    | `clamp(3.75rem, 7vw, 6rem)`        | 400 + 300 italic mix | 0.95 | `-0.01em` | Hero H1. |
| `display-2`   | serif    | `clamp(3rem, 5.5vw, 4.5rem)`       | 400 (+ optional 300 italic) | 1.0 | `-0.01em` | Section mega-head. |
| `display-3`   | serif    | `clamp(2.25rem, 4vw, 3.25rem)`     | 400 | 1.05 | `-0.005em` | Sub-mega, CTA band headline. |
| `heading-1`   | serif    | `clamp(1.875rem, 3vw, 2.5rem)`     | 400 or 500 | 1.15 | `-0.005em` | H2 editorial. |
| `heading-2`   | serif    | `clamp(1.5rem, 2.25vw, 2rem)`      | 500 | 1.2 | `0` | H3 editorial. |
| `heading-3`   | sans     | `1.25rem` (20 px)                  | 500 | 1.3 | `-0.005em` | Card titles, UI H4. |
| `body-lg`     | sans     | `1.125rem` (18 px)                 | 400 | 1.6 | `0` | Lead paragraph, hero subhead. |
| `body-md`     | sans     | `1rem` (16 px)                     | 400 | 1.7 | `0` | Default body. |
| `body-sm`     | sans     | `0.875rem` (14 px)                 | 400 | 1.65 | `0` | Caption, meta. |
| `eyebrow`     | sans     | `0.6875rem` (11 px)                | 500 | 1 | `0.32em` + `uppercase` | Section label above H2. Matches existing `.eyebrow` utility. |
| `mono-stat`   | mono     | `clamp(2.5rem, 5vw, 4rem)`         | 500 | 0.95 | `-0.02em` | Credential numbers (+400, 15+, 1º). |
| `mono-label`  | mono     | `0.8125rem` (13 px)                | 400 | 1.4 | `0.02em` | Inline data (`34 · 168→176 cm · SP`), FAQ +/−. |
| `pullquote`   | serif italic | `clamp(1.75rem, 3vw, 2.25rem)` | 300 italic | 1.3 | `-0.005em` | Testimonial main text. |

#### Weight-mix rule (the "editorial tension")

H1 and H2 must mix ≥ 2 weights or one roman + one italic. Reference pairs:

- **400 roman + 300 italic:** `Mais altura. <i>Mesma vida.</i>`
- **500 roman + 400 italic:** `Técnica e <i>diferenciais</i>`
- **400 + 400 italic:** `Do primeiro dia <i>ao impacto pleno.</i>`

Keep per line: only one shift per line. Never three weights in one H1.

### 4.3 Spacing

Token scale in rem (1 rem = 16 px). Never freehand values.

| Token | rem  | px | Use |
|-------|------|----|-----|
| `--space-1`  | 0.25 | 4   | Hairline offset. |
| `--space-2`  | 0.5  | 8   | Tight icon-label. |
| `--space-3`  | 0.75 | 12  | Small intra-component. |
| `--space-4`  | 1    | 16  | Default component padding. |
| `--space-6`  | 1.5  | 24  | Card padding. |
| `--space-8`  | 2    | 32  | Paragraph after H3. |
| `--space-12` | 3    | 48  | Block after H2. |
| `--space-16` | 4    | 64  | Section inner gap. |
| `--space-24` | 6    | 96  | Section outer (mobile). |
| `--space-32` | 8    | 128 | Section outer (desktop). |

Section vertical rhythm: `padding-block: clamp(4rem, 10vw, 8rem)`.
Container: `max-width: 1320px; padding-inline: clamp(1.25rem, 4vw, 2.5rem)`.

### 4.4 Radii

Quiet-luxury keeps radii low. Nothing feels injection-molded.

| Token | px | Use |
|-------|----|-----|
| `--radius-0`    | 0  | Dividers, full-bleed panels. |
| `--radius-sm`   | 2  | Default (matches existing `--radius`). Cards, panels, inputs. |
| `--radius-md`   | 4  | Images inside cards. |
| `--radius-lg`   | 8  | Rare; only for nested tiles. |
| `--radius-pill` | 9999 | **Only** for primary CTA buttons. |

Never `rounded-2xl`, `rounded-3xl`, or `rounded-full` outside buttons.

### 4.5 Shadows

Two levels only. Shadows are tinted with the ink color, never flat gray.

| Token | Value | Use |
|-------|-------|-----|
| `--shadow-hairline` | `0 0 0 1px rgba(15,42,29,0.08)` | Cards at rest, inputs. |
| `--shadow-depth`    | `0 1px 2px rgba(15,42,29,0.05), 0 12px 32px -12px rgba(15,42,29,0.16)` | Hovered card, modal, floating CTA on scroll. |

Dark-mode tints swap to `rgba(217,200,158, .N)`.

### 4.6 Motion

Canonical durations and easings. Used with Tailwind arbitrary values or
framer-motion config.

| Token          | Value  | Use |
|----------------|--------|-----|
| `--ease-luxe`  | `cubic-bezier(0.22, 0.61, 0.36, 1)` | Default for everything. |
| `--ease-swift` | `cubic-bezier(0.4, 0, 0.2, 1)`      | Rare; UI micro-feedback (button press). |
| `--dur-hover`   | `240ms` | Hover/focus transitions. |
| `--dur-page`    | `400ms` | Page transition crossfade. |
| `--dur-reveal`  | `720ms` | Default scroll-reveal. Range 600–900 ms. |
| `--dur-curtain` | `1100ms` | Page-load curtain (already implemented). |
| `--dur-ambient` | `8s+`   | Breathing/grain-pulse loops. |

**Hardware-accelerated property allowlist:**
`transform`, `opacity`, `filter (blur)`, `clip-path`.
`will-change` is set **only** on elements mid-interaction, never idle.

**Reduced motion:** already handled globally via
`@media (prefers-reduced-motion: reduce)`. In addition: **parallax**,
**count-up**, and **stagger** must check `useReducedMotion()` (framer) or
the CSS query and degrade to a single fade-in.

---

## 5. Grid & Layout

### 5.1 The four canonical layouts

Every section chooses one. If you find yourself reaching for plain
`grid-cols-3`, stop — that is the generic AI default. Justify the choice.

| Layout | Ratio(s) | When to use |
|--------|----------|-------------|
| **A. Split Asymmetric** | `60/40` or `70/30` | Hero, Technique-Card, any section where one side carries visual mass (photo/video) and the other carries copy. |
| **B. Editorial Offset** | 12-col grid, content spans cols `2–8` on even sections and `5–12` on odd; opposite side holds an eyebrow or mono tag | About section, rehab narrative, CTA band. Creates rhythm through alternation. |
| **C. Masonry Asymmetric** | 3 cols desktop (aspect-ratio 4:5, 1:1, 9:16 mixed), 2 cols tablet, horizontal-scroll mobile | Gallery, portrait grids. |
| **D. Full-Bleed With Margin** | `100vw` image, copy sits in a `max-width: 640px` box offset from one edge | Hero alternate, testimonial feature, final CTA. |

### 5.2 Forbidden layout patterns
- 3-column uniform cards without a conceptual reason.
- Centered hero text over a centered image.
- Stacked CTAs dead-center on both axes.
- Three equal tiles in a `grid-cols-3 gap-4`.
- Overlapping text and imagery in the same z-zone.

### 5.3 Responsive rules

- **Mobile (<768 px):** every multi-column grid collapses to single column.
  Zig-zag splits become vertical sequences. Masonry becomes
  horizontal-scroll carousel with `scroll-snap-x mandatory`.
- **Tablet (768–1024 px):** 2-col max.
- **Desktop (≥1024 px):** asymmetric grids activate.
- Typography scales via `clamp()` (see tokens). Never px-only at H1/H2.
- Every touch target ≥ 44 × 44 px.
- Every section has `padding-block: clamp(4rem, 10vw, 8rem)`.

---

## 6. Hero Treatment (signature)

The Hero is where Stature's editorial voice is set. Three constraints:

1. **Asymmetric split.** 60 image / 40 copy, or 40 copy / 60 image.
   Never centered.
2. **Mixed-weight H1.** At least one weight/style shift on the same line.
   Canonical pairing: `Mais altura. <i>Mesma vida.</i>` — "Mais altura."
   at weight 400 roman, "Mesma vida." at weight 300 italic.
3. **Inline image typography (optional but encouraged).** A small
   circular photograph (face cropped or soft-blurred) sits **inline at
   type-height** between words of the subhead — never the H1. Example:

   > `Haste intramedular motorizada.` `[inline 48 px circular image of
   > patient mid-stride, face out of frame]` `Sem hardware externo.`

   Image rules: `rounded-full`, `border: 1px solid rgba(15,42,29,0.08)`,
   `vertical-align: middle`, `margin-inline: 0.25rem`, max 56 px.
   On mobile: image drops to its own line below the sentence — never
   overlaps type.

### Hero structure

| Zone | Content | Motion |
|------|---------|--------|
| Copy side (40%) | Eyebrow (mono, signal color), H1 mixed-weight, 1 subhead (body-lg), 1 primary CTA (pill), 1 secondary link (gold-underline). | H1 reveal 720 ms stagger per line; CTA arrives 160 ms after final line. |
| Image side (60%) | Real patient in cotidiano (face cropped or soft-blurred). Photographic, not rendered. | Parallax ±8 px on scroll; subtle scale(1.02) on mount. |
| Background | Ivory-50 with `.grain-texture` at 3% opacity. | `.grain-pulse` 8s loop. |

### What the Hero is NOT
- Not a 3D rendered bone.
- Not the Ilizarov fixator.
- Not a centered layout with CTA stack.
- Not a full-width video auto-playing on load.

---

## 7. Components Library

Each component ships with **semantic spec + tokens + motion + do/don't**.
These are what `stitch-design` must read before regenerating a section.

### 7.1 Hero

Spec: see §6.

**Do**
- Mix two weights/styles in H1.
- Offset image and copy.
- Use `.gold-underline` on secondary link.
- Preload hero image (already done in `app/layout.tsx`).

**Don't**
- Overlap copy with image.
- Use a 3D bone or Ilizarov graphic.
- Auto-play the Fitbone video in the hero — that lives in Techniques.

---

### 7.2 Technique-Card

Rendered twice: **Fitbone** (primary, left-heavy) and **LON** (secondary,
right-lighter).

Layout: **Split Asymmetric 60 / 40**.

| Zone | Fitbone (Card A) | LON (Card B) |
|------|------------------|--------------|
| Media (60%) | `<video>` autoplay, muted, loop, `playsInline`, `preload="metadata"`, `poster="/fitbone-poster.jpg"`. Source: `/fitbone-video-explicativo.mp4`. Clip-path: `inset(0 round 4px)`. | Static `next/image` of patient in rehab / walk. Soft focus, no hardware visible. |
| Copy (40%) | Badge (mono, accent-on-surface) reading `PRINCIPAL · ANVISA`. H3 (serif, "Fitbone · haste motorizada"). 6 benefits list. CTA link with `.gold-underline`. | Badge `COMPLEMENTAR`. H3 ("Método LON"). 6 benefits list. CTA link. |

**Benefit row spec** (applies to both):
- 1 px line-art icon (Lucide stroke-width 1) in ink color — never colored,
  never emoji.
- `body-md` label in sans.
- 6 items, each separated by a `hairline-sage` 1 px divider.

**Motion**
- Card A hovers: video remains playing, subtle scale(1.01) on card.
- Card B hovers: image scales(1.03), `hairline-gold` grows left-to-right
  across bottom.
- On first viewport entry: staggered reveal, 80 ms between benefits.

**Do**
- Keep Fitbone visually heavier than LON.
- Use `preload="metadata"`, `poster`, `playsInline` on the video.
- Respect reduced-motion (still, no autoplay).

**Don't**
- Make both cards identical (symmetry kills the hierarchy).
- Use emojis or filled colored icons for benefits.
- Put the Ilizarov image anywhere on this section.

---

### 7.3 Credential-Bar

Sits directly below hero. Dark surface for contrast.

Layout: **Full-Bleed With Margin** — forest-800 background, 5 credential
tiles on a 12-col grid, eyebrow label left.

| Element | Type | Token |
|---------|------|-------|
| Eyebrow (left column) | `eyebrow`, sage, reads `AUTORIDADE CLÍNICA` | `.eyebrow` |
| Big number | `mono-stat`, ink-light | IBM Plex Mono 500 |
| Label under number | `body-sm`, serif italic 300, ink-light | Cormorant 300 italic |
| Divider between tiles | `hairline-gold` 1 px | `.hairline-gold` |

Content (from `CREDENTIALS` in `brand.ts`):
`+400` · pacientes operados   |   `5` · capitais com cirurgia   |
`15+` · anos em ortopedia reconstrutiva   |   `1º` · pioneiro no Brasil

**Motion**
- Count-up on viewport entry (e.g., from 0 → 400, 0 → 5, 0 → 15, fixed `1º`).
  Duration: 1200 ms, easing `--ease-luxe`. Disabled under reduced-motion
  (then just fades in the final value).
- Background: `.grain-texture` at 4% opacity.

**Do**
- Keep numbers in MONO — serif on these numbers breaks the tension.
- Sit it directly after Hero (high-trust early anchor).
- Use dark surface — creates a visual "breath" between light hero and
  light techniques.

**Don't**
- Fabricate numbers. Only use values from `brand.ts::CREDENTIALS`.
- Animate the number with color/scale. Just counting.
- Use emojis, flag icons, or hospital clipart.

---

### 7.4 Gallery-Item (Patient Cotidiano Masonry)

Layout: **Masonry Asymmetric** — 3 cols desktop (mixed aspect ratios),
2 cols tablet, `overflow-x-scroll` + snap on mobile.

| Column | Aspect ratios used in rotation |
|--------|-------------------------------|
| Col 1  | 4:5, 9:16, 1:1 |
| Col 2  | 1:1, 4:5, 4:5  |
| Col 3  | 9:16, 4:5, 1:1 |

Each tile:
- `next/image`, `sizes` set explicitly per breakpoint, `loading="lazy"`
  (except first two which preload).
- Face masking: either tight crop above shoulders **or** `filter: blur(14px)`
  on a small circular region — never on whole face.
- Caption slides up from bottom on hover (`translateY(100% → 0)`, 240 ms
  ease-luxe). Caption: `mono-label` meta (`Academia · 26 anos · SP`) plus
  `body-sm` description.

**Motion**
- Staggered reveal on scroll: 70 ms between tiles.
- Hover: `scale(1.05)` on the image inside a `overflow-hidden` frame.

**Do**
- Mix aspect ratios within each column.
- Preserve faces via crop or localized blur; full-face is never shown.
- Label each photo with cidade + idade + contexto (academia, trabalho,
  direção, rua, casa).

**Don't**
- Use a uniform 3×3 grid of square photos.
- Show smiling corporate stock.
- Include any medical hardware.

---

### 7.5 Testimonial-Card

Layout: horizontal **carousel** with `scroll-snap-type: x mandatory`.
Each slide is a **Split 40 / 60** — photo on left, copy on right.

| Zone | Content |
|------|---------|
| Photo (40%) | Small, discreet. `max-width: 280px`. Face cropped or soft-blurred. `radius-md`. |
| Copy (60%) | Large open quote (`"`) in Cormorant 300 italic, color gold. Pullquote text `pullquote` token, serif 300 italic, ink color, max 3 lines. Meta below in `mono-label`: `26 anos · 168 → 176 cm · SP`. Name abbreviated: `Paciente L.` |

**Dots / Arrows**
- Dot pagination in gold; 1 px ring around active.
- Arrows are `<` `>` in Inter Tight 300, not chunky chevrons.

**Motion**
- Scroll snap drives the interaction.
- On slide activation, staggered reveal of quote → text → meta (60 ms).
- Ambient: active slide has subtle `filter: drop-shadow(0 8px 24px rgba(15,42,29,.08))`.

**Do**
- Keep text to 3 lines max.
- Use serif italic for the body — grotesk kills the editorial feel here.
- Filter testimonials to the target demographic (18–45, 160–170 cm) from
  `TESTIMONIALS` in `brand.ts`.

**Don't**
- Use full corporate bios or multi-paragraph walls.
- Show star ratings (medical trust is conveyed by language, not emoji stars).
- Show the patient's full face.

---

### 7.6 FAQ-Item

Layout: **Editorial Offset** — questions in `cols 2–8`, answers in
`cols 3–9` (one col indent). Max-width 720 px on the answer column.

Each accordion row:
- Question: `heading-2` (serif 400), ink.
- Answer (open): `body-md` sans, sage signal color for reading calm.
- Toggle: `+` (closed) / `−` (open) in IBM Plex Mono, `mono-label` size,
  positioned right. No chevron icon, ever.
- Divider between rows: `1px solid rgba(15,42,29,0.08)` — hairline only.
- Open/close transition: `max-height` animated via `grid-template-rows`
  `0fr → 1fr` (transform-compatible technique), 320 ms ease-luxe.

**Motion**
- Staggered reveal on first entry: 60 ms between rows.
- `+` rotates to `−` — implement via swap or opacity crossfade, not rotation.

**Do**
- Keep dividers hairline (1 px, 8% opacity).
- Serif on the question carries the editorial voice.
- Allow multiple rows open at once.

**Don't**
- Use chunky chevron icons (▼▲) — banned.
- Color the entire open row (no muted fills). Leave it on canvas.
- Nest accordions.

---

### 7.7 CTA-Band (final closer)

Layout: **Full-Bleed With Margin** — forest-800 background, copy box
offset from left edge (`max-width: 640px`, `margin-inline-start: clamp(1.25rem, 8vw, 6rem)`).

| Element | Content | Token |
|---------|---------|-------|
| Eyebrow (mono) | `PRÓXIMO PASSO` | `.eyebrow`, gold-500 |
| Headline (serif mix) | `Pronto para dar o próximo passo? <i>Fale diretamente comigo.</i>` | `display-3`, 400 + 300 italic |
| Subhead | 1 sentence (`body-lg`), ink-light at 0.72 opacity | Inter Tight 400 |
| Primary CTA | pill (`radius-pill`), gold-500 bg, ink on it, `hover:bg-gold-600` | `rounded-full` |
| Badges row | 3 mono credential chips (`Fitbone · Anvisa` · `5 capitais` · `Consulta online Brasil`) | `mono-label`, gold-border 1 px |

**Motion**
- Headline reveal staggered per word on scroll.
- Primary CTA: subtle `translateY(-1px)` on hover, 200 ms.
- Background: forest-800 with `.grain-texture` at 6%, `breathe` ambient on
  an optional decorative element (gold dot or hairline).

**Do**
- Single primary CTA. No competing action.
- Keep pill as the only pill in the whole site (so it reads as THE CTA).

**Don't**
- Center the copy box.
- Add a "Learn more" secondary button beside the pill.
- Use a gradient background.

---

## 8. Motion Patterns Catalog

Reusable primitives. Implement in `components/motion/*` as tiny framer
wrappers or pure CSS utilities.

| Pattern | Trigger | Effect | Duration | Easing |
|---------|---------|--------|----------|--------|
| **Reveal-Up**       | viewport entry | `translateY(24px) opacity(0) → 0/1` | 720 ms | ease-luxe |
| **Reveal-Stagger**  | viewport entry, list | Reveal-Up with 60–80 ms between items | 720 ms each | ease-luxe |
| **Parallax-Soft**   | scroll | `translateY(-8px → 8px)` over section height | — | linear mapped to scroll |
| **Count-Up**        | viewport entry, single | integer tween 0 → N | 1200 ms | ease-luxe |
| **Gold-Underline**  | hover/focus | `scaleX(0 → 1)` transform-origin left | 240 ms | ease-luxe |
| **Card-Tilt**       | hover (pointer fine) | `rotateX/Y ≤ 1.5°` based on cursor | 160 ms | ease-luxe |
| **Page-Curtain**    | first load | `translateY(0 → -100%)` on full-bleed ivory panel | 1100 ms | ease-luxe |
| **Grain-Pulse**     | ambient | `opacity(0.3 ↔ 0.45)` on grain layer | 8 s | ease-in-out |
| **Breathe**         | ambient dot | `scale(1 ↔ 1.15) opacity(0.35 ↔ 0)` | 3 s | ease-in-out |

All patterns have a `prefers-reduced-motion` branch that reduces to a
single opacity fade (or no motion at all for `breathe`/`grain-pulse`).

---

## 9. Accessibility

- **Contrast:** WCAG AA minimum. 4.5 : 1 for body, 3 : 1 for ≥ 18 pt.
  (See 4.1 audit.)
- **Focus rings:** already implemented — `0 0 0 1px #F5EFE4, 0 0 0 2px #D9C89E`.
  Never remove.
- **Keyboard:** every interactive target ≥ 44 px, visible order matches
  reading order.
- **Reduced motion:** disables parallax, count-up, stagger, ambient loops.
- **Screen readers:** every `<video>` has a `<track kind="descriptions">`
  or an explicit text caption below. Every decorative image uses
  `alt=""` + `role="presentation"`; meaningful images have descriptive
  Portuguese alt text.
- **Form labels:** always visible, never placeholder-only.
- **Color-only information:** never. Always paired with text.

---

## 10. Performance Budget

| Metric | Target |
|--------|--------|
| LCP    | ≤ 2.5 s |
| CLS    | ≤ 0.05 |
| TBT    | ≤ 200 ms |
| JS per route | ≤ 180 KB gzipped (body script) |
| Video autoplay | **only** Fitbone clip in Techniques. Everything else `preload="metadata"` and click-to-play. |
| Images | `next/image`, `sizes` always defined. |
| Fonts | Cormorant + Inter Tight + IBM Plex Mono via `next/font/google`, `display: swap`. Hero image preloaded. |

---

## 11. Validation Checklist (per section)

`stitch-design` and `react-components` must tick every box before handoff.

### Universal
- [ ] Uses only the 5 functional colors (proportion ~70/25/5).
- [ ] Typography uses the defined tokens; no inline `font-size` hacks.
- [ ] Headlines mix ≥ 2 weights/styles when ≥ 2 lines.
- [ ] Numbers in MONO; body in sans; H1–H3/pullquotes in serif.
- [ ] Grid is one of the 4 canonical layouts (A/B/C/D). No unjustified 3×3.
- [ ] Motion uses only `transform` / `opacity` / `filter` / `clip-path`.
- [ ] Reduced-motion branch exists.
- [ ] Focus rings visible on every interactive element.
- [ ] Every image has a real `alt` or `alt=""` + `role="presentation"`.
- [ ] Mobile collapses cleanly; no horizontal scroll (except intentional).
- [ ] No banned content (Ilizarov, emojis-as-icons, `#000`, Inter plain,
      plain Garamond).

### Hero
- [ ] Split asymmetric (60/40 or 40/60).
- [ ] H1 mixes weights or styles.
- [ ] Inline-image-in-typography considered (not required, but encouraged
      in subhead).
- [ ] Parallax ±8 px on hero image.
- [ ] Hero image preloaded in `<head>`.

### Technique-Card
- [ ] Fitbone visually heavier than LON.
- [ ] Fitbone uses `<video>` with poster + `preload="metadata"` + autoplay.
- [ ] 6 benefits each card; 1 px line-art icons; hairline dividers.
- [ ] Badges in MONO.

### Credential-Bar
- [ ] Dark forest-800 background.
- [ ] Numbers in MONO `mono-stat`.
- [ ] Labels in serif italic 300.
- [ ] Count-up on entry (with reduced-motion fallback).
- [ ] Values come from `brand.ts::CREDENTIALS`.

### Gallery
- [ ] Masonry with mixed aspect ratios (4:5, 1:1, 9:16).
- [ ] Faces cropped or soft-blurred.
- [ ] Captions slide up on hover (transform only).
- [ ] Mobile: horizontal-scroll snap.

### Testimonials
- [ ] Horizontal snap carousel.
- [ ] Quote in Cormorant 300 italic, ≤ 3 lines.
- [ ] Meta in MONO: idade · altura→altura · cidade.
- [ ] Only target demographic shown (from `brand.ts::TESTIMONIALS`).

### FAQ
- [ ] Question in serif 400, answer in sans.
- [ ] `+` / `−` in MONO, no chevrons.
- [ ] Hairline 1 px, 8% opacity between rows.

### CTA-Band
- [ ] Dark forest-800 background.
- [ ] Exactly one primary CTA (pill).
- [ ] 3 mono credential chips.
- [ ] Copy box offset from left edge — not centered.

---

## 12. File Map (where this contract is enforced)

| Concern | File |
|---------|------|
| Content source of truth | `lib/config/brand.ts` |
| Color / font tokens | `app/globals.css` |
| Font loading | `app/layout.tsx` |
| Components (to regenerate) | `components/hero-section.tsx`, `components/techniques-section.tsx`, `components/credentials-strip.tsx`, `components/patient-gallery.tsx`, `components/featured-products.tsx`, `components/faq-section.tsx`, `components/about-doctor.tsx` |
| Motion primitives | `components/reveal.tsx`, `components/parallax-image.tsx`, `components/animated-text.tsx` |
| Utilities (shadcn) | `components/ui/*` |
| Stitch specs | `.stitch/screens/*.md` (one per section, generated by `stitch-design`) |

---

_Last updated: 2026-04-22. Any agent modifying tokens must also update
this file's §4 and bump the date._

---

## 13. Reconciliation with the Existing Codebase (audit — 2026-04-22)

This section is the **delta between the contract above and the real code
on disk**. It is written by `design-md` after reading `app/globals.css`,
`app/layout.tsx`, `lib/config/brand.ts`, and every file under
`components/`. Agents running Etapas 3–5 should read this first.

Legend: **✅ aligned** (no action) · **⚠️ divergent** (refactor) ·
**➕ missing** (add before Etapa 3).

### 13.1 Token audit — DESIGN.md §4 × `app/globals.css`

| Token (DESIGN.md)                              | Real source            | Status | Delta |
|------------------------------------------------|------------------------|--------|-------|
| **Colors**                                     |                        |        |       |
| Background `#F5EFE4`                           | `--ivory-50`           | ✅     | — |
| Surface light `#FFFFFF`                        | `--card`               | ✅     | — |
| Surface dark `#0F2A1D`                         | `.dark --card`         | ✅     | — |
| Ink light `#0F2A1D`                            | `--forest-800`         | ✅     | — |
| Ink dark `#EDE4D0`                             | `--ink-light`          | ✅     | — |
| Accent `#D9C89E`                               | `--gold-500`           | ✅     | — |
| Signal `#3A5243`                               | `--sage-600`           | ✅     | — |
| WCAG AA contrast                               | verified §4.1         | ✅     | — |
| **Typography families**                        |                        |        |       |
| Serif display (Cormorant Garamond)             | `--font-cormorant`     | ✅     | — |
| Sans UI (Inter Tight)                          | `--font-inter-tight`   | ✅     | — |
| Mono (IBM Plex Mono)                           | *not loaded*           | ➕     | Add `next/font/google` import in `app/layout.tsx` and register `--font-plex-mono` + `--font-mono` in `@theme inline`. |
| **Typography scale**                           |                        |        |       |
| Fluid clamp tokens (`display-1`…`body-sm`)     | *not defined*          | ⚠️     | Components use raw Tailwind `text-5xl`/`text-7xl`. Working, but not expressed as tokens. Non-blocking for Etapa 3 (Stitch maps freely); formalize in Etapa 4 CSS. |
| Tracking `-0.02em` on display                  | inline on H1/H2        | ✅     | used in hero, techniques, about |
| Eyebrow utility `.eyebrow`                     | `@layer utilities`     | ✅     | matches token (0.6875rem, 0.32em, uppercase, smcp) |
| **Spacing**                                    |                        |        |       |
| Scale 4→128                                    | Tailwind default       | ✅     | maps to `p-1`…`p-32` |
| Section rhythm `clamp(4rem,10vw,8rem)`         | *inline per-section*   | ⚠️     | Every component hard-codes `py-32 md:py-40 lg:py-56`. Works, but drifts. Consider a `.section-rhythm` utility in Etapa 4. |
| `container-custom` max 1320px                  | `@layer utilities`     | ✅     | — |
| **Radii**                                      |                        |        |       |
| `--radius-sm` 2 px                             | `--radius: 0.125rem`   | ✅     | — |
| `--radius-pill` 9999                           | *no token*             | ➕     | Add `--radius-pill: 9999px` for single CTA pill. Current CTAs use square borders — DESIGN.md §7.7 calls for pill on the single primary CTA. |
| **Shadows**                                    |                        |        |       |
| `--shadow-hairline`                            | achieved via `border` | ⚠️     | Formalize as token so components can opt in instead of crafting per-border. |
| `--shadow-depth`                               | *not defined*          | ➕     | Add. |
| **Motion**                                     |                        |        |       |
| Easing `cubic-bezier(0.22,0.61,0.36,1)`        | `.ease-luxe` class + inline arrays | ✅ partial | Exists as utility class AND inline in every component. Works but duplicated. Suggestion: add `--ease-luxe` CSS var for consistency. |
| `--dur-hover` 240 ms                           | *no token*             | ➕     | Components drift between 500/600/700 ms on hover. Non-blocking, but fix in Etapa 4. |
| `--dur-reveal` 720 ms                          | *no token*             | ➕     | `components/reveal.tsx` uses **600 ms** + wrong easing `[0.21,0.47,0.32,0.98]`. Must align. |
| `--dur-curtain` 1100 ms                        | in `.page-curtain` CSS | ✅     | — |
| Reduced-motion guard                           | `@media (prefers-reduced-motion: reduce)` | ✅ | — |
| **Ambient textures**                           |                        |        |       |
| `.grain-texture`, `.grain-pulse`               | present                | ✅     | used in hero, techniques, products, newsletter, testimonials, footer |
| `.gold-underline`, `.hairline-gold`, `.hairline-sage` | present         | ✅     | — |
| `.matte-card`, `.gold-foil`                    | present                | ✅     | `matte-card` used by testimonial-card; `gold-foil` used by newsletter CTA panel |

**Token score: ✅ 18 · ⚠️ 4 · ➕ 7.**

### 13.2 Component audit — DESIGN.md §7 × `components/*.tsx`

Priority maps for the 7 semantic components plus the sections already on
the page but not in DESIGN.md.

| DESIGN.md component | Real file(s) | Status | Diagnosis |
|---------------------|--------------|--------|-----------|
| **Hero** (§6, §7.1) | `components/hero-section.tsx` | ⚠️ **REWRITE** | (a) **Layout is centered** — §6 requires split asymmetric 60/40. Today: `flex items-center justify-center text-center`. (b) **Scroll indicator** at bottom-right (writing-mode vertical + bouncing line) — §2 bans it. (c) **Headline hardcoded** `"Elevação. Ciência. Presença."` — not pulled from `brand.ts::COPY.hero`; the canonical §6 example is `"Mais altura. Mesma vida."`. (d) **Mixed-weight rule** partly there (regular + italic) ✅. (e) No inline-image-typography technique. (f) Parallax on hero image ✅. (g) Pre-existing `StaggeredWords` helper is good; keep it. |
| **Technique-Card** (§7.2) | `components/techniques-section.tsx` | ✅ **LIGHT REFACTOR** | (a) Correct `lg:col-span-7 / lg:col-span-5` 60/40 split ✅. (b) `<video>` autoplay + muted + loop + playsInline + preload="metadata" ✅ — BUT `controls` attribute present, which contradicts the "ambient autoplay" intent of the hero Fitbone tile. **Remove `controls`**. (c) Tag ribbon `PRINCIPAL / ANVISA` already on gold background ✅. (d) Benefits list uses Lucide `Check` stroke-1.5 ✅ (line-art, no emoji). (e) Missing: MONO treatment on the credential badge — today it uses `.eyebrow` (sans). Acceptable as-is. |
| **Credential-Bar** (§7.3) | `components/credentials-strip.tsx` + `components/trust-bar.tsx` | ⚠️ **CONSOLIDATE + REWRITE** | Two components doing overlapping work on the same page (`app/page.tsx` renders BOTH). CredentialsStrip uses real numbers (`+400`, `LATAM`, `Int.`, `1º`) in **Cormorant serif** — §7.3 requires **MONO**. TrustBar uses decorative Roman numerals I/II/III/IV with `trustItems` labels — a second variant of the same idea on an ivory background. **Action:** (i) keep `CredentialsStrip` as the canonical Credential-Bar, (ii) swap background from ivory `#F5EFE4` to **forest-800** `#0F2A1D` for contrast, (iii) swap the number face from `font-display` to the new `--font-mono` stack, (iv) add the `Count-Up` motion pattern (§8), (v) remove or demote `TrustBar` — it is not adding information beyond what Credential-Bar already carries. |
| **Gallery-Item** (§7.4) | `components/patient-gallery.tsx` | ⚠️ **REFACTOR LAYOUT** | (a) Today: uniform `aspect-[4/5]` inside `grid-cols-2 md:grid-cols-3`. §7.4 requires **masonry with mixed aspect ratios** (4:5, 1:1, 9:16). Fix: extend `data/gallery.ts` with an `aspect` field per item and render via column-based masonry (3 cols desktop, 2 tablet, horizontal-scroll-snap mobile). (b) Caption slide-up on hover ✅. (c) Modal dialog on click ✅. (d) Pending/placeholder state ✅. |
| **Testimonial** (§7.5) | `components/ui/testimonials-with-marquee.tsx` + `components/ui/testimonial-card.tsx` | ⚠️ **REFACTOR** | (a) Today: **marquee** (infinite horizontal animation). §7.5 calls for **scroll-snap carousel** instead. Decision point: marquee is visually striking and consistent with editorial atmosphere, but it does not obey §7.5 snap-with-arrows pattern. Recommend: **accept marquee as the Stature-specific variant** (add note to DESIGN.md §7.5 "Alternate A: marquee"), but require pause-on-hover (already present via `group-hover:[animation-play-state:paused]` ✅). (b) Card uses `matte-card` + serif italic name ✅ + monogram initials (privacy-preserving) ✅. (c) **Missing the MONO meta line** `idade · altura → altura · cidade` — today only `author.handle` is rendered as eyebrow. Fix: display `author.handle` (e.g., `"São Paulo, SP · 168 cm"`) in MONO. (d) Oversized `"` quote in serif gold ✅. |
| **FAQ-Item** (§7.6) | `components/faq-section.tsx` | ✅ **LIGHT REFACTOR** | (a) Serif question ✅. (b) Sans answer ✅. (c) Hairline divider (`border-b border-[#3A5243]/20`) ✅. (d) **Plus/Minus icons come from Lucide** (stroke-1) — §7.6 prefers **MONO `+` / `−` characters**. Swap: replace Lucide icons with `<span className="font-mono text-[13px]">` showing literal `+` / `−`. (e) Vertical gold bar that grows on open is a **bonus** — not in DESIGN.md. Document it in §7.6 as an accepted ornament. (f) Rotating chevron animation on the icon is redundant if we swap to MONO characters — becomes a crossfade. |
| **CTA-Band** (§7.7) | `components/newsletter-section.tsx` | ⚠️ **SCOPE-WIDER THAN SPEC** | The component doubles as CTA + contact grid. The embedded offset-right panel (`col-span-8 col-start-5`, `gold-foil` border) IS the CTA-Band ✅. Surrounding contact grid (3 cells + airport note) is additional content not in §7.7. **Decision:** either (i) keep as a **hybrid "Contact+CTA-Band"** and document in §7.7 as Stature-specific extension, or (ii) split into a dedicated contact grid + separate CTA-Band. Recommend (i) — splitting creates two small sections near the footer and fragments the close. (iii) The single primary CTA uses square border, not pill — §7.7 spec calls for pill. Minor: swap to `rounded-full`. |
| (extra) **About-Doctor** | `components/about-doctor.tsx` | ✅ **KEEP AS REFERENCE** | Already exemplifies Editorial Offset (5/7), sticky image, clip-path reveal, drop-cap `M`, vertical CRM rail, gold corner bracket, numbered highlights. This is the **benchmark** — when in doubt on other editorial sections, look here. Promote to DESIGN.md §7.8 as a new semantic component `Editorial-Feature`. |
| (extra) **Ingredients/Differentials** | `components/ingredients-section.tsx` | ✅ **KEEP** | Interleaved asymmetric flow (odd-row left / even-row right), oversized ghost numerals, gold-foil "Nota Científica" panel. Strong Editorial-Offset variant. |
| (extra) **Rehab** | `components/rehab-section.tsx` | ✅ **KEEP** | 4-milestone strip with italic numerals, Lucide icons stroke-1, hairline-gold accent. Acceptable even though technically 4-col — the per-card italic numeral breaks visual symmetry enough. |
| (extra) **Cities** | `components/cities-strip.tsx` | ✅ **KEEP** | Split 5/7 with stylized Brazil SVG mini-map + pin dots. Clean Split-Asymmetric. |
| (extra) **Featured-Products** | `components/featured-products.tsx` | ⚠️ **FLAG** | Renders procedures in a **3-equal-cards** horizontal grid — the exact pattern §2 bans. Mitigations in place: ghost roman numerals (I/II/III) as off-screen decoration, duotone `mix-blend-color` treatment, hover border-top hairline draw. Still: conceptually 3 uniform cards. **Decision needed** before Etapa 3: (a) accept as "editorial-grid" variant (each card distinct enough), (b) restructure to 2-col + 1-offset, or (c) make first card 2× width. Flagging for human review; does not block Etapas 2→3. |
| Motion: `Reveal` | `components/reveal.tsx` | ⚠️ **FIX** | Uses easing `[0.21, 0.47, 0.32, 0.98]` — this is **NOT** `ease-luxe`. Also duration 600 ms. Align to `[0.22, 0.61, 0.36, 1]` and 720 ms. Single-line fix. |
| Motion: `AnimatedText` | `components/animated-text.tsx` | ⚠️ **FIX** | Same wrong easing. Swap to `ease-luxe`. Unused by most components but lingering. |
| Motion: `ParallaxImage` | `components/parallax-image.tsx` | ✅ **NEAR-OK** | `parallaxOffset = 12 px` default — §4.6 canonical is **±8 px**. Drop default to `8`. |
| Motion: `BlurPanel` | `components/blur-panel.tsx` | — | Not audited here; not referenced by the 7 semantic components. |
| **Footer** | `components/ui/footer.tsx` | ✅ **KEEP** | Editorial closer with centered logo + "est. 2026 — Brasil" framed by hairlines + 4-col nav + coverage/credentials row. Matches the atmosphere. Uses same wrong ease `[0.21, 0.47, 0.32, 0.98]` on stagger — fix with the rest. |
| **Header** | `components/header.tsx` | — | Not audited in detail; out of §7 scope. Present in the DOM. |
| **WhatsAppFab** | `components/whatsapp-fab.tsx` | — | Floating action button; not in §7 scope. |
| **Side-nav** | `components/side-nav.tsx` | — | Not audited in detail. |

**Component score (for the 7 semantic DESIGN.md components):**
- ✅ Keep as-is: **0**
- ✅ Light refactor: **2** (Technique-Card, FAQ-Item)
- ⚠️ Significant refactor: **4** (Credential-Bar, Gallery, Testimonial, CTA-Band)
- ⚠️ Full rewrite: **1** (Hero — centered → split)

### 13.3 Minimum patches required before Etapa 3

These patches land the contract in the codebase so `stitch-design` and
`react-components` have a working foundation. None of these touch a §7
component directly — they only prepare the tokens.

#### (a) `app/layout.tsx` — load IBM Plex Mono

```ts
import { Cormorant_Garamond, Inter_Tight, IBM_Plex_Mono } from "next/font/google"

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
})

// inside return:
<html lang={BRAND.lang}
      className={`${cormorant.variable} ${interTight.variable} ${plexMono.variable} antialiased`}>
```

#### (b) `app/globals.css` — add motion + mono tokens and new utilities

Inside `:root`:

```css
/* Motion tokens */
--ease-luxe: cubic-bezier(0.22, 0.61, 0.36, 1);
--ease-swift: cubic-bezier(0.4, 0, 0.2, 1);
--dur-hover: 240ms;
--dur-page: 400ms;
--dur-reveal: 720ms;
--dur-curtain: 1100ms;

/* Radii */
--radius-pill: 9999px;

/* Shadows */
--shadow-hairline: 0 0 0 1px rgba(15, 42, 29, 0.08);
--shadow-depth: 0 1px 2px rgba(15, 42, 29, 0.05), 0 12px 32px -12px rgba(15, 42, 29, 0.16);
```

Inside `@theme inline`:

```css
--font-mono: var(--font-plex-mono), ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace;
```

Inside `@layer utilities`:

```css
.font-mono-stat {
  font-family: var(--font-mono);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}
.font-mono-label {
  font-family: var(--font-mono);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  font-size: 0.8125rem;
}
.shadow-hairline { box-shadow: var(--shadow-hairline); }
.shadow-depth   { box-shadow: var(--shadow-depth); }
.radius-pill    { border-radius: var(--radius-pill); }
```

#### (c) `components/reveal.tsx` — align easing + duration

```diff
-      duration: 0.6,
-      ease: [0.21, 0.47, 0.32, 0.98],
+      duration: 0.72,
+      ease: [0.22, 0.61, 0.36, 1],
```

#### (d) `components/animated-text.tsx` — align easing

```diff
-      ease: [0.21, 0.47, 0.32, 0.98],
+      ease: [0.22, 0.61, 0.36, 1],
```

#### (e) `components/parallax-image.tsx` — default offset 8 px

```diff
-export function ParallaxImage({ src, alt, className, parallaxOffset = 12 }: ParallaxImageProps) {
+export function ParallaxImage({ src, alt, className, parallaxOffset = 8 }: ParallaxImageProps) {
```

#### (f) `components/ui/footer.tsx` + any other callsite with `[0.21, 0.47, 0.32, 0.98]`

Replace each occurrence with `[0.22, 0.61, 0.36, 1]`. Grep:
`ease: \[0.21, 0.47, 0.32, 0.98\]`

**These 6 patches are the minimum preparation.** After they land, Etapa 3
can proceed — `stitch-design` regenerates the 7 semantic components
against a codebase whose tokens match the contract exactly.

### 13.4 Decisions resolved (2026-04-22)

All three escalation points below were resolved by the project owner.

#### ✅ Decision 1 — TrustBar × CredentialsStrip

**Resolved:** fold `TrustBar` into `CredentialsStrip`. Retire `TrustBar`
(remove from `app/page.tsx`; the file itself may be kept for one commit
and deleted in Etapa 4 cleanup to avoid dead imports).

Canonical **Credential-Bar** contract (replaces §7.3):
- Surface: forest-800 `#0F2A1D` background, full-bleed width, grain at 4%.
- Top and bottom hairline-gold 1 px.
- Content pulled from `lib/config/brand.ts::CREDENTIALS`.
- Numbers rendered in `.font-mono-stat` (IBM Plex Mono 500, tabular-nums,
  `clamp(2.5rem, 5vw, 4rem)`, ink-light `#EDE4D0`).
- Labels below number rendered in `.font-display` italic weight 300,
  `text-sm`, ink-light at 0.7 opacity.
- Between tiles: 1 px vertical sage-60% hairline on desktop; no divider on
  mobile (stacked).
- Motion: `Reveal-Stagger` 80 ms per tile + `Count-Up` on the numeric
  portion of `c.value` (non-numeric strings like `1º` or `LATAM` just fade
  in). Respects reduced-motion.
- No Roman numerals, no serif numbers, no decorative I/II/III ornaments
  (those were the TrustBar idiom — retired).

#### ✅ Decision 2 — FeaturedProducts 2+1 restructure

**Resolved:** restructure from `grid-cols-3 uniform` to **2+1 offset
editorial grid**. Explicit layout:

Desktop (≥ 1024 px), 12-col grid:
```
┌──────────────────────────┬─────────────┐
│                          │             │
│   CARD 1 — feature       │  CARD 2     │
│   cols 1–8  (66%)        │  cols 9–12  │
│   aspect 4:5 media       │  aspect 4:5 │
│   expanded copy          │  small copy │
│                          │             │
│                          ├─────────────┤
│                          │  CARD 3     │
│                          │  cols 9–12  │
│                          │  stacked    │
│                          │  under C2   │
└──────────────────────────┴─────────────┘
```

Tablet (768–1023 px): card 1 full-width on top, cards 2 and 3 side-by-side
below (6/6).

Mobile: stacked single-column, all three cards full-width.

Card 1 is the visual hero — **Fitbone-based procedure** (the most common,
the one most aligned with the brand). Cards 2 and 3 are the remaining
entries from `data/procedures.ts`, rendered in a smaller "brief" variant
(same structure, tighter padding, smaller heading, shorter copy).

**Do**
- Preserve the existing ghost roman numerals (I/II/III) and duotone
  `mix-blend-color` treatment — they're on-brand.
- Keep the hover draw-hairline at top of each card.
- Card 1 allocates `aspect-[4/5]` or wider `aspect-[16/9]` to the media
  (more visual mass); cards 2–3 stay on `aspect-[4/5]`.

**Don't**
- Don't render all three at identical dimensions (that is the banned
  pattern).
- Don't duplicate the CTA on every card — single "Consultar detalhes" on
  card 1, the others get a quieter `gold-underline` link.

#### ✅ Decision 3 — Testimonials: marquee as Alternate A

**Resolved:** **keep the infinite marquee** (`components/ui/testimonials-with-marquee.tsx`)
as the primary visual treatment. Formal acceptance below.

Canonical **Testimonial** contract (replaces / supersedes §7.5):

**Primary variant — Marquee editorial (Stature canonical):**
- Horizontal infinite marquee, CSS animation at 90 s duration (existing
  `--duration: 90s`, `animate-marquee` keyframe in `globals.css` ✅).
- `group-hover:[animation-play-state:paused]` already wired — keep.
- Gradient masks left/right using forest-900 → transparent ✅.
- Card = `components/ui/testimonial-card.tsx`, `matte-card` surface.
- Each card: 380 × flexible height, p-10, `matte-card` (forest-800 bg +
  gold-30% border + subtle inset).
- Contents of card:
  - Oversized opening quote `&ldquo;` in serif italic gold-40% top-left.
  - Body text: body-md, ink-light 85%, font-light, leading-1.85, max
    5 lines (soft clamp if longer).
  - Hairline-gold 40 px separator.
  - Bottom row: **monogram circle** (`initials(author.name)` in serif
    italic inside a gold-bordered circle) + serif italic name + MONO
    meta line (`author.handle`).
- **New requirement (added by this reconciliation):** render
  `author.handle` in `.font-mono-label` class (IBM Plex Mono 400,
  13 px, tabular-nums). Today it uses `.eyebrow` (sans small-caps). The
  MONO line carries `"168 cm · São Paulo"` or `"26 anos · 168 → 176 cm · SP"`.

**Alternate B — Snap carousel (not implemented, reserve):** only build
this if the marquee is ever restricted by motion-safe preferences and a
`prefers-reduced-motion: reduce` fallback needs richer interaction than
a paused marquee. The current reduced-motion guard already stops the
marquee; cards become statically visible (the user can scroll the
container). This is acceptable.

**Faces:** testimonial cards currently use monograms (initials inside a
gold circle) instead of photos. This is correct and preserves privacy.
**Never** swap to real avatars unless each patient has explicitly signed
photo-release for marquee display.

_§13.4 updated: 2026-04-22 by `design-md` after decisions from project
owner._

_§13 updated: 2026-04-22 by `design-md`._
