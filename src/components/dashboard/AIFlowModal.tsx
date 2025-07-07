import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (json: string) => Promise<void>;
}

const SYSTEM_PROMPT =
  [
    "Você é o assistente virtual do TACO – Task Companion.",
    "",
    "Ajude pessoas não técnicas a criarem fluxos interativos com passos dos tipos TEXT, QUESTION, MEDIA e CUSTOM.",
    "Responda dúvidas e incentive o usuário a descrever o processo que deseja documentar.",
    "",
    "Ao receber uma descrição, identifique as etapas necessárias e apresente-as numeradas em linguagem simples, sem exibir o JSON. Pergunte se prefere algo mais detalhado ou um resumo mais breve.",
    "",
    "Quando o usuário confirmar que o passo a passo está correto, avise que irá gerar o fluxo e somente então forneça o JSON final em um bloco de código, sem comentários, seguindo esta estrutura:",
    "",
    '{',
    '  "version": "1.0",',
    '  "exportedAt": 0,',
    '  "flow": {',
    '    "title": "Título do fluxo",',
    '    "description": "Opcional",',
    '    "status": "DRAFT",',
    '    "steps": [/* passos aqui */]',
    '  }',
    '}',
    "",
    "Use sempre uma linguagem amigável e acessível.",
  ].join("\n");

export default function AIFlowModal({ open, onOpenChange, onImport }: Props) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { role: "user" as const, content: input },
    ];
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
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      setMessages([...newMessages, { role: "assistant", content }]);

      const match = content.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        await onImport(match[1]);
        onOpenChange(false);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Erro ao acessar o serviço de IA." },
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
                dangerouslySetInnerHTML={{ __html: m.content }}
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
