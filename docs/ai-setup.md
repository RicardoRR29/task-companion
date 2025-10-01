# Configuração da IA - Gemini 2.5 Flash

Este documento explica como configurar e usar a integração com o **Google Gemini** no Task Companion.

## Visão Geral

O assistente utiliza os modelos da família **Gemini Flash/Pro** para:

- Criar fluxos interativos com base em descrições em linguagem natural
- Sugerir ajustes nos passos antes da geração do JSON final
- Gerar automaticamente um JSON válido para importação

O modelo padrão é o `gemini-2.5-flash`, otimizado para respostas rápidas com custo reduzido. Se ele não estiver disponível, o sistema tenta outros modelos compatíveis de forma automática.

## Configuração

### 1. Obter uma chave de API Gemini

1. Acesse [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Faça login com a conta Google que possui acesso ao Gemini
3. Clique em "Create API key" (ou gere uma nova chave existente)
4. Copie o valor exibido (formato `AIza...`)

### 2. Definir a variável de ambiente

Crie (ou atualize) o arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_GEMINI_API_KEY=AIza...sua-chave-aqui...
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

| Ordem | Modelo              | Uso recomendado                     |
|-------|---------------------|-------------------------------------|
| 1     | `gemini-2.5-flash`  | Respostas rápidas, custo otimizado  |
| 2     | `gemini-2.0-flash`  | Alternativa rápida                  |
| 3     | `gemini-1.5-flash`  | Compatibilidade ampliada            |
| 4     | `gemini-1.5-pro`    | Respostas mais extensas e precisas  |

O fallback é realizado automaticamente seguindo a ordem acima.

## Uso no código

### Fluxo padrão

```typescript
import { AI_CONFIG, DYNAMIC_AI_CONFIG } from "@/config/ai";

const model = await DYNAMIC_AI_CONFIG.getModel();
const response = await fetch(
  `${AI_CONFIG.getGenerateContentUrl(model)}?key=${AI_CONFIG.API_KEY}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: "Descreva o fluxo desejado" }] },
      ],
      system_instruction: {
        parts: [{ text: "Você é um assistente que gera fluxos Task Companion." }],
      },
      generationConfig: AI_CONFIG.getModelSpecificOptions(model),
    }),
  }
);

const data = await response.json();
```

### Ferramentas (function calling)

O assistente usa **function calling** do Gemini para devolver o JSON final. A configuração enviada inclui:

```json
{
  "tools": [
    {
      "functionDeclarations": [
        {
          "name": "generate_flow",
          "description": "Gera o JSON final de um fluxo Task Companion",
          "parameters": { "type": "object", "properties": { ... } }
        }
      ]
    }
  ]
}
```

Quando o Gemini retorna `functionCall`, o app importa o JSON automaticamente.

## Configurações avançadas

- `AI_CONFIG.DEFAULT_OPTIONS` aplica parâmetros globais (`temperature`, `topP`)
- `AI_CONFIG.getModelSpecificOptions(model)` ajusta `maxOutputTokens` por modelo
- `AI_DEBUG.testConnection()` verifica se a chave permite acessar a lista de modelos

## Troubleshooting

| Problema                                         | Possível causa / solução                                             |
|--------------------------------------------------|----------------------------------------------------------------------|
| "Chave da API não configurada"                   | Verifique se `VITE_GEMINI_API_KEY` está definido no `.env`           |
| Status 401 ao chamar a API                       | Chave inválida ou revogada. Gere uma nova chave                      |
| Status 403 ao chamar a API                       | Conta sem acesso ao Gemini. Confira as permissões no AI Studio       |
| Modelo não encontrado (`404`)                    | O modelo pode não estar disponível na região da conta                |
| Resposta sem JSON                                | O modelo pode ter optado por resposta textual; tente novamente       |

## Custos

Consulte a [página oficial de preços do Gemini](https://ai.google.dev/pricing) para valores atualizados de cada modelo.

## Segurança

- Nunca versione o arquivo `.env`
- Em produção, considere criar um proxy backend para ocultar a chave
- Restrinja a chave da API no Google Cloud quando possível

## Suporte

- [Documentação Gemini](https://ai.google.dev/docs)
- [Status da plataforma](https://status.cloud.google.com/)
