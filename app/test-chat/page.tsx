"use client";

import DuoChat from "@/components/chat";

export default function TestChatPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          Teste do Componente Chat
        </h1>

        <p className="text-neutral-600 mb-8">
          Esta página serve para testar se o componente DuoChat está funcionando corretamente.
        </p>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Status do Componente:
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-neutral-700">Componente importado</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-neutral-700">Renderizado na página</span>
            </div>
          </div>
        </div>

        {/* Renderiza o componente do chat aqui */}
        <DuoChat />

        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-500">
            Verifique no canto inferior direito se o botão do chat aparece.
          </p>
        </div>
      </div>
    </div>
  );
}