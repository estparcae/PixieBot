# AGENTS.md - Contexto para Agentes de IA

Este archivo proporciona contexto para agentes de IA que trabajen en este proyecto.

## Descripción del Proyecto

**PixieBot** es un bot de Telegram con RAG (Retrieval-Augmented Generation) para Camaral, una startup de avatares de IA para reuniones de ventas y soporte.

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Telegram      │────▶│  Next.js API     │────▶│  OpenAI GPT-4o  │
│   (Usuario)     │◀────│  (Webhook)       │◀────│  (Respuestas)   │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │  Upstash Vector  │
                        │  (RAG Search)    │
                        └──────────────────┘
```

## Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Bot**: grammy (Telegram Bot Framework)
- **IA**: OpenAI GPT-4o + Whisper
- **Vector DB**: Upstash Vector
- **Embeddings**: text-embedding-3-small
- **Deploy**: Vercel (Serverless)

## Estructura del Proyecto

```
src/
├── app/
│   └── api/
│       ├── telegram/route.ts  # Webhook de Telegram
│       └── index/route.ts     # Indexación de documentos
├── lib/
│   ├── config.ts              # Configuración centralizada
│   ├── types.ts               # Tipos TypeScript
│   ├── bot.ts                 # Lógica del bot
│   ├── ai.ts                  # Cliente GPT-4o con guardrails
│   ├── audio.ts               # Transcripción Whisper
│   └── rag/
│       ├── chunker.ts         # División de documentos
│       ├── embeddings.ts      # Generación de embeddings
│       ├── vectorStore.ts     # Cliente Upstash
│       └── index.ts           # Exportaciones
scripts/
├── index-docs.ts              # Script de indexación
└── setup-webhook.ts           # Configuración de webhook
```

## Flujo de Datos

### 1. Indexación (Una vez)
```
investigacion.md → Chunking → Embeddings → Upstash Vector
```

### 2. Consulta (Cada mensaje)
```
Mensaje → Embedding → Vector Search → Contexto + GPT-4o → Respuesta
```

## Guardrails del Bot

El bot tiene restricciones estrictas:
- Solo responde sobre Camaral y temas relacionados
- Rechaza educadamente preguntas off-topic
- Siempre invita a agendar demo (Calendly)
- No inventa información fuera del contexto

## Variables de Entorno Requeridas

```env
TELEGRAM_BOT_TOKEN=      # Token del bot de Telegram
OPENAI_API_KEY=          # API key de OpenAI
UPSTASH_VECTOR_REST_URL= # URL de Upstash Vector
UPSTASH_VECTOR_REST_TOKEN= # Token de Upstash
```

## Comandos Útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run index        # Indexar documentos
npm run webhook:set  # Configurar webhook de Telegram
npm run webhook:info # Ver estado del webhook
```

## Archivos Clave para Modificar

| Archivo | Propósito |
|---------|-----------|
| `src/lib/config.ts` | Configuración y constantes |
| `src/lib/ai.ts` | Prompt del sistema y guardrails |
| `src/lib/bot.ts` | Comandos y flujos del bot |
| `investigacion.md` | Base de conocimiento (RAG) |

## Convenciones de Código

- TypeScript estricto
- Funciones documentadas con JSDoc
- Configuración centralizada en `config.ts`
- Tipos en `types.ts`
- Nombres en español para mensajes de usuario
- Nombres en inglés para código

## Testing

Para probar cambios:
1. Ejecutar `npm run build` para verificar tipos
2. Hacer push a GitHub (deploy automático en Vercel)
3. Probar el bot en https://t.me/camaral_info_bot

## URLs Importantes

- **Bot**: https://t.me/camaral_info_bot
- **Frontend**: https://pixie-bot-phi.vercel.app
- **Demo**: https://calendly.com/emmsarias13/30min
