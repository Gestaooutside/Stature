# Plano de Implementação — Site Dr. David de Mello
## Adaptação White-Label da Base 1

---

## 1. Resumo Executivo

Adaptar o monolito Next.js 16 (Base 1) para um site institucional de clínica de alongamento ósseo. O layout, componentes, animações e estrutura de código permanecem **idênticos** à Base 1. As mudanças são exclusivamente de **conteúdo, identidade visual e remoção de módulos não utilizados**.

**Entregável:** Landing page single-page com 10 seções + botão WhatsApp flutuante.  
**Conversão principal:** Visitante → WhatsApp do Dr. David.  
**Sem:** Chat IA, checkout, carrinho, sistema de comissões, painel admin de e-commerce.

---

## 2. Arquitetura de Seções (ordem final)

| # | Seção | Componente Base 1 | Ação |
|---|-------|--------------------|------|
| 1 | Header | `header.tsx` | Adaptar — trocar nav items por âncoras das seções, botão CTA → WhatsApp |
| 2 | Hero | `hero-section.tsx` | Adaptar — novo título, subtítulo, CTA WhatsApp, imagem de fundo médica |
| 3 | TrustBar | `trust-bar.tsx` | Adaptar — selos: Hospital Orthomed, CRM, "Pacientes de todo Brasil", Técnica Minimamente Invasiva |
| 4 | Sobre o Médico | **NOVO** `about-doctor.tsx` | Criar — seguindo o mesmo padrão visual dos componentes da Base 1 |
| 5 | Procedimentos | `featured-products.tsx` | Adaptar — cards de "produtos" viram cards de "procedimentos/serviços" |
| 6 | Depoimentos | `testimonials-section.tsx` | Adaptar — trocar depoimentos de clientes por depoimentos de pacientes |
| 7 | Técnica / Diferenciais | `ingredients-section.tsx` | Adaptar — "ingredientes" vira detalhes técnicos do procedimento |
| 8 | FAQ | `faq-section.tsx` | Adaptar — inserir as 17 perguntas fornecidas |
| 9 | Contato | `newsletter-section.tsx` | Adaptar — formulário de newsletter vira seção de contato com CTA WhatsApp |
| 10 | Footer | `ui/footer.tsx` | Adaptar — dados do Dr. David, redes sociais, CRM |
| 11 | WhatsApp Flutuante | **NOVO** `whatsapp-fab.tsx` | Criar — botão fixo inferior direito |

---

## 3. Identidade Visual — `lib/config/brand.ts`

### 3.1 BRAND_CONFIG completo

```typescript
export const BRAND_CONFIG = {
  // === MARCA ===
  name: "Dr. David de Mello",
  tagline: "Alongamento Ósseo",
  fullTitle: "Dr. David de Mello — Alongamento Ósseo",
  description: "Especialista em alongamento ósseo e aumento de estatura com técnica minimamente invasiva",

  // === CONTATO ===
  contact: {
    phone: "(34) 9 9999-8888",
    phoneRaw: "5534999998888",
    whatsappUrl: "https://wa.me/5534999998888?text=Olá%20Dr.%20David%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20alongamento%20ósseo!",
    whatsappMessage: "Olá Dr. David, gostaria de saber mais sobre o alongamento ósseo!",
    email: "contato@drdaviddemello.com.br",
    website: "www.drdaviddemello.com.br",
  },

  // === REDES SOCIAIS ===
  social: {
    instagram: {
      handle: "@drdaviddemello",
      url: "https://instagram.com/drdaviddemello",
    },
  },

  // === LOCALIZAÇÃO ===
  location: {
    hospital: "Hospital Orthomed Center",
    address: "Av. Rondon Pacheco, 555",
    city: "Uberlândia",
    state: "MG",
    fullAddress: "Av. Rondon Pacheco, 555 — Uberlândia, MG",
    hasAirport: true,
    airportNote: "Uberlândia tem aeroporto com voos para diversas cidades do país",
    googleMapsEmbed: "", // URL do embed do Google Maps — preencher
  },

  // === PROFISSIONAL ===
  professional: {
    prefix: "Dr.",
    firstName: "David",
    lastName: "de Mello",
    fullName: "David de Mello",
    specialty: "Ortopedia — Alongamento Ósseo",
    crm: "CRM-MG XXXXX", // PREENCHER com CRM real
    bio: "Especialista em ortopedia com foco em alongamento ósseo e aumento de estatura. Realiza procedimentos no Hospital Orthomed Center em Uberlândia-MG, utilizando técnica minimamente invasiva com fixador externo linear monolateral e haste intramedular.",
  },

  // === CORES ===
  colors: {
    primary: "#0d5c5c",       // Teal escuro — backgrounds, header, footer
    secondary: "#1a8a8a",     // Teal médio — botões, links, acentos
    accent: "#7ec8c8",        // Teal claro — hover, badges, destaques
    surface: "#e8f5f5",       // Teal ultra-claro — fundos alternados
    dark: "#0a3d3d",          // Teal profundo — textos sobre fundo claro
    white: "#ffffff",
    gray50: "#f8fafa",        // Fundo alternado suave
    gray900: "#1a1a2e",       // Texto principal
  },

  // === SEO ===
  seo: {
    title: "Dr. David de Mello — Alongamento Ósseo | Uberlândia-MG",
    description: "Especialista em alongamento ósseo e aumento de estatura. Técnica minimamente invasiva com fixador externo + haste intramedular. Atendimento em Uberlândia-MG, Hospital Orthomed Center.",
    keywords: [
      "alongamento ósseo",
      "aumento de estatura",
      "cirurgia ortopédica",
      "fixador externo",
      "haste intramedular",
      "Dr David de Mello",
      "Uberlândia",
      "Orthomed Center",
    ],
    ogImage: "/og-image.jpg", // imagem para compartilhamento social
  },

  // === NAVEGAÇÃO ===
  navigation: [
    { label: "Sobre", href: "#sobre" },
    { label: "Procedimento", href: "#procedimento" },
    { label: "Resultados", href: "#resultados" },
    { label: "Técnica", href: "#tecnica" },
    { label: "FAQ", href: "#faq" },
    { label: "Contato", href: "#contato" },
  ],
}
```

### 3.2 Tailwind CSS — Variáveis customizadas

Adicionar em `globals.css` ou `tailwind.config.ts`:

```css
:root {
  --brand-primary: #0d5c5c;
  --brand-secondary: #1a8a8a;
  --brand-accent: #7ec8c8;
  --brand-surface: #e8f5f5;
  --brand-dark: #0a3d3d;
}
```

### 3.3 Logos

| Arquivo | Uso | Origem |
|---------|-----|--------|
| `public/logo.svg` | Header (fundo claro) | Versão colorida do PDF da marca |
| `public/logo-light.svg` | Footer (fundo escuro) | Versão branca do PDF da marca |
| `public/icon.svg` | Favicon | Símbolo isolado (silhuetas + seta) |
| `public/apple-icon.svg` | Apple touch icon | Símbolo isolado |
| `public/og-image.jpg` | Compartilhamento social | Logo + tagline sobre fundo teal |

---

## 4. Adaptação Componente a Componente

### 4.1 `components/header.tsx`

**O que muda:**
- Logo: `BRAND_CONFIG.name` + `BRAND_CONFIG.tagline`
- Itens do nav: âncoras `#sobre`, `#procedimento`, `#resultados`, `#tecnica`, `#faq`, `#contato`
- Botão CTA: "Agende sua Consulta" → `BRAND_CONFIG.contact.whatsappUrl`
- Remover: qualquer referência a carrinho (`cart-button.tsx`, `cart-dropdown.tsx`)
- Mobile: hamburguer mantém mesmo padrão, botão WhatsApp sempre visível

**Código — mudanças principais:**
```tsx
// Substituir
import { CartButton } from "./payment-modal/cart-button"
// Por
// (remover import — sem carrinho)

// CTA do header
<Button asChild>
  <a href={BRAND_CONFIG.contact.whatsappUrl} target="_blank" rel="noopener">
    Agende sua Consulta
  </a>
</Button>
```

---

### 4.2 `components/hero-section.tsx`

**O que muda:**
- Título: "Aumento de estatura com segurança e tecnologia de ponta"
- Subtítulo: "Técnica minimamente invasiva com fixador externo + haste intramedular. Resultados reais, vida normal após o tratamento."
- CTA principal: "Fale comigo no WhatsApp" → link WhatsApp
- CTA secundário: "Conheça o procedimento" → scroll para `#procedimento`
- Background: imagem médica/clínica com overlay gradiente teal
- Remover: qualquer referência a preços ou "comprar agora"
- Selo: "Uberlândia-MG | Hospital Orthomed Center"

**Imagens necessárias:**
- `public/hero-section.jpg` — foto profissional (consultório, hospital ou Dr. David)
- `public/hero-section-mobile.jpg` — versão mobile da mesma

---

### 4.3 `components/trust-bar.tsx`

**O que muda — selos/ícones:**

| Selo Base 1 | Selo Dr. David |
|-------------|----------------|
| Selo Anvisa / Qualidade | Hospital Orthomed Center |
| Frete Grátis | Técnica Minimamente Invasiva |
| Garantia | CRM-MG (registro profissional) |
| Pagamento Seguro | Pacientes de Todo o Brasil |

Manter o mesmo layout visual (ícones + texto curto em row horizontal, scroll no mobile).

---

### 4.4 `components/about-doctor.tsx` — **NOVO**

**Criar seguindo o padrão visual da Base 1** (mesmo espaçamento, tipografia, animações Framer Motion).

**Layout:** 2 colunas (imagem esquerda, texto direita) — mesmo padrão de `solution-intro.tsx` ou `comparison-section.tsx` se existir na Base 1.

**Conteúdo:**
- Foto profissional do Dr. David (circular ou rounded)
- Nome: "Dr. David de Mello"
- Especialidade: "Ortopedia — Alongamento Ósseo"
- CRM
- Texto bio (3-4 parágrafos curtos)
- Badge: "Atendo pacientes de todo o Brasil"
- Local: Hospital Orthomed Center, Uberlândia-MG

**Animação:** Mesmo `<Reveal>` usado nos outros componentes da Base 1.

**Imagem necessária:**
- `public/dr-david.jpg` — foto profissional

**Âncora:** `id="sobre"`

---

### 4.5 `components/featured-products.tsx` → Procedimentos

**O que muda:**
- Título da seção: "Procedimentos" ou "Nossos Serviços"
- Cards de "produtos" viram cards de "procedimentos"
- Remover: preços, botão "comprar", referência ao carrinho
- CTA de cada card: "Saiba mais" → WhatsApp ou scroll para FAQ

**Cards propostos:**

| Card | Título | Descrição curta |
|------|--------|-----------------|
| 1 | Alongamento de Fêmur | Ganho médio de 8-10cm. Técnica com fixador + haste. |
| 2 | Alongamento de Tíbia | Ganho médio de 5-7cm. Ideal para complementar o fêmur. |
| 3 | Correção de Discrepância | Correção de diferença de tamanho entre membros. |

**Imagens necessárias:**
- `public/proc-femur.jpg`
- `public/proc-tibia.jpg`
- `public/proc-correcao.jpg`

Ou usar ícones/ilustrações se não houver fotos.

**Âncora:** `id="procedimento"`

---

### 4.6 `components/testimonials-section.tsx`

**O que muda:**
- Título: "O que nossos pacientes dizem"
- Trocar depoimentos de clientes de suplementos por depoimentos de pacientes
- Cada card: nome (pode ser iniciais), cidade/estado, texto do depoimento
- Remover: referência a produtos, notas/estrelas de e-commerce

**Dados — `data/testimonials.ts`:**
```typescript
export const testimonials = [
  {
    id: 1,
    name: "Paciente A.",
    location: "São Paulo, SP",
    text: "O procedimento mudou minha vida. A equipe do Dr. David é excepcional e o acompanhamento foi impecável do início ao fim.",
    // gain: "8cm", // opcional se o paciente autorizar
  },
  // ... mais depoimentos reais (preencher com o Dr. David)
]
```

**Nota:** Usar depoimentos reais fornecidos pelo Dr. David. Manter placeholder até receber.

**Âncora:** `id="resultados"`

---

### 4.7 `components/ingredients-section.tsx` → Técnica / Diferenciais

**O que muda:**
- Título: "Técnica e Diferenciais"
- "Ingredientes" viram "diferenciais técnicos"
- Manter o mesmo layout de cards/grid com ícone + título + descrição

**Itens:**

| # | Título | Descrição |
|---|--------|-----------|
| 1 | Fixador Externo Linear | Monolateral, mais leve e confortável que o Ilizarov. Removido ao final do alongamento. |
| 2 | Haste Intramedular | Dentro do osso, invisível externamente. Sem incômodo. Não precisa retirar. |
| 3 | Minimamente Invasiva | Poucas e pequenas incisões. Menos risco de infecção. Poucas cicatrizes. |
| 4 | Fisioterapia Integrada | Reabilitação desde o 1º dia. Manutenção de força, mobilidade e treino de marcha. |
| 5 | Proporcionalidade | Cálculos para manter proporção corporal entre membros e tronco. |
| 6 | Vida Normal Após | Correr, pular, academia. O osso formado é tão resistente quanto o original. |

**Âncora:** `id="tecnica"`

---

### 4.8 `components/faq-section.tsx`

**O que muda:**
- Título: "Dúvidas Frequentes"
- Conteúdo: as 17 perguntas fornecidas no documento do Dr. David
- Organizar em categorias (accordion agrupado) ou lista flat (manter o padrão da Base 1)
- CTA ao final: "Ainda tem dúvidas? Fale comigo no WhatsApp"

**Dados — criar `data/faq.ts`:**
```typescript
export const faqItems = [
  {
    question: "O que é o alongamento ósseo?",
    answer: "Alongamento ósseo é um método cirúrgico disponível para promover o crescimento do osso. Pode ser utilizado para corrigir diferença de tamanho entre os membros ou para aumento de estatura em pacientes que já atingiram a maturidade óssea.",
  },
  {
    question: "Quem pode passar pelo procedimento?",
    answer: "Os pacientes são cuidadosamente avaliados, sendo fatores importantes: idade, hábitos como fumar e exercícios, alimentação, estado de saúde e nutricional. Pacientes que se enquadrem nesses critérios são submetidos a exames de imagem para estudos ósseos.",
  },
  // ... todas as 17 perguntas
]
```

**Âncora:** `id="faq"`

---

### 4.9 `components/newsletter-section.tsx` → Contato

**O que muda:**
- Título: "Entre em Contato"
- Remover: campo de email + botão "Inscrever"
- Adicionar:
  - Endereço completo do Hospital Orthomed Center
  - Telefone/WhatsApp
  - Instagram
  - Nota sobre aeroporto de Uberlândia
  - Botão grande CTA: "Fale comigo no WhatsApp"
- Opcional: embed Google Maps (se o layout permitir)

**Âncora:** `id="contato"`

---

### 4.10 `components/ui/footer.tsx`

**O que muda:**
- Logo versão light (fundo teal escuro)
- Dados do Dr. David (nome, CRM, especialidade)
- Links de navegação (âncoras)
- Redes sociais: Instagram + WhatsApp
- Endereço: Hospital Orthomed Center
- Copyright: "© 2026 Dr. David de Mello — Todos os direitos reservados"
- Remover: links de termos de uso/política de privacidade de e-commerce (ou adaptar se necessário)

---

### 4.11 `components/whatsapp-fab.tsx` — **NOVO**

**Criar:**
- Botão fixo `position: fixed` no canto inferior direito
- Ícone do WhatsApp (SVG)
- Animação: pulse sutil (Framer Motion ou CSS keyframes)
- z-index alto para ficar sobre todo conteúdo
- Link: `BRAND_CONFIG.contact.whatsappUrl`
- Responsivo: tamanho adequado para mobile (56px) e desktop (64px)

---

## 5. Componentes e Módulos a REMOVER

### 5.1 Componentes

| Componente/Pasta | Motivo |
|------------------|--------|
| `components/payment-modal/` (toda a pasta) | Sem checkout |
| `components/checkout/` | Sem checkout |
| `components/chat/` | Chat IA removido |
| `components/admin/` | Sem painel admin de e-commerce |
| `components/ui/admin-login.tsx` | Sem admin |
| `components/collection-strip.tsx` | Específico de e-commerce |
| `components/product-card.tsx` | Substituído por card de procedimento |
| `components/quick-look-modal.tsx` | Específico de produtos |
| `components/elevenlabs-widget.tsx` | Widget de voz não necessário |

### 5.2 Rotas API (`app/api/`)

| Rota | Motivo |
|------|--------|
| `api/chat/` | Chat removido |
| `api/orders/` | Sem pedidos |
| `api/asaas/` (toda a pasta) | Sem pagamentos |
| `api/webhooks/` | Sem webhooks de pagamento |
| `api/coupons/` | Sem cupons |
| `api/admin/` (toda a pasta) | Sem admin de e-commerce |

**Manter (se quiser capturar leads):**
- `api/leads/route.ts` — para capturar contatos do formulário de contato (opcional)

### 5.3 Serviços (`lib/services/`)

| Serviço | Motivo |
|---------|--------|
| `asaas.ts` | Sem pagamentos |
| `commissions.ts` | Sem comissões |
| `inventory.ts` | Sem estoque |
| `orders.ts` | Sem pedidos |
| `payouts.ts` | Sem repasses |
| `vector-search.ts` | Sem RAG |

### 5.4 Stores (`lib/stores/`)

| Store | Motivo |
|-------|--------|
| `cart-store.ts` | Sem carrinho |

### 5.5 Banco de Dados

**Tabelas a remover do schema:**
- `orders`, `orderItems`, `payments`, `paymentEvents`
- `inventory`, `inventoryTransactions`
- `coupons`, `commissionRecords`, `payouts`
- `representatives`, `prescribers`
- `knowledgeChunks`

**Tabelas a manter (se capturar leads):**
- `leads` — nome, telefone, email, mensagem
- `users`, `sessions` — se quiser login admin simples

### 5.6 Outros

| Item | Motivo |
|------|--------|
| `llm/` (toda a pasta) | Sem IA/RAG |
| `scripts/ingest-knowledge.ts` | Sem knowledge base |
| `scripts/test-vector-search.ts` | Sem RAG |
| `lib/config/products.ts` | Sem catálogo de produtos (criar `procedures.ts`) |

---

## 6. Arquivos NOVOS a Criar

| Arquivo | Descrição |
|---------|-----------|
| `components/about-doctor.tsx` | Seção "Sobre o Médico" |
| `components/whatsapp-fab.tsx` | Botão WhatsApp flutuante |
| `data/faq.ts` | 17 perguntas e respostas |
| `data/testimonials.ts` | Depoimentos de pacientes (atualizar) |
| `data/procedures.ts` | Cards dos procedimentos (fêmur, tíbia, correção) |
| `data/differentials.ts` | Itens da seção "Técnica/Diferenciais" |
| `data/trust-items.ts` | Selos da TrustBar |

---

## 7. Estrutura Final de Pastas

```
dr-david-site/
├── CLAUDE.md
├── README.md
├── next.config.mjs
├── tsconfig.json
├── components.json
├── package.json
├── pnpm-lock.yaml
├── .env.example
│
├── app/
│   ├── page.tsx                    # Landing page (todas as seções)
│   ├── layout.tsx                  # Layout raiz
│   ├── globals.css                 # Variáveis da marca
│   ├── manifest.ts
│   ├── sitemap.ts
│   ├── not-found.tsx
│   ├── icon.svg
│   ├── apple-icon.svg
│   └── politica-privacidade/
│       └── page.tsx
│
├── components/
│   ├── header.tsx                  # Adaptado
│   ├── hero-section.tsx            # Adaptado
│   ├── trust-bar.tsx               # Adaptado
│   ├── about-doctor.tsx            # NOVO
│   ├── featured-products.tsx       # Adaptado → Procedimentos
│   ├── testimonials-section.tsx    # Adaptado
│   ├── ingredients-section.tsx     # Adaptado → Técnica
│   ├── faq-section.tsx             # Adaptado
│   ├── newsletter-section.tsx      # Adaptado → Contato
│   ├── whatsapp-fab.tsx            # NOVO
│   ├── reveal.tsx                  # Mantido
│   ├── animated-text.tsx           # Mantido
│   ├── blur-panel.tsx              # Mantido
│   ├── parallax-image.tsx          # Mantido
│   ├── side-nav.tsx                # Mantido
│   ├── navigation-tracker.tsx      # Mantido
│   ├── theme-provider.tsx          # Mantido
│   │
│   ├── legal/
│   │   └── privacy-policy.tsx      # Adaptado
│   │
│   └── ui/                         # shadcn/ui — mantido intacto
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── footer.tsx              # Adaptado
│       └── ... (demais ui)
│
├── data/
│   ├── testimonials.ts             # Atualizado
│   ├── faq.ts                      # NOVO
│   ├── procedures.ts               # NOVO
│   ├── differentials.ts            # NOVO
│   └── trust-items.ts              # NOVO
│
├── lib/
│   ├── utils.ts                    # Mantido
│   ├── types.ts                    # Simplificado
│   ├── config/
│   │   └── brand.ts                # Atualizado com dados do Dr. David
│   └── db/                         # Simplificado (só leads se necessário)
│       ├── index.ts
│       └── schema.ts
│
├── hooks/
│   ├── use-in-view.ts              # Mantido
│   └── use-reduced-motion.ts       # Mantido
│
├── public/
│   ├── logo.svg                    # Logo Dr. David (claro)
│   ├── logo-light.svg              # Logo Dr. David (escuro)
│   ├── og-image.jpg                # Imagem para social sharing
│   ├── robots.txt
│   ├── hero-section.jpg            # Foto hero desktop
│   ├── hero-section-mobile.jpg     # Foto hero mobile
│   ├── dr-david.jpg                # Foto do médico
│   ├── proc-femur.jpg              # Imagem procedimento fêmur
│   ├── proc-tibia.jpg              # Imagem procedimento tíbia
│   ├── proc-correcao.jpg           # Imagem correção discrepância
│   └── hospital.jpg                # Foto do Orthomed Center (opcional)
│
└── docs/
    └── PLANO_IMPLEMENTACAO.md      # Este documento
```

---

## 8. Mapeamento `page.tsx` — Ordem das Seções

```tsx
// app/page.tsx
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TrustBar } from "@/components/trust-bar"
import { AboutDoctor } from "@/components/about-doctor"
import { FeaturedProducts } from "@/components/featured-products"   // → Procedimentos
import { TestimonialsSection } from "@/components/testimonials-section"
import { IngredientsSection } from "@/components/ingredients-section" // → Técnica
import { FaqSection } from "@/components/faq-section"
import { NewsletterSection } from "@/components/newsletter-section"  // → Contato
import { Footer } from "@/components/ui/footer"
import { WhatsAppFab } from "@/components/whatsapp-fab"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustBar />
        <AboutDoctor />
        <FeaturedProducts />      {/* Procedimentos */}
        <TestimonialsSection />
        <IngredientsSection />    {/* Técnica / Diferenciais */}
        <FaqSection />
        <NewsletterSection />     {/* Contato */}
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
```

---

## 9. Assets Necessários do Cliente

Antes de implementar, solicitar ao Dr. David:

| Asset | Formato | Status |
|-------|---------|--------|
| Foto profissional do Dr. David | JPG/PNG, alta resolução | ⬜ Pendente |
| CRM completo | Texto | ⬜ Pendente |
| Foto do Hospital Orthomed Center | JPG/PNG | ⬜ Pendente |
| Fotos dos procedimentos (ou autorização para usar ilustrações) | JPG/PNG | ⬜ Pendente |
| Foto para hero section | JPG/PNG, 1920x1080+ | ⬜ Pendente |
| Depoimentos reais de pacientes (com autorização) | Texto | ⬜ Pendente |
| Logo em SVG (já temos o PDF) | SVG | ⬜ Extrair do PDF |
| Número de WhatsApp correto | Texto | ⬜ Confirmar |
| Link do Instagram | URL | ✅ @drdaviddemello |
| Endereço completo correto | Texto | ⬜ Confirmar |

---

## 10. Checklist de Implementação

### Fase 1 — Setup (1 sessão)
- [ ] Duplicar repositório Base 1
- [ ] Remover módulos não usados (checkout, admin, chat, pagamentos)
- [ ] Atualizar `BRAND_CONFIG` em `lib/config/brand.ts`
- [ ] Trocar logos em `public/`
- [ ] Atualizar cores no `globals.css` e `tailwind.config.ts`
- [ ] Limpar `package.json` (remover deps: openai, pgvector, bcrypt se não usar admin)

### Fase 2 — Conteúdo (1-2 sessões)
- [ ] Criar `data/faq.ts` com as 17 perguntas
- [ ] Criar `data/procedures.ts` com os 3 procedimentos
- [ ] Criar `data/differentials.ts` com os 6 diferenciais
- [ ] Criar `data/trust-items.ts` com os 4 selos
- [ ] Atualizar `data/testimonials.ts` com depoimentos de pacientes

### Fase 3 — Componentes (2-3 sessões)
- [ ] Adaptar `header.tsx` — nav + CTA WhatsApp
- [ ] Adaptar `hero-section.tsx` — textos + CTA + imagem
- [ ] Adaptar `trust-bar.tsx` — novos selos
- [ ] Criar `about-doctor.tsx` — seção sobre o médico
- [ ] Adaptar `featured-products.tsx` — cards de procedimentos
- [ ] Adaptar `testimonials-section.tsx` — depoimentos de pacientes
- [ ] Adaptar `ingredients-section.tsx` — diferenciais técnicos
- [ ] Adaptar `faq-section.tsx` — 17 perguntas
- [ ] Adaptar `newsletter-section.tsx` — contato + WhatsApp
- [ ] Adaptar `footer.tsx` — dados do Dr. David
- [ ] Criar `whatsapp-fab.tsx` — botão flutuante

### Fase 4 — SEO e Polish (1 sessão)
- [ ] Meta tags e OG tags em `layout.tsx`
- [ ] Schema.org `MedicalBusiness` + `Physician`
- [ ] `sitemap.ts` atualizado
- [ ] `manifest.ts` atualizado
- [ ] Imagens otimizadas com `next/image`
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Lighthouse audit — target 90+

### Fase 5 — Deploy (1 sessão)
- [ ] Configurar domínio `drdaviddemello.com.br`
- [ ] Deploy na Vercel (ou plataforma escolhida)
- [ ] Testar todos os links WhatsApp
- [ ] Testar formulário de leads (se implementado)
- [ ] Validar Google Maps embed
- [ ] Go live

---

## 11. Estimativa de Esforço

| Fase | Estimativa |
|------|-----------|
| Setup + limpeza | 2-3 horas |
| Conteúdo (dados) | 1-2 horas |
| Adaptação de componentes | 4-6 horas |
| Componentes novos (about + whatsapp fab) | 2-3 horas |
| SEO + polish + testes | 2-3 horas |
| Deploy | 1 hora |
| **Total estimado** | **12-18 horas** |

---

*Documento gerado em Abril/2026*  
*Projeto: Site institucional Dr. David de Mello — Alongamento Ósseo*  
*Base: White-label Base 1 (Next.js 16)*
