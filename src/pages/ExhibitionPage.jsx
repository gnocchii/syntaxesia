import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { artworks } from '@/lib/mockData'
import FloorIndicator from '@/components/FloorIndicator'

const FLOOR_IDS = ['floor-2', 'floor-1', 'floor-0']

function FloorContent({ navigate, currentFloor }) {
  return (
    <div className="w-full h-full flex flex-col">
      <header className="shrink-0 text-center pt-8 pb-4">
        <h1
          className="text-lg tracking-[0.35em] uppercase text-[#1a1a1a]/50"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
        >
          Syntaxesia
        </h1>
        <p className="text-sm italic text-[#1a1a1a]/30 mt-1">
          where code becomes art
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center px-12">
        <div className="grid grid-cols-3 gap-10 max-w-5xl">
          {artworks.map((artwork, i) => (
            <motion.div
              key={artwork.id}
              className="cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, y: -4 }}
              onClick={() => navigate(`/artwork/${artwork.id}?from=${currentFloor}`)}
            >
              <img
                src={artwork.image}
                alt={artwork.placard.title}
                className="w-full h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-[filter] duration-300 hover:drop-shadow-[0_12px_32px_rgba(0,0,0,0.3)]"
                draggable={false}
              />
              <p className="text-center mt-3 text-sm italic text-[#1a1a1a]/40">
                {artwork.placard.title}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

// Renders a code snippet as a square art piece
function CodeArt({ code, language, size = 133 }) {
  // Scale font size based on code length and frame size
  const lines = code.split('\n')
  const fontSize = Math.max(2, Math.min(5, size / (lines.length * 2.2)))

  return (
    <div
      style={{
        width: size,
        height: size,
        background: '#0d1117',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size * 0.06,
      }}
    >
      <pre
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: `${fontSize}px`,
          lineHeight: 1.4,
          color: language === 'python' ? '#a5d6ff' : '#7ee787',
          whiteSpace: 'pre',
          overflow: 'hidden',
          width: '100%',
          height: '100%',
          margin: 0,
          opacity: 0.9,
        }}
      >
        {code}
      </pre>
    </div>
  )
}

// Floor 1 (Level 1) with background image and wall-mounted frames
function Floor1Content({ navigate, currentFloor }) {
  // Adjust these positions as needed
  // Safe area: right 0-59.4%, top 2.9-52.8% (avoids left gray/pink area)
  const framePositions = [
    { top: '17%', right: '40%', width: 133, rotation: -1 },
    { top: '35%', right: '40%', width: 135, rotation: 0.5 },
    { top: '17%', right: '25%', width: 132, rotation: 1 },
    { top: '35%', right: '25%', width: 134, rotation: -0.5 },
    { top: '17%', right: '10%', width: 133, rotation: 0.5 },
    { top: '35%', right: '10%', width: 135, rotation: -1 },
  ]

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/L1.png)' }}
      />

      {/* Frames on the right wall */}
      <div className="absolute inset-0">
        {artworks.slice(0, framePositions.length).map((artwork, i) => {
          const pos = framePositions[i]
          // frame.png is 665x545, so aspect ratio ~1.22:1
          const frameWidth = pos.width
          const frameHeight = frameWidth / (665 / 545)
          // Inset for the art inside the frame border
          const inset = frameWidth * 0.08

          return (
            <div
              key={artwork.id}
              className="absolute group cursor-pointer"
              style={{
                top: pos.top,
                right: pos.right,
                width: `${frameWidth}px`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
              onClick={() => navigate(`/artwork/${artwork.id}?from=${currentFloor}`)}
            >
              {/* Container for frame + art */}
              <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
                {/* Code art behind the frame */}
                <div
                  className="absolute overflow-hidden"
                  style={{
                    top: inset,
                    left: inset,
                    right: inset,
                    bottom: inset,
                  }}
                >
                  <CodeArt
                    code={artwork.code}
                    language={artwork.language}
                    size={frameWidth - inset * 2}
                  />
                </div>
                {/* Transparent frame overlay */}
                <img
                  src={artwork.image}
                  alt={artwork.placard.title}
                  className="absolute inset-0 w-full h-full drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                  draggable={false}
                  style={{ pointerEvents: 'none' }}
                />
              </div>

              {/* Glowing dot and label */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex flex-col items-center group/dot">
                {/* Pulsing glow dot */}
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
                {/* Label */}
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

// Ground Floor with background image and wall-mounted frames
function GroundFloorContent({ navigate, currentFloor }) {
  // Adjust these positions as needed for the right cream/yellow wall
  const framePositions = [
    { top: '12%', right: '35%', width: '220px', rotation: -1 },
    { top: '50%', right: '35%', width: '225px', rotation: 0.5 },
    { top: '12%', right: '12%', width: '218px', rotation: 1 },
    { top: '50%', right: '12%', width: '223px', rotation: -0.5 },
  ]

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/G.png)' }}
      />

      {/* Frames on the right wall */}
      <div className="absolute inset-0">
        {artworks.slice(0, framePositions.length).map((artwork, i) => {
          const pos = framePositions[i]
          return (
            <div
              key={artwork.id}
              className="absolute group cursor-pointer"
              style={{
                top: pos.top,
                right: pos.right,
                width: pos.width,
                transform: `rotate(${pos.rotation}deg)`,
              }}
              onClick={() => navigate(`/artwork/${artwork.id}?from=${currentFloor}`)}
            >
              <img
                src={artwork.image}
                alt={artwork.placard.title}
                className="w-full h-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
                draggable={false}
              />

              {/* Glowing dot and label */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-1 flex flex-col items-center group/dot">
                {/* Pulsing glow dot */}
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
                {/* Label */}
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

  // Scroll to appropriate floor on mount
  useEffect(() => {
    const scrollToFloorId = location.state?.scrollToFloor || 'floor-1'
    const targetFloor = document.getElementById(scrollToFloorId)
    if (targetFloor) {
      targetFloor.scrollIntoView({ behavior: 'instant' })
    }
  }, [])

  const scrollToFloor = (floorId) => {
    const target = document.getElementById(floorId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="w-full h-full relative bg-[#f5f0e8]">
      <FloorIndicator activeFloor={activeFloor} onFloorClick={scrollToFloor} />

      <div ref={containerRef} className="snap-container-no-scroll">
        {FLOOR_IDS.map((id) => (
          <section key={id} id={id} className="snap-section bg-[#f5f0e8]">
            {id === 'floor-1' ? (
              <Floor1Content navigate={navigate} currentFloor={id} />
            ) : id === 'floor-0' ? (
              <GroundFloorContent navigate={navigate} currentFloor={id} />
            ) : (
              <FloorContent navigate={navigate} currentFloor={id} />
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
