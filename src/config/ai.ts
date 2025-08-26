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
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) {
      console.error("❌ VITE_OPENAI_API_KEY não encontrada no arquivo .env");
      return null;
    }

    // Valida formato da chave (deve começar com 'sk-')
    if (!key.startsWith("sk-")) {
      console.error(
        "❌ Formato inválido da chave da API. Deve começar com 'sk-'"
      );
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
    return key && key.startsWith("sk-") && key.length > 20;
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
    // Verifica se a chave está configurada antes de fazer a requisição
    if (!AI_CONFIG.isValidKey) {
      console.error("❌ Chave da API não configurada ou inválida");
      return false;
    }

    const response = await fetch(
      `${AI_CONFIG.API_URL.replace("/chat/completions", "")}/models`,
      {
        headers: {
          Authorization: `Bearer ${AI_CONFIG.API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error(
          "❌ Erro de autenticação: Chave da API inválida ou expirada"
        );
      } else if (response.status === 403) {
        console.error(
          "❌ Erro de permissão: Chave da API não tem acesso a este endpoint"
        );
      } else {
        console.error(
          `❌ Erro na verificação de modelos: ${response.status} ${response.statusText}`
        );
      }
      return false;
    }

    const data = await response.json();
    return data.data?.some((m: { id: string }) => m.id === model) ?? false;
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

  // Fallback para GPT-3.5 Turbo (geralmente sempre disponível)
  console.log("⚠️ Usando GPT-3.5 Turbo como fallback");
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
        `${AI_CONFIG.API_URL.replace("/chat/completions", "")}/models`,
        {
          headers: {
            Authorization: `Bearer ${AI_CONFIG.API_KEY}`,
          },
        }
      );

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
