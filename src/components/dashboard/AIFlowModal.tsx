"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Send, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/utils/cn";
import { AI_CONFIG, DYNAMIC_AI_CONFIG } from "@/config/ai";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (json: string) => Promise<void>;
}

interface Message {
  role: "user" | "assistant" | "function";
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `
Você é o assistente virtual do **TACO – Task Companion**, um sistema especializado em criar **fluxos interativos** passo a passo.

Sua função é transformar descrições em um JSON válido que pode ser importado diretamente no sistema. **Siga estas etapas SEMPRE**, e **nunca mude a estrutura definida**.

---

### 🧠 1. ENTENDIMENTO
Quando o usuário pedir para criar um fluxo, você deve:

- Compreender claramente o objetivo do fluxo.
- Identificar o **título**, os **passos** (e seus tipos) e as **ligações** entre eles.
- Confirmar se há passos do tipo:
  - 📄 **TEXT**: exibe um texto.
  - ❓ **QUESTION**: possui opções com destino.
  - 🎥 **MEDIA**: mostra uma imagem ou vídeo do YouTube.
  - 🧩 **CUSTOM**: usa HTML/CSS/JS (via \`componentId\`).
  - 🌐 **WEBHOOK**: executa uma URL com método.

---

### 📋 2. RESUMO PRÉVIO (antes de gerar o JSON)
Antes de gerar o JSON final, **liste todos os passos** em texto para o usuário revisar.

**Exemplo de resumo**:

**Fluxo: Como configurar o roteador**
1. 📄 **Boas-vindas** – Bem-vindo ao tutorial!
2. ❓ **Modelo do roteador** – Qual o modelo?
   • TP-Link → vai para 3  
   • Intelbras → vai para 4
3. 📄 **Instruções TP-Link** – Instruções para configurar o roteador TP-Link.
4. 🎥 **Tutorial Intelbras** – tipo: YouTube, URL: https://youtu.be/JxTq47bbx4g
5. 🧩 **Painel** – usa componente visual personalizado (componentId: xyz123)

Em seguida, pergunte:
**“Está correto?”**

---

### 🧾 3. JSON FINAL (somente após confirmação)
Ao receber a confirmação, gere o JSON chamando a função \`generate_flow\` com o objeto completo como argumento.

Use exatamente este schema:

\`\`\`json
{
  "version": "1.1",
  "exportedAt": <timestamp_ms>,
  "flows": [
    {
      "title": <string>,
      "status": "DRAFT",
      "steps": [
        {
          "id": <string>,
          "order": <number>,
          "type": "TEXT" | "QUESTION" | "MEDIA" | "CUSTOM" | "WEBHOOK",
          "title": <string>,
          "content": <string>,
          "options": [ // apenas para QUESTION
            {
              "id": <string>,
              "label": <string>,
              "targetStepId": <string>
            }
          ],
          "nextStepId": <string>, // apenas para TEXT, MEDIA, CUSTOM, WEBHOOK
          "mediaType": "image" | "youtube", // apenas para MEDIA
          "mediaUrl": <string>, // apenas para MEDIA
          "componentId": <string>, // apenas para CUSTOM
          "method": "GET" | "POST", // apenas para WEBHOOK
          "url": <string> // apenas para WEBHOOK
        }
      ],
      "networkGraph": [
        { "source": <stepId>, "target": <stepId> }
      ],
      "visits": 0,
      "completions": 0,
      "updatedAt": <timestamp_ms>
    }
  ],
  "components": [
    {
      "id": <string>,
      "name": <string>,
      "html": <string>,
      "css": <string>,
      "js": <string>
    }
  ]
}
\`\`\`

---

### 🧩 4. EXEMPLO DE COMPONENTE CUSTOM
Se o fluxo tiver um passo com \`componentId\`, inclua o objeto correspondente em \`components\`.

**Exemplo de passo com componente:**
\`\`\`json
{
  "order": 3,
  "type": "CUSTOM",
  "title": "Cartão interativo",
  "content": "Visual personalizado",
  "componentId": "rex-RhjN9GXk7IisOulSY",
  "nextStepId": "xyz456"
}
\`\`\`

**Componente correspondente:**
\`\`\`json
{
  "id": "rex-RhjN9GXk7IisOulSY",
  "name": "card",
  "html": "<div class='card'>Olá mundo</div>",
  "css": ".card { color: blue; }",
  "js": "console.log('Componente pronto')"
}
\`\`\`

---

### ✅ DICAS FINAIS
- Use **português simples e amigável**.
- Nunca gere o JSON antes da confirmação do usuário.
- Nunca altere a estrutura do JSON.
- Sempre garanta que o JSON tenha:
  - Um \`title\` válido
  - Pelo menos 1 passo com campos obrigatórios: \`order\`, \`title\`, \`type\`, \`content\`
  - Todos os passos encadeados corretamente (via \`options\`, \`nextStepId\` ou \`networkGraph\`)
- Evite pedir ou mostrar campos como \`id\` ao usuário leigo.
- Todos os \`id\`s devem ser únicos (gerados automaticamente).
- \`exportedAt\` e \`updatedAt\` devem ser timestamps (ex: Date.now()).
`.trim();

export default function AIFlowModal({ open, onOpenChange, onImport }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Olá! Sou seu assistente para criar fluxos interativos.\n\nDescreva o fluxo que você gostaria de criar e eu te ajudo a estruturá-lo passo a passo!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Olá! Sou seu assistente para criar fluxos interativos.\n\nDescreva o fluxo que você gostaria de criar e eu te ajudo a estruturá-lo passo a passo!",
        timestamp: new Date(),
      },
    ]);
  };

  async function send() {
    if (!input.trim() || loading) return;

    // Valida a configuração antes de prosseguir
    try {
      DYNAMIC_AI_CONFIG.validateConfig();
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ **Erro de Configuração**\n\n${
          error instanceof Error
            ? error.message
            : "Chave da API não configurada"
        }\n\nVerifique se o arquivo .env está configurado corretamente com VITE_GEMINI_API_KEY.`,
        timestamp: new Date(),
      };
      setMessages([...messages, errorMessage]);
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      // Obtém o modelo disponível com fallback automático
      const availableModel = await DYNAMIC_AI_CONFIG.getModel();

      // Adiciona mensagem informativa sobre o modelo sendo usado
      if (availableModel !== AI_CONFIG.MODEL) {
        const fallbackMessage: Message = {
          role: "assistant",
          content: `ℹ️ **Modelo alternativo ativado**\n\nO modelo ${AI_CONFIG.MODEL} não está disponível no momento. Usando ${availableModel} como alternativa.`,
          timestamp: new Date(),
        };
        setMessages([...newMessages, fallbackMessage]);
      }

      const contents = newMessages
        .filter((m) => m.role === "assistant" || m.role === "user")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const requestBody = {
        contents,
        tools: [
          {
            functionDeclarations: [
              {
                name: "generate_flow",
                description:
                  "Gera o JSON final de um fluxo Task Companion",
                parameters: {
                  type: "object",
                  properties: {
                    version: { type: "string", enum: ["1.1"] },
                    exportedAt: { type: "integer" },
                    flows: {
                      type: "array",
                      items: { type: "object" },
                    },
                    components: {
                      type: "array",
                      items: { type: "object" },
                    },
                  },
                  required: ["version", "exportedAt", "flows", "components"],
                },
              },
            ],
          },
        ],
        system_instruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: AI_CONFIG.getModelSpecificOptions(availableModel),
      };

      const apiKey = AI_CONFIG.API_KEY;
      if (!apiKey) {
        throw new Error("Chave da API não configurada");
      }

      const res = await fetch(
        `${AI_CONFIG.getGenerateContentUrl(availableModel)}?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];

      setIsTyping(false);

      const functionCallPart = parts.find(
        (part: { functionCall?: unknown }) => !!part.functionCall
      ) as { functionCall?: { args?: unknown; arguments?: unknown } } | undefined;

      if (functionCallPart?.functionCall) {
        const { functionCall } = functionCallPart;
        let rawArgs = functionCall.args ?? functionCall.arguments;

        if (typeof rawArgs === "string") {
          rawArgs = JSON.parse(rawArgs);
        }

        const args =
          typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {};
        const jsonString = JSON.stringify(args, null, 2);

        const assistantMessage: Message = {
          role: "assistant",
          content:
            "✅ **Fluxo gerado com sucesso!**\n\nO JSON foi criado e será importado automaticamente. Você pode revisar e editar o fluxo após a importação.",
          timestamp: new Date(),
        };

        setMessages([...newMessages, assistantMessage]);

        try {
          await onImport(jsonString);
          onOpenChange(false);
        } catch (error) {
          console.error("Erro ao importar fluxo:", error);
          setMessages([
            ...newMessages,
            assistantMessage,
            {
              role: "assistant",
              content:
                "❌ **Erro ao importar o fluxo.**\n\nO JSON gerado parece inválido ou houve um problema ao salvar. Tente novamente ou revise os dados.",
              timestamp: new Date(),
            },
          ]);
        }

        return;
      }

      const textPart = parts.find(
        (part: { text?: string }) => typeof part.text === "string"
      );

      const content =
        textPart?.text ?? "Desculpe, não consegui processar sua solicitação.";
      const assistantMessage: Message = {
        role: "assistant",
        content,
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error("Erro na requisição de IA:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "❌ **Erro de conexão**\n\nNão foi possível conectar com o serviço de IA. Verifique sua conexão e tente novamente.",
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full  max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Assistente TACO
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Criador de fluxos interativos
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="gap-2 bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
              Limpar
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 sm:px-6 px-0 ">
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <Card
                  className={cn(
                    "max-w-[80%] relative group",
                    message.role === "user"
                      ? "bg-[#e8e8e8] text-primary-foreground"
                      : "bg-muted/50"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          code(props: any) {
                            const { inline, className, children } = props;
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            const codeContent = String(children).replace(
                              /\n$/,
                              ""
                            );

                            if (!inline && match) {
                              return (
                                <div className="relative">
                                  <div className="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-md text-xs">
                                    <span>{match[1]}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                                      onClick={() =>
                                        copyToClipboard(codeContent, index)
                                      }
                                    >
                                      {copiedIndex === index ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={
                                      oneDark as {
                                        [key: string]: React.CSSProperties;
                                      }
                                    }
                                    language={match[1]}
                                    PreTag="div"
                                    className="!mt-0 !rounded-t-none"
                                    {...props}
                                  >
                                    {codeContent}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            }

                            return (
                              <code
                                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2 pl-4">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-2 pl-4">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold mb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold mb-2">
                              {children}
                            </h3>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold">
                              {children}
                            </strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <Badge variant="secondary" className="text-xs">
                        {message.timestamp.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Assistente está digitando...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        <div className="sm:p-4 p-3">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Descreva o fluxo que você quer criar ou tire suas dúvidas..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={loading}
            />
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              size="lg"
              className="px-6 gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              Pressione Enter para enviar, Shift+Enter para nova linha
            </span>
            <span>{input.length}/2000</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
