import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGeneratedArt } from '@/lib/ArtContext'

export default function ArtworkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromFloor = searchParams.get('from') || 'floor-0'
  const { artworks, images: generatedImages } = useGeneratedArt()
  const artwork = artworks.find((a) => a.id === Number(id))
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [voiceId, setVoiceId] = useState('Xb7hH8MSUJpSbSDYk0k2')

  const voiceOptions = [
    {
      id: 'Xb7hH8MSUJpSbSDYk0k2',
      name: 'Florence',
      description: 'British, calm museum docent',
    },
    {
      id: '9BWtsMINqrJLrRacOk9x',
      name: 'Juno',
      description: 'Neutral, clear narration',
    },
    {
      id: 'FGY2WhTYpPnrIDTdsKH5',
      name: 'Saoirse',
      description: 'British, soft and refined',
    },
  ]

  if (!artwork) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <p className="text-lg text-gray-400">Artwork not found.</p>
      </div>
    )
  }

  const { placard } = artwork
  const ttsText = useMemo(() => {
    const segments = []
    const filename = placard.filename?.trim()
    const title = placard.title?.trim()
    const normalize = (value) =>
      value
        .toLowerCase()
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[\s_-]+/g, ' ')
        .trim()

    if (filename) {
      const withoutExtension = filename.replace(/\.[a-z0-9]+$/i, '').trim()
      segments.push(withoutExtension || filename)
    }
    if (title) {
      const normalizedTitle = normalize(title)
      const normalizedFilename = filename ? normalize(filename) : ''
      const isDuplicate =
        normalizedFilename &&
        (normalizedTitle === normalizedFilename ||
          normalizedTitle.includes(normalizedFilename))
      if (!isDuplicate) {
        segments.push(title)
      }
    }
    if (placard.description) {
      segments.push(placard.description)
    }
    return segments.join('. ')
  }, [placard])

  const stopAudio = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    audioRef.current.src = ''
    audioRef.current.load()
    audioRef.current = null
    setIsPlaying(false)
  }, [])

  const handleAudioToggle = useCallback(() => {
    if (!ttsText) return
    if (isPlaying) {
      stopAudio()
      return
    }
    stopAudio()
    const params = new URLSearchParams({ text: ttsText })
    if (voiceId) {
      params.set('voice_id', voiceId)
    }
    const audio = new Audio(`/api/tts?${params.toString()}`)
    audioRef.current = audio
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => setIsPlaying(false)
    setIsPlaying(true)
    audio.play().catch(() => setIsPlaying(false))
  }, [isPlaying, stopAudio, ttsText, voiceId])

  useEffect(() => {
    return () => stopAudio()
  }, [stopAudio])

  return (
    <div className="w-full h-full bg-white flex">
      {/* Left — Artwork image (full 50% width, no padding) */}
      <motion.div
        className="w-1/2 h-full flex items-center justify-center bg-[#f5f5f5]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {generatedImages[artwork.id] ? (
          <img
            src={generatedImages[artwork.id]}
            alt={placard.title}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <motion.div
            className="w-8 h-8 rounded-full bg-[#1a1a1a]/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Right — Placard (centered, no border) */}
      <motion.div
        className="w-1/2 h-full flex flex-col justify-center px-16"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/exhibition', { state: { scrollToFloor: fromFloor } })}
          className="text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a]/80 transition-colors uppercase tracking-wide mb-8 self-start"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
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
          <p className="text-base text-[#1a1a1a]/65 mb-1">{placard.artist}</p>
        )}

        {/* Medium */}
        {placard.medium && (
          <p className="text-base text-[#1a1a1a]/60 mb-1">{placard.medium}</p>
        )}

        {/* Repository Name */}
        {placard.repoName && (
          <p className="text-base text-[#1a1a1a]/60 mb-8">{placard.repoName}</p>
        )}

        {/* Divider */}
        <div className="w-8 h-px bg-[#1a1a1a]/15 mb-8" />

        {/* Audio guide */}
        {ttsText && (
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={handleAudioToggle}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/40 transition-colors"
              aria-label={isPlaying ? 'Stop audio guide' : 'Play audio guide'}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="6" width="4" height="12" rx="1" />
                  <rect x="14" y="6" width="4" height="12" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M4 10v4c0 1.1.9 2 2 2h3l5 4V4L9 8H6c-1.1 0-2 .9-2 2Z" />
                  <path d="M16.5 8.5a1 1 0 0 1 1.4 0 6 6 0 0 1 0 7.1 1 1 0 1 1-1.4-1.4 4 4 0 0 0 0-4.3 1 1 0 0 1 0-1.4Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-[#1a1a1a]/30 px-4 py-2 text-sm uppercase tracking-[0.15em] text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:border-[#1a1a1a]/50 transition-colors"
              aria-label={isSettingsOpen ? 'Close voice settings' : 'Open voice settings'}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Zm-5 7a1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V19H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A7 7 0 0 0 19 10a1 1 0 1 0-2 0 5 5 0 1 1-10 0Z" />
              </svg>
              Voice settings
            </button>
          </div>
        )}

        {isSettingsOpen && (
          <div className="mb-6 rounded-lg border border-[#1a1a1a]/20 bg-[#faf9f6] px-5 py-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-[#1a1a1a]/60 mb-3 font-medium">
              Voice
            </label>
            <div className="space-y-2">
              {voiceOptions.map((voice) => (
                <label
                  key={voice.id}
                  className="flex items-start gap-3 rounded-md border border-[#1a1a1a]/15 bg-white px-4 py-3 cursor-pointer hover:border-[#1a1a1a]/35 transition-colors"
                >
                  <input
                    type="radio"
                    name="voice"
                    value={voice.id}
                    checked={voiceId === voice.id}
                    onChange={() => setVoiceId(voice.id)}
                    className="mt-0.5 accent-[#1a1a1a]"
                  />
                  <span>
                    <span className="block text-sm text-[#1a1a1a]/85 font-medium">
                      {voice.name}
                    </span>
                    <span className="block text-xs text-[#1a1a1a]/55 mt-0.5">
                      {voice.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {placard.description && (
          <p className="text-xl leading-relaxed text-[#1a1a1a]/85 font-serif mb-8">
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
