import { pgTable, text, timestamp, uuid, boolean, integer, numeric, pgEnum, jsonb, index, vector } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enum para tipo de desconto
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

// Enum para origem do lead
export const sourceTypeEnum = pgEnum('source_type', ['newsletter', 'checkout']);

// Enum para tipo de transação de estoque
export const transactionTypeEnum = pgEnum('transaction_type', ['IN', 'OUT', 'ADJUSTMENT', 'SALE_DEDUCTION']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'AWAITING_PAYMENT', 'PAID', 'CONFIRMED', 'CANCELLED', 'REFUNDED']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'RETURNED']);
export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'AUTHORIZED',
  'RECEIVED',
  'CONFIRMED',
  'OVERDUE',
  'REFUNDED',
  'RECEIVED_IN_CASH',
  'REFUND_REQUESTED',
  'CHARGEBACK_REQUESTED',
  'CHARGEBACK_DISPUTE',
  'AWAITING_CHARGEBACK_REVERSAL',
  'DUNNING_REQUESTED',
  'DUNNING_RECEIVED',
  'AWAITING_RISK_ANALYSIS',
  'CANCELLED',
  'FAILED',
]);

// Tabela de usuários
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de sessões
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabela de Representantes
// Gerencia representantes que podem ter múltiplos prescritores vinculados
export const representatives = pgTable('representatives', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  countryCode: text('country_code').notNull().default('+55'),
  email: text('email'),
  cpfCnpj: text('cpf_cnpj'),
  defaultCommission: numeric('default_commission', { precision: 5, scale: 2 }),
  entityType: text('entity_type').default('individual'), // 'individual', 'clinic', 'company'
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de Prescritores/Influencers
// Gerencia prescritores que criam cupons e podem estar vinculados a representantes
export const prescribers = pgTable('prescribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  countryCode: text('country_code').notNull().default('+55'),
  email: text('email'),
  cpfCnpj: text('cpf_cnpj'),
  representativeId: uuid('representative_id').references(() => representatives.id, { onDelete: 'set null' }),
  defaultCommission: numeric('default_commission', { precision: 5, scale: 2 }),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de cupons de desconto
// Gerencia cupons aplicáveis no checkout
export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Código do cupom (único, convertido para uppercase)
  code: text('code').notNull().unique(),
  // Tipo de desconto: percentage (%) ou fixed (R$)
  discountType: discountTypeEnum('discount_type').notNull().default('percentage'),
  // Valor do desconto (percentual ou valor fixo baseado em discountType)
  discount: numeric('discount', { precision: 10, scale: 2 }).notNull(),
  // Descrição para referência do admin
  description: text('description').notNull(),
  // Status ativo/inativo do cupom
  isActive: boolean('is_active').notNull().default(true),
  // Data de expiração (null = sem expiração)
  expiresAt: timestamp('expires_at'),
  // Número máximo de usos permitidos (null = ilimitado)
  maxUses: integer('max_uses'),
  // Contador de usos já realizados
  currentUses: integer('current_uses').notNull().default(0),
  // Valor mínimo de compra para aplicar o cupom (null = sem mínimo)
  minPurchaseAmount: numeric('min_purchase_amount', { precision: 10, scale: 2 }),
  // CAMPOS ANTIGOS (mantidos para compatibilidade temporária)
  commission: numeric('commission', { precision: 5, scale: 2 }),
  prescriber: text('prescriber'),
  // NOVOS CAMPOS - Sistema multinível
  prescriberId: uuid('prescriber_id').references(() => prescribers.id, { onDelete: 'set null' }),
  prescriberCommissionOverride: numeric('prescriber_commission_override', { precision: 5, scale: 2 }),
  representativeCommissionOverride: numeric('representative_commission_override', { precision: 5, scale: 2 }),
  // Indica se o cupom ativa uma assinatura recorrente
  isRecurring: boolean('is_recurring').notNull().default(false),
  // Ciclo de cobrança para recorrência (WEEKLY, MONTHLY, YEARLY)
  recurringCycle: text('recurring_cycle').default('MONTHLY'),
  // Observações adicionais sobre o cupom
  observations: text('observations'),
  // Timestamps de auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de leads capturados dos formulários
// Armazena dados de leads da newsletter e checkout
export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Origem do lead: newsletter (formulario cupom) ou checkout
  sourceType: sourceTypeEnum('source_type').notNull(),

  // Dados básicos (presentes em ambos os formulários)
  name: text('name').notNull(),
  whatsapp: text('whatsapp').notNull(),

  // Dados completos (apenas checkout)
  email: text('email'),
  cpfCnpj: text('cpf_cnpj'),
  rg: text('rg'),
  rgIssuer: text('rg_issuer'),
  phone: text('phone'),
  postalCode: text('postal_code'),
  addressNumber: text('address_number'),
  addressComplement: text('address_complement'),
  address: text('address'),
  city: text('city'),
  state: text('state'),

  // Dados específicos
  couponCode: text('coupon_code'), // Para leads newsletter
  convertedToSale: boolean('converted_to_sale').notNull().default(false),
  conversionDate: timestamp('conversion_date'),
  
  // Itens do carrinho (salvo no checkout)
  cartItems: jsonb('cart_items'),

  // Metadados para rastreamento
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),

  // Timestamps de auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Tabela de Estoque
export const inventory = pgTable('inventory', {
  // ID do produto deve bater com o ID definido no frontend (duo-dia, duo-noite, etc)
  productId: text('product_id').primaryKey(),
  quantity: integer('quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  lastReconciledAt: timestamp('last_reconciled_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Pedidos
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  leadId: uuid('lead_id').references(() => leads.id),
  customerId: text('customer_id'),
  asaasCustomerId: text('asaas_customer_id'),
  asaasPaymentId: text('asaas_payment_id'),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  deliveryStatus: deliveryStatusEnum('delivery_status').notNull().default('PENDING'),
  billingType: text('billing_type'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: numeric('discount', { precision: 12, scale: 2 }).notNull().default('0'),
  shipping: numeric('shipping', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: text('currency').notNull().default('BRL'),
  stockDeductedAt: timestamp('stock_deducted_at'),
  metadata: jsonb('metadata'),
  // Novos campos para sistema multinível
  metadataJson: jsonb('metadata_json'),
  isRecurring: boolean('is_recurring').notNull().default(false),
  subscriptionId: text('subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Itens do pedido
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  name: text('name').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Pagamentos
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  asaasPaymentId: text('asaas_payment_id').notNull(),
  customerId: text('customer_id'),
  status: paymentStatusEnum('status').notNull().default('PENDING'),
  billingType: text('billing_type'),
  value: numeric('value', { precision: 12, scale: 2 }).notNull(),
  netValue: numeric('net_value', { precision: 12, scale: 2 }),
  dueDate: timestamp('due_date'),
  paidAt: timestamp('paid_at'),
  failReason: text('fail_reason'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Eventos de pagamento (webhooks)
export const paymentEvents = pgTable('payment_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  asaasPaymentId: text('asaas_payment_id').notNull(),
  event: text('event').notNull(),
  payload: jsonb('payload'),
  receivedAt: timestamp('received_at').defaultNow().notNull()
});

// Histórico de Transações de Estoque
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => inventory.productId),
  type: transactionTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(), // Quantidade adicionada (+) ou removida (-)
  note: text('note'),
  orderId: uuid('order_id').references(() => orders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Opcional: ID do usuário que fez a alteração (se houver sistema de login robusto)
  createdBy: text('created_by') 
});

// Tabela de chunks de conhecimento para RAG (Retrieval Augmented Generation)
// Armazena embeddings vetoriais da documentação de vendas para busca semântica
export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Fonte do chunk (arquivo markdown original)
  sourceFile: text('source_file').notNull(),
  
  // Conteúdo textual do chunk
  content: text('content').notNull(),
  
  // Embedding vetorial (1536 dimensões para text-embedding-3-small)
  // Nota: HNSW tem limite de 2000 dimensões, então usamos modelo menor
  embedding: vector('embedding', { dimensions: 1536 }).notNull(),
  
  // Metadados estruturados do chunk
  metadata: jsonb('metadata').$type<{
    section?: string;
    subsection?: string;
    tokens?: number;
    chunkIndex?: number;
  }>(),
  
  // Timestamps de auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  // Índice HNSW para busca vetorial rápida usando cosine distance
  embeddingIdx: index('knowledge_chunks_embedding_idx')
    .using('hnsw', table.embedding.op('vector_cosine_ops'))
}));

// Tabela de Registros de Comissão
// Armazena histórico de todas as comissões geradas por vendas com cupons
export const commissionRecords = pgTable('commission_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  couponId: uuid('coupon_id').references(() => coupons.id, { onDelete: 'set null' }),
  
  // Dados do prescritor
  prescriberId: uuid('prescriber_id').references(() => prescribers.id, { onDelete: 'set null' }),
  prescriberCommissionRate: numeric('prescriber_commission_rate', { precision: 5, scale: 2 }),
  prescriberCommissionAmount: numeric('prescriber_commission_amount', { precision: 12, scale: 2 }),
  
  // Dados do representante
  representativeId: uuid('representative_id').references(() => representatives.id, { onDelete: 'set null' }),
  representativeCommissionRate: numeric('representative_commission_rate', { precision: 5, scale: 2 }),
  representativeCommissionAmount: numeric('representative_commission_amount', { precision: 12, scale: 2 }),
  
  // Valor base da venda
  saleAmount: numeric('sale_amount', { precision: 12, scale: 2 }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Tabela de Repasses (Payouts)
// Gerencia histórico de pagamentos de comissões para prescritores e representantes
export const payouts = pgTable('payouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Entidade que recebe o repasse
  entityType: text('entity_type').notNull(), // 'prescriber' ou 'representative'
  entityId: uuid('entity_id').notNull(),
  
  // Valores financeiros
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  
  // Período coberto pelo repasse
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Status do repasse
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'cancelled'
  
  // Data de pagamento
  paidAt: timestamp('paid_at'),
  
  // Método de pagamento
  paymentMethod: text('payment_method'), // 'pix', 'transfer', 'cash', 'check', 'other'
  
  // Observações e referências
  notes: text('notes'),
  referenceId: text('reference_id'),
  
  // Auditoria
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Types exportados para TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Representative = typeof representatives.$inferSelect;
export type NewRepresentative = typeof representatives.$inferInsert;
export type Prescriber = typeof prescribers.$inferSelect;
export type NewPrescriber = typeof prescribers.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type CommissionRecord = typeof commissionRecords.$inferSelect;
export type NewCommissionRecord = typeof commissionRecords.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
export type OrderStatus = Order['status'];
export type DeliveryStatus = Order['deliveryStatus'];
export type PaymentStatusDb = Payment['status'];
export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type NewKnowledgeChunk = typeof knowledgeChunks.$inferInsert;
