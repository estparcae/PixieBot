import { createBot, createWebhookHandler } from "@/lib/bot";
import { NextRequest, NextResponse } from "next/server";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

const bot = createBot(token);
const handleWebhook = createWebhookHandler(bot);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Create a standard Request object for grammy
    const webhookRequest = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify(body),
    });

    return await handleWebhook(webhookRequest);
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: false, error: "Webhook processing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    bot: "Camaral Bot",
    status: "Webhook is active",
    timestamp: new Date().toISOString(),
  });
}
