// src/config/ai.ts

/**
 * Configurações centralizadas para integração com IA (OpenAI)
 */
export const AI_CONFIG = {
  // Modelo de IA a ser utilizado (com fallback automático)
  MODEL: "gpt-5-mini",

  // Base da API OpenAI
  API_BASE_URL: "https://api.openai.com/v1",

  // Endpoint para chat completions
  getChatCompletionsUrl() {
    return `${this.API_BASE_URL}/chat/completions`;
  },

  // Endpoint para listar/checar modelos
  getModelUrl(model?: string) {
    if (model) {
      return `${this.API_BASE_URL}/models/${model}`;
    }
    return `${this.API_BASE_URL}/models`;
  },

  // Configurações padrão para as requisições
  DEFAULT_OPTIONS: {
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 4000,
  },

  // Configurações específicas por modelo
  getModelSpecificOptions(model: string) {
    const baseOptions = {
      ...this.DEFAULT_OPTIONS,
    };

    if (model.includes("mini")) {
      return {
        ...baseOptions,
        temperature: 0.6,
      };
    }

    return baseOptions;
  },

  // Cabeçalhos padrão com autenticação
  get REQUEST_HEADERS() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const apiKey = this.API_KEY;
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const organization = import.meta.env.VITE_OPENAI_ORG;
    if (organization) {
      headers["OpenAI-Organization"] = organization;
    }

    const project = import.meta.env.VITE_OPENAI_PROJECT;
    if (project) {
      headers["OpenAI-Project"] = project;
    }

    return headers;
  },

  // Chave da API (deve ser definida em .env)
  get API_KEY() {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) {
      console.error("❌ VITE_OPENAI_API_KEY não encontrada no arquivo .env");
      return null;
    }

    return key;
  },

  // Verifica se a chave da API está configurada
  get isConfigured() {
    return !!this.API_KEY;
  },

  // Valida se a chave da API é válida
  get isValidKey() {
    const key = this.API_KEY;
    return typeof key === "string" && key.startsWith("sk-") && key.length > 20;
  },
} as const;

/**
 * Tipos de modelos disponíveis
 */
export const AI_MODELS = {
  GPT_5_MINI: "gpt-5-mini",
  GPT_4O_MINI: "gpt-4o-mini",
  GPT_41_MINI: "gpt-4.1-mini",
  GPT_4O: "gpt-4o",
  GPT_41: "gpt-4.1",
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/**
 * Lista de modelos em ordem de preferência (fallback automático)
 */
export const MODEL_FALLBACK_ORDER = [
  AI_MODELS.GPT_5_MINI,
  AI_MODELS.GPT_4O_MINI,
  AI_MODELS.GPT_41_MINI,
  AI_MODELS.GPT_4O,
  AI_MODELS.GPT_41,
] as const;

/**
 * Verifica se um modelo está disponível
 */
export async function checkModelAvailability(model: string): Promise<boolean> {
  try {
    // Verifica se a chave está configurada antes de fazer a requisição
    if (!AI_CONFIG.isValidKey) {
      console.error("❌ Chave da API não configurada ou inválida");
      return false;
    }

    const response = await fetch(AI_CONFIG.getModelUrl(model), {
      headers: AI_CONFIG.REQUEST_HEADERS,
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error(
          "❌ Erro de autenticação: Chave da API inválida ou expirada"
        );
      } else if (response.status === 403) {
        console.error(
          "❌ Erro de permissão: Chave da API não tem acesso a este endpoint"
        );
      } else if (response.status === 404) {
        console.error(
          `❌ Modelo ${model} não encontrado na API OpenAI`
        );
      } else {
        console.error(
          `❌ Erro na verificação de modelos: ${response.status} ${response.statusText}`
        );
      }
      return false;
    }

    const data = await response.json();

    if (Array.isArray(data.data)) {
      return data.data.some((m: { id: string }) => m.id === model);
    }

    // Quando consultar diretamente o modelo específico
    return data.id === model;
  } catch (error) {
    console.error("❌ Erro ao verificar disponibilidade do modelo:", error);
    return false;
  }
}

/**
 * Obtém o primeiro modelo disponível da lista de fallback
 */
export async function getAvailableModel(): Promise<string> {
  // Verifica se a chave está configurada
  if (!AI_CONFIG.isValidKey) {
    console.error("❌ Chave da API não configurada ou inválida");
    throw new Error("Chave da API não configurada ou inválida");
  }

  for (const model of MODEL_FALLBACK_ORDER) {
    if (await checkModelAvailability(model)) {
      console.log(`✅ Modelo ${model} está disponível`);
      return model;
    }
  }

  // Fallback final para o modelo gpt-4o
  console.log("⚠️ Usando gpt-4o como fallback");
  return AI_MODELS.GPT_4O;
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

  // Valida a configuração completa
  validateConfig() {
    if (!AI_CONFIG.isValidKey) {
      throw new Error("Chave da API não configurada ou inválida");
    }
    return true;
  },
} as const;

/**
 * Utilitários para debug e troubleshooting
 */
export const AI_DEBUG = {
  // Verifica o status da configuração
  checkStatus() {
    const status = {
      hasKey: !!AI_CONFIG.API_KEY,
      isValidKey: AI_CONFIG.isValidKey,
      isConfigured: AI_CONFIG.isConfigured,
      keyPrefix: AI_CONFIG.API_KEY?.substring(0, 7) || "N/A",
      keyLength: AI_CONFIG.API_KEY?.length || 0,
    };

    console.log("🔍 Status da configuração de IA:", status);
    return status;
  },

  // Testa a conexão com a API
  async testConnection() {
    try {
      if (!AI_CONFIG.isValidKey) {
        throw new Error("Chave da API não configurada");
      }

      const response = await fetch(AI_CONFIG.getModelUrl(), {
        headers: AI_CONFIG.REQUEST_HEADERS,
      });

      if (response.ok) {
        console.log("✅ Conexão com a API OpenAI estabelecida com sucesso");
        return true;
      } else {
        console.error(
          `❌ Erro na conexão: ${response.status} ${response.statusText}`
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Erro ao testar conexão:", error);
      return false;
    }
  },
} as const;
