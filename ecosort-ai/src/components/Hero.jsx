export default function Hero() {
  return (
    <section className="pt-8 pb-5 text-center px-4">
      <div className="max-w-2xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/25 border border-emerald-200/60 dark:border-emerald-700/40 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-3">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI-Powered Waste Intelligence
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          See Waste.{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Sort Smarter.
          </span>
        </h2>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Upload an image to identify waste, estimate quantities, evaluate recyclability, and get disposal guidance.
        </p>
      </div>
    </section>
  )
}
