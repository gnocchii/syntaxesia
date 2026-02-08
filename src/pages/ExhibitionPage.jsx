import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGeneratedArt } from '@/lib/ArtContext'
import FloorIndicator from '@/components/FloorIndicator'
import TipModal from '@/components/TipModal'
import Floor2Content from '@/components/Floor2Content'

const FLOOR_IDS = ['floor-2', 'floor-1', 'floor-0']

// Floor 1 (Level 1) with background image and wall-mounted frames
function Floor1Content({ navigate, currentFloor, artworks, generatedImages }) {
  const framePositions = [
    { top: '17%', right: '40%', width: 133, rotation: -1 },
    { top: '35%', right: '40%', width: 135, rotation: 0.5 },
    { top: '17%', right: '25%', width: 132, rotation: 1 },
    { top: '35%', right: '25%', width: 134, rotation: -0.5 },
    { top: '17%', right: '10%', width: 133, rotation: 0.5 },
    { top: '35%', right: '10%', width: 135, rotation: -1 },
  ]

  if (!artworks || artworks.length === 0) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/L1.png)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 rounded-full bg-white/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/L1.png)' }}
      />

      {/* Frames on the right wall */}
      <div className="absolute inset-0">
        {artworks.slice(0, Math.min(framePositions.length, artworks.length)).map((artwork, i) => {
          const pos = framePositions[i]
          const imageUrl = generatedImages[artwork.id]

          return (
            <div
              key={artwork.id}
              className="absolute group cursor-pointer"
              style={{
                top: pos.top,
                right: pos.right,
                width: `${pos.width}px`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
              onClick={() => navigate(`/artwork/${artwork.id}?from=${currentFloor}`)}
            >
              {/* Generated art image (square) */}
              <div
                className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                style={{ width: pos.width, height: pos.width }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={artwork.placard.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: '#1a1a1a' }}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white/30"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                )}
              </div>

              {/* Glowing dot and label */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex flex-col items-center group/dot">
                <motion.div
                  className="w-3 h-3 rounded-full bg-white cursor-pointer"
                  style={{
                    boxShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.2)'
                  }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.6, 1],
                    boxShadow: [
                      '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 40px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.15)',
                      '0 0 15px rgba(255,255,255,1), 0 0 30px rgba(255,255,255,0.9), 0 0 50px rgba(255,255,255,0.7), 0 0 80px rgba(255,255,255,0.5), 0 0 120px rgba(255,255,255,0.3)',
                      '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 40px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.15)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="mt-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  {artwork.placard.title}
                </motion.div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Ground Floor with background image and wall-mounted frames (artworks 7-10)
function GroundFloorContent({ navigate, currentFloor, artworks, generatedImages }) {
  const framePositions = [
    { top: '12%', right: '35%', width: 150, rotation: -1 },
    { top: '38%', right: '35%', width: 153, rotation: 0.5 },
    { top: '12%', right: '12%', width: 148, rotation: 1 },
    { top: '38%', right: '12%', width: 152, rotation: -0.5 },
  ]

  if (!artworks || artworks.length === 0) {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/G.png)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 rounded-full bg-white/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    )
  }

  // Use artworks 7-10 for the ground floor (if available)
  const groundArtworks = artworks.slice(6, 10)

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/G.png)' }}
      />

      {/* Frames on the right wall */}
      <div className="absolute inset-0">
        {groundArtworks.map((artwork, i) => {
          const pos = framePositions[i]
          const imageUrl = generatedImages[artwork.id]

          return (
            <div
              key={artwork.id}
              className="absolute group cursor-pointer"
              style={{
                top: pos.top,
                right: pos.right,
                width: `${pos.width}px`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
              onClick={() => navigate(`/artwork/${artwork.id}?from=${currentFloor}`)}
            >
              {/* Generated art image (square) */}
              <div
                className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                style={{ width: pos.width, height: pos.width }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={artwork.placard.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: '#1a1a1a' }}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white/30"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                )}
              </div>

              {/* Glowing dot and label */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex flex-col items-center group/dot">
                <motion.div
                  className="w-3 h-3 rounded-full bg-white cursor-pointer"
                  style={{
                    boxShadow: '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.6), 0 0 60px rgba(255,255,255,0.4), 0 0 80px rgba(255,255,255,0.2)'
                  }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.6, 1],
                    boxShadow: [
                      '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 40px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.15)',
                      '0 0 15px rgba(255,255,255,1), 0 0 30px rgba(255,255,255,0.9), 0 0 50px rgba(255,255,255,0.7), 0 0 80px rgba(255,255,255,0.5), 0 0 120px rgba(255,255,255,0.3)',
                      '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.7), 0 0 40px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3), 0 0 80px rgba(255,255,255,0.15)',
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="mt-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  {artwork.placard.title}
                </motion.div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ExhibitionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)
  const [activeFloor, setActiveFloor] = useState('floor-1')
  const [tipOpen, setTipOpen] = useState(false)
  const { artworks, images: generatedImages, generating, status } = useGeneratedArt()

  // Track which floor is visible via scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const scrollTop = el.scrollTop
    const sectionHeight = el.clientHeight
    const index = Math.round(scrollTop / sectionHeight)
    const clamped = Math.min(index, FLOOR_IDS.length - 1)
    setActiveFloor(FLOOR_IDS[clamped])
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Track scroll position for floor indicator
    el.addEventListener('scroll', handleScroll, { passive: true })

    // Prevent manual scrolling via wheel/touch
    const preventScroll = (e) => {
      e.preventDefault()
    }
    el.addEventListener('wheel', preventScroll, { passive: false })
    el.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      el.removeEventListener('scroll', handleScroll)
      el.removeEventListener('wheel', preventScroll)
      el.removeEventListener('touchmove', preventScroll)
    }
  }, [handleScroll])

  // Scroll to appropriate floor on mount or when coming back from artwork detail
  useEffect(() => {
    const scrollToFloorId = location.state?.scrollToFloor || 'floor-1'
    const targetFloor = document.getElementById(scrollToFloorId)
    if (targetFloor) {
      targetFloor.scrollIntoView({ behavior: 'instant' })
    }
  }, [location.state?.scrollToFloor])

  const scrollToFloor = (floorId) => {
    const target = document.getElementById(floorId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full h-full relative bg-[#f5f0e8]">
      <FloorIndicator activeFloor={activeFloor} onFloorClick={scrollToFloor} />

      {/* Home button (favicon) */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 z-50 hover:opacity-80 transition-opacity duration-300"
      >
        <img
          src="/favicon_syns.png"
          alt="Home"
          className="w-16 h-16 object-contain drop-shadow-lg"
          draggable={false}
        />
      </button>

      {/* Status overlay - hide on floor-2 */}
      {generating && status && activeFloor !== 'floor-2' && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
          <p className="text-sm text-[#1a1a1a]/70" style={{ fontFamily: 'Inter, sans-serif' }}>
            {status}
          </p>
        </div>
      )}

      {/* Tip jar button */}
      <button
        onClick={() => setTipOpen(true)}
        className="fixed top-8 left-28 z-50 hover:opacity-80 transition-opacity duration-300"
      >
        <img
          src="/tipJar.png"
          alt="Tip Jar"
          className="w-16 h-16 object-contain drop-shadow-lg"
          draggable={false}
        />
      </button>

      {/* Tip Modal */}
      <TipModal isOpen={tipOpen} onClose={() => setTipOpen(false)} />

      <div ref={containerRef} className="snap-container-no-scroll">
        {FLOOR_IDS.map((id) => (
          <section key={id} id={id} className="snap-section bg-[#f5f0e8]">
            {id === 'floor-2' ? (
              <Floor2Content />
            ) : id === 'floor-1' ? (
              <Floor1Content navigate={navigate} currentFloor={id} artworks={artworks} generatedImages={generatedImages} />
            ) : (
              <GroundFloorContent navigate={navigate} currentFloor={id} artworks={artworks} generatedImages={generatedImages} />
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
