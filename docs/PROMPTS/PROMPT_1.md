# Sistema Completo de Gestão Multinível de Comissões, Vendas, Repasses e Administração

## CONTEXTO GERAL DO SISTEMA

Este prompt descreve a implementação completa de um sistema avançado de gestão multinível para a plataforma DUO Natural (e-commerce de suplementos naturais). O sistema envolve representantes, prescritores/influencers, cupons de desconto, comissões em múltiplos níveis, gestão de vendas, repasses financeiros e otimizações gerais da área administrativa. A implementação integra-se ao ecossistema existente (Next.js 16, React 19, TypeScript, Drizzle ORM, PostgreSQL/Neon, API de pagamentos Asaas), mantendo a identidade visual da marca DUO Natural e priorizando compactação extrema, densidade informacional máxima, micro-interações elegantes e responsividade total para dispositivos móveis.

### Hierarquia do Sistema Multinível

```
REPRESENTANTE (Nível 1)
├── Tipos: Individual, Clínica Parceira, Empresa
├── Comissão Padrão Configurável (incide sobre valor total da venda)
├── Múltiplos Prescritores/Influencers Vinculados
├── Telefone com DDD, Código de País e WhatsApp Integrado
└── Pode ser: Laboratório, Clínica, Consultório Parceiro

    └── PRESCRITOR/INFLUENCER (Nível 2)
        ├── Comissão Padrão Configurável
        ├── Representante Opcional (pode ser independente/da empresa)
        ├── Múltiplos Cupons Associados
        ├── Telefone com DDD, Código de País e WhatsApp Integrado
        └── Tipos: Nutricionista, Médico, Influencer Digital

            └── CUPOM (Nível 3)
                ├── Desconto: Percentual ou Valor Fixo
                ├── Override de Comissão do Prescritor (opcional)
                ├── Override de Comissão do Representante (opcional)
                ├── Suporte a Recorrência (MENSAL, TRIMESTRAL, ANUAL)
                └── Validade, Uso Máximo, Valor Mínimo

                    └── PEDIDO (Nível 4)
                        ├── Itens Detalhados (produtos, quantidades, preços)
                        ├── Metadata JSON enviado ao Asaas
                        ├── Status de Pagamento Editável
                        ├── Status de Entrega Gerenciável
                        ├── Recorrente ou Único
                        └── Assinatura Ativa (se recorrente)

                            └── COMISSÃO (Nível 5)
                                ├── Valor do Prescritor (% sobre venda total)
                                ├── Valor do Representante (% sobre venda total)
                                ├── Base de Cálculo: Valor após desconto
                                └── Status: Pendente, Confirmada, Estornada

                                    └── REPASSE (Nível 6)
                                        ├── Período de Referência (início/fim)
                                        ├── Status: Pendente, Pago, Cancelado
                                        ├── Método: PIX, TED, Boleto, Dinheiro
                                        ├── Observações/Comprovante (texto)
                                        └── ID de Referência Externa
```

### Regras de Negócio Críticas

1. **Comissão do Representante**: Incide sobre o valor TOTAL da venda do prescritor, NÃO sobre a comissão do prescritor
2. **Representante Opcional**: Cupons podem existir sem representante (criados pela própria empresa)
3. **Prescritor Opcional**: A empresa pode criar cupons próprios sem prescritor vinculado
4. **Override de Comissão**: Pode ser configurado no cupom, sobrescrevendo o padrão da entidade
5. **Clínicas como Representantes**: Clínicas parceiras podem ser cadastradas como representantes com múltiplos prescritores

---

## PROBLEMA CRÍTICO IDENTIFICADO: DROPDOWN DE PRESCRITORES VAZIO

### Diagnóstico do Problema

O dropdown de prescritores na página de cupons não exibe nenhuma opção mesmo com prescritores já cadastrados no banco de dados. A causa raiz foi identificada:

**Causa Raiz:** O endpoint `GET /api/admin/prescribers` não existe. O arquivo `/app/api/admin/prescribers/route.ts` não possui um handler GET para listar todos os prescritores.

**Arquivos Afetados:**
- `/app/api/admin/prescribers/route.ts` - **FALTA handler GET para listagem**
- `/components/admin/coupons-table.tsx` - Linha 49-59: tenta buscar de `/api/admin/prescribers`
- `/components/admin/coupons-table-new.tsx` - Mesmo problema
- `/app/admin/prescribers/page.tsx` - Tenta buscar prescritores mas endpoint não existe

**Estrutura Atual da API de Prescritores:**
- `GET /api/admin/prescribers` - **NÃO EXISTE** ❌
- `POST /api/admin/prescribers` - **NÃO EXISTE** ❌
- `GET /api/admin/prescribers/[id]/stats` - Existe ✓
- `PATCH /api/admin/prescribers/[id]` - Existe ✓
- `DELETE /api/admin/prescribers/[id]` - Existe ✓

**Estrutura do Banco de Dados (Correta):**
```
coupons.prescriberId → prescribers.id
prescribers.representativeId → representatives.id
```

### Correção Necessária

Criar handlers GET e POST em `/app/api/admin/prescribers/route.ts`:

```typescript
// GET - Listar todos os prescritores
export async function GET(request: NextRequest) {
  const allPrescribers = await db
    .select()
    .from(prescribers)
    .leftJoin(representatives, eq(prescribers.representativeId, representatives.id))
    .where(eq(prescribers.isActive, true))
    .orderBy(prescribers.name);

  return NextResponse.json({ prescribers: allPrescribers });
}

// POST - Criar novo prescritor
export async function POST(request: NextRequest) {
  const body = await request.json();
  const newPrescriber = await db.insert(prescribers).values(body).returning();
  return NextResponse.json({ prescriber: newPrescriber[0] });
}
```

---

## PLANO DE IMPLEMENTAÇÃO EM 250 MICROSTEPS SEQUENCIAIS

### FASE 0: CORREÇÃO URGENTE - API DE PRESCRITORES (Steps 0.1-0.5)

**Step 0.1:** ✅ Criar handler GET em `/app/api/admin/prescribers/route.ts` que retorna lista de todos os prescritores com JOIN para representatives, filtrando por isActive = true e ordenando por nome.

**Step 0.2:** ✅ Criar handler POST em `/app/api/admin/prescribers/route.ts` para criar novos prescritores com validação de campos obrigatórios (name, phone) e opcionais (email, cpfCnpj, representativeId, defaultCommission).

**Step 0.3:** ✅ Testar endpoint GET verificando que retorna prescritores existentes no banco de dados.

**Step 0.4:** ✅ Atualizar componente de dropdown de prescritores para confirmar que agora carrega opções corretamente.

**Step 0.5:** ✅ Verificar que a vinculação cupom ↔ prescritor funciona ao salvar/editar cupom.

---

### FASE 1: AUDITORIA, DIAGNÓSTICO E CORREÇÕES CRÍTICAS (Steps 1-25)

**Step 1:** ✅ Executar auditoria completa do schema do banco de dados em `lib/db/schema.ts`, documentando todas as 14 tabelas existentes: users, sessions, leads, orders, orderItems, payments, paymentEvents, inventory, inventoryTransactions, coupons, prescribers, representatives, commissionRecords, payouts, knowledgeChunks.

**Step 2:** ✅ Mapear detalhadamente os relacionamentos entre entidades: representatives (1) → prescribers (N) → coupons (N) → orders (N) → commissionRecords (1) → payouts (N), identificando foreign keys, cascades e índices existentes.

**Step 3:** ✅ Analisar o arquivo de configuração da sidebar administrativa em `lib/config/admin-sidebar.tsx`, documentando todos os 10 itens de navegação com seus respectivos ícones Lucide React e rotas.

**Step 4:** ✅ Navegar manualmente por todas as 10 páginas administrativas registrando em quais páginas os ícones da sidebar desaparecem ou apresentam comportamento inconsistente de renderização.

**Step 5:** ✅ Identificar no layout principal `app/admin/layout.tsx` como o componente AppSidebar é renderizado e se há lógica condicional afetando a visibilidade dos ícones baseada na rota ativa.

**Step 6:** ✅ Diagnosticar a causa raiz do problema de ícones sumindo: verificar se há CSS condicional, classes dinâmicas baseadas em pathname, ou conflitos de z-index entre componentes de diferentes páginas.

**Step 7:** ✅ Corrigir o componente da sidebar garantindo renderização consistente de todos os ícones Lucide React em todas as rotas, removendo qualquer lógica de visibilidade condicional problemática e aplicando classes CSS uniformes.

**Step 8:** ✅ Localizar o componente que exibe o card "Receita (mês) R$ 0,00" no dashboard administrativo, identificando o arquivo exato (provavelmente em `app/admin/dashboard/page.tsx` ou componente DashboardCharts).

**Step 9:** ✅ Analisar a query SQL/Drizzle que calcula a receita mensal, verificando se filtra corretamente por status de pagamento confirmado (PAID ou CONFIRMED) e pelo período do mês atual usando comparação de datas no campo createdAt ou paidAt.

**Step 10:** ✅ Corrigir a lógica de cálculo de receita mensal implementando: (a) filtro por pedidos com pagamento confirmado usando status IN ('PAID', 'CONFIRMED'), (b) filtro por data usando >= primeiro dia do mês atual, (c) soma do campo correto (total ou value), (d) formatação usando Intl.NumberFormat com locale pt-BR e currency BRL.

**Step 11:** ✅ Adicionar log temporário de debug no cálculo de receita para confirmar valores corretos sendo retornados pela query antes de remover em produção.

**Step 12:** ✅ Localizar a implementação do botão "Atualizar" na página de pedidos `app/admin/orders/page.tsx` que deveria sincronizar o status do pedido com a API do Asaas.

**Step 13:** ✅ Analisar o endpoint de API utilizado pelo botão Atualizar (provavelmente `/api/admin/orders/[id]/sync` ou similar), verificando se consulta o Asaas e atualiza corretamente as tabelas orders e payments.

**Step 14:** ✅ Investigar o caso específico do pedido da cliente "Eduarda Macedo Soares Marx" que aparece como "Aguardando Pagamento" no admin mas já está pago no Asaas, buscando o asaasPaymentId correspondente no banco de dados local.

**Step 15:** ✅ Consultar a API do Asaas diretamente usando o asaasPaymentId identificado para verificar o status real do pagamento e comparar com o status armazenado localmente, documentando a discrepância encontrada.

**Step 16:** ✅ Identificar se o problema está no processamento do webhook do Asaas, na lógica de atualização manual, ou em um mapeamento incorreto entre os 16 status do Asaas e os status locais do sistema.

**Step 17:** ✅ Corrigir a função de sincronização de status implementando: (a) consulta correta à API Asaas endpoint /payments/{id}, (b) mapeamento completo de todos os status do Asaas para status locais, (c) atualização simultânea das tabelas orders e payments, (d) feedback visual de loading, sucesso ou erro ao usuário.

**Step 18:** ✅ Implementar lógica de retry com exponential backoff (1s, 2s, 4s) caso a consulta ao Asaas falhe temporariamente por timeout ou erro de rede.

**Step 19:** ✅ Verificar se existem pedidos com subscriptions (assinaturas recorrentes) e se o problema de sincronização está relacionado ao campo subscriptionId ou à lógica diferenciada de pagamentos recorrentes.

**Step 20:** ✅ Criar função de sincronização em lote `syncAllPendingOrders()` que atualiza múltiplos pedidos pendentes de uma vez, respeitando rate limiting da API Asaas (máximo 100 requisições por minuto).

**Step 21:** ✅ Adicionar log de auditoria para cada sincronização de status realizada, registrando: orderId, status anterior, status novo, timestamp, userId do admin que executou a ação.

**Step 22:** ✅ Testar manualmente o fluxo completo: criar pedido de teste no sandbox do Asaas, simular pagamento, verificar se webhook atualiza automaticamente, verificar se botão manual funciona como fallback.

**Step 23:** ✅ Documentar em comentários no código o mapeamento completo de todos os status do Asaas (PENDING, AUTHORIZED, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, RECEIVED_IN_CASH, REFUND_REQUESTED, CHARGEBACK_REQUESTED, CHARGEBACK_DISPUTE, DUNNING_REQUESTED, DUNNING_RECEIVED, AWAITING_RISK_ANALYSIS, CANCELLED, FAILED) para os status locais.

**Step 24:** ✅ Verificar se existe job/cron agendado para sincronização automática de pedidos pendentes e, caso não exista, documentar necessidade de implementação futura com periodicidade sugerida de 30 minutos.

**Step 25:** ✅ Compilar relatório de todas as correções realizadas nos steps 1-24, confirmando que: sidebar exibe ícones consistentemente em todas as páginas, receita mensal calcula e exibe corretamente, sincronização de status funciona para pedidos individuais e em lote.

---

### FASE 2: SISTEMA DE CONTATO TELEFÔNICO E INTEGRAÇÃO WHATSAPP (Steps 26-50)

**Step 26:** ✅ Verificar na tabela `representatives` se os campos `phone` (text) e `countryCode` (text, default '+55') já existem conforme schema atual, documentando tipos de dados exatos e constraints.

**Step 27:** ✅ Verificar na tabela `prescribers` se os campos `phone` e `countryCode` existem com mesma estrutura da tabela representatives, garantindo paridade entre entidades.

**Step 28:** ✅ Se necessário, criar migration Drizzle em `drizzle/` para adicionar campo `countryCode` com valor padrão '+55' (Brasil) nas tabelas que não possuírem o campo.

**Step 29:** ✅ Garantir que o campo `phone` armazena apenas números sem formatação (ex: "11999999999"), sem parênteses, hífens ou espaços, facilitando formatação dinâmica no frontend.

**Step 30:** ✅ Criar arquivo utilitário `lib/utils/phone.ts` para centralizar todas as funções relacionadas a formatação de telefone e geração de links do WhatsApp.

**Step 31:** ✅ Implementar função `sanitizePhoneNumber(phone: string): string` que remove todos os caracteres não-numéricos (parênteses, hífens, espaços, pontos) de uma string de telefone usando regex.

**Step 32:** ✅ Implementar função `formatPhoneForDisplay(countryCode: string, phone: string): string` que retorna telefone formatado para exibição ao usuário brasileiro (ex: "+55 (11) 99999-9999").

**Step 33:** ✅ Implementar função `formatPhoneForWhatsApp(countryCode: string, phone: string): string` que retorna string sem caracteres especiais pronta para URL do WhatsApp (ex: "5511999999999").

**Step 34:** ✅ Implementar função `generateWhatsAppLink(countryCode: string, phone: string, message?: string): string` que retorna URL completa no formato `https://wa.me/5511999999999?text=Olá%20mensagem` com mensagem opcional URL-encoded usando encodeURIComponent.

**Step 35:** ✅ Criar constante exportada `COUNTRY_CODES` contendo array de objetos com estrutura: `{ code: '+55', name: 'Brasil', flag: '🇧🇷', placeholder: '(11) 99999-9999', digitsLength: 11 }` para os 10 países mais utilizados (Brasil, EUA, Portugal, Argentina, Espanha, México, Colômbia, Chile, Uruguai, Paraguai).

**Step 36:** ✅ Implementar função `getPlaceholderForCountry(countryCode: string): string` que retorna placeholder de telefone apropriado baseado no código do país selecionado, com fallback para formato brasileiro.

**Step 37:** ✅ Criar componente reutilizável `components/ui/phone-input.tsx` que integra: dropdown de seleção de país com bandeiras emoji, input de telefone com máscara dinâmica, indicador de validação em tempo real.

**Step 38:** ✅ Implementar no componente `PhoneInput` a seleção de código de país usando componente Select do Radix UI com estilização compacta, exibindo bandeira emoji + código DDI (ex: "🇧🇷 +55").

**Step 39:** ✅ Implementar máscara de input dinâmica que se adapta ao país selecionado, usando regex para formatar conforme usuário digita: Brasil "(99) 99999-9999", EUA "(999) 999-9999", etc.

**Step 40:** ✅ Adicionar validação em tempo real no `PhoneInput` verificando: quantidade mínima de dígitos por país, formato válido, exibindo feedback visual com borda verde (válido) ou vermelha (inválido) e mensagem de erro discreta.

**Step 41:** ✅ Expor props tipadas do `PhoneInput`: `value` (objeto { countryCode: string, phone: string }), `onChange`, `error?: string`, `disabled?: boolean`, `size?: 'sm' | 'md' | 'lg'` para diferentes contextos de uso.

**Step 42:** ✅ Criar componente `components/ui/whatsapp-button.tsx` que recebe props: `countryCode: string`, `phone: string`, `message?: string`, `variant?: 'icon' | 'full'`, `size?: 'sm' | 'md' | 'lg'`.

**Step 43:** ✅ Estilizar o `WhatsAppButton` com: cor de fundo verde WhatsApp (#25D366), ícone branco do WhatsApp (usar SVG customizado ou Lucide MessageCircle com cor ajustada), efeito hover com elevação (shadow-md), transição suave de 150ms em todas as propriedades.

**Step 44:** ✅ Implementar Tooltip no `WhatsAppButton` usando componente Tooltip do Radix UI, exibindo telefone formatado ao hover (ex: "Abrir chat: +55 (11) 99999-9999").

**Step 45:** ✅ Adicionar atributos de segurança `target="_blank"` e `rel="noopener noreferrer"` no link do WhatsApp para abrir em nova aba protegendo contra tab-nabbing.

**Step 46:** ✅ Implementar funcionalidade de copiar telefone formatado ao clicar com botão direito (context menu) no `WhatsAppButton`, usando `navigator.clipboard.writeText()` com feedback toast de confirmação.

**Step 47:** ✅ Criar variante compacta `variant="icon"` do `WhatsAppButton` para uso em células de tabela: apenas ícone pequeno (16x16 ou 20x20) sem texto, com tooltip informativo mostrando número completo.

**Step 48:** ✅ Criar variante expandida `variant="full"` do `WhatsAppButton` para uso em cards e drawers: ícone + texto "WhatsApp" + telefone formatado em linha única, com espaçamento adequado.

**Step 49:** ✅ Testar componentes `PhoneInput` e `WhatsAppButton` em diferentes navegadores (Chrome, Firefox, Safari, Edge) e dispositivos móveis (iOS Safari, Android Chrome) garantindo funcionamento correto de máscara, validação e abertura de links.

**Step 50:** ✅ Exportar todos os componentes e funções através de barrel exports em `lib/utils/index.ts` e `components/ui/index.ts` para facilitar importação em qualquer parte do projeto.

---

### FASE 3: ESTRUTURA DE DADOS - ENTIDADE REPRESENTANTES (Steps 51-70)

**Step 51:** ✅ Revisar tabela `representatives` no schema confirmando todos os campos: `id` (UUID), `name` (text), `phone` (text), `countryCode` (text default '+55'), `email` (text), `cpfCnpj` (text), `defaultCommission` (numeric 5,2), `entityType` (text check), `isActive` (boolean), `notes` (text), `createdAt`, `updatedAt`.

**Step 52:** ✅ Validar que o constraint CHECK de `entityType` inclui valores 'individual', 'clinic', 'company' para diferenciar tipos de representantes (pessoa física, clínica, empresa).

**Step 53:** ✅ Verificar se existe índice no campo `entityType` para otimizar queries filtradas por tipo de entidade, criar se não existir.

**Step 54:** ✅ Criar índice composto em (`isActive`, `entityType`) para otimizar listagens filtradas simultaneamente por status ativo e tipo de entidade.

**Step 55:** ✅ Criar índice em `name` usando B-tree para otimizar ordenação alfabética e busca por nome com ILIKE.

**Step 56:** ✅ Revisar API route `app/api/admin/representatives/route.ts` (GET) verificando se retorna todos os campos necessários com tipagem correta.

**Step 57:** ✅ Adicionar à query GET de representatives um LEFT JOIN ou subquery para contar quantidade de prescritores vinculados retornando campo `prescriberCount`.

**Step 58:** ✅ Adicionar à query GET de representatives cálculo de vendas totais associadas através da cadeia: representatives → prescribers → coupons → orders (WHERE status = 'PAID'), retornando campo `totalSales`.

**Step 59:** ✅ Adicionar à query GET de representatives cálculo de comissão acumulada usando SUM de `commissionRecords.representativeCommissionAmount` retornando campo `totalCommission`.

**Step 60:** ✅ Implementar parâmetros de filtro na API GET de representatives: `search` (busca ILIKE por nome), `entityType` (filtro exato), `isActive` (boolean), `sortBy` (name, commission, sales), `sortOrder` (asc, desc).

**Step 61:** ✅ Implementar paginação na API GET de representatives com parâmetros `limit` (default 50, max 100) e `offset` para navegação eficiente de listas grandes.

**Step 62:** ✅ Revisar API route POST para criar representante, implementando validações: name obrigatório (min 3 caracteres), phone formato válido, CPF (11 dígitos) ou CNPJ (14 dígitos) válido usando algoritmo de validação brasileiro, defaultCommission entre 0 e 100.

**Step 63:** ✅ Adicionar validação de unicidade de CPF/CNPJ na criação de representante, retornando erro HTTP 409 Conflict com mensagem descritiva se documento já existir.

**Step 64:** ✅ Revisar API route PUT `app/api/admin/representatives/[id]/route.ts` para atualizar representante, aplicando mesmas validações da criação e verificando unicidade de CPF/CNPJ excluindo o próprio registro.

**Step 65:** ✅ Implementar API route DELETE com verificação de dependências: se representante possui prescritores vinculados com `representativeId` apontando para ele, retornar erro HTTP 400 informando quantidade de prescritores e sugerindo desvinculação prévia ou soft-delete (isActive = false).

**Step 66:** ✅ Criar endpoint `/api/admin/representatives/[id]/stats` retornando objeto com estatísticas detalhadas: totalSales, totalCommission, pendingBalance (comissão - repasses), activePrescriberCount, activeCouponCount, monthlySalesChart (últimos 6 meses).

**Step 67:** ✅ Criar endpoint `/api/admin/representatives/[id]/prescribers` retornando lista paginada de prescritores vinculados com suas estatísticas individuais (nome, cupons, vendas, comissão).

**Step 68:** ✅ Criar endpoint `/api/admin/representatives/[id]/orders` retornando pedidos associados (via prescritores e cupons) com paginação, incluindo campos: orderId, customerName, total, status, couponCode, prescriberName, createdAt.

**Step 69:** ✅ Criar endpoint `/api/admin/representatives/search` para autocomplete rápido retornando array `[{ id, name, phone, entityType, prescriberCount }]` limitado a 10 resultados, filtrando por isActive = true e ordenando por relevância de nome.

**Step 70:** ✅ Adicionar log de auditoria estruturado (console.log com JSON) em todas as operações CRUD de representatives registrando: action (create/update/delete), entityId, userId, timestamp, previousData, newData.

---

### FASE 4: ESTRUTURA DE DADOS - ENTIDADE PRESCRITORES/INFLUENCERS (Steps 71-90)

**Step 71:** ✅ Revisar tabela `prescribers` no schema confirmando campos: `id` (UUID), `name` (text), `phone` (text), `countryCode` (text default '+55'), `email` (text), `cpfCnpj` (text), `representativeId` (UUID nullable FK), `defaultCommission` (numeric 5,2), `isActive` (boolean), `notes` (text), `createdAt`, `updatedAt`.

**Step 72:** ✅ Confirmar que `representativeId` é configurado como nullable com `onDelete: 'set null'` no schema, permitindo prescritores independentes sem representante e mantendo histórico quando representante é excluído.

**Step 73:** ✅ Verificar se existe índice no campo `representativeId` para otimizar JOINs entre prescribers e representatives e queries filtradas por representante.

**Step 74:** ✅ Criar índice composto em (`isActive`, `representativeId`) para otimizar listagens filtradas por status ativo e representante específico.

**Step 75:** ✅ Criar índice em `name` para otimizar ordenação alfabética e busca por nome.

**Step 76:** ✅ Revisar API route GET de prescribers verificando se inclui dados do representante vinculado via LEFT JOIN retornando objeto `representative: { id, name, phone }` ou null.

**Step 77:** ✅ Adicionar à query GET de prescribers contagem de cupons associados usando subquery COUNT onde `coupons.prescriberId = prescribers.id`, retornando campo `couponCount`.

**Step 78:** ✅ Adicionar à query GET de prescribers cálculo de vendas totais através de: prescribers → coupons → orders (WHERE status IN ('PAID', 'CONFIRMED')), retornando campo `totalSales` como soma de orders.total.

**Step 79:** ✅ Adicionar à query GET de prescribers cálculo de comissão acumulada usando SUM de `commissionRecords.prescriberCommissionAmount`, retornando campo `totalCommission`.

**Step 80:** ✅ Adicionar à query GET de prescribers cálculo de saldo pendente de repasse: totalCommission - SUM(payouts WHERE entityType = 'prescriber' AND status = 'paid'), retornando campo `pendingBalance`.

**Step 81:** ✅ Implementar parâmetros de filtro na API GET de prescribers: `search` (nome ILIKE), `representativeId` (UUID ou 'independent' para sem representante), `isActive`, `sortBy`, `sortOrder`, `limit`, `offset`.

**Step 82:** ✅ Revisar API route POST para criar prescritor com validações completas: name obrigatório min 3 chars, phone válido, CPF/CNPJ válido, defaultCommission 0-100, representativeId opcional (validar existência se fornecido).

**Step 83:** ✅ Adicionar validação de unicidade de CPF/CNPJ entre prescritores na criação e atualização.

**Step 84:** ✅ Criar endpoint `/api/admin/prescribers/[id]/stats` com estatísticas detalhadas: totalSales, totalCommission, pendingBalance, couponCount, activeCouponCount, monthlySalesChart.

**Step 85:** ✅ Criar endpoint `/api/admin/prescribers/[id]/coupons` retornando lista paginada de cupons associados com estatísticas: code, discount, usageCount, revenue, status, expiresAt.

**Step 86:** ✅ Criar endpoint `/api/admin/prescribers/[id]/orders` retornando pedidos via cupons com paginação: orderId, customerName, total, couponCode, commission, status, createdAt.

**Step 87:** ✅ Criar endpoint `/api/admin/prescribers/search` para autocomplete retornando `[{ id, name, phone, representativeName }]` limitado a 10 resultados.

**Step 88:** ✅ Implementar lógica para criar prescritor inline durante criação de cupom: se payload contiver `createNewPrescriber: true` com `newPrescriberData: { name, phone, countryCode }`, criar prescritor primeiro, obter ID, então vincular ao cupom.

**Step 89:** ✅ Adicionar log de auditoria em todas as operações CRUD de prescribers seguindo mesmo padrão de representatives.

**Step 90:** ✅ Criar função utilitária `canDeletePrescriber(prescriberId): Promise<{ canDelete: boolean, reason?: string, couponCount?: number }>` que verifica dependências antes de permitir exclusão.

---

### FASE 5: ESTRUTURA DE DADOS - CUPONS COM VINCULAÇÃO MULTINÍVEL (Steps 91-115)

**Step 91:** ✅ Revisar tabela `coupons` confirmando campos de vinculação multinível: `prescriberId` (UUID nullable FK), `prescriberCommissionOverride` (numeric 5,2 nullable), `representativeCommissionOverride` (numeric 5,2 nullable).

**Step 92:** ✅ Confirmar que `prescriberId` referencia `prescribers.id` com `onDelete: 'set null'` permitindo cupons órfãos quando prescritor é excluído.

**Step 93:** ✅ Verificar campos de recorrência: `isRecurring` (boolean default false), `recurringCycle` (text: 'MONTHLY', 'WEEKLY', 'YEARLY' nullable).

**Step 94:** ✅ Garantir que campos legacy `prescriber` (text) e `commission` (numeric) ainda existem para compatibilidade com dados antigos, mas marcá-los como deprecated em comentário do schema.

**Step 95:** ✅ Criar índice em `prescriberId` para otimizar queries de cupons filtrados por prescritor.

**Step 96:** ✅ Criar índice composto em (`isActive`, `expiresAt`) para busca eficiente de cupons válidos não expirados.

**Step 97:** ✅ Criar índice em `code` usando GIN com extensão pg_trgm para busca case-insensitive otimizada.

**Step 98:** ✅ Revisar API route GET de coupons para incluir dados completos: prescritor (id, name, phone) via JOIN, representante do prescritor (id, name) via JOIN encadeado.

**Step 99:** ✅ Adicionar à query GET de coupons cálculo de receita gerada usando SUM de orders.total onde orders usou o cupom e status IN ('PAID', 'CONFIRMED'), retornando campo `revenue`.

**Step 100:** ✅ Adicionar à query GET de coupons contagem de pedidos associados retornando campo `orderCount`.

**Step 101:** ✅ Implementar filtros avançados na API GET: `search` (code ILIKE), `prescriberId`, `representativeId` (via prescritor), `discountType`, `isRecurring`, `isActive`, `expired` (boolean para expirados), `sortBy`, `sortOrder`.

**Step 102:** ✅ Revisar API route POST para criar cupom, adicionando suporte a: `prescriberId` opcional, `prescriberCommissionOverride` opcional (0-100), `representativeCommissionOverride` opcional (0-100).

**Step 103:** ✅ Implementar lógica de criação de prescritor inline no POST de cupons: se `createNewPrescriber: true`, criar prescritor com dados de `newPrescriber: { name, phone, countryCode, email?, representativeId? }`, obter UUID, vincular ao cupom automaticamente.

**Step 104:** ✅ Adicionar validação nos campos de override: se fornecido, valor deve estar entre 0 e 100 com precisão de 2 casas decimais.

**Step 105:** ✅ Implementar warning não-bloqueante na resposta da API: se soma de comissões (prescritor + representante, considerando overrides ou defaults) ultrapassar 40%, incluir campo `warning: "Soma de comissões elevada: X%"`.

**Step 106:** ✅ Criar endpoint `/api/admin/coupons/validate-code` (POST com body { code }) para verificação em tempo real de código duplicado, retornando `{ exists: boolean, suggestion?: string }` com sugestão de código alternativo se existir.

**Step 107:** ✅ Criar endpoint `/api/admin/coupons/[id]/stats` retornando: usageCount (currentUses), revenue (soma de vendas), totalPrescriberCommission, totalRepresentativeCommission, lastUsedAt, topCustomers.

**Step 108:** ✅ Criar função `getEffectiveCommissionRates(couponId): Promise<{ prescriberRate, representativeRate, source }>` que retorna taxas efetivas considerando cascade: override no cupom → default no prescritor/representante → 0 se não existir.

**Step 109:** ✅ Implementar lógica de expiração automática via query executada em endpoint ou cron: UPDATE coupons SET isActive = false WHERE expiresAt < NOW() AND isActive = true.

**Step 110:** ✅ Implementar lógica de uso máximo: UPDATE coupons SET isActive = false WHERE currentUses >= maxUses AND maxUses IS NOT NULL AND isActive = true.

**Step 111:** ✅ Adicionar campo calculado `daysUntilExpiration` ao retornar cupom para exibição de alertas visuais no frontend (null se sem expiração, negativo se expirado).

**Step 112:** ✅ Criar função de validação de cupom completa `validateCoupon(code, cartTotal): Promise<{ valid, discount, discountType, message, prescriberId?, representativeId?, isRecurring?, recurringCycle? }>`.

**Step 113:** ✅ Adicionar suporte para cupom de assinatura: quando `isRecurring = true`, retornar `recurringCycle` na validação para frontend criar subscription no Asaas.

**Step 114:** ✅ Adicionar log de auditoria para: criação, edição, desativação, uso de cupom (incremento de currentUses).

**Step 115:** ✅ Criar índice UNIQUE em UPPER(code) para garantir unicidade case-insensitive de códigos.

---

### FASE 6: INTEGRAÇÃO ASAAS - METADATA JSON EM PAGAMENTOS (Steps 116-135)

**Step 116:** ✅ Consultar documentação oficial do Asaas via Context7 MCP para identificar campos disponíveis para armazenar dados customizados em requisições de criação de pagamento (payment) e cliente (customer).

**Step 117:** ✅ Identificar o campo mais apropriado para metadata: verificar se `externalReference` (string até 64 chars), `description` (texto livre), ou `metadata` (objeto JSON) pode ser utilizado para armazenar informações estruturadas.

**Step 118:** ✅ Definir estrutura JSON padrão versão 1 para metadata de pagamento: `{ "version": 1, "couponCode": "DESCONTO10", "prescriberId": "uuid-prescritor", "representativeId": "uuid-representante" }`.

**Step 119:** ✅ Documentar campos futuros planejados para expansão sem quebra de compatibilidade: `"leadSource"`, `"utmCampaign"`, `"affiliateId"`, `"promotionId"`, mantendo campo `version` para migração.

**Step 120:** ✅ Criar arquivo `lib/types/payment-metadata.ts` com interface TypeScript: `PaymentMetadata { version: number, couponCode?: string, prescriberId?: string, representativeId?: string }`.

**Step 121:** ✅ Criar função utilitária `buildPaymentMetadata(coupon, prescriber, representative): PaymentMetadata` que monta objeto padronizado a partir das entidades, retornando null para campos não existentes.

**Step 122:** ✅ Criar função `serializeMetadataForAsaas(metadata: PaymentMetadata): string` que converte objeto para string JSON compacta para envio no campo apropriado do Asaas.

**Step 123:** ✅ Atualizar função `createAsaasPayment` em `lib/services/asaas.ts` para incluir metadata serializado no campo externalReference ou description do payload de criação de pagamento.

**Step 124:** ✅ Testar em ambiente sandbox do Asaas que metadata é armazenado corretamente ao criar pagamento e é retornado ao consultar pagamento via API GET /payments/{id}.

**Step 125:** ✅ Criar função utilitária `parsePaymentMetadata(asaasPayload): PaymentMetadata | null` que extrai metadata da resposta do Asaas, valida versão, e retorna objeto tipado ou null se inválido.

**Step 126:** ✅ Atualizar handler do webhook do Asaas em `/api/webhooks/asaas` ou similar para: extrair metadata do payload, validar estrutura, popular campo `metadataJson` (JSONB) na tabela orders com objeto estruturado.

**Step 127:** ✅ Implementar validação de integridade do metadata ao receber webhook: verificar se version é reconhecida (1), se UUIDs de prescriberId e representativeId são válidos quando presentes.

**Step 128:** ✅ Criar índice GIN no campo `metadataJson` da tabela orders para otimizar queries JSONB usando operadores @>, ->>, etc.

**Step 129:** ✅ Implementar query para buscar pedidos por prescriberId usando operador JSONB: `SELECT * FROM orders WHERE metadataJson->>'prescriberId' = $1`.

**Step 130:** ✅ Implementar query similar para buscar pedidos por representativeId e por couponCode.

**Step 131:** ✅ Criar função `extractEntitiesFromOrder(order): { couponCode?: string, prescriberId?: string, representativeId?: string }` para extração padronizada de metadata do pedido.

**Step 132:** ✅ Atualizar fluxo de criação de pedido para garantir que metadata seja montado com dados do cupom aplicado e enviado ao Asaas antes de criar payment.

**Step 133:** ✅ Implementar fallback: se metadata não puder ser enviado ao Asaas por erro, armazenar localmente no campo metadataJson do order e logar para investigação.

**Step 134:** ✅ Criar teste end-to-end documentado: checkout com cupom vinculado → metadata enviado ao Asaas → webhook recebido → metadata extraído e armazenado → comissões calculadas corretamente.

**Step 135:** ✅ Documentar estrutura completa do metadata em `docs/ASAAS_METADATA.md` incluindo: versões suportadas, campos obrigatórios e opcionais, exemplos de payloads, guia de migração para versões futuras.

---

### FASE 7: SISTEMA DE REGISTRO E CÁLCULO DE COMISSÕES (Steps 136-160)

**Step 136:** ✅ Revisar tabela `commissionRecords` confirmando campos: `id` (UUID), `orderId` (UUID FK), `couponId` (UUID FK nullable), `prescriberId` (UUID FK), `prescriberCommissionRate` (numeric 5,2), `prescriberCommissionAmount` (numeric 12,2), `representativeId` (UUID FK nullable), `representativeCommissionRate` (numeric 5,2), `representativeCommissionAmount` (numeric 12,2), `saleAmount` (numeric 12,2), `createdAt`.

**Step 137:** ✅ Garantir que todos os campos monetários usam `numeric(12,2)` para precisão de centavos em valores até R$ 9.999.999.999,99 e rates usam `numeric(5,2)` para percentuais até 999,99%.

**Step 138:** ✅ Verificar existência de índices em: `orderId` (UNIQUE para impedir duplicação), `prescriberId`, `representativeId`, `createdAt` para queries de relatório.

**Step 139:** ✅ Criar constraint UNIQUE em `orderId` se não existir para impedir duplicação de registro de comissão para o mesmo pedido.

**Step 140:** ✅ Adicionar campo `status` (text) em commissionRecords com CHECK ('pending', 'confirmed', 'reversed') para rastrear estado da comissão ao longo do tempo.

**Step 141:** ✅ Implementar função principal `calculateAndRecordCommission(order: Order, coupon: Coupon | null): Promise<CommissionRecord>` que: busca taxas efetivas usando getEffectiveCommissionRates, calcula valores, insere registro, retorna comissão criada.

**Step 142:** ✅ Implementar lógica de cálculo de comissão do prescritor: `prescriberAmount = (saleAmount * prescriberRate) / 100` arredondando para 2 casas decimais usando Math.round(valor * 100) / 100.

**Step 143:** ✅ Implementar lógica de cálculo de comissão do representante: `representativeAmount = (saleAmount * representativeRate) / 100` - IMPORTANTE: ambas comissões incidem sobre o saleAmount total, não em cascata.

**Step 144:** ✅ Definir `saleAmount` como valor total do pedido APÓS desconto do cupom e INCLUINDO frete: `order.total` (já contempla desconto e shipping).

**Step 145:** ✅ Integrar chamada de `calculateAndRecordCommission` no handler do webhook do Asaas quando `event.payment.status` for 'CONFIRMED' ou 'RECEIVED', passando order e coupon correspondentes.

**Step 146:** ✅ Adicionar verificação antes de criar comissão: checar se já existe registro com mesmo orderId para evitar duplicação em caso de webhook duplicado.

**Step 147:** ✅ Criar função `reverseCommission(orderId: string, reason: string): Promise<void>` para estorno: atualizar status do registro existente para 'reversed' e criar novo registro com valores negativos documentando o motivo.

**Step 148:** ✅ Integrar chamada de `reverseCommission` quando pedido for cancelado (status = 'CANCELLED') ou reembolsado (status = 'REFUNDED') via webhook do Asaas.

**Step 149:** ✅ Criar API route GET `/api/admin/commissions` com filtros: `prescriberId`, `representativeId`, `orderId`, `status`, `startDate`, `endDate`, `sortBy`, `sortOrder`, `limit`, `offset`.

**Step 150:** ✅ Criar API route GET `/api/admin/commissions/summary` retornando totais agregados: totalPrescriberCommissions, totalRepresentativeCommissions, totalCommissions, periodStart, periodEnd.

**Step 151:** ✅ Criar API route GET `/api/admin/commissions/by-prescriber/[id]` com histórico completo de comissões: lista paginada com orderId, orderTotal, rate, amount, status, createdAt.

**Step 152:** ✅ Criar API route GET `/api/admin/commissions/by-representative/[id]` com histórico similar incluindo nome do prescritor de cada comissão.

**Step 153:** ✅ Implementar query agregada para gráfico: comissão total por prescritor agrupada por mês para os últimos 12 meses, retornando array `[{ month: 'Jan/2024', amount: 1500.00 }]`.

**Step 154:** ✅ Implementar query de ranking: top 10 prescritores por comissão acumulada no período selecionado, retornando `[{ prescriberId, name, totalCommission, orderCount }]`.

**Step 155:** ✅ Implementar query de ranking similar para representantes.

**Step 156:** ✅ Criar função `getCommissionBalance(entityType: 'prescriber' | 'representative', entityId: string, periodStart?: Date, periodEnd?: Date): Promise<{ earned, paidOut, pending }>` calculando saldo detalhado.

**Step 157:** ✅ Adicionar campo opcional `notes` (text) em commissionRecords para observações administrativas sobre casos especiais.

**Step 158:** ✅ Criar log de auditoria detalhado para cada criação e reversão de comissão: orderId, entities, rates, amounts, status, userId, timestamp.

**Step 159:** ✅ Criar testes unitários para cálculo de comissão cobrindo cenários: (1) cupom sem prescritor, (2) prescritor sem representante, (3) com override de comissão, (4) sem override usando defaults, (5) valores zerados.

**Step 160:** ✅ Documentar regras de negócio de comissões em `docs/COMMISSION_RULES.md`: fórmulas de cálculo, precedência de taxas (override > default), tratamento de estorno, timing de criação.

---

### FASE 8: SISTEMA COMPLETO DE GESTÃO DE REPASSES (Steps 161-185)

**Step 161:** ✅ Revisar tabela `payouts` confirmando campos: `id` (UUID), `entityType` (text CHECK 'prescriber'|'representative'), `entityId` (UUID), `amount` (numeric 12,2 CHECK > 0), `periodStart` (date), `periodEnd` (date CHECK >= periodStart), `status` (text CHECK 'pending'|'paid'|'cancelled'), `paidAt` (timestamp nullable), `paymentMethod` (text CHECK 'pix'|'transfer'|'cash'|'check'|'other'), `notes` (text), `referenceId` (text), `createdBy` (text), `createdAt`, `updatedAt`.

**Step 162:** ✅ Verificar todas as constraints CHECK existentes no schema para garantir integridade dos dados de repasse.

**Step 163:** ✅ Adicionar constraint: paidAt IS NOT NULL quando status = 'paid' usando trigger ou check expression.

**Step 164:** ✅ Criar índices em: (`entityType`, `entityId`), `status`, (`periodStart`, `periodEnd`), `createdAt` para otimizar queries de listagem e relatórios.

**Step 165:** ✅ Criar índice composto em (`entityType`, `entityId`, `status`) para queries frequentes de saldo pendente por entidade.

**Step 166:** ✅ Implementar função `calculatePendingBalance(entityType, entityId): Promise<{ totalEarned, totalPaid, pending }>` que: soma commissionRecords WHERE status = 'confirmed', subtrai payouts WHERE status = 'paid', retorna saldo.

**Step 167:** ✅ Implementar função `calculatePendingBalanceForPeriod(entityType, entityId, periodStart, periodEnd)` adicionando filtro de data nas queries de comissão e repasse.

**Step 168:** ✅ Criar API route GET `/api/admin/payouts` com filtros: `entityType`, `entityId`, `status`, `startDate`, `endDate`, `paymentMethod`, `sortBy`, `sortOrder`, `limit`, `offset`.

**Step 169:** ✅ Criar API route GET `/api/admin/payouts/balances` retornando lista de TODAS as entidades (prescritores + representantes) com saldos pendentes > 0, ordenados por valor pendente decrescente.

**Step 170:** ✅ Criar API route POST `/api/admin/payouts` para criar repasse com validações: entityType válido, entityId existente, amount > 0 AND amount <= saldo pendente, periodStart <= periodEnd.

**Step 171:** ✅ Ao criar repasse via POST, calcular automaticamente saldo pendente e sugerir valor máximo no response: `{ id: created, suggestedAmount: 1500.00 }`.

**Step 172:** ✅ Criar API route PATCH `/api/admin/payouts/[id]` para atualizar: status (com validações de transição), paidAt (obrigatório se status = 'paid'), paymentMethod, notes, referenceId.

**Step 173:** ✅ Implementar validação de transição de status: pending → paid (OK), pending → cancelled (OK), paid → (ERRO: não pode alterar após pago), cancelled → (ERRO: não pode reativar).

**Step 174:** ✅ Ao marcar repasse como 'paid' via PATCH, preencher automaticamente `paidAt` com timestamp atual (NOW()) se não fornecido explicitamente.

**Step 175:** ✅ Criar API route GET `/api/admin/payouts/[id]` retornando detalhes completos incluindo: dados da entidade (nome, telefone), comissões do período listadas.

**Step 176:** ✅ Criar API route DELETE `/api/admin/payouts/[id]` apenas para status = 'pending', retornando erro 400 se status for 'paid' ou 'cancelled'.

**Step 177:** ✅ Implementar query: histórico de repasses de uma entidade ordenado por periodEnd DESC, createdAt DESC.

**Step 178:** ✅ Implementar query de alerta: repasses pendentes há mais de 30 dias (WHERE status = 'pending' AND createdAt < NOW() - INTERVAL '30 days').

**Step 179:** ✅ Implementar query de resumo mensal: total de repasses pagos no mês atual por entityType.

**Step 180:** ✅ Expandir campo `notes` para TEXT sem limite, permitindo descrições detalhadas do repasse incluindo dados de transferência (banco, agência, conta).

**Step 181:** ✅ Garantir campo `referenceId` para identificador externo: número de comprovante, ID de transação PIX, chave de rastreio TED.

**Step 182:** ✅ Criar log de auditoria para todas as operações de repasse: criação, pagamento (status changed), cancelamento.

**Step 183:** ✅ Implementar validação: não permitir criar novo repasse para mesma entidade se já existir repasse 'pending' para período sobreposto.

**Step 184:** ✅ Criar endpoint GET `/api/admin/payouts/export` para exportação de relatório em CSV com todos os campos, filtrado por período e status.

**Step 185:** ✅ Documentar fluxo de repasses em `docs/PAYOUT_WORKFLOW.md`: criação, aprovação, pagamento, cancelamento, cálculo de saldos.

---

### FASE 9: UI COMPACTA E DENSA - PÁGINA DE REPRESENTANTES (Steps 186-200)

**Step 186:** ✅ Revisar página existente `app/admin/representatives/page.tsx` identificando componentes atuais e layout, planejando refatoração para densidade máxima.

**Step 187:** ✅ Redesenhar layout para máxima densidade visual: tabela com linhas de altura reduzida (h-10, 40px), fontes compactas (text-xs para dados, text-sm para cabeçalhos), padding mínimo (px-2 py-1).

**Step 188:** ✅ Implementar colunas otimizadas da tabela: Nome (truncado com ellipsis se > 20 chars), Tipo (badge pequeno colorido), Tel + WA (WhatsAppButton compacto inline), Comissão (badge %), Prescritores (count badge), Vendas (R$ formatado), Status (dot colorido), Ações (menu dropdown).

**Step 189:** ✅ Criar badges coloridos compactos para entityType: azul céu para Individual, verde esmeralda para Clínica, roxo para Empresa - usando classes como `bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded`.

**Step 190:** ✅ Integrar componente `WhatsAppButton` variant="icon" size="sm" na coluna de telefone, ocupando apenas 24x24px com tooltip mostrando número completo formatado.

**Step 191:** ✅ Implementar filtros compactos em linha única no topo da tabela: Input de busca (w-48), Select de tipo (w-32), Select de status (w-28), Botão "Limpar" (icon only), ocupando mínimo espaço vertical.

**Step 192:** ✅ Adicionar ordenação clicável nas colunas com ícones ChevronUp/ChevronDown (h-3 w-3) ao lado do título, alternando ASC → DESC → sem ordenação ao clicar.

**Step 193:** ✅ Implementar indicador visual sutil de ordenação ativa: coluna ordenada com fundo levemente destacado (bg-muted/50).

**Step 194:** ✅ Criar Sheet (drawer lateral) compacto para adicionar/editar representante, largura máxima 420px, com formulário em grid de 2 colunas para campos curtos.

**Step 195:** ✅ No formulário do drawer: PhoneInput ocupando linha completa, campos Nome/Tipo/Comissão em grid 2 colunas, CPF/Email em grid, Observações ocupando linha completa.

**Step 196:** ✅ Adicionar hint visual discreto no campo Tipo de Entidade: texto xs abaixo do select "Clínicas e consultórios parceiros podem ser cadastrados como representantes".

**Step 197:** ✅ Implementar Sheet de visualização de detalhes com seções colapsáveis (Accordion compacto): Dados Básicos, Prescritores Vinculados (lista com links), Estatísticas de Vendas, Histórico de Repasses.

**Step 198:** ✅ Na seção Prescritores do drawer de detalhes, listar nome com WhatsAppButton inline e link para página do prescritor, limitando a 5 itens com "Ver todos (N)".

**Step 199:** ✅ Implementar paginação ultra-compacta: texto "1-50 de 123" (text-xs), botões Previous/Next com ícones (ChevronLeft/Right) de 6x6, sem labels.

**Step 200:** ✅ Otimizar responsividade: em telas < 768px, transformar tabela em lista de cards compactos empilhados com informações essenciais (Nome, Tipo badge, WhatsApp button, Vendas) e botão "Detalhes".

---

### FASE 10: UI COMPACTA - PÁGINA DE PRESCRITORES/INFLUENCERS (Steps 201-215)

**Step 201:** ✅ Aplicar mesmos princípios de densidade da página de representantes em `app/admin/prescribers/page.tsx`: linhas h-10, text-xs/text-sm, padding mínimo.

**Step 202:** ✅ Implementar colunas otimizadas: Nome, Tel + WA (WhatsAppButton), Representante (nome truncado com link ou badge "Independente"), Comissão %, Cupons (count), Vendas R$, Saldo (pendente), Status, Ações.

**Step 203:** ✅ Criar link clicável na coluna Representante que abre detalhes do representante em novo drawer ou navega para página de representantes filtrada.

**Step 204:** ✅ Adicionar badge discreto "Independente" (bg-gray-100 text-gray-500 text-[10px]) para prescritores sem representante vinculado.

**Step 205:** ✅ Implementar filtros compactos em linha: busca por nome, Select de representante (com opção "Independentes" e "Todos"), Select de status.

**Step 206:** ✅ No drawer de criação/edição, implementar campo Representante com Combobox (busca + select) que consulta API de autocomplete ao digitar.

**Step 207:** ✅ Primeira opção do Combobox de representante: "Sem Representante (Independente)" para permitir prescriberId = null explicitamente.

**Step 208:** ✅ Criar seção "Cupons" no drawer de detalhes: tabela mini com código, desconto, usos, receita, status (ativo/expirado), link para editar cupom.

**Step 209:** ✅ Adicionar botão "Ver Pedidos" no drawer que navega para página /admin/orders com filtro prescriberId pré-aplicado na URL.

**Step 210:** ✅ Criar mini-gráfico de barras horizontais mostrando vendas por mês (últimos 6 meses) no drawer de detalhes usando div com width percentual (sem biblioteca de gráficos).

**Step 211:** ✅ Exibir "Saldo Pendente" no drawer com destaque visual: badge amarelo se > R$100, badge vermelho se > R$500.

**Step 212:** ✅ Adicionar botão compacto "Criar Repasse" no drawer que abre modal de criação de repasse com entityType e entityId pré-preenchidos.

**Step 213:** ✅ Implementar ordenação nas colunas principais: nome (A-Z), vendas (maior-menor), saldo pendente (maior-menor), quantidade de cupons.

**Step 214:** ✅ Responsividade mobile: cards compactos priorizando Nome, WhatsApp, Vendas, Saldo, botão "Ver Mais" expandindo para detalhes completos.

**Step 215:** ✅ Skeleton loading compacto enquanto dados carregam: linhas de altura fixa com shimmer animation nas células da tabela.

---

### FASE 11: UI COMPACTA - PÁGINA DE CUPONS AVANÇADA (Steps 216-235)

**Step 216:** ✅ Atualizar página `app/admin/coupons/page.tsx` com novas colunas densas: Código, Desconto, Prescritor (link), Representante (link), Com. P. %, Com. R. %, Usos, Receita R$, Expira, Status, Ações.

**Step 217:** ✅ Implementar badges visuais compactos: ícone RotateCcw (h-3) para recorrentes, badge "Expirado" vermelho (text-[10px]), badge "Expira em X dias" amarelo.

**Step 218:** ✅ Coluna "Receita" exibindo soma formatada de vendas com tooltip mostrando "X pedidos totalizando R$ Y.YYY,YY".

**Step 219:** ✅ Filtros compactos em linha: input código, Combobox prescritor, Select tipo desconto (% / R$), checkbox "Recorrentes", Select status, botão "Limpar".

**Step 220:** ✅ No formulário de criação/edição, adicionar seção "Vinculação" com Combobox para Prescritor que permite buscar existentes ou criar novo.

**Step 221:** ✅ Implementar criação inline: se usuário digitar nome não encontrado no Combobox, exibir opção destacada "➕ Criar: [nome digitado]" ao final da lista.

**Step 222:** ✅ Ao selecionar "Criar novo prescritor", expandir inline campos adicionais: PhoneInput compacto, Email (opcional), Comissão Padrão % - em layout de 3 colunas.

**Step 223:** ✅ Ao salvar cupom com novo prescritor: (1) POST para criar prescritor, (2) obter UUID retornado, (3) POST para criar cupom com prescriberId, (4) atualizar lista - tudo em transação lógica.

**Step 224:** ✅ Adicionar toggles compactos de override: Switch "Sobrescrever comissão prescritor" e "Sobrescrever comissão representante" com inputs numéricos inline que aparecem ao ativar.

**Step 225:** ✅ Quando toggle de override ativado, exibir input numérico com placeholder mostrando comissão padrão atual da entidade: "Padrão: 10%".

**Step 226:** ✅ Exibir preview de comissões calculadas em tempo real no formulário: texto pequeno "Comissões: Prescritor 10% (~R$ 30,00), Representante 5% (~R$ 15,00)" baseado em venda média.

**Step 227:** ✅ Tooltip explicativo nos campos de override: ícone HelpCircle (h-3) com texto "Se vazio, usa comissão padrão do cadastro da entidade".

**Step 228:** ✅ Seção "Recorrência" compacta: Switch "Cupom Recorrente" + Select de ciclo (Mensal/Trimestral/Anual) inline, ocupando meia linha.

**Step 229:** ✅ Menu de ações dropdown compacto: Editar, Ver Vendas (link filtrado), Ver Comissões, Copiar Código, Desativar/Ativar.

**Step 230:** ✅ Ação "Ver Vendas" navega para /admin/orders?couponId=XXX com filtro aplicado.

**Step 231:** ✅ Ordenação nas colunas: código (A-Z), usos (maior-menor), receita (maior-menor), data criação, data expiração.

**Step 232:** ✅ Drawer de detalhes com seções: Configuração (desconto, validade, usos), Vinculações (prescritor com stats, representante), Estatísticas (gráfico mini), Últimos Pedidos (lista de 5).

**Step 233:** ✅ Responsividade mobile: ocultar colunas de comissão na tabela, exibir apenas no drawer de detalhes expandido.

**Step 234:** ✅ Cache local de prescritores e representantes usando React Query ou SWR com staleTime de 5 minutos para evitar requisições repetitivas.

**Step 235:** ✅ Validação visual em tempo real no campo código: borda vermelha + mensagem "Código já existe" ao digitar código duplicado (consulta debounced).

---

### FASE 12: UI COMPACTA - PÁGINA DE PEDIDOS APRIMORADA (Steps 236-260)

**Step 236:** ✅ Revisar página `app/admin/orders/page.tsx` planejando todas as melhorias de colunas, filtros, ordenação e detalhes.

**Step 237:** ✅ Adicionar botão "Colunas" (ícone Columns) no header da tabela que abre Popover com lista de checkboxes para cada coluna disponível.

**Step 238:** ✅ Lista de colunas configuráveis: ID (sempre visível), Cliente, Email, Telefone, CPF, Total R$, Status Pagamento, Status Entrega, Cupom, Prescritor, Representante, Recorrente, Data, Ações.

**Step 239:** ✅ Salvar array de colunas visíveis no localStorage: `admin_orders_visible_columns = ["id", "cliente", "total", "status", "data", "acoes"]`.

**Step 240:** ✅ Restaurar colunas visíveis do localStorage ao montar componente, com fallback para colunas padrão se não existir.

**Step 241:** ✅ Implementar ordenação em cada coluna: header clicável com ícones ArrowUpDown, alternando entre ASC, DESC, e sem ordenação.

**Step 242:** ✅ Salvar ordenação atual no localStorage: `admin_orders_sort = { column: "createdAt", direction: "desc" }`.

**Step 243:** ✅ Salvar estado de todos os filtros ativos no localStorage: `admin_orders_filters = { status: "PAID", startDate: "2024-01-01", ... }`.

**Step 244:** ✅ Restaurar filtros do localStorage ao carregar página, aplicando-os automaticamente à query inicial.

**Step 245:** ✅ Adicionar colunas com dados extraídos do metadataJson: Prescritor (nome ou "-"), Representante (nome ou "-"), badge "Recorrente" com ícone RotateCcw.

**Step 246:** ✅ Atualizar Sheet de detalhes do pedido adicionando seção "Comissões": Cupom usado (código + link), Prescritor (nome + WhatsApp + link para detalhes), Representante (nome + WhatsApp + link), Valores de comissão calculados.

**Step 247:** ✅ Adicionar seção "Conteúdo do Pedido" no drawer: tabela compacta listando cada item do pedido com Produto, Qtd, Preço Unit., Subtotal.

**Step 248:** ✅ Buscar dados de order_items via JOIN ou query separada e exibir formatado no drawer.

**Step 249:** ✅ Para pedidos com isRecurring = true, exibir badge destacado "Assinatura Ativa" com informações: ciclo, próxima cobrança estimada (baseada em createdAt + ciclo).

**Step 250:** ✅ Implementar Select editável para Status de Pagamento no drawer: Pendente, Pago, Cancelado, Reembolsado - com Dialog de confirmação antes de alterar.

**Step 251:** ✅ Ao alterar status manualmente, registrar log de auditoria: orderId, statusAnterior, statusNovo, userId, timestamp, motivo (input opcional).

**Step 252:** ✅ Corrigir botão "Atualizar" (ícone RefreshCw) para: mostrar loading spinner, consultar Asaas, atualizar banco, exibir toast de sucesso/erro com detalhes.

**Step 253:** ✅ Adicionar botão "Sincronizar Pendentes" no header da página que executa sync em lote de todos os pedidos com status pendente, exibindo progresso.

**Step 254:** ✅ Implementar filtro checkbox "Apenas Assinaturas" que filtra pedidos com isRecurring = true.

**Step 255:** ✅ Criar seção colapsável "Assinaturas Ativas" no topo da página: lista de clientes com assinaturas, último pagamento, próxima cobrança, status de entrega do último pedido.

**Step 256:** ✅ Lógica de status de entrega para recorrentes: se último deliveryStatus = 'DELIVERED' há mais de 25 dias (para ciclo mensal), sugerir "Aguardando Novo Envio".

**Step 257:** ✅ Indicador visual de urgência: linha de pedido pendente há > 7 dias com background amarelo claro (bg-yellow-50).

**Step 258:** ✅ Botão de exportação CSV no header: exportar pedidos visíveis (respeitando filtros atuais) com todas as colunas.

**Step 259:** ✅ Responsividade: drawer ocupa 100vw em mobile, tabela com scroll horizontal, colunas reduzidas ao essencial.

**Step 260:** ✅ Skeleton loading para tabela e drawer: linhas com shimmer animation durante carregamento de dados.

---

### FASE 13: DASHBOARD, MÉTRICAS E GRÁFICOS CORRIGIDOS (Steps 261-275)

**Step 261:** ✅ Revisar página `app/admin/dashboard/page.tsx` para corrigir todas as métricas e adicionar novos indicadores.

**Step 262:** ✅ Corrigir cálculo de "Receita (mês)": query deve filtrar por status IN ('PAID', 'CONFIRMED') AND paidAt >= primeiro dia do mês atual, somando orders.total.

**Step 263:** ✅ Aplicar formatação de moeda consistente em todas as métricas: `new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)`.

**Step 264:** ✅ Adicionar novo card de métrica: "Comissões Pendentes" = SUM de saldos pendentes de todos os prescritores + representantes ativos.

**Step 265:** ✅ Adicionar card: "Repasses do Mês" = SUM de payouts WHERE status = 'paid' AND paidAt >= primeiro dia do mês.

**Step 266:** ✅ Criar mini-gráfico de barras horizontais: "Top 5 Prescritores (Vendas)" mostrando nome e valor, usando divs com width proporcional.

**Step 267:** ✅ Criar mini-gráfico de linha/área: "Comissões Acumuladas" por mês (últimos 6 meses) usando biblioteca leve (recharts já instalado) ou divs estilizados.

**Step 268:** ✅ Adicionar seção "Alertas" com cards de atenção: cupons expirando em 7 dias, saldos pendentes > R$500, pedidos pendentes > 7 dias, assinaturas com envio atrasado.

**Step 269:** ✅ Implementar Select de período no dashboard: Este Mês, Mês Anterior, Últimos 3 Meses, Ano Atual, Personalizado (date range picker).

**Step 270:** ✅ Atualizar todas as métricas e gráficos dinamicamente ao alterar período selecionado.

**Step 271:** ✅ Adicionar tooltips explicativos em cada card de métrica: ícone HelpCircle com texto descrevendo cálculo.

**Step 272:** ✅ Implementar auto-refresh das métricas a cada 5 minutos usando setInterval + fetch, com indicador discreto de última atualização.

**Step 273:** ✅ Exibir texto "Última atualização: há X minutos" no canto do dashboard, atualizando em tempo real.

**Step 274:** ✅ Responsividade: cards em grid de 2 colunas em telas md, 1 coluna em sm, gráficos empilhados verticalmente.

**Step 275:** ✅ Skeleton loading com shimmer para cada card e gráfico durante carregamento inicial e refresh.

---

### FASE 14: DISCLAIMER EM IMAGENS E CORREÇÕES VISUAIS FINAIS (Steps 276-285)

**Step 276:** ✅ Identificar todos os componentes que exibem imagens de produtos no projeto: homepage (FeaturedProducts, ProductCard), checkout, página de admin products.

**Step 277:** ✅ Criar componente `components/ui/product-image.tsx` que encapsula next/image com overlay de disclaimer posicionado.

**Step 278:** ✅ Implementar overlay discreto e elegante: texto "Imagem ilustrativa" em fonte pequena (text-[10px]), cor cinza claro (text-gray-400), posicionado no canto inferior direito com padding de 4px.

**Step 279:** ✅ Aplicar fundo semi-transparente (bg-white/70) no texto do disclaimer para garantir legibilidade sobre qualquer cor de imagem.

**Step 280:** ✅ Substituir todas as ocorrências de `<Image>` ou componentes de imagem de produtos pelo novo `<ProductImage>`, mantendo todas as props originais (src, alt, fill, sizes, priority).

**Step 281:** ✅ Testar exibição do disclaimer em diferentes tamanhos de imagem (thumbnail, card, hero) e dispositivos (desktop, tablet, mobile).

**Step 282:** ✅ Garantir que overlay do disclaimer não interfere com interatividade: cliques passam através usando pointer-events-none.

**Step 283:** ✅ Adicionar prop `showDisclaimer?: boolean` (default true) no ProductImage para casos onde disclaimer não é necessário (thumbnails < 100px).

**Step 284:** ✅ Revisar AppSidebar em `components/ui/sidebar.tsx` ou `lib/config/admin-sidebar.tsx` garantindo que todos os 10 ícones Lucide renderizam consistentemente em todas as rotas.

**Step 285:** ✅ Testar navegação completa entre todas as 10 páginas admin (Dashboard, Pedidos, Estoque, Cupons, Prescritores, Representantes, Comissões, Repasses, Vendas, Leads) verificando persistência de ícones.

---

### FASE 15: DOCUMENTAÇÃO FUTURA E EXPANSÃO MULTINÍVEL (Steps 286-295)

**Step 286:** ✅ Criar arquivo `docs/FUTURE_MULTINIVEL.md` documentando plano de expansão para N níveis de hierarquia além dos 2 atuais (Representante → Prescritor).

**Step 287:** ✅ Documentar caso de uso exemplo: Empresa Farmacêutica → Representante Regional → Representante Local → Prescritor/Nutricionista.

**Step 288:** ✅ Listar pré-requisitos técnicos para expansão: tabela de hierarquia (closure table pattern ou adjacency list), campo `parentId` recursivo, `level` (1-N), queries recursivas com CTE.

**Step 289:** ✅ Documentar considerações de performance: índices necessários (parentId, level, path materialized), limite recomendado de profundidade (máximo 5 níveis), estratégias de cache.

**Step 290:** ✅ Documentar regras de negócio para comissões em cascata N níveis: percentual configurável por nível, cap total de comissão (máx 50%), distribuição proporcional ou fixa.

**Step 291:** ✅ Incluir diagrama ER da estrutura expandida proposta usando notação Mermaid ou ASCII art.

**Step 292:** ✅ Documentar novos endpoints de API necessários: GET /hierarchy/tree, GET /hierarchy/ancestors/:id, GET /hierarchy/descendants/:id.

**Step 293:** ✅ Listar componentes de UI que precisariam de atualização: TreeView para hierarquia, BreadcrumbPath para navegação, filtros em cascata.

**Step 294:** ✅ Estimar esforço de implementação: Sprint 1 (schema + migrations), Sprint 2 (API + cálculos), Sprint 3 (UI + testes).

**Step 295:** ✅ Adicionar referências técnicas: links para padrões de implementação de hierarquia em SQL (Closure Table, Nested Sets, Materialized Path).

---

### FASE 16: IDEIAS DE MELHORIAS E OTIMIZAÇÕES GERAIS DO ADMIN (Steps 296-250)

*Nota: Steps reajustados para totalizar exatamente 250, incorporando ideias de melhorias nos steps finais.*

**Step 236:** ✅ Implementar atalhos de teclado para navegação rápida no admin: Cmd/Ctrl+K abre busca global, G+D = Dashboard, G+O = Pedidos, G+C = Cupons, G+P = Prescritores, G+R = Representantes.

**Step 237:** ✅ Criar componente de busca global (Command Palette) que pesquisa em: pedidos (por ID, cliente), cupons (por código), prescritores (por nome), representantes (por nome), navegando diretamente para o item.

**Step 238:** ✅ Implementar notificações em tempo real para novos pedidos usando polling a cada 30 segundos (ou WebSockets futuramente), exibindo toast com som opcional.

**Step 239:** ✅ Criar página "Atividade Recente" (`/admin/activity`) mostrando log de ações administrativas: criação/edição de entidades, alterações de status, repasses realizados.

**Step 240:** ✅ Adicionar gráfico de funil de conversão no Dashboard: Visitantes → Leads → Checkout Iniciado → Pagamento → Confirmado, usando dados de analytics e leads.

**Step 241:** ✅ Implementar comparativo de períodos em métricas: "Este mês vs mês anterior" com indicador de crescimento/queda percentual (seta verde/vermelha).

**Step 242:** ✅ Adicionar mapa de calor de horários de compra no Dashboard: matriz de dias da semana x horas do dia, colorindo células por quantidade de pedidos.

**Step 243:** ✅ Criar página de configurações administrativas (`/admin/settings`): taxas padrão de comissão, thresholds de alerta, preferências de notificação, timezone.

**Step 244:** ✅ Implementar exportação de relatórios em PDF com logo DUO Natural, formatação profissional de tabelas, e rodapé com data de geração.

**Step 245:** ✅ Criar checklist de onboarding para novos administradores: tarefas interativas (criar primeiro cupom, cadastrar prescritor, verificar integração Asaas).

**Step 246:** ✅ Implementar modo escuro/claro toggle na área admin com persistência em localStorage e respeito a prefers-color-scheme.

**Step 247:** ✅ Adicionar breadcrumbs de navegação em todas as páginas: Dashboard > Prescritores > João Silva, facilitando retorno.

**Step 248:** ✅ Implementar cache inteligente de dados com React Query/SWR: staleTime de 2 minutos para listagens, invalidação automática após mutations.

**Step 249:** ✅ Criar testes E2E básicos usando Playwright para fluxos críticos: login, criar cupom, criar prescritor, visualizar pedido.

**Step 250:** ✅ Realizar auditoria final de qualidade: testar todas as funcionalidades implementadas em desktop e mobile, validar responsividade, confirmar persistência de filtros/colunas, verificar cálculos de comissão com dados reais, documentar qualquer issue pendente em `docs/KNOWN_ISSUES.md`.

---

## OBSERVAÇÕES FINAIS E DIRETRIZES DE IMPLEMENTAÇÃO

### Compactação e Densidade Visual
- Todas as interfaces devem priorizar uso eficiente de espaço com componentes ultra-compactos
- Fontes menores (text-xs para dados, text-sm para títulos) sem comprometer legibilidade
- Padding e margin mínimos (p-1, p-2, gap-1, gap-2) para maximizar conteúdo visível
- Preferir tooltips e popovers para informações secundárias
- Micro-interações elegantes: transitions de 150ms, hover states sutis, feedback visual imediato

### Responsividade Mobile-First
- Todas as páginas 100% funcionais em telas de 320px (iPhone SE)
- Transformar tabelas em listas de cards em breakpoints < 768px
- Drawers/Sheets ocupam tela inteira em mobile
- Touch targets mínimo de 44x44px para botões e links
- Evitar hovers como única forma de interação (não funciona em touch)

### Persistência e Cache
- Salvar preferências de usuário no localStorage: filtros, colunas visíveis, ordenação, tema
- Implementar cache de dados com React Query ou SWR para otimizar requisições
- Prefetch de dados prováveis (ex: detalhes ao hover na lista)

### Performance
- Lazy loading para componentes pesados (gráficos, tabelas grandes)
- Paginação server-side obrigatória para todas as listagens
- Índices de banco otimizados para queries frequentes
- Debounce de 300ms em inputs de busca
- Skeleton loading para feedback visual durante carregamento

### Auditoria e Segurança
- Log estruturado de todas as operações CRUD: userId, timestamp, ação, dados anteriores/novos
- Validação server-side obrigatória para todas as operações
- Sanitização de inputs para prevenir XSS
- Rate limiting em endpoints sensíveis

### Qualidade de Código
- Comentários em português brasileiro explicando lógica de negócio
- TypeScript strict mode para type safety
- Componentes reutilizáveis com props bem documentadas
- Testes unitários para funções críticas de cálculo (comissões, repasses)
- Padrão de commits: `tipo(escopo): descrição em português`

### Integração Asaas
- Sempre validar dados no servidor antes de enviar ao Asaas
- Implementar retry com backoff exponencial para falhas de rede
- Manter logs detalhados de todas as requisições e respostas
- Testar em ambiente sandbox antes de produção
- Documentar mapeamento de status Asaas → Sistema local

### Indicações Visuais para Administradores
- Hints discretos explicando funcionalidades: "Clínicas parceiras podem ser cadastradas como representantes"
- Badges de status com cores consistentes: verde (ativo/pago), amarelo (pendente/alerta), vermelho (erro/expirado)
- Ícones informativos (HelpCircle) com tooltips explicativos
- Mensagens de confirmação claras antes de ações destrutivas
