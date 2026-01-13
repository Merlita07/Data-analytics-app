import DataInput from '@/components/DataInput'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-white bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">Data Analytics Dashboard</h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <DataInput />
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Data Management</h2>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">
              Use the form on the left to add new data entries. The dashboard below will automatically update
              with real-time analytics, charts, and insights from your data.
            </p>
          </div>
        </div>
        <Dashboard />
      </div>
    </main>
  )
}