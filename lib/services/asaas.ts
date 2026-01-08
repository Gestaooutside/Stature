// Serviço de integração com API Asaas para pagamentos
// Gerencia criação de cobranças PIX, Boleto e Cartão de Crédito

import { AsaasPaymentRequest, AsaasPaymentResponse, AsaasErrorResponse, AsaasPixResponse } from '@/lib/types/payment';

// Ambiente padrão: production (produção)
// Para usar sandbox, defina ASAAS_ENVIRONMENT=sandbox nas variáveis de ambiente
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'production';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Log do ambiente configurado na inicialização do módulo
console.log(`[Asaas] ====== CONFIGURAÇÃO DO AMBIENTE ======`);
console.log(`[Asaas] Ambiente: ${ASAAS_ENVIRONMENT}`);
console.log(`[Asaas] API Key configurada: ${ASAAS_API_KEY ? 'Sim (***' + ASAAS_API_KEY.slice(-4) + ')' : 'NÃO'}`);

/**
 * Retorna URL base da API Asaas conforme ambiente configurado
 */
function getAsaasBaseUrl(): string {
  const url = ASAAS_ENVIRONMENT === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
  console.log(`[Asaas] Base URL: ${url}`);
  return url;
}

interface FetchOptions extends RequestInit {
  path: string;
  searchParams?: URLSearchParams;
}

/**
 * Função genérica para requisições à API Asaas
 * Inclui logs detalhados de cada etapa para debug
 */
async function asaasFetch<T>(options: FetchOptions): Promise<T> {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[Asaas][${requestId}] ====== INÍCIO REQUISIÇÃO ======`);
  
  if (!ASAAS_API_KEY) {
    console.error(`[Asaas][${requestId}] ERRO: API Key não configurada`);
    throw new Error('API Key do Asaas não configurada');
  }

  const baseUrl = getAsaasBaseUrl();
  // Remove barra inicial do path para concatenação correta
  const cleanPath = options.path.startsWith('/') ? options.path.slice(1) : options.path;
  const fullUrl = `${baseUrl}/${cleanPath}`;
  const url = new URL(fullUrl);
  
  if (options.searchParams) {
    url.search = options.searchParams.toString();
  }

  console.log(`[Asaas][${requestId}] Método: ${options.method}`);
  console.log(`[Asaas][${requestId}] URL: ${url.toString()}`);
  
  // Log do payload (sem dados sensíveis)
  if (options.body) {
    try {
      const bodyObj = JSON.parse(options.body as string);
      // Remove dados sensíveis do log
      const safeBody = { ...bodyObj };
      if (safeBody.creditCard) {
        safeBody.creditCard = { 
          holderName: safeBody.creditCard.holderName,
          number: '****' + (safeBody.creditCard.number?.slice(-4) || ''),
          expiryMonth: safeBody.creditCard.expiryMonth,
          expiryYear: safeBody.creditCard.expiryYear,
          ccv: '***'
        };
      }
      console.log(`[Asaas][${requestId}] Payload:`, JSON.stringify(safeBody, null, 2));
    } catch {
      console.log(`[Asaas][${requestId}] Payload: [não é JSON válido]`);
    }
  }

  console.log(`[Asaas][${requestId}] Enviando requisição...`);
  const startTime = Date.now();

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
      ...(options.headers || {}),
    },
  });

  const duration = Date.now() - startTime;
  console.log(`[Asaas][${requestId}] Resposta recebida em ${duration}ms`);
  console.log(`[Asaas][${requestId}] Status: ${response.status} ${response.statusText}`);

  // Verifica se a resposta é JSON antes de tentar parsear
  const contentType = response.headers.get('content-type');
  console.log(`[Asaas][${requestId}] Content-Type: ${contentType}`);
  
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    console.error(`[Asaas][${requestId}] ERRO: Resposta não-JSON`);
    console.error(`[Asaas][${requestId}] Corpo (primeiros 500 chars):`, text.substring(0, 500));
    throw new Error(`Erro na API Asaas: resposta inesperada (status ${response.status}). Verifique a configuração do ambiente.`);
  }

  const data = await response.json();
  console.log(`[Asaas][${requestId}] Resposta JSON:`, JSON.stringify(data, null, 2));
  
  if (!response.ok) {
    const error = data as AsaasErrorResponse;
    const errorMessage = error.errors?.[0]?.description || error.message || `Erro na API Asaas (${response.status})`;
    console.error(`[Asaas][${requestId}] ERRO na API:`, errorMessage);
    console.error(`[Asaas][${requestId}] Detalhes do erro:`, JSON.stringify(error, null, 2));
    throw new Error(errorMessage);
  }

  console.log(`[Asaas][${requestId}] ====== FIM REQUISIÇÃO (SUCESSO) ======`);
  return data as T;
}

/**
 * Cria pagamento no Asaas (PIX, Boleto ou Cartão de Crédito)
 * Para PIX: usa /payments e SEMPRE busca QR Code via endpoint dedicado
 */
export async function createAsaasPayment(payload: AsaasPaymentRequest): Promise<AsaasPaymentResponse> {
  console.log(`[Asaas] ====== CRIANDO PAGAMENTO ======`);
  console.log(`[Asaas] Tipo: ${payload.billingType}`);
  console.log(`[Asaas] Valor: R$ ${payload.value}`);
  console.log(`[Asaas] Cliente: ${payload.customer}`);
  
  // Usa /payments para todos os tipos (endpoint completo)
  const endpoint = '/payments';
  console.log(`[Asaas] Endpoint: ${endpoint}`);
  
  const response = await asaasFetch<AsaasPaymentResponse>({
    path: endpoint,
    method: 'POST',
    body: JSON.stringify(payload),
  });

  console.log(`[Asaas] Pagamento criado com ID: ${response.id}`);
  console.log(`[Asaas] Status: ${response.status}`);
  
  // Para PIX: SEMPRE busca o QR Code via endpoint dedicado
  // O ASAAS retorna o QR Code obrigatoriamente para pagamentos PIX
  if (payload.billingType === 'PIX') {
    console.log(`[Asaas] ====== BUSCANDO QR CODE PIX ======`);
    console.log(`[Asaas] Payment ID: ${response.id}`);
    
    // Verifica se já veio na resposta inicial (alguns casos)
    if ((response as any).pixQrCode) {
      const qrCode = (response as any).pixQrCode;
      console.log(`[Asaas] QR Code já presente na resposta inicial:`);
      console.log(`[Asaas]   - encodedImage: ${qrCode.encodedImage ? `SIM (${qrCode.encodedImage.length} chars)` : 'NÃO'}`);
      console.log(`[Asaas]   - payload: ${qrCode.payload ? `SIM (${qrCode.payload.length} chars)` : 'NÃO'}`);
      console.log(`[Asaas]   - expirationDate: ${qrCode.expirationDate || 'NÃO'}`);
    } else {
      // Busca via endpoint dedicado (forma garantida de obter o QR Code)
      console.log(`[Asaas] Buscando QR Code via GET /payments/${response.id}/pixQrCode`);
      
      const pixQrCode = await asaasFetch<AsaasPixResponse>({
        path: `/payments/${response.id}/pixQrCode`,
        method: 'GET',
      });
      
      console.log(`[Asaas] QR Code obtido com sucesso:`);
      console.log(`[Asaas]   - encodedImage: ${pixQrCode.encodedImage ? `SIM (${pixQrCode.encodedImage.length} chars)` : 'NÃO'}`);
      console.log(`[Asaas]   - payload: ${pixQrCode.payload ? `SIM (${pixQrCode.payload.length} chars)` : 'NÃO'}`);
      console.log(`[Asaas]   - expirationDate: ${pixQrCode.expirationDate || 'NÃO'}`);
      
      // Adiciona o QR Code à resposta
      (response as any).pixQrCode = pixQrCode;
    }
    
    // Validação final: QR Code é obrigatório para PIX
    const finalQrCode = (response as any).pixQrCode;
    console.log(`[Asaas] ====== VALIDAÇÃO FINAL PIX ======`);
    console.log(`[Asaas] pixQrCode presente: ${finalQrCode ? 'SIM' : 'NÃO'}`);
    
    if (!finalQrCode) {
      console.error(`[Asaas] ERRO CRÍTICO: QR Code não obtido para pagamento PIX!`);
      throw new Error('Não foi possível obter o QR Code PIX. Tente novamente.');
    }
    
    if (!finalQrCode.encodedImage || !finalQrCode.payload) {
      console.error(`[Asaas] ERRO: QR Code incompleto!`);
      console.error(`[Asaas]   - encodedImage: ${finalQrCode.encodedImage ? 'presente' : 'AUSENTE'}`);
      console.error(`[Asaas]   - payload: ${finalQrCode.payload ? 'presente' : 'AUSENTE'}`);
      throw new Error('QR Code PIX incompleto. Tente novamente.');
    }
    
    console.log(`[Asaas] QR Code PIX validado com sucesso!`);
    console.log(`[Asaas] Estrutura final:`, JSON.stringify({
      encodedImageLength: finalQrCode.encodedImage.length,
      payloadLength: finalQrCode.payload.length,
      expirationDate: finalQrCode.expirationDate,
    }, null, 2));
  }

  console.log(`[Asaas] ====== FIM CRIAÇÃO PAGAMENTO ======`);
  return response;
}

export async function getAsaasPayment(paymentId: string): Promise<AsaasPaymentResponse> {
  return asaasFetch<AsaasPaymentResponse>({
    path: `/payments/${paymentId}`,
    method: 'GET',
  });
}

export async function listAsaasPayments(params: Record<string, string>): Promise<{ data: AsaasPaymentResponse[] }> {
  const searchParams = new URLSearchParams(params);
  return asaasFetch<{ data: AsaasPaymentResponse[] }>({
    path: '/payments',
    method: 'GET',
    searchParams,
  });
}

