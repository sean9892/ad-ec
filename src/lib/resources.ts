export type Resource = 'AM' | 'IP' | 'EP' | 'TT'
export interface Requirement { amount: string; resource: Resource; label?: string }
export type ResourceSegment = { type: 'text'; text: string } | { type: 'resource'; requirement: Requirement }

// Keep scientific notation intact; skip ×5 EP / x5EP multipliers and EP/min rates.
const quantityPattern = /(?<![\w.×])([<>≤≥]?\s*(?:e\d[\d,]*|\d[\d,]*(?:\.\d+)?(?:e[+-]?\d+)?)(?:\s+or\s+\d[\d,]*)?)\s*(AM|IP|EP|TT)(\+)?(?![\w/])/gi

export function resourceSegments(text: string): ResourceSegment[] {
  const segments: ResourceSegment[] = []
  let position = 0
  for (const match of text.matchAll(quantityPattern)) {
    if (match.index > position) segments.push({ type: 'text', text: text.slice(position, match.index) })
    segments.push({ type: 'resource', requirement: { amount: match[1].trim() + (match[3] ?? ''), resource: match[2].toUpperCase() as Resource } })
    position = match.index + match[0].length
  }
  if (position < text.length) segments.push({ type: 'text', text: text.slice(position) })
  return segments
}

export function formatAmount(amount: string): string {
  // Commas help with long AM exponents and TT totals without numeric rounding.
  return amount.replace(/\d{4,}/g, digits => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ','))
}
