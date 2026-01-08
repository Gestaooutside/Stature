Aqui vai um passo a passo direto para aproveitar o controle de estoque novo:

### 1. Acesse a área admin
- Faça login em `/admin`.
- Vá até `/admin/products` (o menu “Estoque”).

### 2. Entenda o painel
- **Cards superiores** mostram resumo geral: unidades disponíveis, pedidos pendentes, produtos em alerta e total de movimentações recentes.
- Cada produto tem um bloco com:
  - Estoque atual, limite mínimo e status (“Estoque Baixo”/“Saudável”).
  - **Pedidos pendentes**: somatório das unidades vendidas (leads convertidos) desde a última conferência manual.
  - Projeção após descontar esses pedidos.

### 3. Ajustes manuais (entradas/saídas)
- Use a seção “Ajuste manual” em cada produto:
  - Selecione `Entrada` ou `Saída`.
  - Informe quantidade e o motivo (opcional).
  - Clique em `Aplicar ajuste`.
- Isso já atualiza o estoque e registra a movimentação no histórico.

### 4. Descontar pedidos pendentes
- Existem dois lugares para usar a reconciliação:
  - **Botão global** “Descontar pedidos pendentes” (topo da página): analisa todos os produtos de uma vez.
  - **Botão individual** “Descontar pedidos recentes” dentro do cartão do produto: considera só aquele item.
- Ao clicar, a API calcula quantas unidades foram vendidas (leads convertidos com esse produto) desde a última conferência, subtrai do estoque e grava uma transação `SALE_DEDUCTION`.
- O campo “Pedidos pendentes” zera e a data de “Atualizado em” avança para agora.

### 5. Histórico
- No final da página tem a tabela “Histórico de movimentações”: entradas manuais, saídas manuais e descontos automáticos de vendas.

### Fluxo típico de uso
1. Verifique “Pedidos pendentes” em cada produto.
2. Clique “Descontar pedidos recentes” (produto específico) ou o botão global se quiser limpar tudo de uma vez depois de conferir.
3. Caso tenha recebido mercadoria ou precise fazer correções, use “Ajuste manual”.
4. O histórico registra cada ação automaticamente, com data e observação.


-------------------------------------------------------------------------------------------------


# NOVO MODELO:

Para sair do “estoque baseado em leads” e chegar num fluxo realmente sólido, definimos a seguinte reestruturação. Ela nasce do que já temos no código, dos requisitos novos e do que a documentação do Asaas permite fazer (`POST/GET /v3/payments`, webhooks, etc.).

---

## 1. Novo modelo de dados (base para tudo)

| Tabela | Campos principais | Observações |
| --- | --- | --- |
| `orders` | `id`, `leadId` (nullable), `customerId` (Asaas), `paymentId` (Asaas), `status` (`PENDING`, `PAID`, `CONFIRMED`, `CANCELLED`, …), `billingType`, `total`, `discount`, `shipping`, `createdAt`, `updatedAt` | É a venda em si. Um pedido nasce assim que criamos a cobrança no Asaas. |
| `order_items` | `id`, `orderId`, `productId`, `name`, `unitPrice`, `quantity`, `total` | Snapshot dos itens (não dependem do catálogo depois). |
| `payments` | `id` (UUID interno), `orderId`, `asaasPaymentId`, `status` (igual ao Asaas: `PENDING`, `RECEIVED`, `CONFIRMED`, `REFUNDED` etc.), `value`, `netValue`, `billingType`, `dueDate`, `paidAt`, `failReason`, `payload` (json) | Guarda tudo que vem do Asaas para auditoria. |
| `payment_events` | `id`, `asaasPaymentId`, `event`, `payload`, `receivedAt` | Log de webhooks/polling para rastrear a linha do tempo. |
| `inventory` e `inventory_transactions` | já existem; vão passar a referenciar `orderId`/`paymentId` quando a baixa for automática. |

### Como preencher
1. **Checkout** salva (ou atualiza) o lead, mas também chama `/api/orders`:
   - Calcula total via `validateAndCalculateCart`.
   - Cria `order` + `order_items` no banco.
   - Chama `POST /v3/lean/payments` ou `/v3/payments` (Asaas).
   - Salva `payments` com o `asaasPaymentId` retornado.
2. **Webhooks Asaas** (eventos `PAYMENT_CREATED`, `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_REFUNDED` etc.) alimentam `payments`/`payment_events` e atualizam `orders.status`.
   - Caso o webhook falhe, temos uma rota de “reconciliação” manual que usa `GET /v3/payments?externalReference=` ou pelo `paymentId` (API aceita filtro por `customer` ou `status`) para sincronizar.
3. **Dashboard/Admin** passa a ler de `orders` (não mais direto de `leads`):
   - KPIs: receita, pedidos, ticket, conversão = pedidos pagos / leads checkout.
   - Listas/tabelas: últimas vendas, pipeline por status, comparação por método (Pix/Boleto/Cartão) usando `billingType`.
4. **Estoque** deixa de olhar “leads convertidos”. Em vez disso:
   - Baixa automática quando `payments.status` muda para `RECEIVED`/`CONFIRMED`.
   - Manter botão manual de reconciliação, mas agora baseado em `orders` que não foram baixados ainda (flag `stockDeductedAt`).
   - `inventory_transactions` ganha referência ao `orderId` para rastreabilidade.

---

## 2. Fluxo API proposto

1. `POST /api/orders`
   - Entrada: itens do carrinho + dados de checkout (já coletados).
   - Passos: cria order, items, chama Asaas, salva `payments`.
   - Retorno: payload do Asaas + dados internos (`orderId`), usado pelo front para exibir QR Code/ boleto / etc.

2. `POST /api/webhooks/asaas`
   - Recebe eventos (docs recomendam responder rápido, 200 OK).
   - Persiste em `payment_events`, aplica transição de status em `payments` e `orders`.

3. `GET /api/admin/orders` (lista paginada com filtros por status, método etc.).
4. `POST /api/admin/orders/reconcile` (puxa estado atual direto do Asaas via `GET /v3/payments/{id}` quando necessário; ótimo para auditoria).
5. `POST /api/admin/inventory/sync` passa a consultar `orders` com `stockDeductedAt IS NULL` e `status in ('PAID','CONFIRMED')`.

---

## 3. Integrações úteis do Asaas (doc)

- `GET /v3/payments/{id}` e `GET /v3/payments?status=RECEIVED&customer=...` → para puxar status atual sem webhook.
- Webhook de cobranças (`PAYMENT_CREATED`, `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`).  
  *Fonte: guia de webhooks e exemplo Flask exibidos na doc do Asaas.*
- `GET /v3/customers/{id}` se quisermos sincronizar dados de cliente (útil para CRM).
- `GET /v3/subscriptions/{id}/payments` caso venhamos a usar assinaturas (mencionado nos docs).

---

## 4. Replanejamento visual

### Dashboard principal (/admin/dashboard)
- Passa a ter duas áreas:
  1. **Visão de Vendas** (dados reais dos pedidos): receita, pedidos, ticket, heatmap de métodos de pagamento, pipeline por status.
  2. **Visão de Leads** (já existe, mas agora apenas para funil top/mid).
- Gráficos:
  - Receita diária (AreaChart) usando `orders` pagos.
  - Distribuição Pix/Boleto/Cartão (Pie ou Donut).
  - Tempo médio entre `createdAt` e `paidAt`.

### Dashboard de Estoque (/admin/products)
- Cards com:
  - Estoque físico.
  - Pedidos “baixados” vs “pendentes” (com base no flag `stockDeductedAt`).
  - Baixas automáticas mostrando o `orderId`.
- Histórico mostra quem fez o ajuste e qual pedido originou a baixa.

### Nova página: `/admin/orders`
- Tabela com filtros, status coloridos, link para detalhes do pedido (itens, timeline de eventos, dados do cliente, botões para marcar como enviado).
- Botão “Sincronizar com Asaas” por pedido (usa `/api/admin/orders/reconcile`).

---

## 5. Próximos passos técnicos (microetapas)

1. **Migrations**  
   - Criar tabelas `orders`, `order_items`, `payments`, `payment_events`.  
   - Adicionar colunas necessárias em `inventory_transactions` (`orderId`?) e possivelmente em `orders` (`stockDeductedAt`).
2. **Serviços**  
   - `lib/services/orders.ts`: funções para criar pedido, anexar pagamento, atualizar status.  
   - `lib/services/asaas.ts`: wrapper com métodos `createPayment`, `getPayment`, `listPayments`, `verifyWebhookSignature` (se configurado).
3. **API**  
   - `/api/orders` (POST) para checkout, `/api/webhooks/asaas` (POST).  
   - `/api/admin/orders` (GET) + `/api/admin/orders/[id]` (GET/PATCH).  
   - Atualizar `/api/admin/inventory*` para buscar orders “não baixados”.
4. **Front**  
   - Atualizar modal de pagamento para usar `orderId` / `paymentId`.  
   - Páginas `dashboard`, `products`, `orders`.  
   - Novos componentes compartilhados para cards, timelines, etc.
5. **Sincronização**  
   - Scheduler opcional (cron) ou endpoint manual para rodar reconciliação com `GET /v3/payments`.  
   - No mínimo, botão na UI que chama `/api/admin/orders/reconcile`.


-------------------------------------------------------------------------------------------------


[33 tools called]

## Atualizações Principais

- Estruturei todo o fluxo de vendas real: `POST /api/orders` agora cria pedidos completos (`orders`, `order_items`, `payments`) usando o serviço `lib/services/orders.ts`, guarda o snapshot do cliente/itens expandidos (kit = Dia + Noite) e já retorna QR code, boleto ou confirmação de cartão. Os estados do pedido refletem o status real do pagamento.
- Reorganizei o dashboard/admin para trabalhar com pedidos de verdade:
  - `app/api/admin/dashboard/route.ts` calcula métricas com base em `orders`/`payments` e traz gráfico de pedidos × pagos + receita diária.
  - A tela `app/admin/dashboard/page.tsx` foi redesenhada: novos KPIs, gráficos e lista das últimas vendas reais.
  - `DashboardCharts` agora mostra pedidos vs pagos e receita confirmada.
- Criei o hub de pedidos (`/admin/orders`):
  - API `app/api/admin/orders/route.ts` lista pedidos com filtros e resumo; `app/api/admin/orders/[id]/route.ts` retorna detalhes.
  - Página `app/admin/orders/page.tsx` com cards de status, tabela interativa e painel de detalhes.
  - Incluí o link “Pedidos” em todas as sidebars administrativas.
- Estoque agora deduz direto dos pedidos pagos:
  - `lib/services/inventory.ts` e `/api/admin/inventory/sync` contabilizam apenas ordens confirmadas (usando `expandedItems`), registram transações por pedido e atualizam `stockDeductedAt`.
  - A UI de estoque continua igual, porém os “Pedidos pendentes” refletem exatamente o que falta baixar do estoque físico.
- Experiência do usuário final:
  - O checkout passa a registrar `orderId` no estado, kit aparece com descrição (“Inclui 1x DUO DIA + 1x DUO NOITE”) tanto nos cards quanto no quick look.
  - Todos os resultados monetários (dashboard/pedidos) usam valores reais vindos dos pagamentos.

## Migrações e Operações

- Rodei novamente `pnpm drizzle-kit migrate` dentro de `duo/` para garantir que as migrations `0005` e `0006` estejam aplicadas. Se clonarem em outra máquina, basta repetir o comando antes de subir o servidor.

## Próximos Passos Sugeridos

- Configurar webhooks do Asaas para atualizar automaticamente `payments`/`orders` (status e datas) em tempo real.
- (Opcional) Exibir itens detalhados do pedido e timeline no painel de detalhes, aproveitando os dados já expostos em `/api/admin/orders/[id]`.
- Integrar a baixa automática do estoque aos webhooks assim que um pagamento for confirmado, evitando uso manual do botão.

Qualquer outro refinamento (relatórios, filtros adicionais, etc.) é só avisar.


-------------------------------------------------------------------------------------------------


Para ter pedidos sincronizados em tempo real você precisa ouvir os eventos de cobrança que o Asaas dispara (principalmente `PAYMENT_CREATED`, `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`, `PAYMENT_DELETED`). O fluxo sugerido é:

1. **Registrar o webhook no Asaas**
   - No painel do Asaas > Integrações > Webhooks informe a URL pública da nossa API (ex.: `https://seusite.com/api/asaas/webhook`).
   - Se preferir fazer via API, use `POST /v3/webhooks` (doc do Context7). A resposta traz o `id` do webhook.
   - Habilite os eventos da categoria “Cobranças”.

2. **Criar um endpoint dedicado**
   - Implemente `app/api/asaas/webhook/route.ts`.
   - O handler precisa:
     - Aceitar apenas `POST`.
     - Validar o header `X-Signature` (o Asaas envia um HMAC, você configura o segredo ao registrar o webhook). Com isso garantimos que o evento é legítimo.
     - Persistir o payload em `payment_events` para auditoria.
     - Atualizar `payments` e `orders`:
       - Localize o pagamento pelo `payment.id` (ou `externalReference` se você passou `orderId` ao criar a cobrança).
       - Atualize `payments.status`, `payments.paidAt`, `payments.netValue` etc.
       - Derive o novo `orders.status` usando a mesma lógica do serviço (`RECEIVED/CONFIRMED → PAID`, `REFUNDED → REFUNDED`, `DELETED/CANCELLED → CANCELLED`).
       - Se mudou para status pago, e o estoque ainda não foi baixado (`stockDeductedAt IS NULL`), você pode disparar a baixa automática ou deixar para o botão “Sincronizar” (já pronto).
     - Retornar `200 OK` rapidamente; qualquer processamento pesado faça assíncrono para não estourar o timeout do Asaas.

3. **Mapeamento dos eventos**
   - `PAYMENT_CREATED`: útil para logar a criação; normalmente o status fica `PENDING`.
   - `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`: marcar pagamento como recebido, preencher `paidAt`, atualizar pedido para `PAID`, liberar o processo logístico e (opcional) chamar o sincronizador de estoque.
   - `PAYMENT_OVERDUE`: manter pedido em “aguardando” ou iniciar ações de cobrança.
   - `PAYMENT_REFUNDED` / `PAYMENT_DELETED`: ajustar pedido para `REFUNDED`/`CANCELLED` e, se já deu baixa no estoque, reverter manualmente se fizer sentido.
   - `PAYMENT_CONFIRMED` também entrega `netValue`, `creditDate` (para conciliar financeiro).

4. **Teste em sandbox**
   - O Asaas permite gerar eventos de teste (docs “ações em sandbox”). Simule recebimentos, cancelamentos etc. até garantir que `payments` e `orders` refletem a timeline correta.

5. **Monitoramento**
   - Se algum webhook falhar, o Asaas reenfileira. Garanta logging claro no endpoint e, se quiser, uma rota manual de reconciliação (ex.: `GET /api/admin/orders/reconcile?id=...` que chama `GET /v3/payments/{id}`) para cobrir eventos perdidos.

Com isso, assim que o Asaas confirmar uma cobrança, o pedido fica “PAID” automaticamente e o painel/dashboards mostram os números atualizados quase em tempo real. Se quiser posso já criar o endpoint e a lógica de atualização agora.