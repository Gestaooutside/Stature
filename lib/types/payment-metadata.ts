/**
 * Estrutura de Metadata para Pagamentos do Asaas
 * Versão 1 - Sistema Multinível de Comissões
 * 
 * Este metadata é enviado ao Asaas e armazenado localmente para rastreamento
 * de cupons, prescritores e representantes em cada venda.
 * 
 * @see docs/ASAAS_METADATA.md para documentação completa
 */

/**
 * Interface principal do metadata de pagamento
 * Armazenado no campo externalReference do Asaas (máx 64 chars)
 * e no campo metadataJson local (JSONB)
 */
export interface PaymentMetadata {
  // Versão do schema para migração futura
  version: number;
  
  // Código do cupom utilizado (se houver)
  couponCode?: string;
  
  // ID do prescritor associado ao cupom
  prescriberId?: string;
  
  // ID do representante associado ao prescritor
  representativeId?: string;
  
  // Campos futuros (documentação)
  // leadSource?: string;
  // utmCampaign?: string;
  // affiliateId?: string;
  // promotionId?: string;
}

/**
 * Versão compacta para envio ao Asaas (cabe em 64 chars)
 * Formato: v1|CUPOM|prescId|repId
 */
export interface PaymentMetadataCompact {
  v: number;
  c?: string; // couponCode (abreviado)
  p?: string; // prescriberId (últimos 8 chars do UUID)
  r?: string; // representativeId (últimos 8 chars do UUID)
}

/**
 * Interface para dados de cupom utilizados na construção do metadata
 */
export interface CouponMetadataInput {
  code: string;
  prescriberId?: string | null;
  representativeId?: string | null;
}

/**
 * Constante para versão atual do metadata
 */
export const METADATA_VERSION = 1;

/**
 * Constrói objeto PaymentMetadata a partir dos dados do cupom
 * @param coupon - Dados do cupom aplicado (pode ser null)
 * @returns PaymentMetadata completo ou objeto básico com versão
 */
export function buildPaymentMetadata(
  coupon: CouponMetadataInput | null
): PaymentMetadata {
  const metadata: PaymentMetadata = {
    version: METADATA_VERSION,
  };

  if (coupon) {
    metadata.couponCode = coupon.code;
    
    if (coupon.prescriberId) {
      metadata.prescriberId = coupon.prescriberId;
    }
    
    if (coupon.representativeId) {
      metadata.representativeId = coupon.representativeId;
    }
  }

  return metadata;
}

/**
 * Serializa metadata para string JSON
 * Usado para armazenamento local (JSONB)
 * @param metadata - Objeto PaymentMetadata
 * @returns String JSON
 */
export function serializeMetadata(metadata: PaymentMetadata): string {
  return JSON.stringify(metadata);
}

/**
 * Serializa metadata em formato compacto para externalReference do Asaas
 * Limite de 64 caracteres - usa formato abreviado
 * Formato: v1|CUPOM|p:abcd1234|r:efgh5678
 * @param metadata - Objeto PaymentMetadata
 * @returns String compacta (máx 64 chars)
 */
export function serializeMetadataForAsaas(metadata: PaymentMetadata): string {
  const parts: string[] = [`v${metadata.version}`];
  
  if (metadata.couponCode) {
    // Trunca código do cupom se muito longo
    parts.push(metadata.couponCode.substring(0, 15));
  }
  
  if (metadata.prescriberId) {
    // Usa apenas últimos 8 caracteres do UUID
    parts.push(`p:${metadata.prescriberId.slice(-8)}`);
  }
  
  if (metadata.representativeId) {
    // Usa apenas últimos 8 caracteres do UUID
    parts.push(`r:${metadata.representativeId.slice(-8)}`);
  }
  
  return parts.join('|').substring(0, 64);
}

/**
 * Deserializa metadata do formato compacto do Asaas
 * @param externalReference - String do campo externalReference
 * @returns PaymentMetadata parcial ou null se inválido
 */
export function parseMetadataFromAsaas(
  externalReference: string | null | undefined
): Partial<PaymentMetadata> | null {
  if (!externalReference) return null;
  
  try {
    const parts = externalReference.split('|');
    
    // Verifica versão
    if (!parts[0]?.startsWith('v')) return null;
    const version = parseInt(parts[0].substring(1));
    
    if (isNaN(version) || version < 1) return null;
    
    const metadata: Partial<PaymentMetadata> = {
      version,
    };
    
    // Parse restante dos campos
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('p:')) {
        // Prescritor (últimos 8 chars do UUID)
        metadata.prescriberId = part.substring(2);
      } else if (part.startsWith('r:')) {
        // Representante (últimos 8 chars do UUID)
        metadata.representativeId = part.substring(2);
      } else if (!part.includes(':')) {
        // Código do cupom (não tem prefixo)
        metadata.couponCode = part;
      }
    }
    
    return metadata;
  } catch {
    return null;
  }
}

/**
 * Parse metadata completo de JSONB armazenado localmente
 * @param jsonString - String JSON do campo metadataJson
 * @returns PaymentMetadata ou null se inválido
 */
export function parsePaymentMetadata(
  jsonString: string | null | undefined
): PaymentMetadata | null {
  if (!jsonString) return null;
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // Valida versão
    if (typeof parsed.version !== 'number' || parsed.version < 1) {
      return null;
    }
    
    return parsed as PaymentMetadata;
  } catch {
    return null;
  }
}

/**
 * Parse metadata de objeto JSONB (já parseado)
 * @param metadata - Objeto do campo metadataJson
 * @returns PaymentMetadata ou null se inválido
 */
export function parsePaymentMetadataObject(
  metadata: unknown
): PaymentMetadata | null {
  if (!metadata || typeof metadata !== 'object') return null;
  
  const obj = metadata as Record<string, unknown>;
  
  // Valida versão
  if (typeof obj.version !== 'number' || obj.version < 1) {
    return null;
  }
  
  return {
    version: obj.version,
    couponCode: typeof obj.couponCode === 'string' ? obj.couponCode : undefined,
    prescriberId: typeof obj.prescriberId === 'string' ? obj.prescriberId : undefined,
    representativeId: typeof obj.representativeId === 'string' ? obj.representativeId : undefined,
  };
}

/**
 * Extrai entidades relacionadas de um metadata de pedido
 * @param metadata - Objeto metadata do pedido
 * @returns Objeto com IDs extraídos
 */
export function extractEntitiesFromMetadata(
  metadata: unknown
): { couponCode?: string; prescriberId?: string; representativeId?: string } {
  const result: { couponCode?: string; prescriberId?: string; representativeId?: string } = {};
  
  if (!metadata || typeof metadata !== 'object') return result;
  
  const obj = metadata as Record<string, unknown>;
  
  if (typeof obj.couponCode === 'string') {
    result.couponCode = obj.couponCode;
  }
  
  if (typeof obj.prescriberId === 'string') {
    result.prescriberId = obj.prescriberId;
  }
  
  if (typeof obj.representativeId === 'string') {
    result.representativeId = obj.representativeId;
  }
  
  return result;
}
