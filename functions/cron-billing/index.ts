import { createClient } from "https://esm.sh/@insforge/sdk@0.1.0"
export default async function handler(req: Request) {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) return new Response("unauthorized", { status: 401 })
  const insforge = createClient({ url: Deno.env.get("INSFORGE_URL")!, serviceKey: Deno.env.get("INSFORGE_SERVICE_KEY")! })
  const { data: tenants } = await insforge.database.from("tenants").select("id, plan").neq("plan", "free")
  for (const tenant of tenants || []) {
    const amount = tenant.plan === "start" ? 15000 : tenant.plan === "automation" ? 35000 : tenant.plan === "systems" ? 80000 : 150000
    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("MERCADOPAGO_ACCESS_TOKEN")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ title: `FoschiDesk Care - ${tenant.plan}`, quantity: 1, unit_price: amount }], external_reference: tenant.id })
    })
    const mpData = await mpRes.json()
    await insforge.database.from("invoices").insert([{ tenant_id: tenant.id, amount, currency: "ARS", status: "pending", mercadopago_id: mpData.id }])
  }
  return new Response(JSON.stringify({ billed: tenants?.length || 0 }), { status: 200 })
}
