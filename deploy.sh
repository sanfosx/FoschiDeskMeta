#!/bin/bash
echo "1. DB..."
npx @insforge/cli db query "$(cat schema.sql)" --unrestricted
npx @insforge/cli db query "$(cat rpc.sql)" --unrestricted
echo "2. Functions..."
for f in whatsapp-webhook sheets-sync generate-report ai-agent-atencion cron-billing diagnostico-generator; do
  npx @insforge/cli functions deploy $f
done
echo "3. Cron..."
npx @insforge/cli functions cron create cron-billing --schedule "0 9 1 * *"
echo "Listo!"
