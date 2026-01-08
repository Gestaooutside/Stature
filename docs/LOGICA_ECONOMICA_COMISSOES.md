# 📊 Lógica Econômica do Sistema de Comissões

## 🎯 Visão Geral

O sistema de comissões da Duo Natural é **flexível por cupom**, não por entidade. Isso permite ajustar margens de lucro baseado no desempenho de vendas e necessidade de desconto.

---

## 🏗️ Estrutura de Hierarquia

```
┌──────────────────────────────────────────────┐
│         REPRESENTANTE (Opcional)             │
│   Ex: Clínica, Laboratório, Distribuidor    │
│   Comissão: Variável POR CUPOM              │
└───────────────┬──────────────────────────────┘
                │
                │ representativeId (FK opcional)
                │
                ↓
┌──────────────────────────────────────────────┐
│    PRESCRITOR/INFLUENCER (Obrigatório)       │
│   Ex: Nutricionista, Médico, Influencer     │
│   OU: "Duo Natural" (cupons da empresa)     │
│   Comissão: Variável POR CUPOM              │
└───────────────┬──────────────────────────────┘
                │
                │ prescriberId (FK obrigatório)
                │
                ↓
┌──────────────────────────────────────────────┐
│              CUPOM (Unidade)                 │
│   Código único: NUTRI10, BLACK15, etc       │
│   Define: Desconto + Comissões específicas  │
└──────────────────────────────────────────────┘
```

---

## 💰 Por Que Comissões Flexíveis?

### Cenário Real: Clínica com 10 Nutricionistas

**Problema:** Se comissões fossem fixas por entidade, perderíamos flexibilidade.

#### ❌ **Sistema Rígido (RUIM)**
```
Clínica: 20% fixo
Nutricionista: 10% fixo
Total: 30% SEMPRE

Cupom 30% desconto + 30% comissão = PREJUÍZO!
```

#### ✅ **Sistema Flexível (IMPLEMENTADO)**
```
┌────────────────────────────────────────────────────────┐
│  Dra. Ana (Ótima Vendedora)                           │
├────────────────────────────────────────────────────────┤
│  Cupom: ANA10 (desconto 10%)                          │
│  Margem Alta → Pode pagar mais comissão               │
│  ├─ Comissão Dra. Ana: 12%                            │
│  └─ Comissão Clínica: 8%                              │
│  TOTAL: 20% comissão sobre venda                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Dr. Carlos (Vendedor Médio)                          │
├────────────────────────────────────────────────────────┤
│  Cupom: CARLOS20 (desconto 20%)                       │
│  Margem Média → Comissão moderada                     │
│  ├─ Comissão Dr. Carlos: 8%                           │
│  └─ Comissão Clínica: 5%                              │
│  TOTAL: 13% comissão sobre venda                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Dra. Paula (Precisa de Incentivo)                    │
├────────────────────────────────────────────────────────┤
│  Cupom: PAULA30 (desconto 30%)                        │
│  Margem Baixa → Comissão reduzida para viabilizar    │
│  ├─ Comissão Dra. Paula: 5%                           │
│  └─ Comissão Clínica: 3%                              │
│  TOTAL: 8% comissão sobre venda                       │
└────────────────────────────────────────────────────────┘
```

### 📈 Fórmula de Viabilidade

```
Venda: R$ 300,00
─────────────────────────────────
Desconto (30%):        - R$ 90,00
Valor Pago:            = R$ 210,00
─────────────────────────────────
Custo Produto:         - R$ 80,00
Frete:                 - R$ 25,00
Comissão Paula (5%):   - R$ 10,50
Comissão Clínica (3%): - R$ 6,30
─────────────────────────────────
LUCRO LÍQUIDO:         = R$ 88,20 ✅
```

**Mesma venda com comissões fixas altas:**
```
Comissão 12% + 8% = 20% sobre R$ 210 = R$ 42,00
Lucro seria: R$ 52,70 (PREJUÍZO se custos aumentarem!)
```

---

## 🏢 Cupons da Empresa (Duo Natural)

### Prescritor Padrão: "Duo Natural"

**Criado automaticamente para:**
- Cupons de promoções internas
- Campanhas de marketing
- Ofertas especiais
- Cupons sem prescritor/influencer externo

**Características:**
```
Nome: Duo Natural
Telefone: +5511999999999
Email: contato@duonatural.com.br
Representante: NENHUM
Comissão Padrão: 0%
```

**Exemplos de Uso:**
```
WHATSAPP05  → 5% desconto (promoção WhatsApp)
BLACK10     → 10% desconto (Black Friday)
NATAL15     → 15% desconto (Campanha Natal)
PRIMEIRACOMPRA → 20% desconto (primeira compra)
```

**Por que comissão 0%?**
- Empresa não paga comissão a si mesma
- Todo lucro após desconto é da Duo Natural
- Usado para aquisição de clientes e campanhas

---

## 🔄 Fluxo de Criação de Cupom

### 1️⃣ Cupom de Prescritor Independente
```
Formulário:
├─ Prescritor: Dr. João Silva ✅
│  └─ (Automaticamente detecta representativeId: null)
├─ Comissão Prescritor: 10%
└─ Comissão Representante: 0% (não tem)

Resultado:
Cupom JOAO10 → Apenas Dr. João recebe comissão
```

### 2️⃣ Cupom de Prescritor com Representante
```
Formulário:
├─ Prescritor: Dra. Ana (Clínica Saúde) ✅
│  └─ (Sistema detecta: representativeId = Clínica Saúde)
├─ Comissão Prescritor: 12%
└─ Comissão Representante: 8%

Resultado:
Cupom ANA10 → Dra. Ana (12%) + Clínica (8%)
```

### 3️⃣ Cupom da Empresa
```
Formulário:
├─ Prescritor: Duo Natural ✅
│  └─ (Prescritor padrão da empresa)
├─ Comissão Prescritor: 0%
└─ Comissão Representante: 0% (não aplicável)

Resultado:
Cupom BLACK10 → Nenhuma comissão paga
```

---

## 🎯 Regras de Negócio

### ✅ Regras Válidas

1. **Prescritor SEMPRE obrigatório**
   - Pode ser externo OU "Duo Natural"
   - Define "dono" do cupom para rastreamento

2. **Representante opcional**
   - Vem automaticamente do cadastro do prescritor
   - Pode ser alterado override de comissão

3. **Comissões por cupom**
   - Cada cupom define suas próprias comissões
   - `defaultCommission` de entidades é apenas referência
   - Campo vazio = 0% de comissão

4. **Comissão do Representante incide sobre VENDA TOTAL**
   - NÃO é sobre a comissão do prescritor
   - É sobre o valor final pago pelo cliente

### ❌ Regras Proibidas

1. **Cupom sem prescritor**
   - ❌ Não permitido (falta "dono")
   - ✅ Use "Duo Natural" para cupons internos

2. **Representante sem prescritor**
   - ❌ Não faz sentido (quem divulga?)
   - ✅ Clínica cadastra prescritores que divulgam

3. **Comissões fixas por entidade**
   - ❌ Não permite flexibilidade de margem
   - ✅ Comissões configuráveis por cupom

---

## 📊 Relatórios e Rastreamento

### Tabela: `commission_records`

Cada venda gera registro:
```sql
{
  orderId: "abc-123",
  couponId: "cupom-xyz",
  prescriberId: "prescritor-id",
  prescriberCommissionRate: 12.00,
  prescriberCommissionAmount: 25.20,
  representativeId: "representante-id",
  representativeCommissionRate: 8.00,
  representativeCommissionAmount: 16.80,
  saleAmount: 210.00
}
```

### Queries Úteis

**Total a pagar para prescritor:**
```sql
SELECT SUM(prescriberCommissionAmount)
FROM commission_records
WHERE prescriberId = 'id-do-prescritor'
  AND createdAt >= '2024-01-01'
  AND createdAt < '2024-02-01';
```

**Total a pagar para representante:**
```sql
SELECT SUM(representativeCommissionAmount)
FROM commission_records
WHERE representativeId = 'id-do-representante'
  AND createdAt >= '2024-01-01'
  AND createdAt < '2024-02-01';
```

---

## 🎓 Casos de Uso Reais

### Caso 1: Nutricionista Estrela
```
Situação: Dra. Ana vende muito, não precisa descontos altos
Estratégia: Desconto baixo (10%) + Comissões altas (12% + 8%)
Resultado: Alta margem de lucro para todos
```

### Caso 2: Nutricionista Iniciante
```
Situação: Dra. Paula precisa conquistar clientes
Estratégia: Desconto alto (30%) + Comissões baixas (5% + 3%)
Resultado: Viabiliza venda mesmo com desconto grande
```

### Caso 3: Campanha Black Friday
```
Situação: Empresa quer adquirir clientes em massa
Estratégia: Prescritor "Duo Natural" + 20% desconto + 0% comissão
Resultado: Maximiza conversão, empresa absorve custo
```

### Caso 4: Clínica Nova Parceira
```
Situação: Clínica testando parceria, sem histórico
Estratégia: Desconto moderado (15%) + Comissões tentadoras (10% + 7%)
Resultado: Incentiva clínica e nutricionistas a venderem
```

---

## 🔐 Segurança e Integridade

1. **Validação no Backend:**
   - Comissões nunca excedem margem disponível
   - Desconto + Comissões < Preço - Custo

2. **Rastreamento Completo:**
   - Toda venda vinculada a cupom
   - Cupom vinculado a prescritor (sempre)
   - Prescritor pode ter representante (opcional)

3. **Auditoria:**
   - `commission_records` mantém histórico imutável
   - `payouts` registra repasses realizados
   - Possível recalcular comissões retroativamente

---

## 📝 Conclusão

O sistema foi projetado para **máxima flexibilidade** sem perder **rastreabilidade**.

**Benefícios:**
- ✅ Ajusta margens dinamicamente
- ✅ Incentiva vendedores fracos
- ✅ Recompensa vendedores fortes
- ✅ Viabiliza descontos altos quando necessário
- ✅ Mantém lucro saudável
- ✅ Rastreamento completo de origens

**Prescritor "Duo Natural":**
- Solução elegante para cupons internos
- Mantém consistência do modelo de dados
- Comissão 0% (empresa não paga a si mesma)
- Permite separar vendas orgânicas de influenciadas
