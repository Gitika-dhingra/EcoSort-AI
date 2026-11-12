const categoryStyles = {
  Plastic: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: '♳',
  },
  Paper: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: '📄',
  },
  Glass: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    icon: '🪟',
  },
  Metal: {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: '🔩',
  },
  Organic: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: '🍂',
  },
  'E-Waste': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: '🔌',
  },
  Hazardous: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: '⚠️',
  },
  Other: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: '📦',
  },
}


/* ─────────────────────────────────────────────
   Loading State
───────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="animate-pulse space-y-4">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />

          <div className="space-y-2 flex-1">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-5 bg-gray-200 rounded w-1/2" />
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>

        <div className="h-32 bg-gray-100 rounded-xl" />
        <div className="h-32 bg-gray-100 rounded-xl" />

      </div>

      <p className="text-xs text-center text-gray-400 mt-5">
        Gemini is analyzing all visible waste items…
      </p>
    </div>
  )
}


/* ─────────────────────────────────────────────
   Empty State
───────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">

      <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">

        <svg
          className="w-8 h-8 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>

      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Analysis Results
      </h3>

      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        Upload a waste image or mixed garbage pile to identify items,
        quantities and segregation categories.
      </p>

    </div>
  )
}


/* ─────────────────────────────────────────────
   Category Summary
───────────────────────────────────────────── */

function CategorySummary({ summary }) {

  const activeCategories = Object.entries(summary || {})
    .filter(([, count]) => count > 0)

  if (activeCategories.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Waste Composition
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {activeCategories.map(([category, count]) => {

          const style =
            categoryStyles[category] ||
            categoryStyles.Other

          return (
            <div
              key={category}
              className={`
                ${style.bg}
                border
                ${style.border}
                rounded-xl
                p-3
                text-center
              `}
            >

              <div className="text-xl mb-1">
                {style.icon}
              </div>

              <div className={`text-xl font-bold ${style.text}`}>
                {count}
              </div>

              <div className="text-xs text-gray-600">
                {category}
              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}

/* ─────────────────────────────────────────────
   Current Scan Analytics
───────────────────────────────────────────── */

function ScanAnalytics({ results }) {
  const summary = results.summary || {}
  const total = results.totalItems || 0

  const activeCategories = Object.values(summary)
    .filter((count) => count > 0).length

  const specialHandling =
    (summary['E-Waste'] || 0) +
    (summary.Hazardous || 0)

  const recyclableCategories = [
    'Plastic',
    'Paper',
    'Glass',
    'Metal',
  ]

  const recyclableItems = recyclableCategories.reduce(
    (sum, category) => sum + (summary[category] || 0),
    0
  )

  const sortedCategories = Object.entries(summary)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])

  const mostCommon =
    sortedCategories.length > 0
      ? sortedCategories[0][0]
      : 'None'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-800">
          Waste Analysis Summary
        </h3>

        <p className="text-xs text-gray-400 mt-1">
          Analytics for the current uploaded image
        </p>
      </div>


      {/* Metric cards */}

      <div className="grid grid-cols-2 gap-3 mb-6">

        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-700">
            {total}
          </p>

          <p className="text-xs text-gray-600 mt-1">
            Total Items
          </p>
        </div>


        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">
            {activeCategories}
          </p>

          <p className="text-xs text-gray-600 mt-1">
            Categories Found
          </p>
        </div>


        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-700">
            {recyclableItems}
          </p>

          <p className="text-xs text-gray-600 mt-1">
            Potentially Recyclable
          </p>
        </div>


        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-700">
            {specialHandling}
          </p>

          <p className="text-xs text-gray-600 mt-1">
            Special Handling
          </p>
        </div>

      </div>


      {/* Most common category */}

      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-5">

        <span className="text-sm text-gray-600">
          Most Common Category
        </span>

        <span className="text-sm font-bold text-gray-800">
          {mostCommon}
        </span>

      </div>


      {/* Distribution bars */}

      <div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Category Distribution
        </p>

        <div className="space-y-3">

          {sortedCategories.map(([category, count]) => {

            const percentage =
              total > 0
                ? Math.round((count / total) * 100)
                : 0

            const style =
              categoryStyles[category] ||
              categoryStyles.Other

            return (
              <div key={category}>

                <div className="flex justify-between text-xs mb-1">

                  <span className="font-medium text-gray-600">
                    {style.icon} {category}
                  </span>

                  <span className="text-gray-500">
                    {count} ({percentage}%)
                  </span>

                </div>


                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">

                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

              </div>
            )
          })}

        </div>

      </div>

    </div>
  )
}


/* ─────────────────────────────────────────────
   Individual Waste Item
───────────────────────────────────────────── */

function WasteItemCard({ item, index }) {

  const cat =
    categoryStyles[item.category] ||
    categoryStyles.Other

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Category header */}

      <div
        className={`
          px-5 py-4
          ${cat.bg}
          border-b
          ${cat.border}
        `}
      >

        <div className="flex items-center justify-between gap-3 flex-wrap">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-white/70 rounded-xl flex items-center justify-center text-xl">
              {cat.icon}
            </div>

            <div>

              <p className="text-xs text-gray-500">
                Detected Item {index + 1}
              </p>

              <h4 className="font-bold text-gray-900">
                {item.item}
              </h4>

            </div>

          </div>


          <div className="flex items-center gap-2">

            {/* Quantity */}

            <span className="px-3 py-1 rounded-full bg-white text-gray-700 text-sm font-semibold border">
              Qty: {item.quantity}
            </span>


            {/* Category */}

            <span
              className={`
                px-3 py-1
                rounded-full
                text-sm
                font-semibold
                ${cat.text}
                bg-white
              `}
            >
              {item.category}
            </span>

          </div>

        </div>

      </div>


      <div className="p-5 space-y-4">

        {/* Material */}

        <div>

          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Material
          </p>

          <p className="text-sm font-medium text-gray-700 mt-1">
            {item.material}
          </p>

        </div>


        {/* Recyclability */}

        <div>

          {item.category === 'Hazardous' ? (
  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
    ⚠ Special Disposal Required
  </span>

) : item.category === 'E-Waste' ? (
  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
    ⚡ E-Waste Collection Required
  </span>

) : item.category === 'Organic' ? (
  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
    ♻ Compostable / Organic Waste
  </span>

) : item.recyclable === true ? (
  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700">
    ✓ Recyclable
  </span>

) : item.recyclable === false ? (
  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
    ✗ Non-Recyclable
  </span>

) : (
  <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600">
    Recycling varies
  </span>
)}

        </div>


        {/* Explanation */}

        <div className="bg-gray-50 rounded-xl p-4">

          <div className="flex items-start gap-2.5">

            <svg
              className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div>

              <p className="text-sm font-semibold text-gray-700 mb-1">
                Why This Classification
              </p>

              <p className="text-sm text-gray-600 leading-relaxed">
                {item.explanation}
              </p>

            </div>

          </div>

        </div>


        {/* Disposal */}

        <div className="bg-emerald-50 rounded-xl p-4">

          <div className="flex items-start gap-2.5">

            <svg
              className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <div>

              <p className="text-sm font-semibold text-emerald-800 mb-1">
                Disposal Recommendation
              </p>

              <p className="text-sm text-emerald-700 leading-relaxed">
                {item.disposal}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}


/* ─────────────────────────────────────────────
   Main Results Panel
───────────────────────────────────────────── */

export default function ResultsPanel({
  results,
  analyzing,
}) {

  if (analyzing) {
    return <SkeletonCard />
  }

  if (!results) {
    return <EmptyState />
  }


  const items =
    Array.isArray(results.items)
      ? results.items
      : []


  return (

    <div className="space-y-5 animate-fade-in-up">


      {/* Total detection banner */}

      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-6 text-white shadow-sm">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="text-emerald-100 text-sm font-medium">
              AI Waste Analysis
            </p>

            <h2 className="text-3xl font-bold mt-1">
              {results.totalItems || 0}
            </h2>

            <p className="text-emerald-50 text-sm mt-1">
              Estimated waste items detected
            </p>

          </div>


          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center">

            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M9 12l2 2 4-4m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

          </div>

        </div>

      </div>


      <CategorySummary
  summary={results.summary}
/>


{/* Current scan analytics */}

<ScanAnalytics
  results={results}
/>


{/* Detected item cards */}

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold text-gray-800">
            Detected Waste Types
          </h3>

          <span className="text-xs text-gray-400">
            {items.length} type{items.length !== 1 ? 's' : ''}
          </span>

        </div>


        {items.map((item, index) => (

          <WasteItemCard
            key={`${item.item}-${index}`}
            item={item}
            index={index}
          />

        ))}

      </div>


      {/* Uncertainty */}

      {results.uncertainty && (

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">

          <div className="flex items-start gap-3">

            <svg
              className="w-5 h-5 text-amber-500 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>


            <div>

              <p className="text-sm font-semibold text-amber-800 mb-1">
                Detection Note
              </p>

              <p className="text-sm text-amber-700 leading-relaxed">
                {results.uncertainty}
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}