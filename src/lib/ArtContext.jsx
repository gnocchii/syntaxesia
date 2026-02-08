import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { artworks } from './mockData'

const ArtContext = createContext({ images: {}, generating: true })

export function ArtProvider({ children }) {
  const [images, setImages] = useState({})
  const [generating, setGenerating] = useState(true)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const total = artworks.length

    console.log(`%c[Syntaxesia] Starting art generation for ${total} pieces...`, 'color: #76ff03; font-weight: bold')

    const delay = (ms) => new Promise(r => setTimeout(r, ms))

    async function generateOne(artwork, index) {
      const maxRetries = 3
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const startTime = performance.now()

        console.log(
          `%c[Syntaxesia] [${index + 1}/${total}] Generating "${artwork.placard.title}" (${artwork.language})${attempt > 1 ? ` — retry ${attempt}/${maxRetries}` : ''}...`,
          'color: #ffd600'
        )

        try {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: artwork.code, language: artwork.language }),
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            console.error(`%c[Syntaxesia] [${index + 1}/${total}] FAILED: ${err.error || res.status}`, 'color: #ff1744')
            if (attempt < maxRetries) {
              const waitSec = attempt * 15
              console.log(`%c[Syntaxesia] Rate limited — waiting ${waitSec}s before retry...`, 'color: #ffa726')
              await delay(waitSec * 1000)
              continue
            }
            return
          }

          const data = await res.json()
          const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)

          setImages(prev => ({ ...prev, [artwork.id]: data.image_data_url }))

          console.log(
            `%c[Syntaxesia] [${index + 1}/${total}] ✓ "${artwork.placard.title}" done (${elapsed}s)`,
            'color: #00e676; font-weight: bold'
          )
          return
        } catch (err) {
          console.error(`%c[Syntaxesia] [${index + 1}/${total}] Network error for "${artwork.placard.title}":`, 'color: #ff1744', err)
          if (attempt < maxRetries) {
            await delay(attempt * 15000)
            continue
          }
        }
      }
    }

    async function generateAll() {
      // Fire 2 at a time — server round-robins: one to Vertex AI, one to Gemini API
      for (let i = 0; i < total; i += 2) {
        const batch = artworks.slice(i, Math.min(i + 2, total))
        await Promise.all(batch.map((aw, j) => generateOne(aw, i + j)))
        if (i + 2 < total) await delay(10000)
      }

      setGenerating(false)
      console.log(`%c[Syntaxesia] All ${total} pieces generated!`, 'color: #76ff03; font-weight: bold; font-size: 14px')
    }

    generateAll()
  }, [])

  return (
    <ArtContext.Provider value={{ images, generating }}>
      {children}
    </ArtContext.Provider>
  )
}

export function useGeneratedArt() {
  return useContext(ArtContext)
}
