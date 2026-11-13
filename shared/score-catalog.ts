import { publicRepertoire } from './public-repertoire.js'
import { guidedScoreCount } from './guided-scores.js'

// Count one normal score per song/artist, regardless of pages or alternate files.
// Guided scores are a separate format included in the Complete plan's total.
export const normalScoreCount = publicRepertoire.length
export const totalScoreCount = normalScoreCount + guidedScoreCount
export const playbackCount = publicRepertoire.filter(([, , , audio]) => audio).length
export function scoreCountForStyles(...styles: string[]) {
  return publicRepertoire.filter(([, , style]) => styles.includes(style)).length
}
