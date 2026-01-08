# Plano de Expansão para Sistema Multinível (N Níveis)

## Visão Geral

Este documento descreve o plano de expansão do sistema atual de 2 níveis (Representante → Prescritor) para um sistema com N níveis de hierarquia, permitindo estruturas mais complexas como:

```
Empresa Farmacêutica (Nível 0)
└── Representante Regional (Nível 1)
    └── Representante Local (Nível 2)
        └── Prescritor/Nutricionista (Nível 3)
            └── Cupom
```

## Estrutura Atual (2 Níveis)

```
REPRESENTANTE (Nível 1)
├── defaultCommission: 5%
└── prescribers[] → PRESCRITOR (Nível 2)
                    ├── defaultCommission: 10%
                    └── coupons[] → CUPOM
                                    ├── prescriberCommissionOverride?
                                    └── representativeCommissionOverride?
```

### Tabelas Atuais

```sql
-- representatives (nível 1)
CREATE TABLE representatives (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  default_commission NUMERIC(5,2),
  entity_type TEXT, -- 'individual', 'clinic', 'company'
  ...
);

-- prescribers (nível 2, referencia representative)
CREATE TABLE prescribers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  representative_id UUID REFERENCES representatives(id),
  default_commission NUMERIC(5,2),
  ...
);
```

## Proposta de Expansão para N Níveis

### Opção 1: Closure Table Pattern (Recomendado)

```sql
-- Tabela unificada de entidades
CREATE TABLE hierarchy_entities (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'company', 'regional', 'local', 'prescriber'
  level INTEGER NOT NULL,
  default_commission NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Closure table para hierarquia
CREATE TABLE hierarchy_paths (
  ancestor_id UUID REFERENCES hierarchy_entities(id),
  descendant_id UUID REFERENCES hierarchy_entities(id),
  depth INTEGER NOT NULL, -- distância entre ancestor e descendant
  PRIMARY KEY (ancestor_id, descendant_id)
);

-- Índices otimizados
CREATE INDEX idx_paths_ancestor ON hierarchy_paths(ancestor_id);
CREATE INDEX idx_paths_descendant ON hierarchy_paths(descendant_id);
CREATE INDEX idx_entities_level ON hierarchy_entities(level);
CREATE INDEX idx_entities_type ON hierarchy_entities(entity_type);
```

### Opção 2: Adjacency List com Materialized Path

```sql
-- Tabela única com parent_id e path materializado
CREATE TABLE hierarchy_entities (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES hierarchy_entities(id),
  path TEXT NOT NULL, -- ex: 'root/regional1/local3/prescriber5'
  level INTEGER NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  default_commission NUMERIC(5,2),
  ...
);

-- Path permite queries eficientes
CREATE INDEX idx_entities_path ON hierarchy_entities USING gin (path gin_trgm_ops);
```

## Diagrama ER da Estrutura Expandida

```
                    ┌─────────────────────────┐
                    │   hierarchy_entities    │
                    ├─────────────────────────┤
                    │ id (PK)                 │
                    │ name                    │
                    │ phone                   │
                    │ entity_type             │
                    │ level                   │
                    │ default_commission      │
                    │ is_active               │
                    │ metadata (JSONB)        │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ hierarchy_    │       │   coupons     │       │ commission_   │
│ paths         │       │               │       │ records       │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ ancestor_id   │       │ id (PK)       │       │ id (PK)       │
│ descendant_id │       │ entity_id (FK)│       │ order_id      │
│ depth         │       │ code          │       │ coupon_id     │
└───────────────┘       │ discount      │       │ entity_id     │
                        │ comm_override │       │ level         │
                        └───────────────┘       │ rate          │
                                                │ amount        │
                                                └───────────────┘
```

## Regras de Negócio para Comissões em Cascata

### Distribuição de Comissões

```typescript
interface CommissionDistribution {
  entityId: string;
  level: number;
  rate: number;      // Percentual configurado
  amount: number;    // Valor calculado
  isOverride: boolean;
}

/**
 * Calcula comissões em cascata para todos os níveis
 * Cada nível recebe sua comissão sobre o valor TOTAL da venda
 * NÃO em cascata (não é comissão sobre comissão)
 */
async function calculateCascadeCommissions(
  orderId: string,
  couponId: string,
  saleAmount: number
): Promise<CommissionDistribution[]> {
  // 1. Busca entidade do cupom
  const coupon = await getCouponWithEntity(couponId);
  
  // 2. Busca todos os ancestrais da entidade
  const ancestors = await getAncestors(coupon.entityId);
  
  // 3. Calcula comissão para cada nível
  const distributions: CommissionDistribution[] = [];
  let totalCommissionRate = 0;
  
  // Entidade do cupom (nível mais baixo)
  const entityRate = coupon.commissionOverride ?? coupon.entity.defaultCommission;
  totalCommissionRate += entityRate;
  
  distributions.push({
    entityId: coupon.entityId,
    level: coupon.entity.level,
    rate: entityRate,
    amount: (saleAmount * entityRate) / 100,
    isOverride: coupon.commissionOverride !== null
  });
  
  // Ancestrais (níveis superiores)
  for (const ancestor of ancestors) {
    const rate = ancestor.defaultCommission;
    totalCommissionRate += rate;
    
    distributions.push({
      entityId: ancestor.id,
      level: ancestor.level,
      rate,
      amount: (saleAmount * rate) / 100,
      isOverride: false
    });
  }
  
  // Validação: total não pode exceder cap
  const MAX_TOTAL_COMMISSION = 50;
  if (totalCommissionRate > MAX_TOTAL_COMMISSION) {
    throw new Error(`Total de comissões (${totalCommissionRate}%) excede limite de ${MAX_TOTAL_COMMISSION}%`);
  }
  
  return distributions;
}
```

### Regras de Cap (Limite)

| Configuração | Valor | Descrição |
|--------------|-------|-----------|
| Cap Total | 50% | Soma de todas as comissões não pode exceder |
| Cap por Nível | 20% | Nenhum nível individual pode ter mais que |
| Profundidade Máxima | 5 | Máximo de níveis na hierarquia |

## Queries Comuns

### Buscar Todos os Ancestrais

```sql
-- Usando closure table
SELECT e.*, p.depth
FROM hierarchy_entities e
JOIN hierarchy_paths p ON e.id = p.ancestor_id
WHERE p.descendant_id = $1
  AND p.depth > 0
ORDER BY p.depth ASC;
```

### Buscar Todos os Descendentes

```sql
-- Usando closure table
SELECT e.*, p.depth
FROM hierarchy_entities e
JOIN hierarchy_paths p ON e.id = p.descendant_id
WHERE p.ancestor_id = $1
  AND p.depth > 0
ORDER BY p.depth ASC;
```

### Árvore Completa

```sql
WITH RECURSIVE tree AS (
  -- Base: entidades raiz
  SELECT id, name, entity_type, level, 0 as depth, ARRAY[id] as path
  FROM hierarchy_entities
  WHERE level = 0
  
  UNION ALL
  
  -- Recursivo: descendentes
  SELECT e.id, e.name, e.entity_type, e.level, t.depth + 1, t.path || e.id
  FROM hierarchy_entities e
  JOIN hierarchy_paths p ON e.id = p.descendant_id
  JOIN tree t ON p.ancestor_id = t.id
  WHERE p.depth = 1
)
SELECT * FROM tree ORDER BY path;
```

## APIs Necessárias

### Novas Rotas

```typescript
// Gerenciamento de hierarquia
GET  /api/admin/hierarchy/tree         // Árvore completa
GET  /api/admin/hierarchy/entity/:id   // Entidade com ancestrais e descendentes
POST /api/admin/hierarchy/entity       // Criar entidade
PATCH /api/admin/hierarchy/entity/:id  // Atualizar
DELETE /api/admin/hierarchy/entity/:id // Remover (se sem descendentes)

// Movimentação na hierarquia
POST /api/admin/hierarchy/move         // Mover entidade para outro pai
POST /api/admin/hierarchy/merge        // Mesclar duas entidades

// Relatórios hierárquicos
GET /api/admin/hierarchy/commissions/:id  // Comissões da entidade e descendentes
GET /api/admin/hierarchy/sales/:id        // Vendas por nível
```

## Componentes de UI Necessários

### TreeView Hierárquico

```tsx
<HierarchyTree
  root={rootEntity}
  onSelect={(entity) => openDetails(entity)}
  expandLevel={2}
  renderNode={(entity) => (
    <EntityCard
      entity={entity}
      showCommission
      showDescendantCount
    />
  )}
/>
```

### Breadcrumb de Navegação

```tsx
<HierarchyBreadcrumb
  entityId={currentEntity.id}
  ancestors={ancestors}
  onNavigate={(id) => setCurrentEntity(id)}
/>
```

### Filtros em Cascata

```tsx
<CascadeFilters
  levels={['company', 'regional', 'local', 'prescriber']}
  onChange={(filters) => updateQuery(filters)}
/>
```

## Estimativa de Implementação

### Sprint 1 - Schema e Migrations (1-2 semanas)

- [ ] Criar tabela `hierarchy_entities`
- [ ] Criar tabela `hierarchy_paths`
- [ ] Migrar dados de `representatives` e `prescribers`
- [ ] Criar triggers para manutenção do closure table
- [ ] Testes de integridade

### Sprint 2 - APIs e Cálculos (1-2 semanas)

- [ ] Implementar CRUD de entidades
- [ ] Implementar queries hierárquicas
- [ ] Adaptar cálculo de comissões para N níveis
- [ ] Adaptar relatórios de repasses
- [ ] Testes unitários e de integração

### Sprint 3 - UI e Testes (1-2 semanas)

- [ ] Componente TreeView
- [ ] Componente Breadcrumb
- [ ] Atualizar páginas de gestão
- [ ] Testes E2E
- [ ] Documentação de usuário

## Considerações de Performance

### Índices Necessários

```sql
-- Para queries frequentes
CREATE INDEX idx_entities_level_active ON hierarchy_entities(level, is_active);
CREATE INDEX idx_paths_ancestor_depth ON hierarchy_paths(ancestor_id, depth);
CREATE INDEX idx_paths_descendant_depth ON hierarchy_paths(descendant_id, depth);

-- Para busca por nome
CREATE INDEX idx_entities_name_trgm ON hierarchy_entities USING gin (name gin_trgm_ops);
```

### Cache Recomendado

- Cache de ancestrais: 5 minutos
- Cache de árvore completa: 10 minutos
- Invalidação: ao criar/mover/excluir entidade

## Referências Técnicas

- [Closure Table Pattern](https://www.slideshare.net/billkarwin/sql-antipatterns-strike-back)
- [Nested Sets Model](https://www.mysqltutorial.org/mysql-basics/mysql-nested-set-model/)
- [Materialized Path Pattern](https://www.mongodb.com/docs/manual/tutorial/model-tree-structures-with-materialized-paths/)
- [PostgreSQL Recursive CTEs](https://www.postgresql.org/docs/current/queries-with.html)

## Conclusão

A expansão para N níveis é viável tecnicamente e pode ser implementada de forma incremental. A recomendação é usar o **Closure Table Pattern** por oferecer melhor performance em queries hierárquicas e facilidade de manutenção.

O sistema atual foi projetado com essa expansão em mente, permitindo que as tabelas `representatives` e `prescribers` sejam migradas para a estrutura unificada `hierarchy_entities` sem perda de dados ou funcionalidade.
