// API route para gerenciar chaves Pix no Asaas
// Verifica se existe chave Pix ativa e cria se necessário

import { NextRequest, NextResponse } from 'next/server';
import {
  AsaasPixKeysResponse,
  AsaasPixKeyRequest,
  AsaasPixKeyResponse,
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
  console.log(`[Pix Key API] Ambiente: ${ASAAS_ENVIRONMENT}`);
  console.log(`[Pix Key API] URL: ${url}`);
  return url;
}

/**
 * GET - Verifica se existe chave Pix ativa na conta
 * Retorna informações sobre disponibilidade do Pix
 */
export async function GET(request: NextRequest) {
  try {
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

    // Busca chaves Pix cadastradas na conta
    const response = await fetch(`${asaasUrl}/pix/addressKeys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as AsaasErrorResponse;

      // Se erro 403, conta não está aprovada para Pix
      if (response.status === 403) {
        return NextResponse.json(
          {
            available: false,
            reason: 'ACCOUNT_NOT_APPROVED',
            message: 'Sua conta Asaas precisa estar aprovada para usar Pix',
            details: errorData.errors?.[0]?.description || errorData.message,
          },
          { status: 200 } // Retorna 200 porque a verificação foi bem-sucedida
        );
      }

      // Outros erros
      return NextResponse.json(
        {
          available: false,
          reason: 'API_ERROR',
          message: 'Erro ao verificar chaves Pix',
          details: errorData.errors?.[0]?.description || errorData.message,
        },
        { status: 200 }
      );
    }

    const data = (await response.json()) as AsaasPixKeysResponse;

    // Verifica se existe pelo menos uma chave ATIVA
    const activeKey = data.data?.find((key) => key.status === 'ACTIVE');

    if (activeKey) {
      return NextResponse.json({
        available: true,
        hasActiveKey: true,
        key: {
          id: activeKey.id,
          type: activeKey.type,
          addressKey: activeKey.addressKey,
          status: activeKey.status,
        },
      });
    }

    // Existe chave mas não está ativa
    const pendingKey = data.data?.[0];
    if (pendingKey) {
      return NextResponse.json({
        available: false,
        hasActiveKey: false,
        reason: 'KEY_PENDING_ACTIVATION',
        message: 'Chave Pix aguardando ativação',
        key: {
          id: pendingKey.id,
          type: pendingKey.type,
          status: pendingKey.status,
        },
      });
    }

    // Não existe nenhuma chave cadastrada
    return NextResponse.json({
      available: false,
      hasActiveKey: false,
      reason: 'NO_KEY_REGISTERED',
      message: 'Nenhuma chave Pix cadastrada',
    });
  } catch (error) {
    console.error('Erro ao verificar chave Pix:', error);
    return NextResponse.json(
      {
        available: false,
        reason: 'INTERNAL_ERROR',
        message: 'Erro ao verificar disponibilidade do Pix',
      },
      { status: 200 } // Retorna 200 para não quebrar o frontend
    );
  }
}

/**
 * POST - Cria uma nova chave Pix do tipo EVP (aleatória)
 * Útil para automação de setup da conta
 */
export async function POST(request: NextRequest) {
  try {
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

    // Cria chave Pix do tipo EVP (chave aleatória)
    const pixKeyData: AsaasPixKeyRequest = {
      type: 'EVP',
    };

    const response = await fetch(`${asaasUrl}/pix/addressKeys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
      },
      body: JSON.stringify(pixKeyData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as AsaasErrorResponse;

      // Tratamento de erros específicos
      const errorMessage =
        errorData.errors?.[0]?.description ||
        errorData.message ||
        'Erro ao criar chave Pix';

      // Se erro 403, conta não aprovada
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'Conta não aprovada',
            message: 'Sua conta Asaas precisa estar aprovada para criar chaves Pix',
            details: errorMessage,
          },
          { status: 403 }
        );
      }

      // Se erro 429, limite de taxa excedido (deve aguardar 1 minuto)
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Limite excedido',
            message: 'Aguarde 1 minuto antes de criar outra chave Pix',
            details: errorMessage,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: 'Erro ao criar chave',
          message: errorMessage,
          details: errorData.errors,
        },
        { status: response.status }
      );
    }

    const keyResponse = data as AsaasPixKeyResponse;

    return NextResponse.json(
      {
        success: true,
        message: 'Chave Pix criada com sucesso',
        key: {
          id: keyResponse.id,
          type: keyResponse.type,
          addressKey: keyResponse.addressKey,
          status: keyResponse.status,
          dateCreated: keyResponse.dateCreated,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar chave Pix:', error);
    return NextResponse.json(
      {
        error: 'Erro interno',
        message: 'Erro ao processar requisição',
      },
      { status: 500 }
    );
  }
}
