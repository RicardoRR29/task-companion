// src/config/ai.ts

/**
 * Configurações centralizadas para integração com IA
 */
export const AI_CONFIG = {
  // Modelo de IA a ser utilizado
  MODEL: "gpt-5-mini",

  // URL da API OpenAI
  API_URL: "https://api.openai.com/v1/chat/completions",

  // Configurações padrão para as requisições
  DEFAULT_OPTIONS: {
    temperature: 0.7,
    max_tokens: 4000,
    function_call: "auto" as const,
  },

  // Chave da API (deve ser definida em .env)
  get API_KEY() {
    return import.meta.env.VITE_OPENAI_API_KEY;
  },

  // Verifica se a chave da API está configurada
  get isConfigured() {
    return !!this.API_KEY;
  },
} as const;

/**
 * Tipos de modelos disponíveis
 */
export const AI_MODELS = {
  GPT_5_MINI: "gpt-5-mini",
  GPT_5: "gpt-5",
  GPT_5_NANO: "gpt-5-nano",
  GPT_4O_MINI: "gpt-4o-mini",
  GPT_4O: "gpt-4o",
  GPT_4_TURBO: "gpt-4-turbo-preview",
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];
