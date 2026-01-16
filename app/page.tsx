import DataInput from '@/components/DataInput'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      {/* Navigation Bar */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">📊 Tajedar</h1>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300"
          >
            View Analytics
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
            Add Your Data
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Enter your data entry details below. Your data will be automatically processed and displayed in real-time analytics on the dashboard.
          </p>
        </div>

        {/* Data Input Form */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700/50 mb-12">
          <DataInput />
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">Add Data</h3>
            <p className="text-slate-400">Fill in the form with your data value, category, and source information.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Processing</h3>
            <p className="text-slate-400">Your data is instantly processed and validated for accuracy.</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">View Analytics</h3>
            <p className="text-slate-400">Navigate to the dashboard to see charts, trends, and detailed analytics.</p>
          </div>
        </div>
      </div>
    </main>
  )
}