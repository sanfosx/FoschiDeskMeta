import { insforge } from '@/lib/insforge'
export default async function Home() {
  const { data: logs } = await insforge.database.from('automation_logs').select('*').limit(5)
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black">FOSCHIDESK OS x INSFORGE</h1>
      <p className="text-lime-400 mt-2">100% InsForge: DB + Auth + Functions + Realtime + AI Gateway</p>
      <div className="grid grid-cols-3 gap-4 mt-12">
        <div className="border border-white/10 p-6 rounded-xl"><h3 className="font-bold">CRM + Ventas</h3><p className="text-white/60 text-sm">InsForge DB + RLS</p></div>
        <div className="border border-white/10 p-6 rounded-xl"><h3 className="font-bold">Automatizaciones</h3><p className="text-white/60 text-sm">6 Edge Functions</p></div>
        <div className="border border-white/10 p-6 rounded-xl"><h3 className="font-bold">IA + ROI</h3><p className="text-white/60 text-sm">Model Gateway + logs</p></div>
      </div>
      <div className="mt-12"><h2 className="text-xl font-bold">Ultimas automatizaciones</h2><pre className="bg-white/5 p-4 rounded mt-4 text-xs overflow-auto">{JSON.stringify(logs, null, 2)}</pre></div>
      <a href="/diagnostico" className="inline-block mt-8 bg-lime-400 text-black px-6 py-3 font-bold rounded">Hacer diagnostico</a>
    </main>
  )
}
