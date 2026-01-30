import { config } from "dotenv";

config({ path: ".env.local" });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function setWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }
  if (!WEBHOOK_URL) {
    throw new Error("WEBHOOK_URL is not set");
  }

  console.log(`Setting webhook to: ${WEBHOOK_URL}`);

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(
      WEBHOOK_URL
    )}`
  );

  const result = await response.json();
  console.log("Response:", JSON.stringify(result, null, 2));

  if (result.ok) {
    console.log("\n✅ Webhook set successfully!");
    console.log(`\nBot URL: https://t.me/camaral_info_bot`);
  } else {
    console.error("\n❌ Failed to set webhook");
  }
}

async function getWebhookInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
  );

  const result = await response.json();
  console.log("Webhook Info:", JSON.stringify(result, null, 2));
}

async function deleteWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set");
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
  );

  const result = await response.json();
  console.log("Response:", JSON.stringify(result, null, 2));
}

const command = process.argv[2] || "set";

switch (command) {
  case "set":
    setWebhook();
    break;
  case "info":
    getWebhookInfo();
    break;
  case "delete":
    deleteWebhook();
    break;
  default:
    console.log("Usage: npx tsx scripts/setup-webhook.ts [set|info|delete]");
}
