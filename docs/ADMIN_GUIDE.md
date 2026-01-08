## Guia da Área Administrativa DUO

Este manual descreve o funcionamento atual do painel administrativo da DUO Natural, incluindo fluxo de autenticação, páginas disponíveis e operações críticas (pedidos, estoque, cupons e leads). Ao final, há uma seção de melhorias recomendadas para evoluções futuras.

---

### 1. Acesso e autenticação

1. Abra `/admin/login`.
2. Informe as credenciais cadastradas (gerenciadas via tabela `users`/`sessions`).
3. Após login, todas as rotas sob `/admin/**` exigem o cookie `duo_admin_session` e passam pelo middleware de verificação JWT.

> **Importante:** Para sair, use o botão “Sair” no rodapé da sidebar. Isso dispara `POST /api/auth/logout`, invalida o token e retorna ao login.

---

### 2. Navegação geral

A sidebar fixa (colapsável) contém os módulos:

- `Dashboard`: visão executiva com KPIs e gráficos.
- `Pedidos`: controle operacional das vendas confirmadas e pendentes.
- `Estoque`: saldo de SKUs, indicação de pedidos aguardando baixa e histórico de movimentações.
- `Cupons`: CRUD de códigos promocionais.
- `Leads`: funil dos formulários (cupom 5% e checkout).

Todos os módulos compartilham o mesmo layout (tema claro forçado, tipografia neutra e ícones `lucide-react`).

---

### 3. Dashboard (`/admin/dashboard`)

**KPIs atuais**

- **Pedidos Pagos**: total de ordens com status `PAID` ou `CONFIRMED`.
- **Pedidos Hoje**: ordens criadas desde 00h00 do dia corrente.
- **Receita do Mês**: soma de pagamentos com status `RECEIVED/CONFIRMED` dentro do mês, valor real vindo da tabela `payments`.
- **Ticket Médio**: média = receita confirmada / pedidos pagos. O subtexto mostra a conversão global (leads × pedidos pagos).

**Gráficos**

- _Pedidos x Pagos (30 dias)_: área chart comparando volume total de ordens vs. ordens confirmadas.
- _Receita Confirmada_: bar chart diário com valores efetivamente recebidos.

**Lista de Últimos Pedidos**

- Apresenta as 5 vendas mais recentes (ID abreviado, nome do cliente – caso capturado –, valor e status).
- Origem do cliente vem do snapshot salvo em `orders.metadata.customerSnapshot`.

---

### 4. Pedidos (`/admin/orders`)

| Área | Descrição |
|------|-----------|
| Cards superiores | Pagos, aguardando e receita do mês. Atualizados via `GET /api/admin/orders`. |
| Lista dinâmica | Tabela com todos os pedidos retornados pela API (ID, cliente, valor, status, data). Clique em um pedido para visualizar os detalhes ao lado. |
| Painel de detalhes | Mostra ID, cliente, email, valor, método, status e data de criação. Usa `metadata.customerSnapshot`. |
| Botão “Atualizar” | Recarrega a lista chamando novamente a API. Útil após reconciliações de estoque ou atualizações vindas de webhooks. |

**Fluxo por trás do módulo**

- O checkout chama `POST /api/orders`.
- A API cria registros em `orders`, `order_items` e `payments`, anexando snapshot do carrinho e do cliente.
- O status inicial depende da resposta do Asaas (PIX/BOLETO → `AWAITING_PAYMENT`; cartão → `PAID/CONFIRMED` se aprovado).
- Futuras integrações de webhook atualizarão automaticamente `payments` e `orders`.

---

### 5. Estoque (`/admin/products`)

**Cards**

- Unidades disponíveis (soma atual de todos os SKUs).
- Pedidos pendentes (unidades confirmadas mas ainda não baixadas).
- Produtos em alerta (atingindo o `lowStockThreshold`).
- Últimas movimentações registradas.

**Painel por produto**

- Mostra saldo atual, pedidos pendentes (derivado de `orders` pagos mas com `stockDeductedAt = NULL`), projeção após baixa e formulário para ajustes manuais (entrada/saída).
- Botão **“Descontar pedidos pendentes”** (global e por SKU): chama `POST /api/admin/inventory/sync`, que:
  - Lê todos os pedidos pagos sem baixa.
  - Deduz do estoque (respeitando a decomposição dos kits).
  - Registra `inventory_transactions` com referência ao `orderId`.
  - Atualiza `orders.stockDeductedAt` para evitar deduções duplicadas.

**Histórico**

- Tabela com as últimas movimentações (manual e automáticas).
- Cada linha traz produto, tipo, quantidade, observação e data.

---

### 6. Cupons (`/admin/coupons`)

| Função | Detalhes |
|--------|----------|
| Listagem | `GET /api/admin/coupons` (colunas padrão: código, tipo, valor, status, usos etc.). |
| Criação/edição | Formulário interno com validações de front-end (tipo de desconto, valor, limite de usos, expiração). |
| Ações rápidas | Ativar/desativar ou excluir cupom. As alterações persistem em `coupons`. |

> Lembre-se de que os descontos aplicados no checkout são recalculados no backend, então qualquer mudança deve estar refletida no banco para surtir efeito.

---

### 7. Leads (`/admin/leads`)

**Tabs**

- _Leads Cupom 5%_: dados vindos do formulário da landing (newsletter).
- _Leads Checkout_: registros criados quando o cliente preenche o formulário de pagamento (antes de gerar pedido).

**Recursos**

- Pesquisa, paginação e visualização detalhada (lado direito) com campos pessoais, endereço, origem (UTMs) e status de conversão.
- A coluna “Status” indica se o lead foi convertido em venda (`convertedToSale = true`). Esse campo pode ser atualizado diretamente pelo time comercial via `/api/admin/leads/[id]`.

---

### 8. Integração com pagamentos

1. **Criação de cliente**: `POST /api/asaas/create-customer` valida e envia os dados básicos ao Asaas.
2. **Criação de pedido/pagamento**: `POST /api/orders` realiza:
   - Validação de itens (kits são decompostos em DUO DIA + DUO NOITE).
   - Cálculo de subtotal, desconto e total usando preços oficiais (`validateAndCalculateCart`).
   - Chamada ao Asaas (PIX, boleto ou cartão) via `createAsaasPayment`.
   - Persistência dos dados em `orders`, `order_items`, `payments` e snapshot no `metadata`.
3. **Dashboard / Pedidos**: todas as métricas e listagens consumem essas tabelas, garantindo números reais.
4. **Estoque**: a reconciliação usa `orders` pagos e só baixa do estoque quando o pedido já está confirmado.

---

### 9. Melhorias Futuras Sugeridas

1. **Webhook do Asaas**
   - Implementar `POST /api/asaas/webhook` com validação de assinatura.
   - Atualizar `payments` e `orders` automaticamente em cada evento (`PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_REFUNDED`, etc.).
   - Opcional: disparar baixa de estoque automática quando o pagamento for confirmado.

2. **Detalhes avançados do pedido**
   - Criar modal/página secundária exibindo itens (`order_items`), timeline de eventos (`payment_events`) e informações de entrega/logística.
   - Incluir notas internas e status personalizados (ex.: “Em separação”, “Despachado”).

3. **Relatórios e filtros**
   - Permitir filtros por período, método de pagamento, status e valores mínimos/máximos em `/admin/orders`.
   - Exportar CSV/Excel direto do painel.
   - Adicionar gráficos adicionais (funil completo: leads → carrinhos → pedidos).

4. **Automação de estoque**
   - Conectar baixa de estoque ao webhook (evento de pagamento confirmado) para eliminar a etapa manual.
   - Incluir alertas por e-mail/Slack quando um SKU atingir estoque crítico.

5. **Integração logística**
   - Campos para informações de envio (tracking, transportadora, data de expedição).
   - Endpoint para atualizar automaticamente quando o pacote for postado.

6. **Central do cliente**
   - Criar página com histórico do consumidor (todas as compras, leads gerados, tickets de atendimento).
   - Facilitar ações como reenvio de boleto, cancelamento ou reembolso direto do painel.

7. **Painel financeiro**
   - Tabela com recebíveis (datas previstas x confirmadas), taxas do Asaas, saldo líquido e conciliado.
   - Integração com contabilidade (exportação de DANFEs/boletos).

---

_Documento a ser atualizado com o estado atual do código (pedidos, estoque, cupons e leads integrados)._ 


