'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, TimeScale } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, TimeScale)

interface DataEntry {
  id: number
  timestamp: string
  value: number
  category: string
  source: string
}

interface Analytics {
  totalEntries: number
  averageValue: number
  totalValue: number
  minValue: number
  maxValue: number
  categories: string[]
  sumByCategory: { category: string; sum: number; count: number }[]
  trends: { date: string; total: number; count: number }[]
  trendAnalysis: { slope: number; intercept: number; direction: string }
  forecast: { date: string; predictedValue: number; confidence: number }[]
}

export default function Dashboard() {
  const [data, setData] = useState<DataEntry[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editSource, setEditSource] = useState('')

  // New state for advanced features
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    source: '',
    search: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [selectedEntries, setSelectedEntries] = useState<number[]>([])
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filters])

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchData(currentPage, true)
      }, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [autoRefresh, refreshInterval, currentPage, filters])

  const fetchData = async (page = 1, isAutoRefresh = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      })

      const response = await fetch(`/api/data?${params}`)
      if (response.ok) {
        const result = await response.json()
        setData(result.data)
        setAnalytics(result.analytics)
        setTotalPages(result.pagination.totalPages)
        setCurrentPage(result.pagination.page)
        if (!isAutoRefresh) {
          setLastRefresh(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      if (!isAutoRefresh) {
        setLoading(false)
      }
    }
  }

  const handleManualRefresh = () => {
    fetchData(currentPage)
    setLastRefresh(new Date())
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      })

      const response = await fetch(`/api/data/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data-export.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleSelectEntry = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedEntries(prev => [...prev, id])
    } else {
      setSelectedEntries(prev => prev.filter(entryId => entryId !== id))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEntries(data.map(entry => entry.id))
    } else {
      setSelectedEntries([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedEntries.length} entries?`)) return

    setBulkDeleting(true)
    try {
      const deletePromises = selectedEntries.map(id =>
        fetch(`/api/data?id=${id}`, { method: 'DELETE' })
      )
      await Promise.all(deletePromises)
      setSelectedEntries([])
      fetchData()
    } catch (error) {
      console.error('Error bulk deleting:', error)
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleEdit = (entry: DataEntry) => {
    setEditingId(entry.id)
    setEditValue(entry.value.toString())
    setEditCategory(entry.category)
    setEditSource(entry.source)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    try {
      const response = await fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, value: editValue, category: editCategory, source: editSource }),
      })
      if (response.ok) {
        fetchData()
        setEditingId(null)
      }
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    try {
      const response = await fetch(`/api/data?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  if (loading) {
    return <div className="text-center text-white">Loading...</div>
  }

  // Prepare chart data
  const colors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 205, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
  ]

  const barData = {
    labels: analytics?.sumByCategory.map(s => s.category) || [],
    datasets: [
      {
        label: 'Sum by Category',
        data: analytics?.sumByCategory.map(s => s.sum) || [],
        backgroundColor: analytics?.sumByCategory.map((_, index) => colors[index % colors.length]) || [],
      },
    ],
  }

  const lineData = {
    labels: [
      ...analytics?.trends.map(t => t.date) || [],
      ...analytics?.forecast.map(f => f.date) || []
    ],
    datasets: [
      {
        label: 'Historical Data',
        data: analytics?.trends.map(t => t.total) || [],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 2,
      },
      {
        label: 'Forecast',
        data: [
          ...Array(analytics?.trends.length || 0).fill(null),
          ...analytics?.forecast.map(f => f.predictedValue) || []
        ],
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderWidth: 2,
        borderDash: [5, 5],
      },
    ],
  }

  // Pie chart data - distribution by category
  const pieData = {
    labels: analytics?.sumByCategory.map(s => s.category) || [],
    datasets: [
      {
        data: analytics?.sumByCategory.map(s => s.sum) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  // Scatter plot data - value vs time
  const scatterData = {
    datasets: [
      {
        label: 'Value Distribution',
        data: data.map(entry => ({
          x: new Date(entry.timestamp),
          y: entry.value,
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">Data Analytics Dashboard</h1>

      {/* Advanced Filters */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Filters & Export</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-2 md:px-3 py-3 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-2 md:px-3 py-3 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-2 md:px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="">All Categories</option>
              {analytics?.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search categories/sources..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-2 md:px-3 py-3 text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={handleManualRefresh}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-3 md:px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 font-medium text-sm"
          >
            🔄 Refresh
          </button>
          <label className="flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700/50 focus:ring-cyan-500/50"
            />
            Auto-refresh
          </label>
          {autoRefresh && (
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-slate-700/50 border border-slate-600 rounded-xl px-2 md:px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
            >
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
          )}
          <span className="text-slate-300 text-xs md:text-sm self-center">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 md:px-4 py-3 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 font-medium text-sm"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 md:px-4 py-3 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 font-medium text-sm"
          >
            {exporting ? 'Exporting...' : 'Export JSON'}
          </button>
          {selectedEntries.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-3 md:px-4 py-3 rounded-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 font-medium text-sm"
            >
              {bulkDeleting ? 'Deleting...' : `Delete ${selectedEntries.length} Selected`}
            </button>
          )}
          <button
            onClick={() => setFilters({ startDate: '', endDate: '', category: '', source: '', search: '' })}
            className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-3 md:px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium text-sm backdrop-blur-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Total Entries</h3>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{analytics.totalEntries}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Total Value</h3>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{analytics.totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Average Value</h3>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{analytics.averageValue.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-yellow-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Min Value</h3>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">{analytics.minValue.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-red-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Max Value</h3>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">{analytics.maxValue.toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">Trend</h3>
            <p className={`text-xl md:text-2xl font-bold mb-1 ${analytics.trendAnalysis.direction === 'increasing' ? 'text-green-400' :
              analytics.trendAnalysis.direction === 'decreasing' ? 'text-red-400' : 'text-slate-400'
              }`}>
              {analytics.trendAnalysis.direction === 'increasing' ? '↗️' :
                analytics.trendAnalysis.direction === 'decreasing' ? '↘️' : '➡️'}
            </p>
            <p className="text-xs md:text-sm text-slate-400">{analytics.trendAnalysis.direction}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-3 md:p-4 rounded-2xl shadow-xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1">
            <h3 className="text-sm md:text-lg font-semibold text-white mb-1">7-Day Forecast</h3>
            <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {analytics?.forecast[6]?.predictedValue.toFixed(2) || 'N/A'}
            </p>
            <p className="text-xs md:text-sm text-slate-400">
              {analytics?.forecast.length ? `~${Math.round(analytics.forecast[6].confidence * 100)}% confidence` : 'Need more data'}
            </p>
          </div>
        </div>
      )
      }

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Sum by Category</h2>
          <div className="h-64 md:h-80">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Daily Trends</h2>
          <div className="h-64 md:h-80">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Category Distribution</h2>
          <div className="h-64 md:h-80">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Value Scatter Plot</h2>
          <div className="h-64 md:h-80">
            <Scatter data={scatterData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  type: 'time',
                  time: {
                    unit: 'day'
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-xl border border-slate-700/50">
        <h2 className="text-lg md:text-xl font-semibold mb-4 text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Recent Data Entries</h2>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-slate-700/50 backdrop-blur-sm">
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedEntries.length === data.length && data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-800/50 focus:ring-cyan-500/50"
                    />
                  </th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm text-slate-300 font-semibold">Timestamp</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm text-slate-300 font-semibold">Value</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm text-slate-300 font-semibold">Category</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm text-slate-300 font-semibold">Source</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-600/50 hover:bg-slate-700/30 transition-all duration-200 backdrop-blur-sm">
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => handleSelectEntry(entry.id, e.target.checked)}
                        className="rounded border-slate-600 bg-slate-800/50 focus:ring-cyan-500/50"
                      />
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-300">{new Date(entry.timestamp).toLocaleString()}</td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-300">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-slate-700/50 text-white px-1 md:px-2 py-2 rounded-xl text-xs md:text-sm w-full border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
                        />
                      ) : (
                        entry.value
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-300">
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="bg-slate-700/50 text-white px-1 md:px-2 py-2 rounded-xl text-xs md:text-sm w-full border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
                        />
                      ) : (
                        entry.category
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-300">
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          value={editSource}
                          onChange={(e) => setEditSource(e.target.value)}
                          className="bg-slate-700/50 text-white px-1 md:px-2 py-2 rounded-xl text-xs md:text-sm w-full border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 backdrop-blur-sm"
                        />
                      ) : (
                        entry.source
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-300">
                      {editingId === entry.id ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button onClick={handleSaveEdit} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">Save</button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-600/50 hover:bg-slate-500/50 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button onClick={() => handleEdit(entry)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">Edit</button>
                          <button onClick={() => handleDelete(entry.id)} className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Data pagination" className="flex justify-center items-center gap-2 mb-6">
          <button
            onClick={() => fetchData(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
            if (pageNum > totalPages) return null
            return (
              <button
                key={pageNum}
                onClick={() => fetchData(pageNum)}
                className={`px-3 py-1 rounded ${pageNum === currentPage
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === currentPage ? 'page' : undefined}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => fetchData(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}