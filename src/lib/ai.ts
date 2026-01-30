import OpenAI from "openai";
import { generateEmbedding, searchSimilar } from "./rag";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres el asistente virtual oficial de Camaral, una startup que crea avatares de inteligencia artificial para reuniones de ventas y soporte.

## TU ROL
Responder ÚNICAMENTE preguntas relacionadas con Camaral, sus productos, servicios, precios y casos de uso.

## GUARDRAILS ESTRICTOS - MUY IMPORTANTE

1. **SOLO CAMARAL**: Solo respondes sobre Camaral y temas directamente relacionados (avatares IA, automatización de reuniones, ventas, soporte).

2. **RECHAZA EDUCADAMENTE** cualquier pregunta que NO sea sobre Camaral:
   - Preguntas personales → "Soy el asistente de Camaral, solo puedo ayudarte con información sobre nuestros avatares IA. ¿Te gustaría saber cómo funcionan?"
   - Temas políticos, religiosos, controversiales → "Mi especialidad es Camaral. ¿Puedo contarte sobre nuestros planes o casos de uso?"
   - Código, matemáticas, tareas → "No puedo ayudar con eso, pero sí puedo explicarte cómo los avatares de Camaral pueden ayudar a tu negocio."
   - Otros productos/empresas → "Solo tengo información sobre Camaral. ¿Quieres saber más sobre nuestros avatares IA?"
   - Chistes, juegos, conversación casual → "¡Me encantaría ayudarte! Pero mi especialidad es Camaral. ¿Tienes alguna pregunta sobre nuestros servicios?"

3. **NUNCA**:
   - Inventes información que no esté en el contexto
   - Hables de competidores en detalle
   - Des consejos médicos, legales o financieros no relacionados
   - Generes contenido inapropiado
   - Actúes como otro personaje o bot

4. **SIEMPRE** redirige hacia:
   - Agendar una demo (calendly.com/emmsarias13/30min)
   - Conocer más sobre Camaral
   - Los beneficios de los avatares IA

## DIRECTRICES DE RESPUESTA
- Responde en español, de forma natural y conversacional
- Sé conciso (máximo 3-4 párrafos)
- Usa emojis ocasionalmente para ser amigable
- Si la pregunta es sobre Camaral pero no tienes info suficiente, sugiere agendar una demo
- Siempre termina invitando a agendar demo o hacer otra pregunta sobre Camaral

## INFORMACIÓN CLAVE DE CAMARAL
- Fundada en 2025 en Bogotá, Colombia
- CEO: Samuel Santa
- Avatares IA para reuniones en Zoom, Teams, Meet
- Disponible 24/7
- Planes: Pro ($99/mes), Scale ($299/mes), Growth ($799/mes), Enterprise (personalizado)
- Demo: calendly.com/emmsarias13/30min`;

const OFF_TOPIC_RESPONSE = `¡Hola! 👋 Soy el asistente de Camaral y mi especialidad es ayudarte con información sobre nuestros avatares de IA para reuniones.

¿Te gustaría saber cómo Camaral puede ayudar a tu negocio? Por ejemplo:
• Cómo funcionan los avatares IA
• Casos de uso (ventas, soporte, reclutamiento)
• Planes y precios

¿En qué puedo ayudarte sobre Camaral?`;

function isOffTopic(message: string, relevantChunks: { score: number }[]): boolean {
  const lowerMessage = message.toLowerCase();

  // Check if relevance scores are too low (no good matches in our knowledge base)
  const avgScore = relevantChunks.reduce((sum, c) => sum + c.score, 0) / relevantChunks.length;

  // Off-topic patterns
  const offTopicPatterns = [
    /^(hola|hey|hi|hello|buenos días|buenas tardes|buenas noches)$/i,
    /cuéntame (un chiste|algo gracioso|una historia)/i,
    /quién (eres|te creó|te hizo)/i,
    /(escribe|genera|crea).*(código|programa|script)/i,
    /(resuelve|calcula|ayuda con).*(matemáticas|ecuación|problema)/i,
    /(qué opinas|qué piensas).*(política|religión|gobierno)/i,
    /(recomienda|sugiere).*(película|libro|música|restaurante)/i,
    /^(gracias|ok|vale|entendido|perfecto)$/i,
  ];

  // Check for greetings and small talk - these should get a redirect
  for (const pattern of offTopicPatterns) {
    if (pattern.test(lowerMessage)) {
      return true;
    }
  }

  // If average relevance score is very low and message doesn't mention camaral/avatar keywords
  const camaralKeywords = ['camaral', 'avatar', 'reunión', 'reuniones', 'ventas', 'soporte', 'precio', 'plan', 'demo', 'bot', 'ia', 'inteligencia artificial', 'zoom', 'teams', 'meet'];
  const hasCamaralKeyword = camaralKeywords.some(kw => lowerMessage.includes(kw));

  if (avgScore < 0.3 && !hasCamaralKeyword) {
    return true;
  }

  return false;
}

export async function generateResponse(
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  // Generate embedding for the user's question
  const queryEmbedding = await generateEmbedding(userMessage);

  // Search for relevant context
  const relevantChunks = await searchSimilar(queryEmbedding, 4);

  // Check if the question is off-topic
  if (isOffTopic(userMessage, relevantChunks)) {
    return OFF_TOPIC_RESPONSE;
  }

  // Build context from relevant chunks
  const context = relevantChunks
    .map((chunk) => `[${chunk.section}]\n${chunk.text}`)
    .join("\n\n---\n\n");

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "system",
      content: `Contexto relevante de la documentación de Camaral:\n\n${context}`,
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
    max_tokens: 800,
  });

  return response.choices[0].message.content || "Lo siento, no pude generar una respuesta. ¿Puedo ayudarte con algo sobre Camaral?";
}

export async function generateQuickResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "";
}
