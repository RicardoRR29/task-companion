// src/config/ai.ts

/**
 * Configurações centralizadas para integração com IA
 */
export const AI_CONFIG = {
  // Modelo de IA a ser utilizado (com fallback automático)
  MODEL: "gemini-2.5-flash",

  // Base da API Gemini
  API_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",

  // Caminho para a chamada de geração de conteúdo
  getGenerateContentUrl(model: string) {
    return `${this.API_BASE_URL}/models/${model}:generateContent`;
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
    topP: 0.95,
  },

  // Configurações específicas por modelo
  getModelSpecificOptions(model: string) {
    const baseOptions = {
      ...this.DEFAULT_OPTIONS,
      maxOutputTokens: 4000,
    };

    if (model.includes("flash")) {
      return {
        ...baseOptions,
        temperature: 0.6,
      };
    }

    return baseOptions;
  },

  // Chave da API (deve ser definida em .env)
  get API_KEY() {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      console.error("❌ VITE_GEMINI_API_KEY não encontrada no arquivo .env");
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
    return typeof key === "string" && key.length > 20;
  },
} as const;

/**
 * Tipos de modelos disponíveis
 */
export const AI_MODELS = {
  GEMINI_25_FLASH: "gemini-2.5-flash",
  GEMINI_20_FLASH: "gemini-2.0-flash",
  GEMINI_15_FLASH: "gemini-1.5-flash",
  GEMINI_15_PRO: "gemini-1.5-pro",
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

/**
 * Lista de modelos em ordem de preferência (fallback automático)
 */
export const MODEL_FALLBACK_ORDER = [
  AI_MODELS.GEMINI_25_FLASH,
  AI_MODELS.GEMINI_20_FLASH,
  AI_MODELS.GEMINI_15_FLASH,
  AI_MODELS.GEMINI_15_PRO,
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

    const url = `${AI_CONFIG.getModelUrl(model)}?key=${AI_CONFIG.API_KEY}`;
    const response = await fetch(url);

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
          `❌ Modelo ${model} não encontrado na API Gemini`
        );
      } else {
        console.error(
          `❌ Erro na verificação de modelos: ${response.status} ${response.statusText}`
        );
      }
      return false;
    }

    const data = await response.json();
    if (Array.isArray(data.models)) {
      return data.models.some((m: { name: string }) =>
        m.name?.endsWith(model)
      );
    }

    // Quando consultar diretamente o modelo específico
    return data.name?.endsWith(model) ?? false;
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

  // Fallback final para o modelo flash 1.5
  console.log("⚠️ Usando gemini-1.5-flash como fallback");
  return AI_MODELS.GEMINI_15_FLASH;
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

      const response = await fetch(
        `${AI_CONFIG.getModelUrl()}?key=${AI_CONFIG.API_KEY}`
      );

      if (response.ok) {
        console.log("✅ Conexão com a API Gemini estabelecida com sucesso");
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
