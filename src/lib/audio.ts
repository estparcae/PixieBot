import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioBuffer: Buffer, filename: string = "audio.ogg"): Promise<string> {
  // Create a File-like object from the buffer
  const uint8Array = new Uint8Array(audioBuffer);
  const file = new File([uint8Array], filename, {
    type: "audio/ogg",
  });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    language: "es",
  });

  return transcription.text;
}

export async function downloadTelegramFile(
  fileId: string,
  botToken: string
): Promise<Buffer> {
  // First, get the file path from Telegram
  const fileInfoResponse = await fetch(
    `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`
  );
  const fileInfo = await fileInfoResponse.json();

  if (!fileInfo.ok || !fileInfo.result?.file_path) {
    throw new Error("Could not get file info from Telegram");
  }

  // Download the file
  const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.result.file_path}`;
  const fileResponse = await fetch(fileUrl);

  if (!fileResponse.ok) {
    throw new Error("Could not download file from Telegram");
  }

  const arrayBuffer = await fileResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function transcribeTelegramVoice(
  fileId: string,
  botToken: string
): Promise<string> {
  const audioBuffer = await downloadTelegramFile(fileId, botToken);
  return transcribeAudio(audioBuffer, "voice.ogg");
}
