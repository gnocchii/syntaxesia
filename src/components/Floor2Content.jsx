import { useState } from 'react'
import { motion } from 'framer-motion'
import { searchMetLocal } from '@/lib/metLocalSearch'

export default function Floor2Content() {
  const [keywords, setKeywords] = useState('')
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [artworks, setArtworks] = useState([])
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    console.log('[Floor2Content] Generate clicked with keywords:', keywords)

    if (!keywords.trim()) {
      setError('Please enter keywords (e.g., "abstract", "geometric", "colorful", "pattern")')
      return
    }

    setGenerating(true)
    setError(null)
    setStatus('Curating artworks by women artists...')

    try {
      console.log('[Floor2Content] Calling searchMetLocal...')
      const results = await searchMetLocal(keywords)
      console.log('[Floor2Content] Search returned', results.length, 'results')

      if (results.length === 0) {
        console.warn('[Floor2Content] No results found - this should never happen!')
        setError('Something went wrong. Please try again.')
        setStatus('')
        setGenerating(false)
        return
      }

      console.log('[Floor2Content] Setting artworks:', results)
      setArtworks(results)
      setStatus('')
    } catch (err) {
      console.error('[Floor2Content] Search error:', err)
      setError(err.message || 'Search failed. Please try again.')
      setStatus('')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col relative bg-[#f5f0e8]">
      {/* Header with search bar */}
      <header className="shrink-0 pt-6 pb-4 px-8">
        <h1
          className="text-center text-xl tracking-[0.35em] uppercase text-[#1a1a1a]/70 mb-1"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
        >
          Women Artists Gallery
        </h1>
        <p className="text-center text-xs italic text-[#1a1a1a]/40 mb-4">
          Historical women artists from The Met collection
        </p>

        {/* Simple search bar */}
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Try: colorful, textile, portrait, botanical, pattern, jewelry"
            className="flex-1 px-4 py-2 bg-white/60 border border-[#1a1a1a]/10 rounded text-sm text-[#1a1a1a]/80 focus:outline-none focus:border-[#1a1a1a]/30 transition-colors"
            disabled={generating}
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
          <button
            onClick={handleGenerate}
            disabled={generating || !keywords.trim()}
            className="px-6 py-2 bg-[#1a1a1a]/80 text-white rounded text-sm tracking-wider hover:bg-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            {generating ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600/80 italic mt-2">
            {error}
          </p>
        )}
      </header>

      {/* Status */}
      {status && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full">
            <motion.div
              className="w-2 h-2 rounded-full bg-[#1a1a1a]/60"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <p className="text-xs text-[#1a1a1a]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
              {status}
            </p>
          </div>
        </div>
      )}

      {/* Gallery Grid - 8 artworks */}
      <main className="flex-1 px-8 pb-8 overflow-y-auto">
        {artworks.length > 0 ? (
          <div className="grid grid-cols-4 gap-6 max-w-7xl mx-auto">
            {artworks.map((artwork, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-white/40 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Artwork image */}
                <img
                  src={artwork.url}
                  alt={artwork.title}
                  className="w-full h-48 object-cover rounded mb-3"
                  draggable={false}
                />

                {/* Artwork info */}
                <div className="space-y-1 text-xs text-[#1a1a1a]/70">
                  <p className="font-semibold text-sm text-[#1a1a1a]/80 line-clamp-1">
                    {artwork.artist}
                  </p>
                  {artwork.date && (
                    <p className="text-[#1a1a1a]/60">{artwork.date}</p>
                  )}
                  {artwork.medium && (
                    <p className="text-[#1a1a1a]/50 italic">{artwork.medium}</p>
                  )}
                  {artwork.description && (
                    <p className="text-[#1a1a1a]/50 line-clamp-2 mt-2">
                      {artwork.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          !generating && (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#1a1a1a]/40 text-sm italic">
                Enter keywords above to discover artworks by women artists
              </p>
            </div>
          )
        )}
      </main>
    </div>
  )
}
