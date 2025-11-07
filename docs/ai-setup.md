# Configuração da IA - OpenAI GPT-4o Mini

Este documento explica como configurar e usar a integração com a **OpenAI** no Task Companion.

## Visão Geral

O assistente utiliza a família de modelos **GPT-4o** para:

- Criar fluxos interativos com base em descrições em linguagem natural
- Sugerir ajustes nos passos antes da geração do JSON final
- Gerar automaticamente um JSON válido para importação

O modelo padrão é o `gpt-4o-mini`, otimizado para respostas rápidas com ótimo custo-benefício. Se ele não estiver disponível, o sistema tenta outros modelos compatíveis automaticamente.

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

if (AI_CONFIG.isConfigured) {
  console.log("IA configurada com sucesso!");
} else {
  console.log("Chave da API não encontrada");
}
```

## Modelos disponíveis

| Ordem | Modelo         | Uso recomendado                              |
|-------|----------------|----------------------------------------------|
| 1     | `gpt-4o-mini`  | Respostas rápidas e econômicas               |
| 2     | `gpt-4.1-mini` | Alternativa estável com mesmo estilo         |
| 3     | `gpt-4o`       | Respostas mais ricas em contexto multimodal  |
| 4     | `gpt-4.1`      | Respostas extensas e de alta precisão        |

O fallback é realizado automaticamente seguindo a ordem acima.

## Uso no código

### Fluxo padrão

```typescript
import { AI_CONFIG, DYNAMIC_AI_CONFIG } from "@/config/ai";

const model = await DYNAMIC_AI_CONFIG.getModel();
const response = await fetch(AI_CONFIG.getChatCompletionsUrl(), {
  method: "POST",
  headers: AI_CONFIG.REQUEST_HEADERS,
  body: JSON.stringify({
    model,
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
    ...AI_CONFIG.getModelSpecificOptions(model),
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

## Configurações avançadas

- `AI_CONFIG.DEFAULT_OPTIONS` aplica parâmetros globais (`temperature`, `top_p`, `max_tokens`)
- `AI_CONFIG.getModelSpecificOptions(model)` ajusta automaticamente os valores para cada modelo
- `AI_DEBUG.testConnection()` verifica se a chave consegue acessar o endpoint `/models`

## Troubleshooting

| Problema                                         | Possível causa / solução                                             |
|--------------------------------------------------|----------------------------------------------------------------------|
| "Chave da API não configurada"                   | Verifique se `VITE_OPENAI_API_KEY` está definido no `.env`           |
| Status 401 ao chamar a API                       | Chave inválida ou revogada. Gere uma nova chave                      |
| Status 403 ao chamar a API                       | Conta sem permissão para o recurso. Confira o painel da OpenAI       |
| Modelo não encontrado (`404`)                    | O modelo pode não estar disponível para sua conta                    |
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
