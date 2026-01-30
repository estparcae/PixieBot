/**
 * Módulo de procesamiento de audio
 * Transcripción de notas de voz con OpenAI Whisper
 */

import OpenAI from "openai";
import type { TelegramFileInfo } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WHISPER_MODEL = "whisper-1";
const DEFAULT_LANGUAGE = "es";

/**
 * Transcribe un buffer de audio a texto
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = "audio.ogg"
): Promise<string> {
  const uint8Array = new Uint8Array(audioBuffer);
  const file = new File([uint8Array], filename, { type: "audio/ogg" });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    language: DEFAULT_LANGUAGE,
  });

  return transcription.text;
}

/**
 * Descarga un archivo de Telegram
 */
export async function downloadTelegramFile(
  fileId: string,
  botToken: string
): Promise<Buffer> {
  // Obtener la ruta del archivo desde Telegram
  const fileInfoResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
  );
  const fileInfo: TelegramFileInfo = await fileInfoResponse.json();

  if (!fileInfo.ok || !fileInfo.result?.file_path) {
    throw new Error("Could not get file info from Telegram");
  }

  // Descargar el archivo
  const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`;
  const fileResponse = await fetch(fileUrl);

  if (!fileResponse.ok) {
    throw new Error("Could not download file from Telegram");
  }

  const arrayBuffer = await fileResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Transcribe una nota de voz de Telegram
 */
export async function transcribeTelegramVoice(
  fileId: string,
  botToken: string
): Promise<string> {
  const audioBuffer = await downloadTelegramFile(fileId, botToken);
  return transcribeAudio(audioBuffer, "voice.ogg");
}
