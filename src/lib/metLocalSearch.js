/**
 * Search Met Museum for women artists via our backend.
 * Backend handles Met API calls (no CORS), filters by artistGender, returns 8 results.
 */
export async function searchMetLocal(searchKeywords) {
  console.log('[Met] Searching for:', searchKeywords)

  const response = await fetch(`/api/met/women-artists?q=${encodeURIComponent(searchKeywords)}`)

  if (!response.ok) {
    const text = await response.text()
    console.error('[Met] Backend error:', text)
    throw new Error('Search failed. Please try different keywords.')
  }

  const results = await response.json()
  console.log(`[Met] Got ${results.length} artworks by women artists`)
  return results
}
