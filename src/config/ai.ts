// src/config/ai.ts

const API_BASE_URL = "https://api.openai.com/v1";
const MODEL = "gpt-5-mini" as const;

const getApiKey = () => {
  const value = import.meta.env.VITE_OPENAI_API_KEY;
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getRequestHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = getApiKey();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const organization = import.meta.env.VITE_OPENAI_ORG;
  if (typeof organization === "string" && organization.trim().length > 0) {
    headers["OpenAI-Organization"] = organization.trim();
  }

  const project = import.meta.env.VITE_OPENAI_PROJECT;
  if (typeof project === "string" && project.trim().length > 0) {
    headers["OpenAI-Project"] = project.trim();
  }

  return headers;
};

export const AI_CONFIG = {
  MODEL,
  API_BASE_URL,
  getChatCompletionsUrl(): string {
    return `${API_BASE_URL}/chat/completions`;
  },
  getRequestHeaders,
  getApiKey,
  isConfigured(): boolean {
    return getApiKey() !== null;
  },
} as const;

export type AIModel = typeof MODEL;
