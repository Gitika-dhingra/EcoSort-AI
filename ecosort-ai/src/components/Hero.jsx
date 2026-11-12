const categories = [
  { name: 'Plastic', icon: '♳', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Paper', icon: '📄', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Glass', icon: '🪟', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
  { name: 'Metal', icon: '🔩', color: 'bg-slate-50 text-slate-600 border-slate-100' },
  { name: 'Organic', icon: '🍂', color: 'bg-green-50 text-green-600 border-green-100' },
  { name: 'E-Waste', icon: '🔌', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { name: 'Hazardous', icon: '⚠️', color: 'bg-red-50 text-red-600 border-red-100' },
  { name: 'Other', icon: '📦', color: 'bg-gray-50 text-gray-600 border-gray-100' },
]

export default function Hero() {
  return (
    <section className="py-16 sm:py-20 text-center px-4">
      <div className="max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Powered by Google Gemini AI
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Intelligent Waste{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Segregation
          </span>
        </h2>

        <p className="mt-5 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Upload a photo of any waste item and our AI will instantly classify it, 
          identify the material, and recommend proper disposal — helping you make 
          sustainable choices effortlessly.
        </p>

        {/* Category pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {categories.map((cat) => (
            <span
              key={cat.name}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border ${cat.color} transition-transform hover:scale-105`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
