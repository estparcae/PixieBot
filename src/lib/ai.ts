/**
 * Módulo de IA para generación de respuestas con GPT-4o
 * Incluye guardrails para mantener el foco en Camaral
 */

import OpenAI from "openai";
import { generateEmbedding, searchSimilar } from "./rag";
import { AI_CONFIG, RAG_CONFIG, EXTERNAL_LINKS, COMPANY_INFO } from "./config";
import type { ConversationHistory, SearchResult } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt con guardrails estrictos
 */
const SYSTEM_PROMPT = `Eres el asistente virtual oficial de ${COMPANY_INFO.NAME}, una startup que crea avatares de inteligencia artificial para reuniones de ventas y soporte.

## TU ROL
Responder ÚNICAMENTE preguntas relacionadas con Camaral, sus productos, servicios, precios y casos de uso.

## GUARDRAILS ESTRICTOS

1. **SOLO CAMARAL**: Solo respondes sobre Camaral y temas directamente relacionados (avatares IA, automatización de reuniones, ventas, soporte).

2. **RECHAZA EDUCADAMENTE** cualquier pregunta que NO sea sobre Camaral:
   - Preguntas personales → "Soy el asistente de Camaral, solo puedo ayudarte con información sobre nuestros avatares IA."
   - Temas políticos, religiosos, controversiales → "Mi especialidad es Camaral. ¿Puedo contarte sobre nuestros planes?"
   - Código, matemáticas, tareas → "No puedo ayudar con eso, pero sí puedo explicarte cómo Camaral puede ayudar a tu negocio."
   - Otros productos/empresas → "Solo tengo información sobre Camaral."
   - Chistes, juegos → "¡Me encantaría ayudarte! Pero mi especialidad es Camaral."

3. **NUNCA**:
   - Inventes información que no esté en el contexto
   - Hables de competidores en detalle
   - Des consejos médicos, legales o financieros
   - Generes contenido inapropiado
   - Actúes como otro personaje

4. **SIEMPRE** redirige hacia agendar una demo: ${EXTERNAL_LINKS.CALENDLY}

## DIRECTRICES DE RESPUESTA
- Responde en español, de forma natural y conversacional
- Sé conciso (máximo 3-4 párrafos)
- Usa emojis ocasionalmente
- Siempre invita a agendar demo o hacer otra pregunta sobre Camaral

## FORMATO (MUY IMPORTANTE)
Usa formato HTML para dar estilo a tus respuestas:
- Negrita: <b>texto</b>
- Cursiva: <i>texto</i>
- Enlaces: <a href="url">texto</a>
- NO uses markdown (**texto**, _texto_, [texto](url))
- Ejemplo correcto: "Agenda tu demo en <a href="https://calendly.com/emmsarias13/30min">este enlace</a>"

## INFORMACIÓN CLAVE
- Fundada en ${COMPANY_INFO.FOUNDED} en ${COMPANY_INFO.LOCATION}
- CEO: ${COMPANY_INFO.CEO}
- Avatares IA para reuniones en Zoom, Teams, Meet
- Disponible 24/7
- Planes: Pro ($99/mes), Scale ($299/mes), Growth ($799/mes), Enterprise
- Demo: ${EXTERNAL_LINKS.CALENDLY}`;

/**
 * Respuesta estándar para preguntas fuera de tema
 */
const OFF_TOPIC_RESPONSE = `¡Hola! 👋 Soy el asistente de Camaral y mi especialidad es ayudarte con información sobre nuestros avatares de IA para reuniones.

¿Te gustaría saber cómo Camaral puede ayudar a tu negocio? Por ejemplo:
• Cómo funcionan los avatares IA
• Casos de uso (ventas, soporte, reclutamiento)
• Planes y precios

¿En qué puedo ayudarte sobre Camaral?`;

/**
 * Patrones que indican preguntas fuera de tema
 */
const OFF_TOPIC_PATTERNS: RegExp[] = [
  /^(hola|hey|hi|hello|buenos días|buenas tardes|buenas noches)$/i,
  /cuéntame (un chiste|algo gracioso|una historia)/i,
  /quién (eres|te creó|te hizo)/i,
  /(escribe|genera|crea).*(código|programa|script)/i,
  /(resuelve|calcula|ayuda con).*(matemáticas|ecuación|problema)/i,
  /(qué opinas|qué piensas).*(política|religión|gobierno)/i,
  /(recomienda|sugiere).*(película|libro|música|restaurante)/i,
  /^(gracias|ok|vale|entendido|perfecto)$/i,
];

/**
 * Keywords relacionados con Camaral
 */
const CAMARAL_KEYWORDS = [
  "camaral", "avatar", "reunión", "reuniones", "ventas", "soporte",
  "precio", "plan", "demo", "bot", "ia", "inteligencia artificial",
  "zoom", "teams", "meet", "videollamada", "automatizar"
];

/**
 * Determina si un mensaje está fuera de tema
 */
function isOffTopic(message: string, relevantChunks: SearchResult[]): boolean {
  const lowerMessage = message.toLowerCase();

  // Verificar patrones off-topic
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return true;
    }
  }

  // Calcular score de relevancia promedio
  const avgScore = relevantChunks.length > 0
    ? relevantChunks.reduce((sum, c) => sum + c.score, 0) / relevantChunks.length
    : 0;

  // Verificar si contiene keywords de Camaral
  const hasCamaralKeyword = CAMARAL_KEYWORDS.some(kw => lowerMessage.includes(kw));

  // Si el score es muy bajo y no hay keywords relevantes
  if (avgScore < RAG_CONFIG.MIN_RELEVANCE_SCORE && !hasCamaralKeyword) {
    return true;
  }

  return false;
}

/**
 * Genera una respuesta usando RAG y GPT-4o
 */
export async function generateResponse(
  userMessage: string,
  conversationHistory: ConversationHistory = []
): Promise<string> {
  // Generar embedding de la pregunta
  const queryEmbedding = await generateEmbedding(userMessage);

  // Buscar contexto relevante
  const relevantChunks = await searchSimilar(queryEmbedding, RAG_CONFIG.TOP_K_RESULTS);

  // Verificar si la pregunta está fuera de tema
  if (isOffTopic(userMessage, relevantChunks)) {
    return OFF_TOPIC_RESPONSE;
  }

  // Construir contexto
  const context = relevantChunks
    .map((chunk) => `[${chunk.section}]\n${chunk.text}`)
    .join("\n\n---\n\n");

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `Contexto relevante:\n\n${context}` },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: AI_CONFIG.MODEL,
    messages,
    temperature: AI_CONFIG.TEMPERATURE,
    max_tokens: AI_CONFIG.MAX_TOKENS,
  });

  return response.choices[0].message.content
    || "Lo siento, no pude generar una respuesta. ¿Puedo ayudarte con algo sobre Camaral?";
}

/**
 * Genera una respuesta rápida sin RAG (para casos simples)
 */
export async function generateQuickResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: AI_CONFIG.TEMPERATURE,
    max_tokens: 500,
  });

  return response.choices[0].message.content || "";
}
