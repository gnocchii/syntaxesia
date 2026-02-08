/**
 * Search Wikimedia Commons for artwork images
 */

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php'

// Women artists to enhance search results
const WOMEN_ARTISTS = [
  'Yayoi Kusama',
  'Hilma af Klint',
  'Georgia O\'Keeffe',
  'Helen Frankenthaler',
  'Joan Mitchell',
  'Agnes Martin',
  'Bridget Riley',
  'Lee Krasner',
  'Sonia Delaunay',
  'Anni Albers'
]

// Art styles/movements
const ART_STYLES = [
  'abstract',
  'geometric',
  'expressionist',
  'minimalist',
  'colorfield',
  'pattern',
  'textile'
]

/**
 * Generate search keywords from code metrics
 */
export function generateSearchKeywords(metrics, language) {
  const keywords = []

  // Add style based on code characteristics
  if (metrics.recursionCount > 2) keywords.push('fractal', 'pattern', 'recursive')
  if (metrics.loopCount > 5) keywords.push('repetitive', 'dots', 'grid')
  if (metrics.conditionalCount > 8) keywords.push('branching', 'network')
  if (metrics.classCount > 2) keywords.push('geometric', 'structured')
  if (metrics.asyncCount > 3) keywords.push('scattered', 'constellation')
  if (metrics.cyclomaticComplexity < 5) keywords.push('minimalist', 'simple')

  // Add a random artist for variety
  const artist = WOMEN_ARTISTS[Math.floor(Math.random() * WOMEN_ARTISTS.length)]
  keywords.push(artist)

  // Default to abstract if nothing specific
  if (keywords.length === 1) {
    keywords.push('abstract', 'painting')
  }

  return keywords.slice(0, 5) // Max 5 keywords
}

/**
 * Extract metadata from image title
 */
function parseArtworkMetadata(title) {
  // Try to extract artist, date, medium from common patterns
  let artist = 'Unknown Artist'
  let date = ''
  let medium = ''

  // Pattern: "Artist Name - Title - Date.jpg"
  const match1 = title.match(/([^-]+)\s*-\s*([^-]+)\s*-\s*(\d{4}|\d{2}th century)/i)
  if (match1) {
    artist = match1[1].trim()
    date = match1[3].trim()
  }

  // Pattern: "Artist Name, Title (Date).jpg"
  const match2 = title.match(/([^,]+),\s*[^(]+\((\d{4})\)/i)
  if (match2) {
    artist = match2[1].trim()
    date = match2[2].trim()
  }

  // Extract medium from common terms
  const mediumKeywords = ['oil', 'canvas', 'watercolor', 'acrylic', 'painting', 'print', 'lithograph', 'etching', 'pastel', 'ink', 'tempera']
  for (const keyword of mediumKeywords) {
    if (title.toLowerCase().includes(keyword)) {
      medium = keyword.charAt(0).toUpperCase() + keyword.slice(1)
      break
    }
  }

  return { artist, date, medium: medium || 'Mixed media' }
}

/**
 * Search Wikimedia Commons for artwork by women artists
 * Returns 8 artworks with full metadata
 */
export async function searchWikimedia(keywords) {
  const searchTerm = Array.isArray(keywords) ? keywords.join(' ') : keywords
  console.log('[Wikimedia] Starting search with keywords:', searchTerm)

  // Build search query - try simpler query first, then add artist names
  // Try multiple search strategies
  const searchStrategies = [
    `${searchTerm} painting art`,
    `${searchTerm} abstract art`,
    `${searchTerm} artwork`,
  ]

  const artistQuery = searchStrategies[0] // Start with first strategy
  console.log('[Wikimedia] Search query:', artistQuery)

  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: artistQuery,
    gsrnamespace: '6', // CRITICAL: Search only in File namespace (images)
    gsrlimit: '20',
    prop: 'imageinfo|info',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '800',
    inprop: 'url',
    origin: '*'
  })

  const apiUrl = `${WIKIMEDIA_API}?${params}`
  console.log('[Wikimedia] API URL:', apiUrl)

  try {
    console.log('[Wikimedia] Fetching from API...')
    const response = await fetch(apiUrl)
    const data = await response.json()

    console.log('[Wikimedia] Raw API response:', data)

    if (!data.query || !data.query.pages) {
      console.warn('[Wikimedia] No query.pages in response')
      return []
    }

    const pages = Object.values(data.query.pages)
    console.log('[Wikimedia] Found', pages.length, 'pages')
    const pagesWithImages = pages.filter(page => {
      const hasImage = page.imageinfo && page.imageinfo[0]
      if (!hasImage) {
        console.log('[Wikimedia] Skipping page (no imageinfo):', page.title)
      }
      return hasImage
    })
    console.log('[Wikimedia] Pages with imageinfo:', pagesWithImages.length)

    const artworks = pagesWithImages.map(page => {
        const imageInfo = page.imageinfo[0]
        const metadata = imageInfo.extmetadata || {}

        console.log('[Wikimedia] Processing page:', page.title)
        console.log('[Wikimedia] Image URL:', imageInfo.thumburl || imageInfo.url)

        // Extract description from metadata
        const description = metadata.ImageDescription?.value ||
                          metadata.ObjectName?.value ||
                          'Abstract artwork'

        // Clean HTML tags from description
        const cleanDesc = description.replace(/<[^>]*>/g, '').substring(0, 150)

        // Extract artist and date from metadata or title
        let artist = metadata.Artist?.value || 'Unknown Artist'
        artist = artist.replace(/<[^>]*>/g, '').substring(0, 50)

        let date = metadata.DateTimeOriginal?.value ||
                   metadata.DateTime?.value || ''

        // Extract year from date if it's a full date
        const yearMatch = date.match(/\d{4}/)
        if (yearMatch) date = yearMatch[0]

        // Parse title for additional metadata
        const parsed = parseArtworkMetadata(page.title)
        if (!artist || artist === 'Unknown Artist') artist = parsed.artist
        if (!date) date = parsed.date

        const medium = metadata.Medium?.value?.replace(/<[^>]*>/g, '') || parsed.medium

        return {
          url: imageInfo.thumburl || imageInfo.url,
          fullUrl: imageInfo.url,
          title: page.title.replace(/^File:/, '').replace(/\.(jpg|jpeg|png|gif)$/i, ''),
          artist,
          date,
          medium,
          description: cleanDesc,
          pageUrl: page.fullurl,
          width: imageInfo.thumbwidth || imageInfo.width,
          height: imageInfo.thumbheight || imageInfo.height
        }
      })

    console.log('[Wikimedia] Mapped to', artworks.length, 'artworks')

    const filteredArtworks = artworks.filter(img => {
        const isValid = img.url && (
          img.url.endsWith('.jpg') ||
          img.url.endsWith('.jpeg') ||
          img.url.endsWith('.png') ||
          img.url.includes('jpeg') ||
          img.url.includes('png')
        )
        if (!isValid) {
          console.log('[Wikimedia] Filtered out (invalid URL):', img.title, img.url)
        }
        return isValid
      })

    console.log('[Wikimedia] After filtering:', filteredArtworks.length, 'valid artworks')

    const finalResults = filteredArtworks.slice(0, 8)
    console.log('[Wikimedia] Returning', finalResults.length, 'artworks')

    return finalResults
  } catch (error) {
    console.error('[Wikimedia] ERROR:', error)
    console.error('[Wikimedia] Error stack:', error.stack)
    return []
  }
}

/**
 * Get a specific artwork by artist name
 */
export async function searchArtistWork(artistName) {
  const styles = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)]
  return searchWikimedia(`${artistName} ${styles} painting artwork`)
}

/**
 * Fallback: Get random abstract art from a woman artist
 */
export async function getRandomWomenArtistWork() {
  const artist = WOMEN_ARTISTS[Math.floor(Math.random() * WOMEN_ARTISTS.length)]
  const style = ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)]
  return searchWikimedia(`${artist} ${style}`)
}
