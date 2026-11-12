import { useState } from 'react'

const categoryStyles = {
  Plastic: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800/50',
    barColor: 'bg-blue-500',
    icon: '♳',
  },
  Paper: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/50',
    barColor: 'bg-amber-500',
    icon: '📄',
  },
  Glass: {
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800/50',
    barColor: 'bg-cyan-500',
    icon: '🪟',
  },
  Metal: {
    bg: 'bg-slate-100 dark:bg-slate-700/30',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-600/50',
    barColor: 'bg-slate-500',
    icon: '🔩',
  },
  Organic: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800/50',
    barColor: 'bg-green-500',
    icon: '🍂',
  },
  'E-Waste': {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800/50',
    barColor: 'bg-purple-500',
    icon: '🔌',
  },
  Hazardous: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800/50',
    barColor: 'bg-red-500',
    icon: '⚠️',
  },
  Other: {
    bg: 'bg-gray-50 dark:bg-gray-800/30',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700/50',
    barColor: 'bg-gray-500',
    icon: '📦',
  },
}

function getStatusBadge(item) {
  if (item.category === 'Hazardous') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-transparent dark:border-red-800/40">
        ⚠ Special Disposal
      </span>
    )
  }
  if (item.category === 'E-Waste') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-transparent dark:border-purple-800/40">
        ⚡ E-Waste Collection
      </span>
    )
  }
  if (item.category === 'Organic') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-transparent dark:border-green-800/40">
        ♻ Compostable
      </span>
    )
  }
  if (item.recyclable === true) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40">
        ✓ Recyclable
      </span>
    )
  }
  if (item.recyclable === false) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-transparent dark:border-red-800/40">
        ✗ Non-Recyclable
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 border border-transparent dark:border-gray-700/40">
      Recycling varies
    </span>
  )
}


/* ─────────────────────────────────────────────
   Accordion Waste Item Card
───────────────────────────────────────────── */

function WasteItemCard({ item }) {
  const [expanded, setExpanded] = useState(false)
  const cat = categoryStyles[item.category] || categoryStyles.Other

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border ${cat.border} overflow-hidden transition-all duration-200`}>
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-base flex-shrink-0">{cat.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{item.item}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-[11px] font-medium ${cat.text}`}>{item.category}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Qty {item.quantity}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusBadge(item)}
          <svg
            className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700/50 space-y-2.5 animate-fade-in-up">
          {/* Material */}
          <div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Material</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{item.material}</p>
          </div>

          {/* Explanation */}
          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2.5">
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Why This Classification</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            </div>
          </div>

          {/* Disposal */}
          <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-lg p-2.5 border border-transparent dark:border-emerald-800/30">
            <div className="flex items-start gap-2">
              <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 mb-0.5">Disposal Recommendation</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">{item.disposal}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


/* ─────────────────────────────────────────────
   Loading State — compact with scanning feel
───────────────────────────────────────────── */

function AnalyzingState() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 p-6">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="animate-spin h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Analyzing waste composition...</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Identifying materials, quantities and disposal requirements</p>
          </div>
        </div>
        <div className="h-px bg-slate-100 dark:bg-slate-700" />
        <div className="grid grid-cols-4 gap-2">
          <div className="h-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
          <div className="h-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
          <div className="h-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
          <div className="h-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
        </div>
        <div className="h-24 bg-slate-50 dark:bg-slate-700/30 rounded-lg" />
        <div className="space-y-2">
          <div className="h-10 bg-slate-50 dark:bg-slate-700/30 rounded-lg" />
          <div className="h-10 bg-slate-50 dark:bg-slate-700/30 rounded-lg" />
          <div className="h-10 bg-slate-50 dark:bg-slate-700/30 rounded-lg" />
        </div>
      </div>
    </div>
  )
}


/* ─────────────────────────────────────────────
   Empty State (before analysis)
───────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 p-8 text-center">
      <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Analysis Results</h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
        Upload a waste image to identify items, quantities and segregation categories.
      </p>
    </div>
  )
}


/* ─────────────────────────────────────────────
   No Waste Detected State
───────────────────────────────────────────── */

function NoWasteState({ results }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 rounded-xl p-6 text-center shadow-sm">
      <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 dark:bg-amber-800/30 rounded-xl flex items-center justify-center">
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">No Clear Waste Detected</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
        {results.uncertainty || 'EcoSort AI could not confidently identify waste in this image.'}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
        Try another image with clearly visible waste objects.
      </p>
    </div>
  )
}


/* ─────────────────────────────────────────────
   Main Results Panel
───────────────────────────────────────────── */

export default function ResultsPanel({ results, analyzing }) {

  if (analyzing) {
    return <AnalyzingState />
  }

  if (!results) {
    return <EmptyState />
  }

  if (results.wasteDetected === false) {
    return <NoWasteState results={results} />
  }

  const items = Array.isArray(results.items) ? results.items : []
  const summary = results.summary || {}
  const total = results.totalItems || 0

  const activeCategories = Object.values(summary).filter((count) => count > 0).length

  const specialHandling = (summary['E-Waste'] || 0) + (summary.Hazardous || 0)

  const recyclableCategories = ['Plastic', 'Paper', 'Glass', 'Metal']
  const recyclableItems = recyclableCategories.reduce(
    (sum, category) => sum + (summary[category] || 0),
    0
  )

  const sortedCategories = Object.entries(summary)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])

  const mostCommon = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None'

  return (
    <div className="space-y-3 animate-fade-in-up">

      {/* ── Top Analytics — 4 compact metric cards ── */}
      <div className="grid grid-cols-4 gap-2">

        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-2.5 text-center">
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{total}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">Estimated Items</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-2.5 text-center">
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{activeCategories}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">Categories</p>
        </div>

        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200/60 dark:border-teal-800/40 rounded-lg p-2.5 text-center">
          <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{recyclableItems}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">Recyclable</p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-lg p-2.5 text-center">
          <p className="text-xl font-bold text-red-700 dark:text-red-400">{specialHandling}</p>
          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">Special Handling</p>
        </div>

      </div>

      {/* ── Waste Composition — single compact card ── */}
      {sortedCategories.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Waste Composition</h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Most common: <span className="font-semibold text-slate-600 dark:text-slate-300">{mostCommon}</span>
            </span>
          </div>
          <div className="space-y-2">
            {sortedCategories.map(([category, count]) => {
              const percentage = total > 0 ? Math.round((count / total) * 100) : 0
              const style = categoryStyles[category] || categoryStyles.Other

              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="text-sm">{style.icon}</span> {category}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {count} <span className="text-slate-400 dark:text-slate-500">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`${style.barColor} h-1.5 rounded-full transition-all duration-700`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Detected Waste Types — Accordion Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">Detected Waste Types</h3>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {items.length} type{items.length !== 1 ? 's' : ''} • click to expand
          </span>
        </div>
        <div className="space-y-1.5">
          {items.map((item, index) => (
            <WasteItemCard key={`${item.item}-${index}`} item={item} />
          ))}
        </div>
      </div>

    </div>
  )
}
