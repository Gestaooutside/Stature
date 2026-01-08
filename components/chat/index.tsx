"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import "./chat-animations.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useCartStore } from "@/lib/stores/cart-store";
import { PRODUCTS } from "@/lib/config/products";
import { usePathname } from "next/navigation";

// Tipos
interface DuoMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * Componente DuoChat - Agente de Vendas com IA
 */
export default function DuoChat() {
  // --- Estado ---
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  
  // Store do carrinho
  const { addItem, openCart } = useCartStore();

  // Mensagem inicial
  const initialMessage: DuoMessage = {
    id: "welcome",
    text: "Olá :) tudo bem?\n\nMuito prazer, sou do time de acolhimento e suporte da DUO. Estou à sua disposição.\n\nCaso prefira, você pode entrar em [contato via nosso whatsapp](https://wa.me/5561993168859).\n*Respostas no WhatsApp podem levar até 24h.*\n\nComo eu posso te ajudar por aqui hoje?",
    sender: "bot",
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<DuoMessage[]>([initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Efeitos ---

  // Detectar montagem no cliente
  useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("duo-chat-history-v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        const rehydratedMessages = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        if (rehydratedMessages.length > 0) {
          setMessages(rehydratedMessages);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar histórico do chat", e);
    }
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (isClient && messages.length > 0) {
      localStorage.setItem("duo-chat-history-v3", JSON.stringify(messages));
    }
  }, [messages, isClient]);

  // Scroll automático
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focar no input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) {
    return null;
  }

  // --- Lógica de Negócio ---

  const handleAction = (action: string, id: string, label?: string) => {
    if (action === "COMPRAR_AGORA") {
      const normalizedId =
        id === "KIT" || id === "KIT_COMPLETO" || id === "kit" || id === "kit-completo"
          ? "duo-completo"
          : id;

      const product = PRODUCTS.find((p) => p.id === normalizedId);

      if (!product) {
        console.error("Produto não encontrado para CTA do chat:", normalizedId, label);
        return;
      }

      addItem(product, 1);
      openCart();
      setIsOpen(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText("");
    setIsLoading(true);

    const userMsg: DuoMessage = {
      id: Date.now().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date()
    };

    // Atualiza estado com mensagem do usuário
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      // Cria mensagem temporária do bot para streaming
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: DuoMessage = {
        id: botMsgId,
        text: "", // Começa vazia
        sender: "bot",
        timestamp: new Date(),
        isLoading: true
      };
      
      setMessages(prev => [...prev, botMsg]);

      // Prepara histórico para API
      const apiMessages = newMessages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error("Erro na API");
      if (!response.body) throw new Error("Sem resposta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        // Atualiza mensagem do bot em tempo real
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: streamedText, isLoading: false } 
              : msg
          )
        );
      }
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Remove mensagem de erro ou mostra aviso
      setMessages(prev => prev.filter(m => m.text !== "")); // Remove msg vazia se falhou
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialMessage]);
    localStorage.removeItem("duo-chat-history-v3");
  };

  // Renderizador customizado de conteúdo
  const renderContent = (text: string) => {
    // Regex para encontrar botões: [BUTTON:ACTION:ID:LABEL]
    const parts = text.split(/(\[BUTTON:[^:]+:[^:]+:[^\]]+\])/g);

    return parts.map((part, index) => {
      const match = part.match(/\[BUTTON:([^:]+):([^:]+):([^\]]+)\]/);
      
      if (match) {
        const [, action, id, label] = match;
        return (
          <button
            key={index}
            onClick={() => handleAction(action.trim(), id.trim(), label)}
            className="block w-full mt-2 mb-2 bg-[#8d7f72] hover:bg-[#7a6d61] text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
          >
            {label}
          </button>
        );
      }

      // Renderiza Markdown para o texto normal
      return (
        <ReactMarkdown 
          key={index} 
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            a: ({node, ...props}) => <a className="text-[#8d7f72] underline hover:text-[#7a6d61]" target="_blank" rel="noopener noreferrer" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
            strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
            table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full text-xs border-collapse" {...props} /></div>,
            th: ({node, ...props}) => <th className="border border-gray-200 bg-gray-50 p-1 font-semibold" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-200 p-1" {...props} />,
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  if (!isClient) return null;

  return (
    <div 
      className="duo-chat-root" 
      style={{ 
        position: 'fixed', 
        zIndex: 99999,
        bottom: 0,
        right: 0,
        pointerEvents: 'none'
      }}
    >
      <div className="absolute bottom-6 right-6 flex flex-col items-end pointer-events-auto gap-4">
        
        {/* Janela do Chat */}
        {isOpen && (
          <div 
            className={cn(
              "w-[350px] sm:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#dad7ce]",
              "flex flex-col transition-all duration-300 origin-bottom-right",
              "animate-in slide-in-from-bottom-5 fade-in duration-300"
            )}
            style={{
              maxHeight: 'min(600px, 80vh)',
              height: '500px'
            }}
          >
            {/* Header */}
            <div className="bg-[#8d7f72] p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-white/10">
                    <img src="/chat-profile.jpg" alt="Atendente" className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                    }} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#8d7f72]"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Consultor DUO</h3>
                  <p className="text-white/80 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online agora
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button 
                  onClick={handleClearChat}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Limpar conversa"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Lista de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex max-w-[85%]",
                    msg.sender === 'user' ? "ml-auto justify-end" : "mr-auto"
                  )}
                >
                  <div 
                    className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.sender === 'user' 
                        ? "bg-[#8d7f72] text-white rounded-tr-none" 
                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                    )}
                  >
                    {renderContent(msg.text)}
                    <div className={cn(
                      "text-[10px] mt-1 opacity-70 text-right",
                      msg.sender === 'user' ? "text-white" : "text-gray-400"
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Indicador de Digitação (apenas se não estiver fazendo stream da msg) */}
              {isLoading && messages[messages.length - 1]?.text === "" && (
                <div className="flex mr-auto max-w-[85%]">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-gray-200 focus-within:border-[#8d7f72] focus-within:ring-1 focus-within:ring-[#8d7f72]/20 transition-all"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="p-1.5 bg-[#8d7f72] text-white rounded-full hover:bg-[#7a6d61] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Botão Flutuante */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95",
            "bg-gradient-to-br from-[#8d7f72] to-[#a89a8d] text-white border-2 border-white/20",
            "hover:shadow-2xl hover:shadow-[#8d7f72]/40"
          )}
          aria-label={isOpen ? "Fechar chat" : "Abrir chat"}
        >
          {isOpen ? (
            <X size={24} className="animate-in spin-in-90 duration-300" />
          ) : (
            <>
              <MessageCircle size={28} className="animate-in zoom-in duration-300" />
              {/* Notification Badge - mostra só se tiver fechado e sem mensagens lidas recentemente, mas por simplificação deixamos sem ou estático */}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

