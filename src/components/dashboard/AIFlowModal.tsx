import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (json: string) => Promise<void>;
}

const SYSTEM_PROMPT = `
Você é o assistente virtual do TACO – Task Companion, especializado em criar fluxos interativos.
Siga estas instruções sempre que o usuário pedir para criar um fluxo:

1) Entendimento
- Identifique título, passos (TEXT, QUESTION, MEDIA, CUSTOM, WEBHOOK) e navegação (nextStepId ou opções).

2) Resumo
- Sem JSON, liste em texto cada passo numerado:
  • Tipo, título, conteúdo.
  • Para QUESTION: opções e destinos.
  • Para MEDIA: tipo e URL.
  • Para CUSTOM/WEBHOOK: informe que usar componentId.

- Pergunte: "Está correto? Deseja ajustar algo?"

3) JSON final (apenas após confirmação)
- Use exatamente este schema (nenhuma variação):

\`\`\`json
{
  "version": "1.1",
  "exportedAt": <timestamp_ms>,
  "flows": [
    {
      "title": <string>,
      "status": "DRAFT",
      "steps": [ /* conforme tipagem detalhada */ ],
      "networkGraph": [ /* source/target */ ],
      "visits": 0,
      "completions": 0,
      "updatedAt": <timestamp_ms>
    }
  ],
  "components": [ /* lista de CUSTOM/WEBHOOK */ ]
}
\`\`\`

- Gerar UUID v4 para ids.
- Usar Date.now() para exportedAt e updatedAt.
- Enviar o JSON puro num único bloco \`\`\`json\`\`\` sem comentários.

Use sempre português simples e amigável.
`.trim();

export default function AIFlowModal({ open, onOpenChange, onImport }: Props) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant" | "function"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages,
          ],
          functions: [
            {
              name: "generate_flow",
              description: "Gera o JSON final de um fluxo Task Companion",
              parameters: {
                type: "object",
                properties: {
                  version: { type: "string", enum: ["1.1"] },
                  exportedAt: { type: "integer" },
                  flows: {
                    type: "array",
                    items: { type: "object" /* conforme schema acima */ },
                  },
                  components: {
                    type: "array",
                    items: { type: "object" /* conforme schema acima */ },
                  },
                },
                required: ["version", "exportedAt", "flows", "components"],
              },
            },
          ],
          function_call: "auto",
        }),
      });

      const data = await res.json();
      const msg = data.choices?.[0]?.message;

      // Se o modelo chamar nossa função, extraímos o JSON e importamos
      if (msg?.function_call) {
        const args = JSON.parse(msg.function_call.arguments);
        await onImport(JSON.stringify(args, null, 2));
        onOpenChange(false);
        setLoading(false);
        return;
      }

      // Caso contrário, exibimos a resposta como texto
      const content = msg?.content ?? "";
      setMessages([...newMessages, { role: "assistant", content }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Erro ao acessar o serviço de IA.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl">
        <DialogHeader>
          <DialogTitle>Criar fluxo com IA</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto py-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "text-right" : "text-left"}
            >
              <p
                className="whitespace-pre-wrap text-sm"
                dangerouslySetInnerHTML={{
                  __html:
                    m.role === "function"
                      ? `<pre>${m.content}</pre>`
                      : m.content,
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva o fluxo ou tire dúvidas"
            className="flex-1"
          />
          <Button onClick={send} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
