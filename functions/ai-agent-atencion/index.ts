import { createClient } from "https://esm.sh/@insforge/sdk@0.1.0"
export default async function handler(req: Request) {
  const { tenant_id, message, contact_id } = await req.json()
  const insforge = createClient({ url: Deno.env.get("INSFORGE_URL")!, serviceKey: Deno.env.get("INSFORGE_SERVICE_KEY")! })
  const embeddingRes = await insforge.ai.embeddings.create({ model: "text-embedding-3-small", input: message })
  const embedding = embeddingRes.data[0].embedding
  const { data: knowledge } = await insforge.database.rpc("match_knowledge", { query_embedding: embedding, match_threshold: 0.75, match_count: 5, filter_tenant: tenant_id })
  const context = knowledge?.map((k:any)=>`Problema: ${k.problem} Solución: ${k.solution}`).join("\n---\n") || ""
  const completion = await insforge.ai.chat.completions.create({
    model: "claude-3-5-sonnet-20241022",
    messages: [
      { role: "system", content: `Sos asistente de ${tenant_id}. Contexto: ${context}. Responde en español rioplatense corto.` },
      { role: "user", content: message }
    ]
  })
  const answer = completion.choices[0].message.content
  await insforge.database.from("automation_logs").insert([{ tenant_id, process_name: "ai_atencion", hours_saved: 0.15, payload: { message, answer, contact_id } }])
  return new Response(JSON.stringify({ answer }), { status: 200 })
}
