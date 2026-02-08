import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'

const ArtContext = createContext({
  artworks: [],
  images: {},
  generating: false,
  status: '',
  setGithubUrl: () => {}
})

export function ArtProvider({ children }) {
  const [artworks, setArtworks] = useState([])
  const [images, setImages] = useState({})
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [githubUrl, setGithubUrlState] = useState(null)
  const processingRef = useRef(false)

  const setGithubUrl = useCallback((url) => {
    setGithubUrlState(url)
  }, [])

  useEffect(() => {
    if (!githubUrl || processingRef.current) return
    processingRef.current = true

    const delay = (ms) => new Promise(r => setTimeout(r, ms))

    async function runPipeline() {
      try {
        setGenerating(true)
        setStatus('Extracting code from GitHub...')

        // Start timer
        const pipelineStartTime = performance.now()
        console.log(`%c[Syntaxesia] ⏱️  Starting pipeline for ${githubUrl}`, 'color: #76ff03; font-weight: bold')

        // Step 1: Extract files from GitHub
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ github_url: githubUrl }),
        })

        if (!extractRes.ok) {
          const err = await extractRes.json().catch(() => ({}))
          throw new Error(err.detail || `Extraction failed: ${extractRes.status}`)
        }

        const { data: repoData } = await extractRes.json()
        const repoMetadata = repoData.metadata
        const importantFiles = repoData.analysis?.important_files || {}

        console.log(`%c[Syntaxesia] Extracted ${Object.keys(importantFiles).length} files from ${repoMetadata.name}`, 'color: #ffd600')

        // Step 2: Select top 10 files by importance score
        const filesArray = Object.entries(importantFiles).map(([path, fileData]) => ({
          path,
          ...fileData
        }))

        filesArray.sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0))
        const top10Files = filesArray.slice(0, 10)

        console.log(`%c[Syntaxesia] Selected top 10 files for artworks`, 'color: #ffd600')

        // Step 3: Create placeholder artworks immediately (so loading frames appear)
        const username = repoMetadata.full_name?.split('/')[0] || 'unknown'
        const repoName = repoMetadata.name || 'Unknown Repository'

        // Extract year from repo metadata
        const updatedAt = repoMetadata.updated_at || repoMetadata.created_at || ''
        let year = ''
        if (updatedAt) {
          try {
            year = new Date(updatedAt).getFullYear().toString()
          } catch (e) {
            // ignore
          }
        }

        // Helper to extract language from file path
        const getLanguage = (path) => {
          const ext = path.split('.').pop()?.toLowerCase() || ''
          const languageMap = {
            'js': 'JavaScript', 'jsx': 'JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript',
            'py': 'Python', 'rs': 'Rust', 'go': 'Go', 'java': 'Java',
            'c': 'C', 'cpp': 'C++', 'cc': 'C++', 'cs': 'C#',
            'rb': 'Ruby', 'php': 'PHP', 'swift': 'Swift', 'kt': 'Kotlin'
          }
          return languageMap[ext] || ext.toUpperCase()
        }

        // Create placeholder artworks for all 10 files (so frames show immediately)
        const placeholderArtworks = top10Files.map((file, i) => ({
          id: i + 1,
          placard: {
            title: file.path.split('/').pop() || 'Loading...',
            filename: file.path.split('/').pop() || '',
            filePath: file.path,
            artist: `Code by @${username}`,
            medium: `${getLanguage(file.path)}, ${year}`,
            year: year,
            description: 'Generating artwork...'
          },
          language: getLanguage(file.path)
        }))

        // Set placeholder artworks immediately so frames appear
        setArtworks(placeholderArtworks)
        setStatus('Generating artwork images from code...')

        // Generate image + placard for one file
        async function generateArtwork(file, index) {
          const maxRetries = 3
          const artworkId = index + 1

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            const startTime = performance.now()

            console.log(
              `%c[Syntaxesia] [${artworkId}/10] Generating image for "${file.path}"${attempt > 1 ? ` — retry ${attempt}/${maxRetries}` : ''}...`,
              'color: #ffd600'
            )

            try {
              // Generate image from code
              const imageRes = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: file.snippet || '',
                  language: getLanguage(file.path)
                }),
              })

              if (!imageRes.ok) {
                const err = await imageRes.json().catch(() => ({}))
                console.error(
                  `%c[Syntaxesia] [${artworkId}/10] Image generation FAILED: ${err.error || imageRes.status}`,
                  'color: #ff1744'
                )
                if (attempt < maxRetries) {
                  const waitSec = attempt * 15
                  console.log(
                    `%c[Syntaxesia] Rate limited — waiting ${waitSec}s before retry...`,
                    'color: #ffa726'
                  )
                  await delay(waitSec * 1000)
                  continue
                }
                return null
              }

              const imageData = await imageRes.json()
              const imageElapsed = ((performance.now() - startTime) / 1000).toFixed(1)

              console.log(
                `%c[Syntaxesia] [${artworkId}/10] ✓ Image generated (${imageElapsed}s), now generating placard...`,
                'color: #00e676'
              )

              // Store image immediately so it shows in gallery
              setImages(prev => ({ ...prev, [artworkId]: imageData.image_data_url }))

              // Generate placard from the Imagen prompt + code context
              const placardStartTime = performance.now()
              const placardRes = await fetch('/api/placard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imagen_prompt: imageData.prompt_used,
                  code_snippet: file.snippet || '',
                  file_path: file.path,
                  language: getLanguage(file.path),
                  repo_name: repoName,
                  username: username,
                  year: year
                }),
              })

              if (!placardRes.ok) {
                const err = await placardRes.json().catch(() => ({}))
                console.error(
                  `%c[Syntaxesia] [${artworkId}/10] Placard generation FAILED: ${err.detail || placardRes.status}`,
                  'color: #ff1744'
                )
                // Return artwork with minimal placard
                return {
                  id: artworkId,
                  placard: {
                    title: file.path.split('/').pop(),
                    filename: file.path.split('/').pop(),
                    filePath: file.path,
                    artist: `Code by @${username}`,
                    medium: `${getLanguage(file.path)}, ${year}`,
                    year: year,
                    description: 'Placard generation failed.'
                  },
                  language: getLanguage(file.path)
                }
              }

              const placard = await placardRes.json()
              const placardElapsed = ((performance.now() - placardStartTime) / 1000).toFixed(1)
              const totalElapsed = ((performance.now() - startTime) / 1000).toFixed(1)

              console.log(
                `%c[Syntaxesia] [${artworkId}/10] ✓ "${placard.title}" complete (${totalElapsed}s total: ${imageElapsed}s image + ${placardElapsed}s placard)`,
                'color: #00e676; font-weight: bold'
              )

              return {
                id: artworkId,
                placard,
                language: getLanguage(file.path)
              }
            } catch (err) {
              console.error(
                `%c[Syntaxesia] [${artworkId}/10] Network error:`,
                'color: #ff1744',
                err
              )
              if (attempt < maxRetries) {
                await delay(attempt * 15000)
                continue
              }
              return null
            }
          }
        }

        // Process 5 files at a time (perfect for 2 Vertex AI instances round-robin)
        // Batch 1: artworks 1-5 (Vertex #1, #2, #1, #2, #1)
        // Batch 2: artworks 6-10 (Vertex #2, #1, #2, #1, #2)
        for (let i = 0; i < top10Files.length; i += 5) {
          const batch = top10Files.slice(i, Math.min(i + 5, top10Files.length))

          console.log(
            `%c[Syntaxesia] 🚀 Processing batch ${Math.floor(i / 5) + 1}/2 (${batch.length} artworks in parallel)`,
            'color: #00e676; font-weight: bold'
          )

          // Generate artworks in parallel (5 at a time, alternating between 2 Vertex AI instances)
          const results = await Promise.all(
            batch.map((file, j) => generateArtwork(file, i + j))
          )

          // Update artworks state with completed artworks
          setArtworks(prev => {
            const updated = [...prev]
            for (const artwork of results) {
              if (artwork) {
                // Replace placeholder with completed artwork
                updated[artwork.id - 1] = artwork
              }
            }
            return updated
          })

          // No delay needed - dual Vertex AI can handle the load
          if (i + 5 < top10Files.length) {
            console.log(
              `%c[Syntaxesia] ⏳ Starting batch 2/2...`,
              'color: #ffeb3b; font-weight: bold'
            )
          }
        }

        const finalCount = placeholderArtworks.length

        setGenerating(false)
        setStatus('Gallery complete!')

        const totalTime = ((performance.now() - pipelineStartTime) / 1000).toFixed(1)
        console.log(
          `%c[Syntaxesia] ⚡ All ${finalCount} artworks generated in ${totalTime}s!`,
          'color: #76ff03; font-weight: bold; font-size: 14px'
        )

      } catch (error) {
        console.error('%c[Syntaxesia] Pipeline error:', 'color: #ff1744; font-weight: bold', error)
        setStatus(`Error: ${error.message}`)
        setGenerating(false)
      }
    }

    runPipeline()
  }, [githubUrl])

  return (
    <ArtContext.Provider value={{ artworks, images, generating, status, setGithubUrl }}>
      {children}
    </ArtContext.Provider>
  )
}

export function useGeneratedArt() {
  return useContext(ArtContext)
}
