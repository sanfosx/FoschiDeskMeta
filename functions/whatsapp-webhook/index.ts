import { createClient } from "https://esm.sh/@insforge/sdk@0.1.0"
export default async function handler(req: Request) {
  if (req.method === "GET") {
    const url = new URL(req.url)
    if (url.searchParams.get("hub.mode") === "subscribe") {
      return new Response(url.searchParams.get("hub.challenge"), { status: 200 })
    }
  }
  const body = await req.json()
  const insforge = createClient({ url: Deno.env.get("INSFORGE_URL")!, anonKey: Deno.env.get("INSFORGE_ANON_KEY")! })
  try {
    const entry = body.entry?.[0]?.changes?.[0]?.value
    const message = entry?.messages?.[0]
    if (!message) return new Response("no message", { status: 200 })
    const from = message.from
    const text = message.text?.body || ""
    const tenantId = req.headers.get("x-tenant-id") || Deno.env.get("DEFAULT_TENANT_ID")
    await insforge.database.from("contacts").insert([{ tenant_id: tenantId, name: entry.contacts?.[0]?.profile?.name || from, phone: from, source: "whatsapp", status: "nuevo", metadata: { last_message: text } }])
    await insforge.database.from("automation_logs").insert([{ tenant_id: tenantId, process_name: "whatsapp_inbound", hours_saved: 0.1, payload: { from, text } }])
    await insforge.realtime.broadcast("contacts", { event: "new_whatsapp", tenant_id: tenantId, phone: from, text })
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 })
  }
}
