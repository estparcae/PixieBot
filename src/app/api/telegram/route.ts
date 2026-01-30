import { createBot, createWebhookHandler } from "@/lib/bot";
import { NextRequest, NextResponse } from "next/server";

let bot: ReturnType<typeof createBot> | null = null;
let handleWebhook: ReturnType<typeof createWebhookHandler> | null = null;

function getBot() {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set");
    }
    bot = createBot(token);
    handleWebhook = createWebhookHandler(bot);
  }
  return { bot, handleWebhook: handleWebhook! };
}

export async function POST(req: NextRequest) {
  try {
    const { handleWebhook } = getBot();
    const body = await req.json();

    console.log("Received update:", JSON.stringify(body).slice(0, 200));

    // Create a standard Request object for grammy
    const webhookRequest = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify(body),
    });

    const response = await handleWebhook(webhookRequest);
    console.log("Webhook response status:", response.status);
    return response;
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { ok: false, error: "Webhook processing failed", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasUpstash = !!process.env.UPSTASH_VECTOR_REST_URL;

  return NextResponse.json({
    ok: true,
    bot: "Camaral Bot",
    status: "Webhook is active",
    timestamp: new Date().toISOString(),
    env: {
      telegram: hasToken,
      openai: hasOpenAI,
      upstash: hasUpstash,
    },
  });
}
