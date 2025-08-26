// src/config/ai.ts

/**
 * Configurações centralizadas para integração com IA
 */
export const AI_CONFIG = {
  // Modelo de IA a ser utilizado (com fallback automático)
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
  GPT_3_5_TURBO: "gpt-3.5-turbo",
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/**
 * Lista de modelos em ordem de preferência (fallback automático)
 */
export const MODEL_FALLBACK_ORDER = [
  AI_MODELS.GPT_5_MINI,
  AI_MODELS.GPT_4O_MINI,
  AI_MODELS.GPT_3_5_TURBO,
] as const;

/**
 * Verifica se um modelo está disponível
 */
export async function checkModelAvailability(model: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${AI_CONFIG.API_URL.replace("/chat/completions", "")}/models`,
      {
        headers: {
          Authorization: `Bearer ${AI_CONFIG.API_KEY}`,
        },
      }
    );

    if (!response.ok) return false;

    const data = await response.json();
    return data.data?.some((m: { id: string }) => m.id === model) ?? false;
  } catch {
    return false;
  }
}

/**
 * Obtém o primeiro modelo disponível da lista de fallback
 */
export async function getAvailableModel(): Promise<string> {
  for (const model of MODEL_FALLBACK_ORDER) {
    if (await checkModelAvailability(model)) {
      return model;
    }
  }

  // Fallback para GPT-3.5 Turbo (geralmente sempre disponível)
  return AI_MODELS.GPT_3_5_TURBO;
}

/**
 * Configuração dinâmica baseada na disponibilidade dos modelos
 */
export const DYNAMIC_AI_CONFIG = {
  async getModel() {
    return await getAvailableModel();
  },

  async getConfig() {
    const model = await this.getModel();
    return {
      ...AI_CONFIG,
      MODEL: model,
    };
  },
} as const;
