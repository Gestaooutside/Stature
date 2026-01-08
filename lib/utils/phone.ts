/**
 * Utilitários para formatação de telefone e geração de links WhatsApp
 * Centraliza toda a lógica de manipulação de números de telefone
 */

export interface CountryInfo {
  code: string;
  name: string;
  dial: string;
  flag: string;
  placeholder: string;
  digitsLength: number;
}

/**
 * Lista de códigos de países suportados
 * Ordenados por relevância para o mercado brasileiro
 */
export const COUNTRY_CODES: CountryInfo[] = [
  { code: 'BR', name: 'Brasil', dial: '+55', flag: '🇧🇷', placeholder: '(11) 99999-9999', digitsLength: 11 },
  { code: 'US', name: 'EUA', dial: '+1', flag: '🇺🇸', placeholder: '(555) 555-5555', digitsLength: 10 },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', placeholder: '912 345 678', digitsLength: 9 },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷', placeholder: '(11) 1234-5678', digitsLength: 10 },
  { code: 'ES', name: 'Espanha', dial: '+34', flag: '🇪🇸', placeholder: '612 34 56 78', digitsLength: 9 },
  { code: 'MX', name: 'México', dial: '+52', flag: '🇲🇽', placeholder: '55 1234 5678', digitsLength: 10 },
  { code: 'CO', name: 'Colômbia', dial: '+57', flag: '🇨🇴', placeholder: '312 345 6789', digitsLength: 10 },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱', placeholder: '9 1234 5678', digitsLength: 9 },
  { code: 'UY', name: 'Uruguai', dial: '+598', flag: '🇺🇾', placeholder: '94 123 456', digitsLength: 8 },
  { code: 'PY', name: 'Paraguai', dial: '+595', flag: '🇵🇾', placeholder: '981 123 456', digitsLength: 9 },
];

/**
 * Remove todos os caracteres não-numéricos de uma string de telefone
 * @param phone - Número de telefone com formatação
 * @returns String contendo apenas dígitos
 * 
 * @example
 * sanitizePhoneNumber('(11) 99999-9999') // '11999999999'
 * sanitizePhoneNumber('+55 11 99999-9999') // '5511999999999'
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Formata número de telefone para exibição ao usuário
 * Aplica formatação específica de cada país
 * @param countryCode - Código do país (ex: 'BR', 'US')
 * @param phone - Número de telefone (pode conter formatação)
 * @returns Telefone formatado para exibição (ex: '+55 (11) 99999-9999')
 */
export function formatPhoneForDisplay(countryCode: string, phone: string): string {
  const numbers = sanitizePhoneNumber(phone);
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  
  if (!country) {
    return `+${numbers}`;
  }

  // Remove código do país se presente no número
  const dialNumbers = country.dial.replace('+', '');
  const localNumber = numbers.startsWith(dialNumbers) 
    ? numbers.slice(dialNumbers.length) 
    : numbers;

  // Formatação específica por país
  switch (countryCode) {
    case 'BR':
      // Formato: +55 (11) 99999-9999
      if (localNumber.length >= 11) {
        return `${country.dial} (${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7, 11)}`;
      } else if (localNumber.length >= 10) {
        return `${country.dial} (${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6, 10)}`;
      }
      break;
    
    case 'US':
      // Formato: +1 (555) 555-5555
      if (localNumber.length >= 10) {
        return `${country.dial} (${localNumber.slice(0, 3)}) ${localNumber.slice(3, 6)}-${localNumber.slice(6, 10)}`;
      }
      break;
    
    case 'PT':
    case 'ES':
      // Formato: +351 912 345 678
      if (localNumber.length >= 9) {
        return `${country.dial} ${localNumber.slice(0, 3)} ${localNumber.slice(3, 6)} ${localNumber.slice(6, 9)}`;
      }
      break;
    
    default:
      // Formato genérico
      return `${country.dial} ${localNumber}`;
  }

  // Fallback se não há dígitos suficientes
  return `${country.dial} ${localNumber}`;
}

/**
 * Formata número para uso em URL do WhatsApp
 * Remove todos os caracteres especiais, mantendo apenas números
 * @param countryCode - Código do país (ex: 'BR')
 * @param phone - Número de telefone
 * @returns String sem caracteres especiais (ex: '5511999999999')
 */
export function formatPhoneForWhatsApp(countryCode: string, phone: string): string {
  const numbers = sanitizePhoneNumber(phone);
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  
  if (!country) {
    return numbers;
  }

  const dialNumbers = country.dial.replace('+', '');
  
  // Adiciona código do país se não presente
  if (!numbers.startsWith(dialNumbers)) {
    return `${dialNumbers}${numbers}`;
  }
  
  return numbers;
}

/**
 * Gera link completo para WhatsApp
 * @param countryCode - Código do país (ex: 'BR')
 * @param phone - Número de telefone
 * @param message - Mensagem opcional pré-preenchida
 * @returns URL completa do WhatsApp (ex: 'https://wa.me/5511999999999?text=Olá')
 */
export function generateWhatsAppLink(
  countryCode: string, 
  phone: string, 
  message?: string
): string {
  const formattedPhone = formatPhoneForWhatsApp(countryCode, phone);
  const baseUrl = `https://wa.me/${formattedPhone}`;
  
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  
  return baseUrl;
}

/**
 * Retorna placeholder de telefone apropriado para o país
 * @param countryCode - Código do país (ex: 'BR')
 * @returns Placeholder formatado (ex: '(11) 99999-9999')
 */
export function getPlaceholderForCountry(countryCode: string): string {
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  return country?.placeholder || '(00) 00000-0000';
}

/**
 * Encontra país pelo código de discagem
 * @param dial - Código de discagem (ex: '+55')
 * @returns Informações do país ou undefined
 */
export function findCountryByDial(dial: string): CountryInfo | undefined {
  return COUNTRY_CODES.find(c => c.dial === dial);
}

/**
 * Encontra país pelo código do país
 * @param code - Código do país (ex: 'BR')
 * @returns Informações do país ou undefined
 */
export function findCountryByCode(code: string): CountryInfo | undefined {
  return COUNTRY_CODES.find(c => c.code === code);
}

/**
 * Valida se um número de telefone tem quantidade mínima de dígitos
 * @param phone - Número de telefone
 * @param countryCode - Código do país (opcional, default 'BR')
 * @returns true se válido, false caso contrário
 */
export function isValidPhoneNumber(phone: string, countryCode = 'BR'): boolean {
  const numbers = sanitizePhoneNumber(phone);
  const country = COUNTRY_CODES.find(c => c.code === countryCode);
  
  if (!country) {
    return numbers.length >= 8; // Mínimo genérico
  }
  
  // Pode ter código do país ou não
  const dialNumbers = country.dial.replace('+', '');
  const localNumber = numbers.startsWith(dialNumbers)
    ? numbers.slice(dialNumbers.length)
    : numbers;
  
  return localNumber.length >= country.digitsLength;
}

/**
 * Extrai código do país e número local de um telefone internacional
 * @param internationalPhone - Telefone no formato internacional (ex: '+5511999999999')
 * @returns Objeto com countryCode e localNumber
 */
export function parseInternationalPhone(internationalPhone: string): {
  countryCode: string;
  localNumber: string;
  country: CountryInfo | null;
} {
  const numbers = sanitizePhoneNumber(internationalPhone);
  
  // Tenta encontrar país pelo início do número
  for (const country of COUNTRY_CODES) {
    const dialNumbers = country.dial.replace('+', '');
    if (numbers.startsWith(dialNumbers)) {
      return {
        countryCode: country.code,
        localNumber: numbers.slice(dialNumbers.length),
        country,
      };
    }
  }
  
  // Fallback para Brasil
  return {
    countryCode: 'BR',
    localNumber: numbers,
    country: COUNTRY_CODES[0],
  };
}
