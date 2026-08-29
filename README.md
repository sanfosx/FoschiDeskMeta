# FoschiDesk OS x InsForge - Boilerplate completo

Stack 100% InsForge para tu modelo: Soluciones + Automatización + IA + Care -> FoschiDesk OS

## Que incluye
- `schema.sql` -> 11 tablas multi-tenant + RLS con auth.uid() + pgvector
- `rpc.sql` -> busqueda vectorial para RAG
- `functions/` -> 6 Edge Functions Deno listas
- `apps/web/` -> Next.js 15 + InsForge SDK + pagina de diagnostico

## Quick Start

```bash
npm i -g @insforge/cli
npx @insforge/cli login
npx @insforge/cli init foschidesk-os
# pega tu URL en .env

# 1. DB
npx @insforge/cli db query "$(cat schema.sql)" --unrestricted
npx @insforge/cli db query "$(cat rpc.sql)" --unrestricted

# 2. Functions
for f in whatsapp-webhook sheets-sync generate-report ai-agent-atencion cron-billing diagnostico-generator; do
  npx @insforge/cli functions deploy $f
done

# 3. Frontend
cd apps/web
pnpm i
pnpm dev
```

## MCP para Cursor
```json
{
  "mcpServers": {
    "insforge": { "command": "npx", "args": ["@insforge/cli", "mcp"] }
  }
}
```
Prompt: "Crea modulo de facturacion AR con tabla invoices usando InsForge"
