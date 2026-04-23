# Pipeline Handoff — Stature Clinic Redesign

> **Sessão anterior encerrou após Etapa 2 + patches. Restam Etapas 3, 4 e 5.**
> **Este arquivo te dá tudo que precisa para retomar no próximo chat.**

---

## TL;DR

- **Etapas concluídas:** 1 (taste-design) + 2 (design-md) + 6 patches técnicos.
- **Fonte de verdade:** `.stitch/DESIGN.md` (§0-13). Lê essa primeiro no próximo chat.
- **Decisões já tomadas** (não reabrir): fusão de TrustBar em CredentialsStrip, FeaturedProducts em grid 2+1 offset, Testimonials mantém marquee.
- **Próximo passo:** Etapa 3 com Stitch MCP → 7 seções regeradas.

---

## 1. O que foi feito nesta sessão

### Etapa 1 — `taste-design` ✅

Criado `.stitch/DESIGN.md` com:

- **§0-1:** Princípio + atmosfera (densidade 4, variância 7, motion 6, criatividade 9). Referência: Loro Piana × Cleveland Clinic × Apple Health.
- **§2:** Anti-patterns (banidos: Inter puro, Garamond genérico, `#000`, neon, centered hero, 3-col uniform, emojis-as-icons, scroll indicators, Ilizarov).
- **§3:** Content guardrails — preservar/remover.
- **§4:** Tokens completos (5 cores funcionais, 3 famílias tipográficas incluindo IBM Plex Mono, escala fluida clamp(), spacing 4→128, radii 0/2/4/8/pill, shadows hairline/depth, motion tokens).
- **§5:** 4 layouts canônicos — Split Asymmetric · Editorial Offset · Masonry · Full-Bleed With Margin.
- **§6:** Hero treatment dedicado (asymmetric + mixed-weight H1 + inline-image-in-typography).
- **§7:** 7 componentes semânticos com spec + do/don't.
- **§8:** Motion catalog (9 patterns reutilizáveis).
- **§9:** Accessibility WCAG AA.
- **§10:** Performance budget.
- **§11:** Validation checklist por seção.
- **§12:** File map.

### Etapa 2 — `design-md` ✅

Anexada §13 ao `.stitch/DESIGN.md`:

- **§13.1:** Auditoria tokens (✅ 18 · ⚠️ 4 · ➕ 7).
- **§13.2:** Auditoria componentes (mapa 1:1 contrato → arquivo real, com diagnóstico por componente).
- **§13.3:** 6 patches mínimos para alinhar globals.css + layout.tsx ao contrato.
- **§13.4:** 3 decisões resolvidas (ver seção 3 abaixo).

### 6 patches técnicos aplicados ao código ✅

| # | Arquivo | Mudança |
|---|---------|---------|
| a | `app/layout.tsx` | Importado `IBM_Plex_Mono`; adicionado `plexMono.variable` no `<html>`. |
| b | `app/globals.css` | Adicionados em `:root`: `--ease-luxe`, `--ease-swift`, `--dur-hover`, `--dur-page`, `--dur-reveal`, `--dur-curtain`, `--radius-pill`, `--shadow-hairline`, `--shadow-depth`. Em `@theme inline`: `--font-mono` com stack IBM Plex Mono → JetBrains Mono → system mono. Em `@layer utilities`: `.font-mono`, `.font-mono-stat`, `.font-mono-label`, `.shadow-hairline`, `.shadow-depth`, `.radius-pill`. |
| c | `components/reveal.tsx` | Ease `[0.21, 0.47, 0.32, 0.98]` → `[0.22, 0.61, 0.36, 1]`; duration 0.6 → 0.72. |
| d | `components/animated-text.tsx` | Mesma troca de ease. |
| e | `components/parallax-image.tsx` | `parallaxOffset` default 12 → 8. |
| f | `components/ui/footer.tsx` (2 callsites) + `components/whatsapp-fab.tsx` (1 callsite) | Ease `[0.21, 0.47, 0.32, 0.98]` → `[0.22, 0.61, 0.36, 1]`. |

**Verificar antes de prosseguir no próximo chat:**
```bash
pnpm tsc --noEmit   # ou: pnpm build
```
Deve passar sem erros de tipo. Se der erro, provavelmente `IBM_Plex_Mono` não foi reconhecido — rode `pnpm install` se `next/font/google` reclamar.

---

## 2. Arquivos tocados nesta sessão

**Criados:**
- `.stitch/DESIGN.md` (contrato completo + reconciliação §13)
- `.stitch/HANDOFF.md` (este arquivo)

**Modificados:**
- `app/layout.tsx`
- `app/globals.css`
- `components/reveal.tsx`
- `components/animated-text.tsx`
- `components/parallax-image.tsx`
- `components/ui/footer.tsx`
- `components/whatsapp-fab.tsx`

**Não tocados (ainda):**
- Os 7 componentes semânticos propriamente ditos (`hero-section.tsx`, `techniques-section.tsx`, `credentials-strip.tsx`, `trust-bar.tsx`, `featured-products.tsx`, `patient-gallery.tsx`, `faq-section.tsx`, `ui/testimonials-with-marquee.tsx`, `ui/testimonial-card.tsx`). Etapas 3 + 4 vão reescrever/refatorar esses.

---

## 3. Decisões já tomadas — **NÃO REABRIR**

### Decisão 1 — TrustBar aposentado
Fundir `components/trust-bar.tsx` em `components/credentials-strip.tsx`. Remover `<TrustBar />` de `app/page.tsx`. O novo Credential-Bar carrega:
- Fundo forest-800 `#0F2A1D` (não mais ivory).
- Números em `.font-mono-stat` (IBM Plex Mono 500).
- Labels em Cormorant italic 300.
- Count-up com fallback reduced-motion.
- Hairlines top + bottom.
- Grain 4%.
- Dados de `CREDENTIALS` em `brand.ts` (sem Roman numerals I/II/III — aquilo era do TrustBar, retirado).

### Decisão 2 — FeaturedProducts em 2+1 offset
Substituir `grid-cols-3` uniforme por:

```
Desktop (≥1024px, 12-col):
┌──────────── CARD 1 (cols 1-8) ────────────┬─ CARD 2 (cols 9-12) ─┐
│   Fitbone feature — media maior 4:5 ou    │  brief variant       │
│   16:9, copy expandida, CTA primário      ├──────────────────────┤
│                                           │  CARD 3 (cols 9-12)  │
│                                           │  brief variant       │
└───────────────────────────────────────────┴──────────────────────┘

Tablet: card 1 full-width em cima, cards 2+3 side-by-side (6/6) abaixo.
Mobile: stack single-column.
```

Preservar: ghost numerals I/II/III, duotone `mix-blend-color`, hover draw-hairline.

### Decisão 3 — Testimonials mantém marquee
O marquee infinito (`components/ui/testimonials-with-marquee.tsx`) é variante canonical Stature. Preservar:
- 90s duration
- Pause-on-hover (`group-hover:[animation-play-state:paused]`)
- Gradient masks left/right forest-900 → transparent
- Cards `matte-card` com monogram circles (iniciais em serif italic dentro de círculo gold-border) — **sem fotos** (privacidade)

**Uma única mudança:** `author.handle` passa de `.eyebrow` para `.font-mono-label` (IBM Plex Mono 400, 13px, tabular-nums).

---

## 4. O que falta — Etapas 3, 4, 5

### Etapa 3 — `stitch-design` com Stitch MCP

Regerar 7 seções no Stitch, uma por vez, lendo DESIGN.md como contrato. Sequência recomendada:

| # | Seção | Status | Arquivo React alvo |
|---|-------|--------|---------------------|
| 1 | Hero | **rewrite** (centered → split 40/60) | `components/hero-section.tsx` |
| 2 | Techniques | light refactor | `components/techniques-section.tsx` |
| 3 | Credential-Bar | rewrite (consolidar + forest bg) | `components/credentials-strip.tsx` (+ delete `trust-bar.tsx`) |
| 4 | FeaturedProducts | restructure (2+1 offset) | `components/featured-products.tsx` |
| 5 | Gallery | refactor (masonry com aspects mistos) | `components/patient-gallery.tsx` (+ adicionar `aspect` em `data/gallery.ts`) |
| 6 | Testimonials | light refactor (MONO meta) | `components/ui/testimonial-card.tsx` |
| 7 | FAQ | light refactor (+/− em MONO) | `components/faq-section.tsx` |

### Etapa 4 — `react-components`

Converter cada tela Stitch em componente React tipado, usando:
- Tokens de `app/globals.css` (já prontos após patches).
- `next/image`, `next/font`, framer-motion.
- shadcn/ui em `components/ui/`.
- Stack já instalada.
- Validação AST + `pnpm tsc --noEmit` sem erros.

### Etapa 5 — `remotion`

Walkthrough de 40s, 1920×1080, 60fps, sem áudio. Output: `public/stature-walkthrough.mp4`, ≤ 8MB. Usa o prompt que você já tem preparado (mencionado no topo da conversa anterior) com `start_session` + `init_project` em subpasta `video/`.

---

## 5. Prompt pronto para o próximo chat

Cole isto no início do próximo chat (ajuste se quiser):

---

**PROMPT PARA COLAR:**

```
Contexto: continuando pipeline de redesign do Stature Clinic (Next.js 14). 
Projeto em C:\Users\Steam\Desktop\Stature. 

Li .stitch/HANDOFF.md + .stitch/DESIGN.md. Etapas 1 e 2 já foram feitas 
(taste-design + design-md + 6 patches técnicos). Decisões 1, 2 e 3 já 
resolvidas em §13.4 — NÃO reabrir.

Quero rodar Etapa 3 agora via Stitch MCP.

Primeiro: confirma que você tem acesso ao Stitch MCP (ferramentas como 
generate_screen_from_text, edit_screens, list_projects, get_screen, 
download). Lista as ferramentas disponíveis.

Depois: invoca o skill stitch-design e gera a seção 1 (Hero) primeiro, 
lendo .stitch/DESIGN.md §6 + §7.1 como contrato. Usa:

- Layout: Split Asymmetric 40/60 (copy esquerda, imagem direita)
- Headline canônico: "Mais altura." (weight 400) + "Mesma vida." 
  (weight 300 italic) — mesclar pesos na mesma headline
- Paleta: ivory #F5EFE4 background, forest-800 #0F2A1D ink, 
  gold-500 #D9C89E accent, sage-600 #3A5243 signal
- Fontes: Cormorant Garamond (serif display), Inter Tight (sans UI), 
  IBM Plex Mono (números)
- Remover: qualquer scroll indicator, centered layout, imagem de 
  Ilizarov, bouncing chevrons
- Adicionar: inline-image-in-typography no subhead (opcional mas 
  encorajado) — foto pequena circular 48px entre palavras
- CTA primário: pill gold; CTA secundário: link com gold-underline

Depois que a Hero estiver aprovada por mim, prossegue para seções 2-7 
em ordem. Ao final da Etapa 3, lista todas as telas geradas.

Faz checkpoint entre cada seção — mostra o output antes de ir pra 
próxima.
```

---

## 6. Comandos de verificação rápida no novo chat

```bash
# Verifica que os patches estão no lugar:
pnpm tsc --noEmit                          # type-check
ls .stitch/                                # DESIGN.md + HANDOFF.md
grep -c "IBM_Plex_Mono" app/layout.tsx     # deve retornar 1
grep -c "font-mono-stat" app/globals.css   # deve retornar pelo menos 1
grep -rn "0.21, 0.47, 0.32, 0.98" components/  # deve retornar 0 matches
```

Se qualquer comando falhar, os patches não estão aplicados corretamente — resolve antes de ir para Etapa 3.

---

## 7. Onde olhar para cada dúvida

| Dúvida | Arquivo · seção |
|--------|------------------|
| Qual ease usar? | `.stitch/DESIGN.md` §4.6 — `--ease-luxe: cubic-bezier(0.22, 0.61, 0.36, 1)` |
| Que cores são permitidas? | `.stitch/DESIGN.md` §4.1 (5 funcionais × 2 modos) |
| Como fazer hero não-centralizado? | `.stitch/DESIGN.md` §6 |
| TrustBar ou CredentialsStrip? | Handoff §3 Decisão 1 (CredentialsStrip, TrustBar retirado) |
| Featured-Products grid? | Handoff §3 Decisão 2 (2+1 offset) |
| Testimonials carrossel ou marquee? | Handoff §3 Decisão 3 (marquee mantido) |
| O que NUNCA pode aparecer no site? | `.stitch/DESIGN.md` §2 + §3 (Ilizarov, Inter puro, Garamond genérico, centered hero, etc.) |
| Conteúdo que NUNCA sai? | `.stitch/DESIGN.md` §3 (+400, 8cm fêmur/6cm tíbia, 5 capitais, Fitbone Anvisa) |
| Anti-padrões motion? | `.stitch/DESIGN.md` §2 + §8 |

---

## 8. Nota final

A Etapa 5 (remotion) tem prompt próprio preparado (primeira mensagem da conversa anterior — `Quero um walkthrough de 40 segundos do site Stature, 1920×1080, 60fps, sem áudio...`). Guarda esse prompt e só invoca no final, depois que as Etapas 3 e 4 tiverem fechado o visual novo.

Boa sorte.

_Gerado: 2026-04-22._
