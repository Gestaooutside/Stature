# Sistema Multinível de Comissões - Documentação Técnica

## Estrutura Atual (2 Níveis)

O sistema atual implementa uma estrutura de comissões em 2 níveis hierárquicos:

```
Representante (Nível 1)
    └── Prescritor/Influencer (Nível 2)
            └── Cupom
                    └── Venda (comissões geradas)
```

### Funcionamento Atual

1. **Representante** (opcional): Pode ser pessoa física, clínica ou empresa
   - Possui comissão padrão configurável
   - Pode ter múltiplos prescritores vinculados
   - Recebe comissão sobre vendas de TODOS os prescritores vinculados

2. **Prescritor/Influencer**: Nutricionistas, médicos, influencers
   - Possui comissão padrão configurável
   - Pode estar vinculado a um representante (opcional)
   - Cria cupons de desconto
   - Recebe comissão sobre vendas com seus cupons

3. **Cupom**: Código de desconto
   - Vinculado a um prescritor
   - Pode sobrescrever comissões padrão (prescritor e representante)
   - Aplicado em vendas pelos clientes

### Cálculo de Comissões (Lógica Atual)

**Ambas as comissões incidem sobre o valor TOTAL da venda (não em cascata):**

- **Comissão Prescritor**: `valor_venda × taxa_prescritor / 100`
- **Comissão Representante**: `valor_venda × taxa_representante / 100`

**Lógica de Precedência:**
1. Se cupom tiver `prescriber_commission_override` → usa este valor
2. Senão → usa `prescribers.default_commission`

Mesma lógica para representante:
1. Se cupom tiver `representative_commission_override` → usa este valor
2. Senão → usa `representatives.default_commission`

### Exemplo Prático

**Cenário:**
- Venda: R$ 500,00
- Prescritor: comissão padrão 10%
- Representante: comissão padrão 5%
- Cupom: sem override

**Resultado:**
- Comissão Prescritor: R$ 500,00 × 10% = R$ 50,00
- Comissão Representante: R$ 500,00 × 5% = R$ 25,00
- **Total comissões**: R$ 75,00
- **Líquido vendedor**: R$ 425,00

---

## Expansão para N Níveis - Planejamento

### Pré-requisitos Técnicos

#### 1. Alterações no Banco de Dados

**Opção A: Closure Table (Recomendado)**
```sql
-- Nova tabela para hierarquia
CREATE TABLE entity_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ancestor_id UUID NOT NULL,
  descendant_id UUID NOT NULL,
  depth INTEGER NOT NULL,
  entity_type TEXT NOT NULL, -- 'representative' ou 'prescriber'
  created_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(ancestor_id, descendant_id),
  CHECK (depth >= 0)
);

CREATE INDEX idx_entity_hierarchy_ancestor ON entity_hierarchy(ancestor_id);
CREATE INDEX idx_entity_hierarchy_descendant ON entity_hierarchy(descendant_id);
CREATE INDEX idx_entity_hierarchy_depth ON entity_hierarchy(depth);
```

**Opção B: Adjacency List com Path (Alternativa)**
```sql
-- Adicionar campos às tabelas existentes
ALTER TABLE representatives ADD COLUMN parent_id UUID REFERENCES representatives(id);
ALTER TABLE representatives ADD COLUMN hierarchy_path TEXT; -- Ex: "uuid1/uuid2/uuid3"
ALTER TABLE representatives ADD COLUMN hierarchy_level INTEGER DEFAULT 0;
```

#### 2. Alterações no Schema TypeScript

```typescript
// Novo tipo para hierarquia
export interface EntityHierarchy {
  ancestorId: string;
  descendantId: string;
  depth: number;
  entityType: 'representative' | 'prescriber';
  ancestors: Array<{ id: string; name: string; commission: number }>;
}

// Atualizar tipos existentes
export interface Representative {
  // ... campos existentes
  parentId?: string | null;
  hierarchyLevel: number;
  childrenCount: number;
}
```

#### 3. Nova Lógica de Comissões

```typescript
/**
 * Calcula comissões em cascata para N níveis
 * 
 * @param orderId - ID do pedido
 * @param couponId - ID do cupom
 * @param saleAmount - Valor total da venda
 * @returns Array de comissões para cada nível da hierarquia
 */
async function calculateMultilevelCommissions(
  orderId: string,
  couponId: string,
  saleAmount: number
): Promise<CommissionRecord[]> {
  // 1. Buscar cupom e prescritor
  const coupon = await getCouponWithPrescriber(couponId);
  
  // 2. Buscar toda hierarquia acima do prescritor
  const hierarchy = await getFullHierarchy(coupon.prescriberId);
  
  // 3. Calcular comissão para cada nível
  const commissions: CommissionRecord[] = [];
  
  for (const level of hierarchy) {
    const commissionRate = getCommissionRate(level);
    const commissionAmount = (saleAmount * commissionRate) / 100;
    
    commissions.push({
      orderId,
      couponId,
      entityId: level.id,
      entityType: level.type,
      level: level.depth,
      rate: commissionRate,
      amount: commissionAmount,
      saleAmount
    });
  }
  
  return commissions;
}
```

#### 4. APIs Adicionais Necessárias

```typescript
// GET /api/admin/entities/[id]/hierarchy
// Retorna hierarquia completa de uma entidade

// POST /api/admin/entities/[id]/move
// Move entidade para outro ponto da hierarquia

// GET /api/admin/hierarchy/validate
// Valida se nova estrutura não cria ciclos
```

### Casos de Uso para Expansão

#### Caso 1: Empresa com Múltiplos Representantes

```
Empresa ABC (Nível 1) - Comissão 3%
    ├── Representante SP (Nível 2) - Comissão 2%
    │   ├── Nutricionista A - Comissão 10%
    │   └── Nutricionista B - Comissão 10%
    └── Representante RJ (Nível 3) - Comissão 2%
        └── Nutricionista C - Comissão 10%
```

**Venda de R$ 500,00 com cupom da Nutricionista A:**
- Nutricionista A: R$ 50,00 (10%)
- Representante SP: R$ 10,00 (2%)
- Empresa ABC: R$ 15,00 (3%)
- **Total**: R$ 75,00 (15%)

#### Caso 2: Clínica com Hierarquia de Nutricionistas

```
Clínica Nutrição+ (Nível 1) - Comissão 5%
    ├── Nutricionista Sênior (Nível 2) - Comissão 3%
    │   ├── Nutricionista Junior A - Comissão 10%
    │   └── Nutricionista Junior B - Comissão 10%
    └── Nutricionista Autônomo - Comissão 12%
```

### Validações Necessárias

#### 1. Prevenção de Ciclos
```typescript
function validateHierarchy(entityId: string, newParentId: string): boolean {
  // Verificar se newParentId não é descendente de entityId
  // Previne: A -> B -> C -> A (ciclo)
  const descendants = await getDescendants(entityId);
  return !descendants.includes(newParentId);
}
```

#### 2. Limites de Profundidade
```typescript
const MAX_HIERARCHY_DEPTH = 5; // Máximo 5 níveis

function validateDepth(parentId: string): boolean {
  const parentDepth = await getEntityDepth(parentId);
  return parentDepth < MAX_HIERARCHY_DEPTH;
}
```

#### 3. Soma de Comissões
```typescript
function validateCommissionTotal(hierarchy: EntityHierarchy[]): boolean {
  const totalCommission = hierarchy.reduce((sum, level) => 
    sum + level.commission, 0
  );
  
  // Alerta se comissões totais ultrapassam threshold
  if (totalCommission > 30) {
    console.warn(`Comissões totais altas: ${totalCommission}%`);
  }
  
  // Sem limite rígido - apenas alerta
  return true;
}
```

### UI/UX para Multinível

#### 1. Visualização de Hierarquia

Componente de árvore expansível:
```typescript
<HierarchyTree
  rootId={entityId}
  onNodeClick={handleNodeClick}
  showCommissions={true}
  expandedByDefault={false}
/>
```

#### 2. Seletor de Parent

Dropdown com visualização hierárquica:
```
- Empresa ABC (Nível 1)
  ├── Representante SP (Nível 2)
  │   └── Nutricionista A (Nível 3)
  └── Representante RJ (Nível 2)
      └── [Selecionar como parent]
```

#### 3. Dashboard de Comissões Multinível

Gráfico de Sankey mostrando fluxo de comissões:
```
Vendas R$ 10.000
    ├── Prescritores: R$ 1.000 (10%)
    ├── Representantes: R$ 200 (2%)
    ├── Empresas: R$ 300 (3%)
    └── Líquido: R$ 8.500 (85%)
```

### Migração de Dados

```sql
-- Script de migração para estrutura multinível
-- Executar quando expandir para N níveis

-- 1. Criar hierarchy para estrutura atual
INSERT INTO entity_hierarchy (ancestor_id, descendant_id, depth, entity_type)
SELECT 
  r.id as ancestor_id,
  p.id as descendant_id,
  1 as depth,
  'prescriber' as entity_type
FROM prescribers p
INNER JOIN representatives r ON p.representative_id = r.id;

-- 2. Adicionar auto-referências (depth 0)
INSERT INTO entity_hierarchy (ancestor_id, descendant_id, depth, entity_type)
SELECT id, id, 0, 'representative' FROM representatives
UNION ALL
SELECT id, id, 0, 'prescriber' FROM prescribers;
```

### Performance e Escalabilidade

#### Índices Recomendados
```sql
-- Para queries de hierarquia
CREATE INDEX idx_hierarchy_composite ON entity_hierarchy(ancestor_id, depth);
CREATE INDEX idx_hierarchy_descendant_type ON entity_hierarchy(descendant_id, entity_type);

-- Para agregações de comissões
CREATE INDEX idx_commission_entity_date ON commission_records(
  entity_id, entity_type, created_at DESC
);
```

#### Caching Estratégico
```typescript
// Cache de hierarquia (TTL: 1 hora)
const hierarchyCache = new Map<string, EntityHierarchy[]>();

async function getCachedHierarchy(entityId: string): Promise<EntityHierarchy[]> {
  if (hierarchyCache.has(entityId)) {
    return hierarchyCache.get(entityId)!;
  }
  
  const hierarchy = await fetchHierarchy(entityId);
  hierarchyCache.set(entityId, hierarchy);
  
  return hierarchy;
}
```

---

## Checklist de Implementação

Quando expandir para N níveis, seguir esta ordem:

- [ ] 1. Criar tabela `entity_hierarchy`
- [ ] 2. Popular com estrutura atual (2 níveis)
- [ ] 3. Atualizar schema TypeScript
- [ ] 4. Implementar funções de hierarquia
- [ ] 5. Atualizar lógica de cálculo de comissões
- [ ] 6. Criar APIs de gerenciamento de hierarquia
- [ ] 7. Implementar componentes UI (árvore, seletores)
- [ ] 8. Adicionar validações (ciclos, profundidade)
- [ ] 9. Atualizar dashboards e relatórios
- [ ] 10. Migrar dados existentes
- [ ] 11. Testes de carga e performance
- [ ] 12. Documentar para usuários finais

---

## Referências

- **Padrão Closure Table**: https://www.slideshare.net/billkarwin/models-for-hierarchical-data
- **PostgreSQL Recursive Queries**: https://www.postgresql.org/docs/current/queries-with.html
- **Comissões Multinível**: Implementação inspirada em sistemas MLM, mas adaptada para transparência e simplicidade

---

**Última atualização**: Dezembro 2024  
**Autor**: Sistema DUO - Área Administrativa  
**Versão**: 1.0
