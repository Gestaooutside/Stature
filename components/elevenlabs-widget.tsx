// "use client" - DESATIVADO TEMPORARIAMENTE
// import React, { useEffect, useState } from "react"
// import { usePathname } from "next/navigation"

// Integra o widget de voz da ElevenLabs como botão flutuante no site.
// Dependências: next/navigation para checar rotas e DOM API para injetar o script.
// TODO: Re-ligar widget ElevenLabs no futuro quando necessário

/**
 * Tipagem explícita do elemento customizado fornecido pelo embed da ElevenLabs.
 * TODO: Re-ligar widget ElevenLabs no futuro quando necessário
 */
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       "elevenlabs-convai": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
//         "agent-id": string
//       }
//     }
//   }
// }

// const WIDGET_SCRIPT_ID = "elevenlabs-convai-widget-script"

/**
 * ElevenLabsWidget - adiciona o widget de voz da ElevenLabs de forma elegante
 * e evita carregá-lo em áreas administrativas.
 * TODO: Re-ligar widget ElevenLabs no futuro quando necessário
 */
// export function ElevenLabsWidget() {
//   const pathname = usePathname()
//   const [isClient, setIsClient] = useState(false)

//   // Obtém agent ID da variável de ambiente
//   const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

//   // Garante que o componente só renderiza no client.
//   useEffect(() => {
//     setIsClient(true)
//   }, [])

//   // Injeta o script do widget apenas uma vez e ignora rotas administrativas.
//   // Segue documentação oficial: https://elevenlabs.io/docs/agents-platform/customization/widget
//   useEffect(() => {
//     if (!isClient) return
//     if (pathname?.startsWith("/admin")) return

//     const existingScript = document.getElementById(WIDGET_SCRIPT_ID)
//     if (existingScript) return

//     const script = document.createElement("script")
//     script.id = WIDGET_SCRIPT_ID
//     script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed"
//     script.async = true
//     script.type = "text/javascript"

//     document.body.appendChild(script)
//   }, [isClient, pathname])

//   if (!isClient || pathname?.startsWith("/admin") || !agentId) {
//     return null
//   }

//   return (
//     <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none">
//       <div className="pointer-events-auto shadow-lg rounded-full overflow-hidden">
//         <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>
//       </div>
//     </div>
//   )
// }
