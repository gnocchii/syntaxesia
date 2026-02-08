import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { artworks } from '@/lib/mockData'
import FloorIndicator from '@/components/FloorIndicator'

const FLOOR_IDS = ['floor-2', 'floor-1', 'floor-0']

function FloorContent({ navigate, currentFloor }) {
  const [prompt, setPrompt] = useState('')
  const [count] = useState(1)
  const [status, setStatus] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Curator prompt wrapper (Floor 2) */}
      <div className="absolute inset-8 z-20 rounded-[32px] border border-[#1a1a1a]/10 bg-white/90 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.15)] backdrop-blur-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-sm uppercase tracking-[0.3em] text-[#1a1a1a]/50">
          Curated by Women
              </h2>
              <p className="mt-2 max-w-md text-xs text-[#1a1a1a]/60">
                Describe the kind of art you want to see. We’ll surface women artists
                from The Met with public-domain images.
              </p>
            </div>
            <div className="text-right text-[10px] uppercase tracking-[0.3em] text-[#1a1a1a]/40">
              Floor 2
            </div>
          </div>

          <div className="mt-6 grid flex-1 grid-cols-[minmax(260px,360px)_1fr] gap-6">
            <div className="flex flex-col">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: sweeping landscape paintings with open skies and natural light"
                className="w-full rounded-2xl border border-[#1a1a1a]/10 bg-white/90 p-4 text-xs text-[#1a1a1a]/80 shadow-inner outline-none focus:border-[#1a1a1a]/30"
                rows={6}
              />
              <div className="mt-4 flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/45">
                  1 result
                </span>
                <button
                  className="ml-auto rounded-full bg-[#1a1a1a] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                  onClick={async () => {
                    if (!prompt.trim()) {
                      setStatus('Describe the art you want first.')
                      return
                    }
                    try {
                      setIsLoading(true)
                      setStatus('Searching The Met...')
                      setResults([])
                      const res = await fetch('/api/female-artists', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt, count }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        setStatus(data.error || 'Request failed.')
                        setIsLoading(false)
                        return
                      }
                      const nextResults = data.results || []
                      setResults(nextResults)
                      setStatus(nextResults.length ? 'Curated results ready.' : 'No matches yet — try a broader prompt.')
                    } catch (err) {
                      console.error(err)
                      setStatus('Something went wrong. Check console.')
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                >
                  Curate
                </button>
              </div>
              {status && (
                <p className="mt-3 text-[11px] text-[#1a1a1a]/55">{status}</p>
              )}
            </div>

            <div className="min-h-0">
              <div className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-auto pr-1">
                {results.map((artist, idx) => (
                  <div
                    key={`${artist.artist}-${idx}`}
                    className="rounded-2xl border border-[#1a1a1a]/10 bg-white/95 p-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex gap-3">
                      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-[#1a1a1a]/10 bg-[#f2eee7]">
                        {artist.image_url ? (
                          <img
                            src={artist.image_url}
                            alt={`${artist.title} by ${artist.artist}`}
                            className="h-full w-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#1a1a1a]/40">
                            {isLoading ? 'Loading…' : 'No image'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#1a1a1a]">{artist.title}</p>
                        <p className="text-[11px] text-[#1a1a1a]/70">
                          {artist.artist}
                        </p>
                        <p className="mt-1 text-[11px] text-[#1a1a1a]/60">
                          {artist.object_date}
                        </p>
                      </div>
                    </div>
                    {artist.medium && (
                      <p className="mt-2 text-[11px] text-[#1a1a1a]/60">
                        {artist.medium}
                      </p>
                    )}
                    <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/45">
                      {artist.culture || artist.period || artist.classification || 'Met Collection'}
                    </div>
                    {artist.department && (
                      <p className="mt-1 text-[10px] text-[#1a1a1a]/45">
                        {artist.department}
                      </p>
                    )}
                  {artist.object_url && (
                    <a
                      href={artist.object_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-[10px] uppercase tracking-[0.2em] text-[#1a1a1a]/55 underline decoration-[#1a1a1a]/20 underline-offset-4"
                    >
                      View on The Met
                    </a>
                  )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

      <main className="flex-1" />
    </div>
  )
}

// Floor 1 (Level 1) with background image and wall-mounted frames
function Floor1Content({ navigate, currentFloor }) {
  // Adjust these positions as needed
  // Safe area: right 0-59.4%, top 2.9-52.8% (avoids left gray/pink area)
  const framePositions = [
    { top: '17%', right: '40%', width: '133px', rotation: -1 },
    { top: '35%', right: '40%', width: '135px', rotation: 0.5 },
    { top: '17%', right: '25%', width: '132px', rotation: 1 },
    { top: '35%', right: '25%', width: '134px', rotation: -0.5 },
    { top: '17%', right: '10%', width: '133px', rotation: 0.5 },
    { top: '35%', right: '10%', width: '135px', rotation: -1 },
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
  const [activeFloor, setActiveFloor] = useState('floor-0')

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
    const scrollToFloorId = location.state?.scrollToFloor || 'floor-0'
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
