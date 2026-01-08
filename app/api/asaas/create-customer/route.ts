// API route para criar cliente no Asaas
// Valida dados e envia para API do Asaas

import { NextRequest, NextResponse } from 'next/server';
import {
  AsaasCustomer,
  AsaasCustomerResponse,
  AsaasErrorResponse,
} from '@/lib/types/payment';

// Ambiente padrão: production
const ASAAS_ENVIRONMENT = process.env.ASAAS_ENVIRONMENT || 'production';

/**
 * Retorna URL base da API Asaas conforme ambiente
 */
function getAsaasApiUrl(): string {
  const url = ASAAS_ENVIRONMENT === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://sandbox.asaas.com/api/v3';
  console.log(`[Create Customer] Ambiente: ${ASAAS_ENVIRONMENT}, URL: ${url}`);
  return url;
}

/**
 * Valida CPF usando algoritmo de verificação de dígitos
 * Verifica se os dígitos verificadores estão corretos
 */
function validateCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;
  
  return true;
}

/**
 * Valida CNPJ usando algoritmo de verificação de dígitos
 * Verifica se os dígitos verificadores estão corretos
 */
function validateCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  
  // Rejeita CNPJs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;
  
  // Calcula primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cleaned[12])) return false;
  
  // Calcula segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cleaned[13])) return false;
  
  return true;
}

/**
 * Valida CPF/CNPJ usando algoritmo de verificação
 * Remove caracteres especiais e valida dígitos verificadores
 */
function validateCpfCnpj(cpfCnpj: string): boolean {
  const cleaned = cpfCnpj.replace(/[^\d]/g, '');
  
  if (cleaned.length === 11) {
    return validateCpf(cleaned);
  }
  
  if (cleaned.length === 14) {
    return validateCnpj(cleaned);
  }
  
  return false;
}

/**
 * Valida email
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST - Cria novo cliente no Asaas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validação de campos obrigatórios
    if (!body.name || !body.email || !body.cpfCnpj) {
      return NextResponse.json(
        {
          error: 'Campos obrigatórios faltando',
          message: 'Nome, email e CPF/CNPJ são obrigatórios',
        },
        { status: 400 }
      );
    }

    // Validação de formato
    if (!validateEmail(body.email)) {
      return NextResponse.json(
        {
          error: 'Email inválido',
          message: 'Formato de email inválido',
        },
        { status: 400 }
      );
    }

    if (!validateCpfCnpj(body.cpfCnpj)) {
      return NextResponse.json(
        {
          error: 'CPF/CNPJ inválido',
          message: 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos',
        },
        { status: 400 }
      );
    }

    // Prepara dados do cliente para Asaas
    const customerData: AsaasCustomer = {
      name: body.name,
      email: body.email,
      cpfCnpj: body.cpfCnpj.replace(/[^\d]/g, ''), // Remove formatação
      phone: body.phone?.replace(/[^\d]/g, ''),
      mobilePhone: body.mobilePhone?.replace(/[^\d]/g, ''),
      postalCode: body.postalCode?.replace(/[^\d]/g, ''),
      address: body.address,
      addressNumber: body.addressNumber,
      complement: body.addressComplement,
      province: body.province,
      externalReference: body.externalReference,
      notificationDisabled: false,
    };

    // Chama API do Asaas
    const apiKey = process.env.ASAAS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Configuração inválida',
          message: 'API Key do Asaas não configurada',
        },
        { status: 500 }
      );
    }

    const asaasUrl = getAsaasApiUrl();
    console.log(`[Asaas] POST ${asaasUrl}/customers`);
    
    const response = await fetch(`${asaasUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
      },
      body: JSON.stringify(customerData),
    });

    // Verifica se a resposta é JSON antes de tentar parsear
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error(`[Asaas] Resposta não-JSON (${response.status}):`, text.substring(0, 200));
      return NextResponse.json(
        {
          error: 'Erro na API Asaas',
          message: `Resposta inesperada (status ${response.status}). Verifique a configuração do ambiente.`,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Tratamento de erros da API Asaas
    if (!response.ok) {
      const errorData = data as AsaasErrorResponse;
      const errorMessage =
        errorData.errors?.[0]?.description ||
        errorData.message ||
        'Erro ao criar cliente';

      return NextResponse.json(
        {
          error: 'Erro ao criar cliente',
          message: errorMessage,
          details: errorData.errors,
        },
        { status: response.status }
      );
    }

    // Retorna dados do cliente criado
    const customerResponse = data as AsaasCustomerResponse;
    return NextResponse.json(customerResponse, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      {
        error: 'Erro interno',
        message: 'Erro ao processar requisição',
      },
      { status: 500 }
    );
  }
}
