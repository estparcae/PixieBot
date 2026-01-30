/**
 * Bot de Telegram para Camaral
 * Implementado con grammy y RAG para respuestas contextuales
 */

import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { generateResponse } from "./ai";
import { transcribeTelegramVoice } from "./audio";
import { BOT_CONFIG, EXTERNAL_LINKS } from "./config";
import type { ConversationHistory } from "./types";

// Almacenamiento de historial por usuario (en producción usar Redis)
const conversationHistory = new Map<number, ConversationHistory>();

// ============================================================================
// Gestión del historial de conversación
// ============================================================================

function getHistory(userId: number): ConversationHistory {
  return conversationHistory.get(userId) || [];
}

function addToHistory(userId: number, role: "user" | "assistant", content: string): void {
  const history = getHistory(userId);
  history.push({ role, content });

  if (history.length > BOT_CONFIG.MAX_HISTORY_LENGTH) {
    history.splice(0, history.length - BOT_CONFIG.MAX_HISTORY_LENGTH);
  }

  conversationHistory.set(userId, history);
}

function clearHistory(userId: number): void {
  conversationHistory.delete(userId);
}

// ============================================================================
// Teclados inline reutilizables
// ============================================================================

const createDemoCtaKeyboard = () =>
  new InlineKeyboard()
    .url("🗓️ Agendar una demo", EXTERNAL_LINKS.CALENDLY)
    .row()
    .text("⬅️ Menú principal", "main_menu");

const createMainMenuKeyboard = () =>
  new InlineKeyboard()
    .text("🤖 ¿Qué es Camaral?", "what_is_camaral")
    .text("⚙️ ¿Cómo funciona?", "how_it_works")
    .row()
    .text("💼 Casos de uso", "use_cases")
    .text("💰 Precios", "pricing")
    .row()
    .url("🗓️ Agendar demo", EXTERNAL_LINKS.CALENDLY)
    .text("🚀 Probar gratis", "try_free");

const createPricingKeyboard = () =>
  new InlineKeyboard()
    .text("Plan Pro - $99/mes", "plan_pro")
    .row()
    .text("Plan Scale - $299/mes", "plan_scale")
    .row()
    .text("Plan Growth - $799/mes", "plan_growth")
    .row()
    .text("🏢 Enterprise", "plan_enterprise")
    .row()
    .url("🗓️ Agendar demo", EXTERNAL_LINKS.CALENDLY)
    .row()
    .text("⬅️ Menú principal", "main_menu");

// ============================================================================
// Mensajes predefinidos
// ============================================================================

const WELCOME_MESSAGE = (firstName?: string) => `¡Hola${firstName ? ` ${firstName}` : ""}! 👋

Soy el asistente virtual de *Camaral*, la plataforma de avatares con IA que participan en tus reuniones de ventas y soporte.

Puedo ayudarte a conocer más sobre:
• Qué hace Camaral y cómo funciona
• Casos de uso y beneficios
• Planes y precios
• Cómo empezar

*¿Qué te gustaría saber?* 👇`;

const HELP_MESSAGE = `*Comandos disponibles:*

/start - Iniciar conversación
/help - Ver esta ayuda
/precios - Ver planes y precios
/demo - Agendar una demo

También puedes:
• Escribirme cualquier pregunta sobre Camaral
• Enviarme un mensaje de voz 🎤

*¿En qué puedo ayudarte?*`;

const DEMO_MESSAGE = `🗓️ *¡Agenda tu demo personalizada!*

En 30 minutos podrás:
• Ver los avatares de Camaral en acción
• Explorar casos de uso para tu industria
• Resolver todas tus dudas
• Conocer el proceso de implementación

👇 *Selecciona un horario que te funcione:*`;

const PRICING_MESSAGE = `💰 *Planes de Camaral*

*Pro* - $99/mes → 500 min incluidos
*Scale* - $299/mes → 1,600 min incluidos
*Growth* - $799/mes → 3,600 min incluidos
*Enterprise* - Personalizado

Todos incluyen avatares ilimitados y acceso a API.

👇 *Selecciona un plan para más detalles:*`;

const TRY_FREE_MESSAGE = `🚀 *¡Comienza con Camaral!*

La mejor forma de empezar es agendando una demo con nuestro equipo:

✅ Te mostramos la plataforma en vivo
✅ Configuramos tu primer avatar juntos
✅ Resolvemos todas tus dudas
✅ Sin compromiso

👇 *Agenda tu demo gratuita:*`;

// ============================================================================
// Mapeo de callback queries a preguntas
// ============================================================================

const CALLBACK_QUESTIONS: Record<string, string> = {
  what_is_camaral: "¿Qué es Camaral y qué hace? Explica brevemente.",
  how_it_works: "¿Cómo funciona la tecnología de avatares de Camaral?",
  use_cases: "¿Cuáles son los principales casos de uso de Camaral?",
  plan_pro: "Dame todos los detalles del plan Pro de $99/mes de Camaral",
  plan_scale: "Dame todos los detalles del plan Scale de $299/mes de Camaral",
  plan_growth: "Dame todos los detalles del plan Growth de $799/mes de Camaral",
  plan_enterprise: "¿Qué incluye el plan Enterprise de Camaral?",
};

// ============================================================================
// Creación del bot
// ============================================================================

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // --- Comandos ---

  bot.command("start", async (ctx) => {
    clearHistory(ctx.from?.id || 0);
    await ctx.reply(WELCOME_MESSAGE(ctx.from?.first_name), {
      parse_mode: "Markdown",
      reply_markup: createMainMenuKeyboard(),
    });
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_MESSAGE, {
      parse_mode: "Markdown",
      reply_markup: createMainMenuKeyboard(),
    });
  });

  bot.command("demo", async (ctx) => {
    await ctx.reply(DEMO_MESSAGE, {
      parse_mode: "Markdown",
      reply_markup: createDemoCtaKeyboard(),
    });
  });

  bot.command("precios", async (ctx) => {
    await ctx.reply(PRICING_MESSAGE, {
      parse_mode: "Markdown",
      reply_markup: createPricingKeyboard(),
    });
  });

  // --- Callback queries ---

  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from?.id || 0;

    await ctx.answerCallbackQuery();

    // Manejo de acciones especiales
    switch (data) {
      case "pricing":
        await ctx.reply(PRICING_MESSAGE, {
          parse_mode: "Markdown",
          reply_markup: createPricingKeyboard(),
        });
        return;

      case "try_free":
        await ctx.reply(TRY_FREE_MESSAGE, {
          parse_mode: "Markdown",
          reply_markup: createDemoCtaKeyboard(),
        });
        return;

      case "main_menu":
        await ctx.reply("¿En qué más puedo ayudarte? 👇", {
          reply_markup: createMainMenuKeyboard(),
        });
        return;
    }

    // Procesar preguntas predefinidas
    const question = CALLBACK_QUESTIONS[data];
    if (!question) return;

    await ctx.replyWithChatAction("typing");

    try {
      const history = getHistory(userId);
      const response = await generateResponse(question, history);

      addToHistory(userId, "user", question);
      addToHistory(userId, "assistant", response);

      await ctx.reply(response, { reply_markup: createDemoCtaKeyboard() });
    } catch (error) {
      console.error("Error generating response:", error);
      await ctx.reply(
        "Lo siento, hubo un error. Por favor intenta de nuevo.",
        { reply_markup: createMainMenuKeyboard() }
      );
    }
  });

  // --- Mensajes de voz ---

  bot.on("message:voice", async (ctx) => {
    const userId = ctx.from?.id || 0;
    await ctx.replyWithChatAction("typing");

    try {
      const fileId = ctx.message.voice.file_id;
      const botToken = process.env.TELEGRAM_BOT_TOKEN!;

      const transcription = await transcribeTelegramVoice(fileId, botToken);

      if (!transcription.trim()) {
        await ctx.reply("No pude entender el mensaje de voz. ¿Podrías intentar de nuevo?");
        return;
      }

      await ctx.reply(`🎤 _"${transcription}"_`, { parse_mode: "Markdown" });
      await ctx.replyWithChatAction("typing");

      const history = getHistory(userId);
      const response = await generateResponse(transcription, history);

      addToHistory(userId, "user", transcription);
      addToHistory(userId, "assistant", response);

      await ctx.reply(response, { reply_markup: createDemoCtaKeyboard() });
    } catch (error) {
      console.error("Error processing voice:", error);
      await ctx.reply(
        "Lo siento, hubo un error con el mensaje de voz. ¿Podrías escribir tu pregunta?",
        { reply_markup: createMainMenuKeyboard() }
      );
    }
  });

  // --- Mensajes de texto ---

  bot.on("message:text", async (ctx) => {
    const userId = ctx.from?.id || 0;
    const userMessage = ctx.message.text;

    if (userMessage.startsWith("/")) return;

    await ctx.replyWithChatAction("typing");

    try {
      const history = getHistory(userId);
      const response = await generateResponse(userMessage, history);

      addToHistory(userId, "user", userMessage);
      addToHistory(userId, "assistant", response);

      await ctx.reply(response, { reply_markup: createDemoCtaKeyboard() });
    } catch (error) {
      console.error("Error generating response:", error);
      await ctx.reply(
        "Lo siento, hubo un error. Por favor intenta de nuevo.",
        { reply_markup: createMainMenuKeyboard() }
      );
    }
  });

  // --- Error handler ---

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}

/**
 * Crea el handler de webhook para el bot
 */
export function createWebhookHandler(bot: Bot) {
  return webhookCallback(bot, "std/http");
}
