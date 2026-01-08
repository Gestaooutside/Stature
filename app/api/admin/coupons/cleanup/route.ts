import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Executa a limpeza das descrições
    const result = await db.execute(`
      UPDATE coupons
      SET description =
        CASE
          WHEN description LIKE '%(cópia)' THEN
            TRIM(TRAILING ' ' FROM REGEXP_REPLACE(description, '\\s*\\(cópia\\)\\s*$', ''))
          WHEN description LIKE '%(cópia)%' THEN
            REPLACE(description, '(cópia)', '')
          ELSE
            description
        END
      WHERE description LIKE '%(cópia)%'
    `);

    // Conta quantos registros foram afetados
    const countResult = await db.execute(`
      SELECT COUNT(*) as count FROM coupons WHERE description LIKE '%(cópia)%'
    `);

    const remainingCount = countResult.rows[0]?.count || 0;

    return NextResponse.json({
      success: true,
      message: `Limpeza executada com sucesso. Restam ${remainingCount} cupons com "(cópia)" na descrição.`,
      cleanedCount: result.rowsAffected || 0
    });
  } catch (error) {
    console.error('Erro ao limpar descrições de cupons:', error);
    return NextResponse.json(
      { error: 'Erro interno ao executar limpeza' },
      { status: 500 }
    );
  }
}