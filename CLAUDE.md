# PixieBot - Bot de Telegram para Camaral

## Proyecto

Bot de Telegram con RAG para responder preguntas sobre Camaral (avatares IA para reuniones).

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build
npm run index        # Indexar documentos
npm run webhook:set  # Configurar webhook
```

## Estructura Clave

- `src/lib/config.ts` - Configuración centralizada
- `src/lib/types.ts` - Tipos TypeScript
- `src/lib/bot.ts` - Lógica del bot
- `src/lib/ai.ts` - GPT-4o + guardrails
- `src/lib/rag/` - Sistema RAG
- `investigacion.md` - Base de conocimiento

## URLs

- Bot: https://t.me/camaral_info_bot
- Frontend: https://pixie-bot-phi.vercel.app
- Demo: https://calendly.com/emmsarias13/30min

## Notas

- El bot SOLO responde sobre Camaral
- Siempre incluir CTA de agendar demo
- Usar configuración de `config.ts`
- Ver `AGENTS.md` para contexto completo
