// Tipos para integração com API Asaas
// Define estruturas de dados para pagamentos, clientes e respostas da API

/**
 * Tipo de cobrança suportado pelo Asaas
 */
export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

/**
 * Tipo de desconto aplicável
 */
export type DiscountType = 'FIXED' | 'PERCENTAGE';

/**
 * Status do pagamento no Asaas
 */
export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS'
  | 'CANCELLED'
  | 'FAILED';

/**
 * Dados do cliente para Asaas
 */
export interface AsaasCustomer {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
  groupName?: string;
}

/**
 * Resposta da criação de cliente no Asaas
 */
export interface AsaasCustomerResponse {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  dateCreated: string;
  personType: 'FISICA' | 'JURIDICA';
}

/**
 * Desconto aplicável ao pagamento
 */
export interface AsaasDiscount {
  value: number;
  dueDateLimitDays: number;
  type: DiscountType;
}

/**
 * Dados do cartão de crédito
 */
export interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

/**
 * Informações do titular do cartão
 */
export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
  mobilePhone?: string;
}

/**
 * Dados completos para pagamento com cartão de crédito
 */
export interface CreditCardPayment {
  creditCard: CreditCardData;
  creditCardHolderInfo: CreditCardHolderInfo;
  remoteIp: string;
}

/**
 * Dados para criação de pagamento no Asaas
 */
export interface AsaasPaymentRequest {
  customer: string; // ID do cliente no Asaas
  billingType: BillingType;
  value: number;
  dueDate: string; // Formato: YYYY-MM-DD
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: AsaasDiscount;
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
  };
  postalService?: boolean;
  split?: any[];
  callback?: {
    successUrl?: string;
    autoRedirect?: boolean;
  };
  // Dados específicos para cartão de crédito
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  remoteIp?: string;
}

/**
 * Dados do QR Code PIX retornados pelo Asaas
 */
export interface AsaasPixResponse {
  encodedImage: string; // Base64 da imagem do QR Code
  payload: string; // String para copia e cola
  expirationDate: string; // Data de expiração
}

/**
 * Resposta da criação de pagamento no Asaas
 */
export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  billingType: BillingType;
  canBePaidAfterDueDate: boolean;
  pixTransaction?: string;
  status: PaymentStatus;
  dueDate: string;
  originalDueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl: string;
  invoiceNumber?: string;
  externalReference?: string;
  discount?: AsaasDiscount;
  fine?: any;
  interest?: any;
  deleted: boolean;
  postalService: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate?: string;
  estimatedCreditDate?: string;
  transactionReceiptUrl?: string;
  nossoNumero?: string;
  bankSlipUrl?: string;
  lastInvoiceViewedDate?: string;
  lastBankSlipViewedDate?: string;
  refunds?: any;
  pixQrCode?: AsaasPixResponse;
}

/**
 * Estado local do pagamento na aplicação
 */
export interface PaymentState {
  orderId?: string;
  customerId?: string;
  paymentId?: string;
  billingType?: BillingType;
  status?: PaymentStatus;
  qrCode?: AsaasPixResponse;
  bankSlipUrl?: string;
  invoiceUrl?: string;
  value?: number;
  error?: string;
  loading: boolean;
}

/**
 * Dados do formulário de cliente
 */
export interface CustomerFormData {
  name: string;
  email: string;
  cpfCnpj: string;
  rg: string;
  rgIssuer: string;
  phone: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  addressComplement?: string;
  city: string;
  state: string;
}

/**
 * Resposta de erro da API Asaas
 */
export interface AsaasErrorResponse {
  errors?: Array<{
    code: string;
    description: string;
  }>;
  error?: string;
  message?: string;
}

/**
 * Tipo de chave Pix
 */
export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

/**
 * Dados de uma chave Pix cadastrada
 */
export interface AsaasPixKey {
  id: string;
  addressKey: string;
  type: PixKeyType;
  status: 'ACTIVE' | 'AWAITING_ACTIVATION' | 'AWAITING_ACCOUNT_ACTIVATION' | 'ERROR';
  dateCreated: string;
  qrCode?: {
    id: string;
    payload: string;
    allowsMultiplePayments: boolean;
  };
}

/**
 * Resposta da listagem de chaves Pix
 */
export interface AsaasPixKeysResponse {
  object: string;
  hasMore: boolean;
  totalCount: number;
  limit: number;
  offset: number;
  data: AsaasPixKey[];
}

/**
 * Requisição para criar chave Pix
 */
export interface AsaasPixKeyRequest {
  type: PixKeyType;
}

/**
 * Resposta da criação de chave Pix
 */
export interface AsaasPixKeyResponse {
  id: string;
  addressKey: string;
  type: PixKeyType;
  status: 'ACTIVE' | 'AWAITING_ACTIVATION' | 'AWAITING_ACCOUNT_ACTIVATION' | 'ERROR';
  dateCreated: string;
}
