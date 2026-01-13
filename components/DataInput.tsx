'use client'

import { useState } from 'react'

export default function DataInput() {
  const [value, setValue] = useState('')
  const [category, setCategory] = useState('')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Frontend validation
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      setMessage('Value must be a positive number')
      setLoading(false)
      return
    }

    if (numValue > 1000000) {
      setMessage('Value cannot exceed 1,000,000')
      setLoading(false)
      return
    }

    if (!category.trim()) {
      setMessage('Category is required')
      setLoading(false)
      return
    }

    if (!source.trim()) {
      setMessage('Source is required')
      setLoading(false)
      return
    }

    if (category.length > 100 || source.length > 100) {
      setMessage('Category and source must be less than 100 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: numValue.toString(),
          category: category.trim(),
          source: source.trim()
        }),
      })

      if (response.ok) {
        setMessage('Data added successfully!')
        setValue('')
        setCategory('')
        setSource('')
      } else {
        const error = await response.json()
        if (error.details) {
          // Handle detailed validation errors
          const details = Object.entries(error.details)
            .filter(([_, msg]) => msg)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ')
          setMessage(`${error.error}: ${details}`)
        } else {
          setMessage(error.error || 'Failed to add data')
        }
      }
    } catch (error) {
      setMessage('Error submitting data')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) {
      setImportMessage('Please select a CSV file')
      return
    }

    setImportLoading(true)
    setImportMessage('')

    try {
      const formData = new FormData()
      formData.append('file', importFile)

      const response = await fetch('/api/data/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        let message = `Successfully imported ${result.imported} entries out of ${result.totalRows} rows.`
        if (result.errors.length > 0) {
          message += `\n\nErrors (${result.errors.length}):`
          result.errors.slice(0, 5).forEach((error: string) => {
            message += `\n• ${error}`
          })
          if (result.errors.length > 5) {
            message += `\n• ... and ${result.errors.length - 5} more errors`
          }
        }
        setImportMessage(message)
        setImportFile(null)
        // Reset file input
        const fileInput = document.getElementById('csv-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setImportMessage(result.error || 'Failed to import CSV')
        if (result.details) {
          setImportMessage(prev => prev + '\n\nDetails:\n' + result.details.join('\n'))
        }
      }
    } catch (error) {
      setImportMessage('Error importing CSV file')
    } finally {
      setImportLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setImportMessage('Please select a valid CSV file')
        setImportFile(null)
        e.target.value = ''
        return
      }
      setImportFile(file)
      setImportMessage('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          {activeTab === 'manual' ? 'Manual Data Entry' : 'CSV Import'}
        </h2>

        {/* Toggle Switch */}
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium ${activeTab === 'manual' ? 'text-cyan-400' : 'text-slate-400'}`}>
            Manual
          </span>
          <button
            onClick={() => setActiveTab(activeTab === 'manual' ? 'import' : 'manual')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 ${activeTab === 'import' ? 'bg-green-600' : 'bg-cyan-600'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${activeTab === 'import' ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
          <span className={`text-sm font-medium ${activeTab === 'import' ? 'text-green-400' : 'text-slate-400'}`}>
            CSV Import
          </span>
        </div>
      </div>

      {activeTab === 'manual' && (
        <>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-slate-300 mb-2">
                Value
              </label>
              <input
                type="number"
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-700/50 text-white placeholder-slate-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="e.g., 123.45"
                required
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-700/50 text-white placeholder-slate-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="e.g., Sales, Revenue"
                required
              />
            </div>
            <div>
              <label htmlFor="source" className="block text-sm font-medium text-slate-300 mb-2">
                Source
              </label>
              <input
                type="text"
                id="source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-700/50 text-white placeholder-slate-400 transition-all duration-200 backdrop-blur-sm"
                placeholder="e.g., API, Manual Entry"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none border border-cyan-500/20"
            >
              {loading ? 'Adding...' : 'Add Data'}
            </button>
          </form>
          {message && (
            <p className={`mt-6 text-sm text-center p-3 rounded-xl backdrop-blur-sm ${message.includes('successfully') ? 'text-green-300 bg-green-500/10 border border-green-500/20' : 'text-red-300 bg-red-500/10 border border-red-500/20'}`}>
              {message}
            </p>
          )}
        </>
      )}

      {activeTab === 'import' && (
        <>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Import CSV File</h3>
              <p className="text-slate-300 text-sm mb-4">
                Upload a CSV file with columns: <code className="bg-slate-700 px-2 py-1 rounded text-xs">value</code>, <code className="bg-slate-700 px-2 py-1 rounded text-xs">category</code>, <code className="bg-slate-700 px-2 py-1 rounded text-xs">source</code> (optional: <code className="bg-slate-700 px-2 py-1 rounded text-xs">timestamp</code>)
              </p>
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label htmlFor="csv-file" className="block text-sm font-medium text-slate-300 mb-2">
                    CSV File
                  </label>
                  <input
                    type="file"
                    id="csv-file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="mt-1 block w-full px-4 py-3 border border-slate-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 bg-slate-700/50 text-white file:bg-cyan-600 file:text-white file:border-none file:rounded-lg file:px-3 file:py-1 file:mr-3 file:hover:bg-cyan-700 transition-all duration-200 backdrop-blur-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={importLoading || !importFile}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none border border-green-500/20"
                >
                  {importLoading ? 'Importing...' : 'Import CSV'}
                </button>
              </form>
            </div>
          </div>
          {importMessage && (
            <div className={`mt-6 text-sm p-4 rounded-xl backdrop-blur-sm whitespace-pre-line ${importMessage.includes('Successfully') ? 'text-green-300 bg-green-500/10 border border-green-500/20' : 'text-red-300 bg-red-500/10 border border-red-500/20'}`}>
              {importMessage}
            </div>
          )}
        </>
      )}
    </div>
  )
}