import { useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ImageUploader from './components/ImageUploader.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import Footer from './components/Footer.jsx'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null) // File object
  const [preview, setPreview] = useState(null)              // data-URI for <img>
  const [results, setResults] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

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
      // Convert to base64
      const base64 = await fileToBase64(selectedImage)

      // Call the serverless endpoint
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
        throw new Error(data.error || `Server responded with ${response.status}`)
      }

      // Basic sanity check on the response shape
      // Validate the new multi-item response format
if (
  !data ||
  !Array.isArray(data.items) ||
  typeof data.totalItems !== 'number' ||
  !data.summary
) {
  console.error('Unexpected API response:', data)
  throw new Error('The server returned an unexpected response format.')
}

setResults(data)
    } catch (err) {
      console.error('Analysis failed:', err)

      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Network error — could not reach the server. Make sure the dev server is running.')
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.')
      }
    } finally {
      setAnalyzing(false)
    }
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Header />

      <main className="flex-1">
        <Hero />

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column — upload */}
            <div className="space-y-6">
              <ImageUploader
                onImageSelect={handleImageSelect}
                preview={preview}
                onClear={handleClear}
              />

              {/* Inline error (shown above the button) */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in-up">
                  <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {preview && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg
                    transition-all duration-300 cursor-pointer
                    ${analyzing
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 animate-pulse-glow'
                    }`}
                >
                  {analyzing ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing with Gemini AI…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Waste
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Right column — results */}
            <ResultsPanel results={results} analyzing={analyzing} error={error} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
