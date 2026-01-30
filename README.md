# 🤖 PixieBot - Bot de Telegram con RAG para Camaral

Bot de Telegram inteligente que responde preguntas sobre Camaral utilizando RAG (Retrieval-Augmented Generation) para proporcionar respuestas precisas y contextuales.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/estparcae/PixieBot)

## 🌟 Características

- **RAG (Retrieval-Augmented Generation)**: Búsqueda semántica en la base de conocimiento
- **GPT-4o**: Respuestas naturales y contextuales
- **Transcripción de voz**: Soporte para notas de voz con Whisper
- **Guardrails**: Solo responde sobre Camaral, rechaza preguntas off-topic
- **Menú interactivo**: Botones inline para navegación fácil
- **Multi-idioma**: Optimizado para español

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Flujo del Sistema](#flujo-del-sistema)
- [Buenas Prácticas](#buenas-prácticas)
- [API Reference](#api-reference)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA RAG                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐                                                   │
│  │ investigacion│     INDEXACIÓN (una vez)                          │
│  │     .md      │─────────────────────────────────────┐             │
│  └──────────────┘                                     │             │
│         │                                             │             │
│         ▼                                             ▼             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐    │
│  │   Chunking   │────▶│  Embeddings  │────▶│  Upstash Vector  │    │
│  │  (512 tok)   │     │  (OpenAI)    │     │    (Storage)     │    │
│  └──────────────┘     └──────────────┘     └────────┬─────────┘    │
│                                                      │              │
├──────────────────────────────────────────────────────┼──────────────┤
│                                                      │              │
│  ┌──────────────┐     CONSULTA (cada mensaje)        │              │
│  │   Telegram   │                                    │              │
│  │   Usuario    │                                    │              │
│  └──────┬───────┘                                    │              │
│         │                                            │              │
│         ▼                                            ▼              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐    │
│  │   Webhook    │────▶│  Embedding   │────▶│  Vector Search   │    │
│  │  (Next.js)   │     │   Query      │     │   (Top K=4)      │    │
│  └──────────────┘     └──────────────┘     └────────┬─────────┘    │
│         │                                            │              │
│         │              ┌─────────────────────────────┘              │
│         │              │                                            │
│         ▼              ▼                                            │
│  ┌─────────────────────────────┐     ┌──────────────────┐          │
│  │        GPT-4o               │────▶│    Respuesta     │          │
│  │  (Contexto + Guardrails)    │     │   al Usuario     │          │
│  └─────────────────────────────┘     └──────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| **Framework** | Next.js | 15.x | App Router, API Routes |
| **Runtime** | React | 19.x | UI Components |
| **Bot** | grammy | 1.31.x | Telegram Bot Framework |
| **IA** | OpenAI | 4.77.x | GPT-4o, Whisper, Embeddings |
| **Vector DB** | Upstash Vector | 1.1.x | Almacenamiento de embeddings |
| **Styling** | Tailwind CSS | 4.x | Estilos del frontend |
| **Deploy** | Vercel | - | Serverless hosting |
| **Language** | TypeScript | 5.x | Type safety |

## 📁 Estructura del Proyecto

```
pixie-bot/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   ├── telegram/
│   │   │   │   └── route.ts      # Webhook handler
│   │   │   └── index/
│   │   │       └── route.ts      # Endpoint de indexación
│   │   ├── globals.css           # Estilos globales
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Landing page
│   │
│   └── lib/                      # Lógica de negocio
│       ├── config.ts             # ⚙️ Configuración centralizada
│       ├── types.ts              # 📝 Tipos TypeScript
│       ├── bot.ts                # 🤖 Lógica del bot
│       ├── ai.ts                 # 🧠 Cliente GPT-4o + Guardrails
│       ├── audio.ts              # 🎤 Transcripción Whisper
│       └── rag/                  # 📚 Sistema RAG
│           ├── index.ts          # Exportaciones
│           ├── chunker.ts        # División de documentos
│           ├── embeddings.ts     # Generación de embeddings
│           └── vectorStore.ts    # Cliente Upstash Vector
│
├── scripts/
│   ├── index-docs.ts             # Script de indexación
│   └── setup-webhook.ts          # Configuración de webhook
│
├── investigacion.md              # 📄 Base de conocimiento
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── AGENTS.md                     # Contexto para agentes IA
└── README.md
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Cuenta de OpenAI con API key
- Bot de Telegram (crear con @BotFather)
- Cuenta de Upstash (para Vector DB)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/estparcae/PixieBot.git
cd PixieBot

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Indexar la base de conocimiento
npm run index

# 5. Iniciar servidor de desarrollo
npm run dev
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env.local`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=tu_token_de_botfather

# OpenAI
OPENAI_API_KEY=sk-proj-xxx

# Upstash Vector
UPSTASH_VECTOR_REST_URL=https://xxx.upstash.io
UPSTASH_VECTOR_REST_TOKEN=xxx

# Webhook (URL de producción)
WEBHOOK_URL=https://tu-dominio.vercel.app/api/telegram
```

### Configurar Webhook de Telegram

```bash
# Ver estado actual
npm run webhook:info

# Configurar webhook
npm run webhook:set

# Eliminar webhook (para desarrollo local)
npm run webhook:delete
```

## 📖 Uso

### Comandos del Bot

| Comando | Descripción |
|---------|-------------|
| `/start` | Inicia la conversación y muestra el menú |
| `/help` | Muestra ayuda y comandos disponibles |
| `/precios` | Muestra planes y precios |
| `/demo` | Link para agendar una demo |

### Flujo de Conversación

1. Usuario envía mensaje (texto o voz)
2. Si es voz, se transcribe con Whisper
3. Se genera embedding del mensaje
4. Se buscan chunks relevantes en Upstash
5. Se construye prompt con contexto
6. GPT-4o genera respuesta
7. Se envía respuesta con botón de demo

## 🔄 Flujo del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                        TELEGRAM                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ /start  │  │  Texto  │  │   Voz   │  │ Botones │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BOT (bot.ts)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  • Manejo de comandos                                 │   │
│  │  • Gestión de historial                              │   │
│  │  • Teclados inline                                   │   │
│  │  • Routing de callbacks                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  AUDIO       │  │     AI       │  │    RAG       │
│  (audio.ts)  │  │   (ai.ts)    │  │  (rag/*.ts)  │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ • Whisper    │  │ • GPT-4o     │  │ • Chunking   │
│ • Download   │  │ • Guardrails │  │ • Embeddings │
│ • Transcribe │  │ • Prompts    │  │ • Search     │
└──────────────┘  └──────────────┘  └──────────────┘
                          │                 │
                          ▼                 ▼
                  ┌──────────────┐  ┌──────────────┐
                  │   OpenAI     │  │   Upstash    │
                  │    API       │  │   Vector     │
                  └──────────────┘  └──────────────┘
```

### Flujo de Mensaje de Texto

```
Usuario escribe "¿Qué es Camaral?"
         │
         ▼
┌─────────────────────────┐
│ 1. Webhook recibe POST  │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 2. bot.ts procesa texto │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 3. generateResponse()   │
│    en ai.ts             │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 4. generateEmbedding()  │
│    del mensaje          │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 5. searchSimilar()      │
│    en Upstash (top 4)   │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 6. isOffTopic()?        │
│    - Sí → OFF_TOPIC_MSG │
│    - No → continuar     │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 7. GPT-4o genera        │
│    respuesta con        │
│    contexto RAG         │
└───────────┬─────────────┘
            ▼
┌─────────────────────────┐
│ 8. Enviar respuesta +   │
│    botón "Agendar demo" │
└─────────────────────────┘
```

## ✅ Buenas Prácticas

### Código

```typescript
// ✅ Configuración centralizada
import { AI_CONFIG, EXTERNAL_LINKS } from "./config";

// ✅ Tipos estrictos
import type { ConversationHistory, SearchResult } from "./types";

// ✅ Funciones documentadas
/**
 * Genera una respuesta usando RAG y GPT-4o
 * @param userMessage - Mensaje del usuario
 * @param history - Historial de conversación
 */
export async function generateResponse(
  userMessage: string,
  history: ConversationHistory = []
): Promise<string> { ... }

// ✅ Constantes en UPPER_CASE
const MAX_TOKENS = 800;
const EMBEDDING_MODEL = "text-embedding-3-small";

// ✅ Early returns para legibilidad
if (isOffTopic(message, chunks)) {
  return OFF_TOPIC_RESPONSE;
}

// ✅ Error handling consistente
try {
  const response = await generateResponse(message);
  await ctx.reply(response);
} catch (error) {
  console.error("Error:", error);
  await ctx.reply("Lo siento, hubo un error.");
}
```

### Arquitectura

1. **Separación de responsabilidades**: Cada archivo tiene una función específica
2. **Configuración centralizada**: `config.ts` para constantes y settings
3. **Tipos compartidos**: `types.ts` para interfaces reutilizables
4. **Guardrails de IA**: Prompt engineering para mantener el foco
5. **Lazy initialization**: Bot se crea al primer request, no al importar

### Seguridad

- Variables de entorno para secretos (nunca en código)
- Guardrails para prevenir respuestas fuera de tema
- Validación de inputs de usuario
- Rate limiting implícito de APIs externas

## 📚 API Reference

### Webhook Endpoint

```
POST /api/telegram
```

Recibe updates de Telegram y procesa mensajes.

**Response**: `200 OK` (vacío para Telegram)

### Index Endpoint

```
GET /api/index
```

Retorna estadísticas del índice vectorial.

```json
{
  "ok": true,
  "status": "Index endpoint ready",
  "vectorCount": 29
}
```

```
POST /api/index
```

Reindexar la base de conocimiento (requiere autorización).

## 🔗 Enlaces

- **Bot de Telegram**: https://t.me/camaral_info_bot
- **Frontend**: https://pixie-bot-phi.vercel.app
- **Agendar Demo**: https://calendly.com/emmsarias13/30min

## 📄 Licencia

MIT © 2025 Camaral

---

Desarrollado con ❤️ para Camaral
