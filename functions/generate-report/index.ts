import { createClient } from "https://esm.sh/@insforge/sdk@0.1.0"
export default async function handler(req: Request) {
  const { tenant_id, month } = await req.json()
  const insforge = createClient({ url: Deno.env.get("INSFORGE_URL")!, serviceKey: Deno.env.get("INSFORGE_SERVICE_KEY")! })
  const { data: logs } = await insforge.database.from("automation_logs").select("*").eq("tenant_id", tenant_id).gte("created_at", `${month}-01`)
  const totalHours = logs?.reduce((acc: number, l: any) => acc + (l.hours_saved || 0), 0) || 0
  const html = `<h1>Reporte FoschiDesk - ${month}</h1><p>Horas recuperadas: <b>${totalHours.toFixed(1)}h</b></p><p>Valor estimado: $${(totalHours * 8000).toLocaleString('es-AR')}</p><ul>${logs?.map((l:any)=>`<li>${l.process_name} - ${l.hours_saved}h</li>`).join('')}</ul>`
  const fileName = `reports/${tenant_id}/${month}-roi.html`
  await insforge.storage.from("client-docs").upload(fileName, new Blob([html], { type: "text/html" }))
  const { data: url } = await insforge.storage.from("client-docs").getPublicUrl(fileName)
  return new Response(JSON.stringify({ totalHours, reportUrl: url }), { status: 200 })
}
