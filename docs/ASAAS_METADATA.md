# Estrutura de Metadata para Pagamentos do Asaas

## Visão Geral

Este documento descreve a estrutura de metadata utilizada para rastrear informações de cupons, prescritores e representantes em pagamentos processados pelo Asaas.

## Versões Suportadas

| Versão | Status | Descrição |
|--------|--------|-----------|
| 1 | **Atual** | Sistema multinível básico (cupom → prescritor → representante) |

## Campos do Metadata

### Versão 1 (Atual)

```typescript
interface PaymentMetadata {
  // Versão do schema (obrigatório)
  version: 1;
  
  // Código do cupom utilizado (opcional)
  couponCode?: string;
  
  // UUID do prescritor vinculado ao cupom (opcional)
  prescriberId?: string;
  
  // UUID do representante vinculado ao prescritor (opcional)
  representativeId?: string;
}
```

## Armazenamento

### No Asaas (externalReference)

O campo `externalReference` do Asaas tem limite de **64 caracteres**. Utilizamos um formato compacto:

```
Formato: v1|CUPOM|p:abcd1234|r:efgh5678

Onde:
- v1: versão do schema
- CUPOM: código do cupom (truncado em 15 chars se necessário)
- p:abcd1234: últimos 8 chars do UUID do prescritor
- r:efgh5678: últimos 8 chars do UUID do representante
```

**Exemplos:**
```
v1|DESCONTO10
v1|NUTRI25|p:a1b2c3d4
v1|VIP50|p:a1b2c3d4|r:e5f6g7h8
```

### No Banco Local (metadataJson)

O campo `metadataJson` na tabela `orders` armazena o JSON completo:

```json
{
  "version": 1,
  "couponCode": "DESCONTO10",
  "prescriberId": "123e4567-e89b-12d3-a456-426614174000",
  "representativeId": "987fcdeb-51a2-34b5-c678-901234567890"
}
```

## Fluxo de Dados

### 1. Criação do Pagamento

```
Checkout → Validação do Cupom → buildPaymentMetadata() → createAsaasPayment()
                                        ↓
                               serializeMetadataForAsaas()
                                        ↓
                               externalReference: "v1|CUPOM|p:xxx|r:yyy"
```

### 2. Recebimento do Webhook

```
Webhook Asaas → parseMetadataFromAsaas(externalReference)
                        ↓
              Atualiza orders.metadataJson
                        ↓
              calculateAndRecordCommission()
```

## Funções Utilitárias

```typescript
import {
  buildPaymentMetadata,      // Constrói metadata a partir do cupom
  serializeMetadata,         // JSON completo para banco local
  serializeMetadataForAsaas, // Formato compacto para externalReference
  parseMetadataFromAsaas,    // Parse do formato compacto
  parsePaymentMetadata,      // Parse do JSON completo
  extractEntitiesFromMetadata // Extrai IDs do metadata
} from '@/lib/types/payment-metadata';
```

## Campos Futuros Planejados

A estrutura suporta expansão sem quebra de compatibilidade:

```typescript
interface PaymentMetadataFuture extends PaymentMetadata {
  // Origem do lead (analytics)
  leadSource?: string;
  
  // Campanha de marketing
  utmCampaign?: string;
  
  // ID de afiliado externo
  affiliateId?: string;
  
  // Promoção específica aplicada
  promotionId?: string;
  
  // Código de desconto secundário
  secondaryDiscount?: string;
}
```

## Migração de Versões

### v1 → v2 (Exemplo Futuro)

```typescript
function migrateMetadata(metadata: PaymentMetadataV1): PaymentMetadataV2 {
  return {
    ...metadata,
    version: 2,
    // Novos campos com valores padrão
    leadSource: null,
  };
}
```

## Considerações de Segurança

1. **Não armazenar dados sensíveis** no metadata
2. UUIDs são parcialmente expostos no externalReference (últimos 8 chars)
3. Dados completos ficam apenas no banco local (metadataJson)

## Índices de Banco

```sql
-- Índice GIN para queries JSONB eficientes
CREATE INDEX idx_orders_metadata_json ON orders USING GIN (metadata_json);

-- Queries de exemplo
SELECT * FROM orders WHERE metadata_json->>'couponCode' = 'DESCONTO10';
SELECT * FROM orders WHERE metadata_json->>'prescriberId' = 'uuid-aqui';
```

## Troubleshooting

### Metadata não aparece no Asaas

1. Verificar se `externalReference` foi enviado na criação do pagamento
2. Confirmar que o valor não excede 64 caracteres
3. Logs em `[Asaas]` mostram payload completo

### Metadata não salvo localmente

1. Verificar webhook recebido em `/api/webhooks/asaas`
2. Confirmar que `metadataJson` está sendo atualizado
3. Verificar logs de erro no processamento do webhook

## Referências

- [Documentação Asaas - Criar Cobrança](https://docs.asaas.com/docs/criar-cobranca)
- [Documentação Asaas - Webhooks](https://docs.asaas.com/docs/webhooks)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
