/**
 * Local search using Met Museum Open Access dataset
 * Pre-filtered for women artists from our curated list
 */

let artworksData = null

/**
 * Load the local artwork dataset
 */
async function loadArtworks() {
  if (artworksData) return artworksData

  console.log('[Met Local] Loading artwork data...')
  const response = await fetch('/met_women_artists.json')
  artworksData = await response.json()
  console.log('[Met Local] Loaded', artworksData.length, 'artworks')
  return artworksData
}

/**
 * Search artworks by keywords
 */
export async function searchMetLocal(searchKeywords) {
  console.log('[Met Local] Searching for:', searchKeywords)

  const artworks = await loadArtworks()
  const keywords = searchKeywords.toLowerCase().split(/\s+/)

  console.log('[Met Local] Parsed keywords:', keywords)

  // Score each artwork based on keyword matches
  const scored = artworks.map(artwork => {
    let score = 0

    // Match against artwork keywords
    for (const keyword of keywords) {
      for (const artworkKeyword of (artwork.keywords || [])) {
        if (artworkKeyword.toLowerCase() === keyword) {
          score += 3 // Exact match
        } else if (artworkKeyword.toLowerCase().includes(keyword) ||
                   keyword.includes(artworkKeyword.toLowerCase())) {
          score += 1 // Partial match
        }
      }

      // Also match against title and medium
      const title = (artwork.title || '').toLowerCase()
      const medium = (artwork.medium || '').toLowerCase()

      if (title.includes(keyword)) score += 2
      if (medium.includes(keyword)) score += 1
    }

    return { artwork, score }
  })

  // Sort by score and filter out zero scores
  const matches = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)

  console.log('[Met Local] Found', matches.length, 'matching artworks')

  // Fetch actual image URL from Met API for a single object
  const fetchImageUrl = async (objectID) => {
    try {
      const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`
      console.log('[Met Local] Fetching', url)

      const response = await fetch(url)
      if (!response.ok) {
        console.error('[Met Local] API returned', response.status, 'for object', objectID)
        return null
      }

      const data = await response.json()
      console.log('[Met Local] API response for object', objectID, ':', data)

      // Extract primaryImage URL
      const imageUrl = data.primaryImage || data.primaryImageSmall

      if (imageUrl) {
        console.log('[Met Local] ✓ Found image:', imageUrl)
        return imageUrl
      } else {
        console.log('[Met Local] ✗ No primaryImage in response for object', objectID)
        return null
      }
    } catch (err) {
      console.error('[Met Local] Error fetching object', objectID, ':', err)
      return null
    }
  }

  // Select artworks (without images yet)
  let selectedArtworks = []
  let usedArtists = new Set()

  if (matches.length === 0) {
    console.log('[Met Local] No keyword matches, using random selection')
    const shuffled = [...artworks].sort(() => Math.random() - 0.5)

    for (const artwork of shuffled) {
      if (selectedArtworks.length >= 8) break
      if (!usedArtists.has(artwork.artist)) {
        selectedArtworks.push(artwork)
        usedArtists.add(artwork.artist)
      }
    }
  } else {
    // Shuffle matches for variety
    const shuffledMatches = [...matches].sort(() => Math.random() - 0.5)

    for (const { artwork } of shuffledMatches) {
      if (selectedArtworks.length >= 8) break

      // Only 1 artwork per artist for maximum variety
      if (!usedArtists.has(artwork.artist)) {
        selectedArtworks.push(artwork)
        usedArtists.add(artwork.artist)
      }
    }
  }

  console.log('[Met Local] Selected', selectedArtworks.length, 'artworks from', usedArtists.size, 'artists')
  console.log('[Met Local] Artists:', Array.from(usedArtists))

  // Fetch actual image URLs from Met API for each artwork
  console.log('[Met Local] Fetching image URLs from Met API...')
  const results = []

  for (const artwork of selectedArtworks) {
    console.log('[Met Local] Processing', artwork.artist, '-', artwork.title)

    const imageUrl = await fetchImageUrl(artwork.objectID)

    if (imageUrl) {
      results.push({
        url: imageUrl,
        title: artwork.title,
        artist: artwork.artist,
        date: artwork.date,
        medium: artwork.medium,
        description: artwork.credit || artwork.department
      })
      console.log('[Met Local] Added artwork:', artwork.title)
    } else {
      console.log('[Met Local] Skipped artwork (no image):', artwork.title)
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('[Met Local] ===== FINAL RESULTS =====')
  console.log('[Met Local] Returning', results.length, 'artworks with valid images')
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.artist} - ${r.title}`)
    console.log(`     Image: ${r.url}`)
  })

  return results
}
