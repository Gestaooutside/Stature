import { OpenAI } from "openai";
import { promises as fs } from "fs";
import path from "path";
import { searchSimilarChunks, formatContextForPrompt } from "@/lib/services/vector-search";

// Initialize OpenAI client with OpenRouter base URL
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://duo-natural.com",
    "X-Title": "Duo Natural Chat",
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Extrai última mensagem do usuário para RAG
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

    // 1. BUSCA SEMÂNTICA: recupera chunks relevantes via RAG
    const relevantChunks = await searchSimilarChunks(lastUserMessage, 7);
    const ragContext = formatContextForPrompt(relevantChunks);

    // 2. Carrega system prompt base
    const promptPath = path.join(process.cwd(), "llm/prompts/system-prompt-sales.md");
    const promptContent = await fs.readFile(promptPath, "utf-8").catch(() => {
      return fs.readFile(path.join(process.cwd(), "duo/llm/prompts/system-prompt-sales.md"), "utf-8");
    });

    // 3. INJETA CONTEXTO RAG no system prompt
    // Contexto dinâmico recuperado é adicionado ao prompt base
    const enhancedSystemPrompt = `${promptContent}

---

${ragContext}

---

Agora responda à consulta do cliente de forma consultiva, empática e transformadora.
`;

    // 4. Prepara mensagens com system prompt enriquecido
    const completionMessages = [
      { role: "system", content: enhancedSystemPrompt },
      ...messages,
    ];

    // 5. Chama LLM com contexto RAG injetado
    const completion = await openai.chat.completions.create({
      model: process.env.CHAT_SALES_LLM_MODEL || "openai/gpt-4o-mini",
      messages: completionMessages,
      stream: true,
      temperature: 0.7,
    });

    // Create a ReadableStream from the OpenAI AsyncIterable
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

