# Configuração da IA - GPT-5 Mini

Este documento explica como configurar e usar a funcionalidade de IA no Task Companion.

## Visão Geral

O sistema utiliza o **GPT-5 Mini** da OpenAI para:

- Criação inteligente de fluxos interativos
- Assistência na estruturação de passos
- Geração automática de JSON válido para importação

## Configuração

### 1. Obter Chave da API OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave gerada

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# .env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Verificar Configuração

O sistema automaticamente detecta se a chave está configurada. Você pode verificar no código:

```typescript
import { AI_CONFIG } from "@/config/ai";

if (AI_CONFIG.isConfigured) {
  console.log("IA configurada com sucesso!");
} else {
  console.log("Chave da API não encontrada");
}
```

## Modelos Disponíveis

### GPT-5 Mini (Padrão)

- **ID**: `gpt-5-mini`
- **Descrição**: Versão rápida e econômica do GPT-5 para tarefas bem definidas
- **Recomendado para**: Criação de fluxos, tarefas estruturadas

### Outros Modelos

- **GPT-5**: Melhor modelo para codificação e tarefas agenticas
- **GPT-5 Nano**: Versão mais rápida e econômica
- **GPT-4o Mini**: Alternativa mais barata para tarefas simples

## Uso

### Interface do Usuário

1. Acesse o Dashboard
2. Clique em "Criar com IA"
3. Descreva o fluxo desejado
4. O assistente irá:
   - Entender sua solicitação
   - Mostrar um resumo dos passos
   - Gerar o JSON para importação automática

### Programático

```typescript
import { AI_CONFIG, AI_MODELS } from '@/config/ai';

// Usar modelo padrão (GPT-5 Mini)
const response = await fetch(AI_CONFIG.API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_CONFIG.API_KEY}`,
  },
  body: JSON.stringify({
    model: AI_CONFIG.MODEL, // gpt-5-mini
    messages: [...],
    ...AI_CONFIG.DEFAULT_OPTIONS,
  }),
});

// Usar modelo específico
const customResponse = await fetch(AI_CONFIG.API_URL, {
  // ... configuração similar
  body: JSON.stringify({
    model: AI_MODELS.GPT_5, // gpt-5
    // ... outras opções
  }),
});
```

## Configurações Avançadas

### Personalizar Parâmetros

```typescript
// src/config/ai.ts
export const AI_CONFIG = {
  // ... outras configurações
  DEFAULT_OPTIONS: {
    temperature: 0.7, // Criatividade (0.0 - 2.0)
    max_tokens: 4000, // Máximo de tokens de saída
    function_call: "auto", // Chamada de função automática
  },
};
```

### Trocar Modelo

```typescript
// src/config/ai.ts
export const AI_CONFIG = {
  MODEL: AI_MODELS.GPT_5, // Trocar para GPT-5 completo
  // ... outras configurações
};
```

## Troubleshooting

### Erro: "Chave da API não encontrada"

- Verifique se o arquivo `.env` existe na raiz
- Confirme se `VITE_OPENAI_API_KEY` está definido
- Reinicie o servidor de desenvolvimento

### Erro: "Modelo não encontrado"

- Verifique se o modelo especificado está disponível na sua conta
- Confirme se o nome do modelo está correto (ex: `gpt-5-mini`, não `gpt-5o-mini`)

### Erro: "Limite de taxa excedido"

- Aguarde alguns minutos antes de fazer nova requisição
- Verifique seu plano de uso na OpenAI
- Considere usar um modelo mais econômico como GPT-5 Nano

## Custos

### GPT-5 Mini

- **Input**: $0.25 por 1M tokens
- **Output**: $1.00 por 1M tokens

### Comparação

- **GPT-5**: $1.25 / $5.00 por 1M tokens
- **GPT-5 Nano**: $0.05 / $0.40 por 1M tokens
- **GPT-4o Mini**: $0.15 / $0.60 por 1M tokens

## Segurança

- Nunca commite o arquivo `.env` no repositório
- A chave da API é exposta apenas no frontend (necessário para funcionalidade)
- Considere implementar proxy backend para maior segurança em produção

## Suporte

Para problemas relacionados à API OpenAI:

- [Documentação OpenAI](https://platform.openai.com/docs)
- [Status da API](https://status.openai.com/)
- [Comunidade OpenAI](https://community.openai.com/)
