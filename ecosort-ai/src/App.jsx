import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ImageUploader from './components/ImageUploader.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import Footer from './components/Footer.jsx'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const THEME_KEY = 'ecosort-theme'

/**
 * Convert a File to a plain base64 string (no data-URI prefix).
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      // result is "data:<mime>;base64,<data>" — we only need <data>
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function getInitialDarkMode() {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark') return true
  if (stored === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const featureChips = [
  { label: '8 Waste Categories', icon: '🏷' },
  { label: 'Quantity Estimation', icon: '🔢' },
  { label: 'Recycling Guidance', icon: '♻' },
  { label: 'Disposal Recommendations', icon: '📋' },
]

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null) // File object
  const [preview, setPreview] = useState(null)              // data-URI for <img>
  const [results, setResults] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(getInitialDarkMode)

  // ── Theme management ────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement
    // Enable transition class briefly for smooth switch
    root.classList.add('theme-transition')
    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light')
    // Remove transition class after animation completes
    const timer = setTimeout(() => root.classList.remove('theme-transition'), 350)
    return () => clearTimeout(timer)
  }, [darkMode])

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  // ── Image selection ──────────────────────────────────────
  const handleImageSelect = (file) => {
    setError(null)
    setResults(null)

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported file type "${file.type}". Please use JPG, PNG, or WebP.`)
      return
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setError(`Image is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`)
      return
    }

    setSelectedImage(file)

    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    setSelectedImage(null)
    setPreview(null)
    setResults(null)
    setError(null)
  }

  // ── Analysis ─────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedImage) return

    setAnalyzing(true)
    setError(null)
    setResults(null)

    try {
      const base64 = await fileToBase64(selectedImage)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mimeType: selectedImage.type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || `Server responded with ${response.status}`
        )
      }

      // Validate multi-item response
      if (
        !data ||
        !Array.isArray(data.items) ||
        typeof data.totalItems !== 'number' ||
        !data.summary
      ) {
        console.error('Unexpected API response:', data)
        throw new Error(
          'The server returned an unexpected response format.'
        )
      }

      setResults(data)

    } catch (err) {
      console.error('Analysis failed:', err)

      if (
        err.name === 'TypeError' &&
        err.message === 'Failed to fetch'
      ) {
        setError(
          'Network error — could not reach the server. Make sure the dev server is running.'
        )
      } else {
        setError(
          err.message ||
          'An unexpected error occurred. Please try again.'
        )
      }

    } finally {
      setAnalyzing(false)
    }
  }


  // ── Reset / Analyze Another Image ────────────────────────
  const handleReset = () => {
    setSelectedImage(null)
    setPreview(null)
    setResults(null)
    setError(null)
  }

  // ── Download Analysis Report ─────────────────────────────
  const downloadReport = () => {
    if (!results || results.wasteDetected === false) return

    const lines = []

    lines.push('ECOSORT AI - WASTE ANALYSIS REPORT')
    lines.push('===================================')
    lines.push('')
    lines.push(`Total Items Detected: ${results.totalItems || 0}`)
    lines.push('')

    // Waste composition
    lines.push('WASTE COMPOSITION')
    lines.push('-----------------')

    Object.entries(results.summary || {}).forEach(
      ([category, count]) => {
        if (count > 0) {
          lines.push(`${category}: ${count}`)
        }
      }
    )

    // Detected items
    lines.push('')
    lines.push('DETECTED WASTE ITEMS')
    lines.push('--------------------')

    ;(results.items || []).forEach((item, index) => {
      lines.push('')
      lines.push(`${index + 1}. ${item.item}`)
      lines.push(`Quantity: ${item.quantity}`)
      lines.push(`Material: ${item.material}`)
      lines.push(`Category: ${item.category}`)

      if (item.category === 'Hazardous') {
        lines.push('Status: Special Disposal Required')
      } else if (item.category === 'E-Waste') {
        lines.push('Status: E-Waste Collection Required')
      } else if (item.category === 'Organic') {
        lines.push('Status: Compostable / Organic Waste')
      } else if (item.recyclable === true) {
        lines.push('Status: Potentially Recyclable')
      } else if (item.recyclable === false) {
        lines.push('Status: Non-Recyclable')
      } else {
        lines.push('Status: Recycling varies by location')
      }

      lines.push(`Classification: ${item.explanation}`)
      lines.push(`Disposal: ${item.disposal}`)
    })

    // Detection note
    if (results.uncertainty) {
      lines.push('')
      lines.push('DETECTION NOTE')
      lines.push('--------------')
      lines.push(results.uncertainty)
    }

    lines.push('')
    lines.push('-----------------------------------')
    lines.push('Generated by EcoSort AI')
    lines.push(`Generated on: ${new Date().toLocaleString()}`)
    lines.push('')
    lines.push(
      'Note: Disposal and recycling regulations may vary by location.'
    )

    // Create downloadable file
    const blob = new Blob(
      [lines.join('\n')],
      { type: 'text/plain;charset=utf-8' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `EcoSort-Analysis-${Date.now()}.txt`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // ── Determine layout mode ─────────────────────────────────
  const hasResults = results && !analyzing
  const showTwoColumn = hasResults || analyzing

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <Header darkMode={darkMode} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        <Hero />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

          {/* Feature chips — visible before analysis */}
          {!showTwoColumn && (
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {featureChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-sm"
                >
                  <span>{chip.icon}</span>
                  {chip.label}
                </span>
              ))}
            </div>
          )}

          {/* ── Two-column layout when showing results ── */}
          {showTwoColumn ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* LEFT COLUMN — Image + Uncertainty + Actions */}
              <div className="lg:col-span-5 space-y-3">

                {/* Analyzed image */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                      <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Analyzed Image
                    </h3>
                    {preview && (
                      <div className="rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                        <img
                          src={preview}
                          alt="Analyzed waste"
                          className="w-full h-auto max-h-72 object-contain"
                        />
                      </div>
                    )}
                    {selectedImage && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 truncate">{selectedImage.name}</p>
                    )}
                  </div>
                </div>

                {/* Detection note — visible under image in results mode */}
                {hasResults && results.wasteDetected !== false && results.uncertainty && (
                  <div className="bg-amber-50 dark:bg-amber-900/15 rounded-lg border border-amber-200 dark:border-amber-800/40 p-3">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 mb-0.5">AI Visual Estimate</p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">{results.uncertainty}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result actions — accessible without scrolling */}
                {hasResults && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 dark:bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Analyze Another
                    </button>
                    {results.wasteDetected !== false && (
                      <button
                        type="button"
                        onClick={downloadReport}
                        className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Report
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN — Results / Analytics */}
              <div className="lg:col-span-7">
                {/* Error display */}
                {error && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-lg text-sm mb-3 animate-fade-in-up">
                    <svg className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-red-800 dark:text-red-300 mb-0.5">Analysis Error</p>
                      <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-300 cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                <ResultsPanel
                  results={results}
                  analyzing={analyzing}
                />
              </div>
            </div>
          ) : (
            /* ── Single centered column before analysis ── */
            <div className="max-w-lg mx-auto space-y-4">
              <ImageUploader
                onImageSelect={handleImageSelect}
                preview={preview}
                onClear={handleClear}
                fileName={selectedImage?.name}
              />

              {/* Inline error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 rounded-lg text-sm animate-fade-in-up">
                  <svg className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Analyze button */}
              {preview && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`w-full py-3 px-6 rounded-xl text-white font-semibold text-base
                    transition-all duration-300 cursor-pointer
                    ${analyzing
                      ? 'bg-emerald-400 dark:bg-emerald-500/50 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 animate-pulse-glow'
                    }`}
                >
                  {analyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing with Gemini AI…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Waste
                    </span>
                  )}
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
