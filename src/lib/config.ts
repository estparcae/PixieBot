/**
 * Configuración centralizada del bot de Camaral
 */

// URLs y enlaces externos
export const EXTERNAL_LINKS = {
  CALENDLY: "https://calendly.com/emmsarias13/30min",
  WEBSITE: "https://camaral.ai",
  TELEGRAM_BOT: "https://t.me/camaral_info_bot",
} as const;

// Configuración del modelo de IA
export const AI_CONFIG = {
  MODEL: "gpt-4o",
  EMBEDDING_MODEL: "text-embedding-3-small",
  EMBEDDING_DIMENSIONS: 1536,
  MAX_TOKENS: 800,
  TEMPERATURE: 0.7,
} as const;

// Configuración de RAG
export const RAG_CONFIG = {
  CHUNK_SIZE: 1500,
  CHUNK_OVERLAP: 200,
  TOP_K_RESULTS: 4,
  MIN_RELEVANCE_SCORE: 0.3,
} as const;

// Configuración del bot
export const BOT_CONFIG = {
  MAX_HISTORY_LENGTH: 10,
  TYPING_ACTION_DELAY: 100,
} as const;

// Información de la empresa
export const COMPANY_INFO = {
  NAME: "Camaral",
  FOUNDED: "2025",
  LOCATION: "Bogotá, Colombia",
  CEO: "Samuel Santa",
  DESCRIPTION: "Avatares de IA para reuniones de ventas y soporte",
} as const;

// Planes de precios
export const PRICING_PLANS = {
  PRO: {
    name: "Pro",
    price: 99,
    minutes: 500,
    extraMinutePrice: 0.24,
  },
  SCALE: {
    name: "Scale",
    price: 299,
    minutes: 1600,
    extraMinutePrice: 0.23,
  },
  GROWTH: {
    name: "Growth",
    price: 799,
    minutes: 3600,
    extraMinutePrice: 0.22,
  },
} as const;
