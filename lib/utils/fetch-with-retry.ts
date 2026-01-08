// Função utilitária de fetch com retry e exponential backoff
// Melhora resiliência a falhas de rede temporárias

interface FetchWithRetryOptions {
  /** Número máximo de tentativas (padrão: 3) */
  maxRetries?: number;
  /** Delay inicial em ms (padrão: 1000) */
  initialDelay?: number;
  /** Fator de multiplicação do delay (padrão: 2) */
  backoffFactor?: number;
  /** Delay máximo em ms (padrão: 10000) */
  maxDelay?: number;
  /** Códigos de status que devem fazer retry (padrão: 408, 429, 500, 502, 503, 504) */
  retryOnStatus?: number[];
  /** Callback chamado em cada retry */
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: Required<FetchWithRetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
  onRetry: () => {},
};

/**
 * Verifica se o erro é de rede (offline, timeout, etc)
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // Erros comuns de rede
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('aborted')
    );
  }
  return false;
}

/**
 * Aguarda um tempo especificado
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calcula delay com exponential backoff e jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffFactor: number,
  maxDelay: number
): number {
  // Exponential backoff
  const exponentialDelay = initialDelay * Math.pow(backoffFactor, attempt - 1);
  
  // Aplica limite máximo
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Adiciona jitter (0-25% de variação) para evitar thundering herd
  const jitter = cappedDelay * Math.random() * 0.25;
  
  return cappedDelay + jitter;
}

/**
 * Fetch com retry automático e exponential backoff
 * Faz retry em erros de rede e códigos de status específicos
 * 
 * @param url - URL da requisição
 * @param init - Opções do fetch (body, headers, etc)
 * @param options - Opções de retry
 * @returns Response do fetch
 * @throws Error após esgotar tentativas
 */
export async function fetchWithRetry(
  url: string | URL | Request,
  init?: RequestInit,
  options?: FetchWithRetryOptions
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  let lastError: Error = new Error('Falha na requisição');
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, init);
      
      // Verifica se o status indica que deve fazer retry
      if (config.retryOnStatus.includes(response.status)) {
        if (attempt < config.maxRetries) {
          const retryDelay = calculateDelay(
            attempt,
            config.initialDelay,
            config.backoffFactor,
            config.maxDelay
          );
          
          const statusError = new Error(`Status ${response.status}`);
          config.onRetry(attempt, statusError);
          
          await delay(retryDelay);
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Só faz retry em erros de rede
      if (isNetworkError(error) && attempt < config.maxRetries) {
        const retryDelay = calculateDelay(
          attempt,
          config.initialDelay,
          config.backoffFactor,
          config.maxDelay
        );
        
        config.onRetry(attempt, lastError);
        
        await delay(retryDelay);
        continue;
      }
      
      throw lastError;
    }
  }
  
  throw lastError;
}

/**
 * Verifica se o navegador está online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Espera até que o navegador esteja online
 * @param timeout - Tempo máximo de espera em ms (padrão: 30000)
 */
export function waitForOnline(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', handleOnline);
      reject(new Error('Timeout aguardando conexão'));
    }, timeout);

    const handleOnline = () => {
      clearTimeout(timeoutId);
      resolve();
    };

    window.addEventListener('online', handleOnline, { once: true });
  });
}

