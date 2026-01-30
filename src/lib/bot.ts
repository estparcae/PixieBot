import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { generateResponse } from "./ai";
import { transcribeTelegramVoice } from "./audio";

const CALENDLY_URL = "https://calendly.com/emmsarias13/30min";

// Store conversation history per user (in production, use Redis or similar)
const conversationHistory = new Map<number, { role: "user" | "assistant"; content: string }[]>();

const MAX_HISTORY_LENGTH = 10;

function getHistory(userId: number): { role: "user" | "assistant"; content: string }[] {
  return conversationHistory.get(userId) || [];
}

function addToHistory(userId: number, role: "user" | "assistant", content: string): void {
  const history = getHistory(userId);
  history.push({ role, content });

  if (history.length > MAX_HISTORY_LENGTH) {
    history.splice(0, history.length - MAX_HISTORY_LENGTH);
  }

  conversationHistory.set(userId, history);
}

function clearHistory(userId: number): void {
  conversationHistory.delete(userId);
}

// Reusable keyboard with demo CTA
const demoCtaKeyboard = new InlineKeyboard()
  .url("🗓️ Agendar una demo", CALENDLY_URL)
  .row()
  .text("⬅️ Menú principal", "main_menu");

const mainMenuWithDemo = new InlineKeyboard()
  .text("🤖 ¿Qué es Camaral?", "what_is_camaral")
  .text("⚙️ ¿Cómo funciona?", "how_it_works")
  .row()
  .text("💼 Casos de uso", "use_cases")
  .text("💰 Precios", "pricing")
  .row()
  .url("🗓️ Agendar demo", CALENDLY_URL)
  .text("🚀 Probar gratis", "try_free");

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // /start command
  bot.command("start", async (ctx) => {
    clearHistory(ctx.from?.id || 0);

    await ctx.reply(
      `¡Hola${ctx.from?.first_name ? ` ${ctx.from.first_name}` : ""}! 👋

Soy el asistente virtual de *Camaral*, la plataforma de avatares con IA que participan en tus reuniones de ventas y soporte.

Puedo ayudarte a conocer más sobre:
• Qué hace Camaral y cómo funciona
• Casos de uso y beneficios
• Planes y precios
• Cómo empezar

*¿Qué te gustaría saber?* 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: mainMenuWithDemo,
      }
    );
  });

  // /help command
  bot.command("help", async (ctx) => {
    await ctx.reply(
      `*Comandos disponibles:*

/start - Iniciar conversación
/help - Ver esta ayuda
/precios - Ver planes y precios
/demo - Agendar una demo

También puedes:
• Escribirme cualquier pregunta sobre Camaral
• Enviarme un mensaje de voz 🎤

*¿En qué puedo ayudarte?*`,
      { parse_mode: "Markdown", reply_markup: mainMenuWithDemo }
    );
  });

  // /demo command
  bot.command("demo", async (ctx) => {
    await ctx.reply(
      `🗓️ *¡Agenda tu demo personalizada!*

En 30 minutos podrás:
• Ver los avatares de Camaral en acción
• Explorar casos de uso para tu industria
• Resolver todas tus dudas
• Conocer el proceso de implementación

👇 *Selecciona un horario que te funcione:*`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .url("🗓️ Agendar demo ahora", CALENDLY_URL)
          .row()
          .text("⬅️ Menú principal", "main_menu"),
      }
    );
  });

  // /precios command
  bot.command("precios", async (ctx) => {
    const pricingKeyboard = new InlineKeyboard()
      .text("Plan Pro - $99/mes", "plan_pro")
      .row()
      .text("Plan Scale - $299/mes", "plan_scale")
      .row()
      .text("Plan Growth - $799/mes", "plan_growth")
      .row()
      .text("🏢 Enterprise", "plan_enterprise")
      .row()
      .url("🗓️ Agendar demo", CALENDLY_URL)
      .row()
      .text("⬅️ Menú principal", "main_menu");

    await ctx.reply(
      `💰 *Planes de Camaral*

Todos los planes incluyen:
✅ Avatares ilimitados
✅ Transcripciones y resúmenes
✅ Acceso a la API
✅ Soporte prioritario

*Pro* - $99/mes
• 500 minutos incluidos
• $0.24/min adicional

*Scale* - $299/mes
• 1,600 minutos incluidos
• $0.23/min adicional
• Integraciones personalizadas

*Growth* - $799/mes
• 3,600 minutos incluidos
• $0.22/min adicional

*Enterprise* - Personalizado
• Descuentos por volumen
• SSO/SAML y soporte dedicado

💡 *¿Quieres saber cuál plan es mejor para ti?* Agenda una demo.`,
      { parse_mode: "Markdown", reply_markup: pricingKeyboard }
    );
  });

  // Callback queries (inline keyboard buttons)
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    const userId = ctx.from?.id || 0;

    await ctx.answerCallbackQuery();

    let question = "";
    switch (data) {
      case "what_is_camaral":
        question = "¿Qué es Camaral y qué hace? Explica brevemente.";
        break;
      case "how_it_works":
        question = "¿Cómo funciona la tecnología de avatares de Camaral? Explica el proceso.";
        break;
      case "use_cases":
        question = "¿Cuáles son los principales casos de uso de Camaral? Dame ejemplos concretos.";
        break;
      case "pricing":
        // Trigger pricing flow
        const pricingKeyboard = new InlineKeyboard()
          .text("Plan Pro - $99/mes", "plan_pro")
          .row()
          .text("Plan Scale - $299/mes", "plan_scale")
          .row()
          .text("Plan Growth - $799/mes", "plan_growth")
          .row()
          .text("🏢 Enterprise", "plan_enterprise")
          .row()
          .url("🗓️ Agendar demo", CALENDLY_URL)
          .row()
          .text("⬅️ Menú principal", "main_menu");

        await ctx.reply(
          `💰 *Planes de Camaral*

*Pro* - $99/mes → 500 min incluidos
*Scale* - $299/mes → 1,600 min incluidos
*Growth* - $799/mes → 3,600 min incluidos
*Enterprise* - Personalizado

Todos incluyen avatares ilimitados y acceso a API.

👇 *Selecciona un plan para más detalles:*`,
          { parse_mode: "Markdown", reply_markup: pricingKeyboard }
        );
        return;

      case "try_free":
        await ctx.reply(
          `🚀 *¡Comienza con Camaral!*

La mejor forma de empezar es agendando una demo con nuestro equipo:

✅ Te mostramos la plataforma en vivo
✅ Configuramos tu primer avatar juntos
✅ Resolvemos todas tus dudas
✅ Sin compromiso

👇 *Agenda tu demo gratuita:*`,
          { parse_mode: "Markdown", reply_markup: demoCtaKeyboard }
        );
        return;

      case "main_menu":
        await ctx.reply("¿En qué más puedo ayudarte? 👇", { reply_markup: mainMenuWithDemo });
        return;

      case "plan_pro":
        question = "Dame todos los detalles del plan Pro de $99/mes de Camaral";
        break;
      case "plan_scale":
        question = "Dame todos los detalles del plan Scale de $299/mes de Camaral";
        break;
      case "plan_growth":
        question = "Dame todos los detalles del plan Growth de $799/mes de Camaral";
        break;
      case "plan_enterprise":
        question = "¿Qué incluye el plan Enterprise de Camaral y para quién es?";
        break;
      default:
        return;
    }

    // Process the question through RAG
    await ctx.replyWithChatAction("typing");

    try {
      const history = getHistory(userId);
      const response = await generateResponse(question, history);

      addToHistory(userId, "user", question);
      addToHistory(userId, "assistant", response);

      await ctx.reply(response, { reply_markup: demoCtaKeyboard });
    } catch (error) {
      console.error("Error generating response:", error);
      await ctx.reply(
        "Lo siento, hubo un error procesando tu pregunta. Por favor intenta de nuevo.",
        { reply_markup: mainMenuWithDemo }
      );
    }
  });

  // Handle voice messages
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

      await ctx.reply(response, { reply_markup: demoCtaKeyboard });
    } catch (error) {
      console.error("Error processing voice message:", error);
      await ctx.reply(
        "Lo siento, hubo un error procesando tu mensaje de voz. ¿Podrías escribir tu pregunta?",
        { reply_markup: mainMenuWithDemo }
      );
    }
  });

  // Handle text messages
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

      await ctx.reply(response, { reply_markup: demoCtaKeyboard });
    } catch (error) {
      console.error("Error generating response:", error);
      await ctx.reply(
        "Lo siento, hubo un error procesando tu pregunta. Por favor intenta de nuevo.",
        { reply_markup: mainMenuWithDemo }
      );
    }
  });

  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}

export function createWebhookHandler(bot: Bot) {
  return webhookCallback(bot, "std/http");
}
