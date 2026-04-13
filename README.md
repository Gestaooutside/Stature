registro

# White Label Base – Portal e Área Administrativa

Repositório monolítico white-label do site público e do painel administrativo. O projeto roda em Next.js 16 (App Router + Turbopack) com Drizzle ORM e integrações com OpenRouter e Asaas. Para personalizar a marca, edite `lib/config/brand.ts`.

[![Deploy Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](#)
[![Stack](https://img.shields.io/badge/Stack-Next.js%2016%20%7C%20Drizzle%20ORM%20%7C%20pnpm-orange)](#)

---

## Sumário

1. [Stacks e ferramentas](#stacks-e-ferramentas)
2. [Instalação e scripts](#instalação-e-scripts)
3. [Principais funcionalidades](#principais-funcionalidades)
4. [Integração com Asaas](#integração-com-asaas)
5. [Fluxo de estoque](#fluxo-de-estoque)
6. [Área administrativa](#área-administrativa)
7. [Checklist de deploy](#checklist-de-deploy)

---

## Stacks e Ferramentas

| Camada | Tecnologias |
|--------|-------------|
| Front-end | Next.js 16, React 19, Tailwind/Framer, Zustand |
| Back-end | API Routes, Drizzle ORM + Neon Postgres |
| LLM/Chat | OpenRouter (streaming + markdown) |
| Pagamentos | Asaas (clientes, pagamentos, QR Code) |
| Build/Dev | pnpm 10, Turbopack, Vercel, dotenvx |

---

## Instalação e Scripts

```bash
pnpm install
pnpm dev --turbopack
pnpm build
pnpm start
pnpm lint
pnpm drizzle-kit migrate   # aplica migrations no banco Neon
```

> **Regra do projeto:** sempre use `pnpm`. Scripts `npm` não são suportados.

---

## Principais Funcionalidades

- **Site público** com hero, vitrine, depoimentos e fluxo de checkout simplificado.
- **Chat IA** com botões de ação (adiciona kits ao carrinho e abre modal). Nas rotas `/admin/**` o chat é ocultado automaticamente.
- **Checkout inteligente**:
  - Captura lead completo.
  - Cria cliente no Asaas.
  - Gera pedido real (`orders`, `order_items`, `payments`).
  - Suporte a PIX, boleto e cartão, com fallback automático para QR Code PIX.
- **Área Admin**:
  - Dashboard com KPIs reais e últimas vendas.
  - Pedidos com listagem, busca e painel lateral de detalhes.
  - Estoque apenas dos SKUs físicos (DUO DIA / DUO NOITE).
  - Cupons e Leads com CRUD e detalhamento.

---

## Integração com Asaas

- `POST /api/asaas/create-customer`: cria cliente antes do pagamento.
- `POST /api/orders`: cria pedido + pagamento e persiste no banco.
- `lib/services/asaas.ts`: wrapper para `lean/payments` (PIX/Boleto) e `payments`.
- **Próximo passo**: webhook do Asaas para atualizar `payments/orders` em tempo real (detalhes na seção “Melhorias Futuras” do `ADMIN_GUIDE.md`).

Variáveis relevantes: `ASAAS_API_KEY`, `ASAAS_ENVIRONMENT`, `OPENROUTER_API_KEY`, `CHAT_SALES_LLM_MODEL`, `DATABASE_URL`, etc. Siga `.env.example`.

---

## Fluxo de Estoque

- Bancos `inventory` / `inventory_transactions` só aceitam os SKUs físicos.
- Kits (DUO Completo) são decompostos automaticamente em DUO DIA + DUO NOITE ao gerar pedidos.
- Botão “Descontar pedidos pendentes” usa `POST /api/admin/inventory/sync`: encontra pedidos pagos sem baixa (`stockDeductedAt IS NULL`), deduz estoque e registra as transações.
- Migration `0007_purge_kit_inventory.sql` limpa qualquer resquício antigo do kit.

---

## Área Administrativa

1. **Login** – `/admin/login` protegido por middleware.
2. **Dashboard** – KPIs, gráficos e últimas vendas baseados em `orders/payments`.
3. **Pedidos** – tabela com refresh + painel lateral de detalhes (cliente, valor, status, timestamps).
4. **Estoque** – cartões por SKU, ajustes rápidos, baixa automática e histórico.
5. **Cupons/Leads** – gerenciamento completo dos formulários e códigos.
6. **Documentação interna** – `ADMIN_GUIDE.md` descreve todos os fluxos; `ADMIN_DOCS.md` traz notas e tutoriais auxiliares.

---

## Checklist de Deploy

- Confirmar `.env.local` e `.env.example` alinhados com as variáveis novas.
- Rodar migrations pendentes: `pnpm drizzle-kit migrate`.
- Resolver warnings de build (Next 16 exige `viewport` export, TypeScript ≥ 5.1, etc.).
- Validar que o chat não aparece em rotas `/admin/**`.
- Se ajustar Asaas/webhooks, revisar logs e configurar URLs públicas no painel do Asaas.

---

> Para guias detalhados e melhorias futuras, consulte `ADMIN_GUIDE.md`.  
> Para instruções de operação interna, veja `ADMIN_DOCS.md`.
