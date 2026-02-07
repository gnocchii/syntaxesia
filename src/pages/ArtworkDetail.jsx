import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { artworks } from '@/lib/mockData'

export default function ArtworkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromFloor = searchParams.get('from') || 'floor-0'
  const artwork = artworks.find((a) => a.id === Number(id))

  if (!artwork) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <p className="text-lg text-gray-400">Artwork not found.</p>
      </div>
    )
  }

  const { placard } = artwork

  return (
    <div className="w-full h-full bg-white flex">
      {/* Left — Artwork image */}
      <motion.div
        className="flex-1 flex items-center justify-center p-12"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <img
          src={artwork.image}
          alt={placard.title}
          className="max-h-[80vh] max-w-full object-contain drop-shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
          draggable={false}
        />
      </motion.div>

      {/* Right — Placard */}
      <motion.div
        className="w-[380px] shrink-0 border-l border-gray-100 flex flex-col justify-center px-10 py-12"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/', { state: { scrollToFloor: fromFloor } })}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mb-10 self-start"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          ← Back
        </button>

        {/* Title */}
        {placard.title && (
          <h2 className="text-3xl italic font-serif text-[#1a1a1a] mb-2 leading-tight">
            {placard.title}
          </h2>
        )}

        {/* Artist */}
        {placard.artist && (
          <p className="text-sm text-[#1a1a1a]/50 mb-1">{placard.artist}</p>
        )}

        {/* Medium */}
        {placard.medium && (
          <p className="text-sm text-[#1a1a1a]/40 mb-1">{placard.medium}</p>
        )}

        {/* Year */}
        {placard.year && (
          <p className="text-sm text-[#1a1a1a]/40 mb-8">{placard.year}</p>
        )}

        {/* Divider */}
        <div className="w-8 h-px bg-[#1a1a1a]/15 mb-8" />

        {/* Description */}
        {placard.description && (
          <p className="text-base leading-relaxed text-[#1a1a1a]/60 font-serif mb-8">
            {placard.description}
          </p>
        )}

        {/* Dynamic details — any key/value pairs Gemini returns */}
        {placard.details && placard.details.length > 0 && (
          <div className="border-t border-gray-100 pt-6 space-y-2">
            {placard.details.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-[#1a1a1a]/40" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {d.label}
                </span>
                <span className="text-[#1a1a1a]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
