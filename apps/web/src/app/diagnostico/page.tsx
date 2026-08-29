'use client'
import { useState } from 'react'
export default function DiagnosticoPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  async function submit(e: any) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.target)
    const res = await fetch(`${process.env.NEXT_PUBLIC_INSFORGE_URL}/functions/diagnostico-generator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: form.get('business'),
        tools: (form.get('tools') as string).split(','),
        repetitive_tasks: [{ task: form.get('task'), hours: form.get('hours') }],
        employees: form.get('employees')
      })
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold">Diagnostico de Automatizacion</h1>
      <form onSubmit={submit} className="mt-8 space-y-4 max-w-lg">
        <input name="business" placeholder="Nombre negocio" className="w-full p-3 bg-white/10 rounded" required />
        <input name="tools" placeholder="Herramientas (Excel, WhatsApp, Sheets)" className="w-full p-3 bg-white/10 rounded" required />
        <input name="task" placeholder="Tarea repetitiva" className="w-full p-3 bg-white/10 rounded" required />
        <input name="hours" placeholder="Horas por semana" type="number" className="w-full p-3 bg-white/10 rounded" required />
        <input name="employees" placeholder="Empleados" type="number" className="w-full p-3 bg-white/10 rounded" />
        <button disabled={loading} className="bg-lime-400 text-black px-6 py-3 font-bold rounded w-full">{loading ? 'Analizando...' : 'Generar roadmap'}</button>
      </form>
      {result && <pre className="mt-8 bg-white/5 p-4 rounded text-xs">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
