# Webhook Asaas - Configuração e Referência

> Documentação da integração de webhooks com o Asaas para sincronização automática de pagamentos.

---

## Status da Configuração

| Item | Status |
|------|--------|
| Webhook no Asaas | ✅ Configurado via API |
| Endpoint no servidor | ✅ `/api/webhooks/asaas` |
| Deploy | ✅ Vercel (auto-deploy) |

### Detalhes do Webhook

```
ID: a1ab212c-ff16-4333-83cc-0e62273c3bd7
Nome: DUO Natural - Notificações de Pagamento
URL: https://www.duonatural.com.br/api/webhooks/asaas
Status: Ativo
Modo: SEQUENTIALLY (eventos enviados em ordem)
```

---

## Eventos Configurados

### Ciclo de Vida do Pagamento

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| `PAYMENT_CREATED` | Pagamento criado | Log para auditoria |
| `PAYMENT_UPDATED` | Pagamento atualizado | Atualiza dados |
| `PAYMENT_CONFIRMED` | Pagamento confirmado (cartão) | Pedido → `PAID` |
| `PAYMENT_RECEIVED` | Pagamento recebido (PIX/boleto) | Pedido → `PAID` |
| `PAYMENT_OVERDUE` | Pagamento vencido | Status → `OVERDUE` |
| `PAYMENT_DELETED` | Pagamento deletado | Log para auditoria |
| `PAYMENT_RESTORED` | Pagamento restaurado | Restaura status |

### Estornos

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| `PAYMENT_REFUNDED` | Pagamento estornado | Pedido → `REFUNDED` |
| `PAYMENT_REFUND_IN_PROGRESS` | Estorno em processamento | Status → `REFUND_REQUESTED` |

### Análise de Risco

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| `PAYMENT_AWAITING_RISK_ANALYSIS` | Aguardando análise | Status → `AWAITING_RISK_ANALYSIS` |
| `PAYMENT_APPROVED_BY_RISK_ANALYSIS` | Aprovado na análise | Continua fluxo |
| `PAYMENT_REPROVED_BY_RISK_ANALYSIS` | Reprovado na análise | Pedido → `CANCELLED` |

### Chargeback

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| `PAYMENT_CHARGEBACK_REQUESTED` | Chargeback solicitado | Status → `CHARGEBACK_REQUESTED` |
| `PAYMENT_CHARGEBACK_DISPUTE` | Disputa de chargeback | Status → `CHARGEBACK_DISPUTE` |
| `PAYMENT_AWAITING_CHARGEBACK_REVERSAL` | Aguardando reversão | Status atualizado |

### Negativação

| Evento | Descrição | Ação no Sistema |
|--------|-----------|-----------------|
| `PAYMENT_DUNNING_REQUESTED` | Negativação solicitada | Status → `DUNNING_REQUESTED` |
| `PAYMENT_DUNNING_RECEIVED` | Pagamento via negativação | Pedido → `PAID` |

---

## Fluxos de Pagamento

### PIX (Sem Atraso)
```
PAYMENT_CREATED → PAYMENT_RECEIVED
```

### PIX (Com Atraso)
```
PAYMENT_CREATED → PAYMENT_OVERDUE → PAYMENT_RECEIVED
```

### Boleto (Sem Atraso)
```
PAYMENT_CREATED → PAYMENT_CONFIRMED → PAYMENT_RECEIVED
```

### Cartão de Crédito
```
PAYMENT_CREATED → PAYMENT_CONFIRMED → PAYMENT_RECEIVED (32 dias depois)
```

### Estorno
```
PAYMENT_RECEIVED → PAYMENT_REFUND_IN_PROGRESS → PAYMENT_REFUNDED
```

---

## Gerenciamento via API

### Listar Webhooks

```bash
curl -X GET "https://api.asaas.com/v3/webhooks" \
  -H "access_token: $ASAAS_API_KEY"
```

### Criar Novo Webhook

```bash
curl -X POST "https://api.asaas.com/v3/webhooks" \
  -H "Content-Type: application/json" \
  -H "access_token: $ASAAS_API_KEY" \
  -d '{
    "name": "Meu Webhook",
    "url": "https://meusite.com/api/webhooks/asaas",
    "enabled": true,
    "sendType": "SEQUENTIALLY",
    "events": ["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]
  }'
```

### Atualizar Webhook

```bash
curl -X PUT "https://api.asaas.com/v3/webhooks/{webhookId}" \
  -H "Content-Type: application/json" \
  -H "access_token: $ASAAS_API_KEY" \
  -d '{
    "enabled": false
  }'
```

### Deletar Webhook

```bash
curl -X DELETE "https://api.asaas.com/v3/webhooks/{webhookId}" \
  -H "access_token: $ASAAS_API_KEY"
```

---

## Verificar Status

### Health Check

```bash
curl https://www.duonatural.com.br/api/webhooks/asaas
```

Resposta esperada:
```json
{
  "status": "active",
  "message": "Webhook Asaas endpoint está ativo",
  "timestamp": "2025-12-13T..."
}
```

### Ver Eventos Recebidos

```sql
SELECT * FROM payment_events 
ORDER BY received_at DESC 
LIMIT 20;
```

---

## Troubleshooting

### Webhook não está recebendo eventos

1. **Verificar status no Asaas:**
   ```bash
   curl "https://api.asaas.com/v3/webhooks" -H "access_token: $ASAAS_API_KEY"
   ```
   - Checar se `enabled: true`
   - Checar se `interrupted: false`

2. **Verificar se o endpoint está acessível:**
   ```bash
   curl https://www.duonatural.com.br/api/webhooks/asaas
   ```

3. **Verificar logs da Vercel:**
   - Acessar: https://vercel.com/[projeto]/logs
   - Filtrar por: `[Webhook Asaas]`

### Webhook com fila interrompida

Se `interrupted: true`, a fila foi pausada por falhas consecutivas. Para reativar:

```bash
curl -X PUT "https://api.asaas.com/v3/webhooks/{webhookId}" \
  -H "Content-Type: application/json" \
  -H "access_token: $ASAAS_API_KEY" \
  -d '{"interrupted": false}'
```

### Eventos perdidos

Se houve período com webhook inativo, sincronizar manualmente:

1. Acessar painel admin: `/admin/orders`
2. Clicar em "Sincronizar Pedidos"
3. O sistema buscará status atualizado direto na API do Asaas

---

## Payload de Exemplo

```json
{
  "id": "evt_05b708f961d739ea7eba7e4db318f621",
  "event": "PAYMENT_RECEIVED",
  "dateCreated": "2025-12-13 16:45:03",
  "payment": {
    "object": "payment",
    "id": "pay_080225913252",
    "dateCreated": "2025-12-13",
    "customer": "cus_G7Dvo4iphUNk",
    "value": 324.99,
    "netValue": 324.00,
    "description": "Compra DUO - Suplemento Natural",
    "externalReference": "757a8144-02c4-48f1-a728-4cf1425cbd26",
    "billingType": "PIX",
    "status": "RECEIVED",
    "paymentDate": "2025-12-13",
    "invoiceUrl": "https://www.asaas.com/i/...",
    "transactionReceiptUrl": "https://www.asaas.com/comprovantes/..."
  }
}
```

---

## Referências

- [Documentação Oficial Asaas - Webhooks](https://docs.asaas.com/docs/webhook-para-cobrancas)
- [Eventos de Pagamento](https://docs.asaas.com/docs/eventos-para-cobrancas)
- [Criar Webhook via API](https://docs.asaas.com/docs/criar-novo-webhook-pela-api)
