import { Bot, Context, InlineKeyboard, webhookCallback } from "grammy";
import { generateResponse } from "./ai";
import { transcribeTelegramVoice } from "./audio";

// Store conversation history per user (in production, use Redis or similar)
const conversationHistory = new Map<number, { role: "user" | "assistant"; content: string }[]>();

const MAX_HISTORY_LENGTH = 10;

function getHistory(userId: number): { role: "user" | "assistant"; content: string }[] {
  return conversationHistory.get(userId) || [];
}

function addToHistory(userId: number, role: "user" | "assistant", content: string): void {
  const history = getHistory(userId);
  history.push({ role, content });

  // Keep only last N messages
  if (history.length > MAX_HISTORY_LENGTH) {
    history.splice(0, history.length - MAX_HISTORY_LENGTH);
  }

  conversationHistory.set(userId, history);
}

function clearHistory(userId: number): void {
  conversationHistory.delete(userId);
}

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // Main menu keyboard
  const mainMenu = new InlineKeyboard()
    .text("🤖 ¿Qué es Camaral?", "what_is_camaral")
    .text("⚙️ ¿Cómo funciona?", "how_it_works")
    .row()
    .text("💼 Casos de uso", "use_cases")
    .text("💰 Precios", "pricing")
    .row()
    .text("📞 Hablar con ventas", "contact_sales")
    .text("🚀 Probar gratis", "try_free");

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
        reply_markup: mainMenu,
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
/demos - Solicitar una demo

También puedes:
• Escribirme cualquier pregunta sobre Camaral
• Enviarme un mensaje de voz 🎤

*¿En qué puedo ayudarte?*`,
      { parse_mode: "Markdown", reply_markup: mainMenu }
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
      .text("🏢 Enterprise (personalizado)", "plan_enterprise")
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
• Ideal para equipos en crecimiento

*Scale* - $299/mes
• 1,600 minutos incluidos
• $0.23/min adicional
• Integraciones personalizadas
• Analíticas avanzadas

*Growth* - $799/mes
• 3,600 minutos incluidos
• $0.22/min adicional
• Para operaciones a escala global

*Enterprise* - Personalizado
• Descuentos por volumen
• Avatares y voces personalizadas
• SSO/SAML
• Soporte dedicado`,
      { parse_mode: "Markdown", reply_markup: pricingKeyboard }
    );
  });

  // /demos command
  bot.command("demos", async (ctx) => {
    const demoKeyboard = new InlineKeyboard()
      .url("🗓️ Agendar demo", "https://camaral.ai")
      .row()
      .text("⬅️ Menú principal", "main_menu");

    await ctx.reply(
      `🚀 *¿Quieres ver Camaral en acción?*

Agenda una demo personalizada con nuestro equipo para:

• Ver cómo funcionan los avatares en vivo
• Explorar casos de uso para tu industria
• Resolver todas tus dudas
• Conocer el proceso de implementación

¡También puedes probar gratis directamente en camaral.ai!`,
      { parse_mode: "Markdown", reply_markup: demoKeyboard }
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
        question = "¿Qué es Camaral y qué hace?";
        break;
      case "how_it_works":
        question = "¿Cómo funciona la tecnología de avatares de Camaral?";
        break;
      case "use_cases":
        question = "¿Cuáles son los principales casos de uso de Camaral?";
        break;
      case "pricing":
        await ctx.answerCallbackQuery();
        // Trigger the pricing command
        await ctx.reply("/precios - Ver planes y precios");
        return;
      case "contact_sales":
        await ctx.reply(
          `📞 *Contacta con nuestro equipo de ventas*

Visita camaral.ai para agendar una llamada con nuestro equipo.

También puedes escribirme cualquier pregunta que tengas y te ayudaré en lo que pueda.`,
          { parse_mode: "Markdown" }
        );
        return;
      case "try_free":
        await ctx.reply(
          `🚀 *¡Prueba Camaral gratis!*

Visita [camaral.ai](https://camaral.ai) para crear tu cuenta gratuita y empezar a usar avatares de IA en tus reuniones.

El proceso es simple:
1. Regístrate en la plataforma
2. Crea tu primer avatar
3. Conéctalo con tu calendario
4. ¡Listo! El avatar asistirá a tus reuniones`,
          { parse_mode: "Markdown" }
        );
        return;
      case "main_menu":
        await ctx.reply("¿En qué más puedo ayudarte?", { reply_markup: mainMenu });
        return;
      case "plan_pro":
        question = "Dame más detalles sobre el plan Pro de $99/mes";
        break;
      case "plan_scale":
        question = "Dame más detalles sobre el plan Scale de $299/mes";
        break;
      case "plan_growth":
        question = "Dame más detalles sobre el plan Growth de $799/mes";
        break;
      case "plan_enterprise":
        question = "¿Qué incluye el plan Enterprise de Camaral?";
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

      const followUpKeyboard = new InlineKeyboard()
        .text("⬅️ Menú principal", "main_menu");

      await ctx.reply(response, { reply_markup: followUpKeyboard });
    } catch (error) {
      console.error("Error generating response:", error);
      await ctx.reply(
        "Lo siento, hubo un error procesando tu pregunta. Por favor intenta de nuevo."
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

      // Transcribe the voice message
      const transcription = await transcribeTelegramVoice(fileId, botToken);

      if (!transcription.trim()) {
        await ctx.reply("No pude entender el mensaje de voz. ¿Podrías intentar de nuevo?");
        return;
      }

      // Show what we understood
      await ctx.reply(`🎤 _"${transcription}"_`, { parse_mode: "Markdown" });

      await ctx.replyWithChatAction("typing");

      // Generate response using RAG
      const history = getHistory(userId);
      const response = await generateResponse(transcription, history);

      addToHistory(userId, "user", transcription);
      addToHistory(userId, "assistant", response);

      await ctx.reply(response);
    } catch (error) {
      console.error("Error processing voice message:", error);
      await ctx.reply(
        "Lo siento, hubo un error procesando tu mensaje de voz. ¿Podrías escribir tu pregunta?"
      );
    }
  });

  // Handle text messages
  bot.on("message:text", async (ctx) => {
    const userId = ctx.from?.id || 0;
    const userMessage = ctx.message.text;

    // Ignore commands (already handled)
    if (userMessage.startsWith("/")) return;

    await ctx.replyWithChatAction("typing");

    try {
      const history = getHistory(userId);
      const response = await generateResponse(userMessage, history);

      addToHistory(userId, "user", userMessage);
      addToHistory(userId, "assistant", response);

      await ctx.reply(response);
    } catch (error) {
      console.error("Error generating response:", error);
      await ctx.reply(
        "Lo siento, hubo un error procesando tu pregunta. Por favor intenta de nuevo."
      );
    }
  });

  // Error handler
  bot.catch((err) => {
    console.error("Bot error:", err);
  });

  return bot;
}

export function createWebhookHandler(bot: Bot) {
  return webhookCallback(bot, "std/http");
}
