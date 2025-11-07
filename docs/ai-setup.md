# Configuração da IA - OpenAI GPT-5 Mini

Este documento explica como configurar e usar a integração com a **OpenAI** no Task Companion.

## Visão Geral

O assistente utiliza por padrão o modelo **GPT-5 Mini** para:

- Criar fluxos interativos com base em descrições em linguagem natural
- Sugerir ajustes nos passos antes da geração do JSON final
- Gerar automaticamente um JSON válido para importação

O modelo padrão é o `gpt-5-mini`, otimizado para respostas rápidas com ótimo custo-benefício. Mantivemos somente esse modelo como padrão para simplificar o funcionamento e reduzir pontos de falha.

## Configuração

### 1. Obter uma chave de API OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login com a conta que possui acesso à plataforma
3. Clique em **Create new secret key** (ou gere uma nova chave)
4. Copie o valor exibido (formato `sk-...`)

### 2. Definir as variáveis de ambiente

Crie (ou atualize) o arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_OPENAI_API_KEY=sk-...sua-chave-aqui...
# Opcional: defina sua organização ou projeto
# VITE_OPENAI_ORG=org-...
# VITE_OPENAI_PROJECT=proj-...
```

### 3. Verificar a configuração

O sistema valida automaticamente a presença da chave. Você pode checar manualmente usando:

```typescript
import { AI_CONFIG } from "@/config/ai";

if (AI_CONFIG.isConfigured()) {
  console.log("IA configurada com sucesso!");
} else {
  console.log("Chave da API não encontrada");
}
```

## Modelo disponível

Para reduzir a complexidade e evitar falhas de fallback, utilizamos apenas o modelo `gpt-5-mini`. Caso queira experimentar outro modelo da OpenAI, basta editar o valor de `AI_CONFIG.MODEL` no arquivo `src/config/ai.ts`.

## Uso no código

### Fluxo padrão

```typescript
import { AI_CONFIG } from "@/config/ai";

const response = await fetch(AI_CONFIG.getChatCompletionsUrl(), {
  method: "POST",
  headers: AI_CONFIG.getRequestHeaders(),
  body: JSON.stringify({
    model: AI_CONFIG.MODEL,
    messages: [
      { role: "system", content: "Você é um assistente que gera fluxos Task Companion." },
      { role: "user", content: "Descreva o fluxo desejado" },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "generate_flow",
          description: "Gera o JSON final de um fluxo Task Companion",
          parameters: { type: "object", properties: { ... } },
        },
      },
    ],
    temperature: 0.6,
    top_p: 0.9,
    max_tokens: 3000,
  }),
});

const data = await response.json();
```

### Ferramentas (function calling)

O assistente usa **function calling** da OpenAI para devolver o JSON final. A configuração enviada inclui:

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "generate_flow",
        "description": "Gera o JSON final de um fluxo Task Companion",
        "parameters": { "type": "object", "properties": { ... } }
      }
    }
  ]
}
```

Quando o modelo retorna `tool_calls`, o app importa o JSON automaticamente.

## Troubleshooting

| Problema                                         | Possível causa / solução                                             |
|--------------------------------------------------|----------------------------------------------------------------------|
| "Chave da API não configurada"                   | Verifique se `VITE_OPENAI_API_KEY` está definido no `.env`           |
| Status 401 ao chamar a API                       | Chave inválida ou revogada. Gere uma nova chave                      |
| Status 403 ao chamar a API                       | Conta sem permissão para o recurso. Confira o painel da OpenAI       |
| Modelo não encontrado (`404`)                    | Confirme se o modelo definido em `AI_CONFIG.MODEL` está liberado      |
| Resposta vazia ou sem tool call                  | O modelo pode ter optado por resposta textual; tente novamente       |

## Custos

Consulte a [página oficial de preços da OpenAI](https://openai.com/api/pricing/) para valores atualizados de cada modelo.

## Segurança

- Nunca versione o arquivo `.env`
- Em produção, considere criar um proxy backend para ocultar a chave
- Restrinja a chave no painel da OpenAI quando possível

## Suporte

- [Documentação OpenAI](https://platform.openai.com/docs)
- [Status da plataforma](https://status.openai.com/)
