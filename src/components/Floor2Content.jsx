import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchMetLocal } from '@/lib/metLocalSearch'
import DecryptedText from './DecryptedText'

export default function Floor2Content() {
  const [keywords, setKeywords] = useState('')
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [artworks, setArtworks] = useState([])
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!keywords.trim()) {
      setError('Please enter search keywords')
      return
    }

    setArtworks([])
    setGenerating(true)
    setError(null)
    setStatus('Searching Met Museum collection...')

    try {
      const results = await searchMetLocal(keywords)
      if (results.length === 0) {
        setError('No results found for this search.')
        setStatus('')
        setGenerating(false)
        return
      }
      setArtworks(results)
      setStatus('')
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.')
      setStatus('')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col relative bg-[#f5f0e8] overflow-hidden">
      {/* Film Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Header */}
      <header className="shrink-0 pt-12 pb-8 px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="font-sans font-bold text-4xl tracking-tighter text-charcoal">
            <DecryptedText 
              text="WOMEN ARTISTS GALLERY"
              animateOn="view"
              speed={100}
              parentClassName="inline-block"
            />
          </h1>
          <p className="font-sans text-sm tracking-[0.2em] text-charcoal/40 uppercase">
            Exploring the female gaze in the Met collection
          </p>

          {/* Refined Search Bar */}
          <div className="max-w-xl mx-auto mt-10 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-charcoal/5 to-charcoal/10 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white/40 backdrop-blur-md border border-charcoal/10 rounded-full px-2 py-1.5 shadow-sm focus-within:border-charcoal/30 transition-all">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Search styles, eras, subjects..."
                className="flex-1 bg-transparent border-none px-4 py-2 text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none font-sans"
                disabled={generating}
              />
              <button
                onClick={handleGenerate}
                disabled={generating || !keywords.trim()}
                className="bg-charcoal text-white rounded-full px-6 py-2 text-xs font-sans font-bold tracking-widest hover:bg-charcoal/90 disabled:opacity-20 disabled:cursor-not-allowed transition-all uppercase"
              >
                {generating ? '...' : 'Search'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-red-500 font-mono mt-4 tracking-tight"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Status */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-3 px-4 py-1.5 bg-charcoal/5 rounded-full">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-charcoal/40"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p className="text-[10px] font-sans font-bold tracking-[0.2em] text-charcoal/60 uppercase">
                {status}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Grid */}
      <main className="flex-1 px-8 pb-12 overflow-y-auto custom-scrollbar relative z-10">
        <div className="max-w-7xl mx-auto">
          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {artworks.map((artwork, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-charcoal/5 mb-4 shadow-sm group-hover:shadow-2xl transition-all duration-700 ease-out">
                    <img
                      src={artwork.url}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  </div>

                  <div className="space-y-2 px-1">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-sans font-bold text-xs tracking-wider text-charcoal/90 uppercase line-clamp-2 leading-relaxed">
                        {artwork.artist}
                      </h3>
                      {artwork.date && (
                        <span className="font-mono text-[9px] text-charcoal/30 pt-0.5 whitespace-nowrap">
                          {artwork.date}
                        </span>
                      )}
                    </div>
                    
                    <div className="h-px w-6 bg-charcoal/10 group-hover:w-12 transition-all duration-700" />
                    
                    {artwork.medium && (
                      <p className="font-sans text-[10px] text-charcoal/50 leading-relaxed italic line-clamp-1">
                        {artwork.medium}
                      </p>
                    )}
                    
                    {artwork.description && (
                      <p className="font-sans text-[10px] text-charcoal/40 leading-relaxed line-clamp-3 mt-3">
                        {artwork.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            !generating && (
              <div className="flex flex-col items-center justify-center h-[50vh] opacity-20">
                <div className="w-12 h-12 border-t border-charcoal/20 rounded-full animate-spin-slow mb-6" />
                <p className="font-sans text-[11px] tracking-[0.4em] uppercase">
                  Awaiting Discovery
                </p>
              </div>
            )
          )}
        </div>
      </main>

    </div>
  )
}
