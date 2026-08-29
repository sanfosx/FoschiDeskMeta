import { createClient } from "https://esm.sh/@insforge/sdk@0.1.0"
export default async function handler(req: Request) {
  const { tenant_id, sheet_id, range } = await req.json()
  const insforge = createClient({ url: Deno.env.get("INSFORGE_URL")!, serviceKey: Deno.env.get("INSFORGE_SERVICE_KEY")! })
  const googleToken = Deno.env.get("GOOGLE_ACCESS_TOKEN")
  const sheetsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheet_id}/values/${range}`, { headers: { Authorization: `Bearer ${googleToken}` } })
  const sheetData = await sheetsRes.json()
  const rows = sheetData.values.slice(1)
  const contacts = rows.map((r: any[]) => ({ tenant_id, name: r[0], phone: r[1], email: r[2], source: "sheets_sync" }))
  await insforge.database.from("contacts").insert(contacts)
  await insforge.database.from("automation_logs").insert([{ tenant_id, process_name: "sheets_sync", hours_saved: rows.length * 0.05, payload: { sheet_id, rows: rows.length } }])
  return new Response(JSON.stringify({ synced: rows.length }), { status: 200 })
}
