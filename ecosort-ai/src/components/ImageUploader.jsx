import { useRef, useState } from 'react'

export default function ImageUploader({ onImageSelect, preview, onClear }) {
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  if (preview) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image Preview
              </h3>
              <button
                onClick={onClear}
                className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-gray-50">
              <img
                src={preview}
                alt="Uploaded waste item"
                className="w-full h-64 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative bg-white rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer
          transition-all duration-300 group
          ${dragActive
            ? 'border-emerald-400 bg-emerald-50/50 shadow-lg shadow-emerald-100'
            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-md'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Upload icon */}
        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5
          transition-all duration-300
          ${dragActive
            ? 'bg-emerald-100 scale-110'
            : 'bg-gray-100 group-hover:bg-emerald-100 group-hover:scale-105'
          }`}>
          <svg
            className={`w-8 h-8 transition-colors duration-300 ${dragActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <p className="text-base font-semibold text-gray-700 mb-1">
          {dragActive ? 'Drop your image here' : 'Drag & drop your waste image'}
        </p>
        <p className="text-sm text-gray-400 mb-4">
          or click to browse from your device
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Select Image
        </div>

        <p className="mt-4 text-xs text-gray-300">
          Supports JPG, PNG, WebP • Max 10MB
        </p>
      </div>
    </div>
  )
}
