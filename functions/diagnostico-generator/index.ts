import { createClient } from "https://esm.sh/@insforge/sdk@0.1.0"
export default async function handler(req: Request) {
  const body = await req.json()
  const { business_name, tools, repetitive_tasks, employees } = body
  const insforge = createClient({ url: Deno.env.get("INSFORGE_URL")!, serviceKey: Deno.env.get("INSFORGE_SERVICE_KEY")! })
  const prompt = `Negocio: ${business_name} Herramientas: ${tools.join(", ")} Tareas: ${JSON.stringify(repetitive_tasks)} Empleados: ${employees} Genera JSON con {bottlenecks: string[], opportunities: [{process, hours_saved_per_week, solution, priority}], roi_monthly_hours}`
  const completion = await insforge.ai.chat.completions.create({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], response_format: { type: "json_object" } })
  const roadmap = JSON.parse(completion.choices[0].message.content)
  const { data: diag } = await insforge.database.from("diagnostics").insert([{ business_name, tools_used: tools, repetitive_tasks, bottlenecks: roadmap.bottlenecks, roadmap, hours_estimated: roadmap.roi_monthly_hours }]).select()
  return new Response(JSON.stringify({ diagnostic_id: diag?.[0]?.id, roadmap, message: `Detectamos ${roadmap.roi_monthly_hours}h/mes recuperables` }), { status: 200 })
}
