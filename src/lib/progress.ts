export const STORAGE_KEY = 'ad-ec:progress:v1'

export interface SavedProgress { version: 1; completed: string[]; current: string }

export function readProgress(raw: string | null, ids: readonly string[]): SavedProgress {
  const empty: SavedProgress = { version: 1, completed: [], current: ids[0] ?? '' }
  if (!raw) return empty
  try {
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1) return empty
    const value = data as Partial<SavedProgress>
    const known = new Set(ids)
    const completed = Array.isArray(value.completed)
      ? [...new Set(value.completed.filter((id): id is string => typeof id === 'string' && known.has(id)))] : []
    return { version: 1, completed, current: typeof value.current === 'string' && known.has(value.current) ? value.current : ids.find(id => !completed.includes(id)) ?? empty.current }
  } catch { return empty }
}

export function toggleCompleted(completed: readonly string[], id: string): string[] {
  return completed.includes(id) ? completed.filter(value => value !== id) : [...completed, id]
}

export function nextAfterAchievement(index: number, total: number, wasCompleted: boolean, autoAdvance: boolean): number | null {
  return autoAdvance && !wasCompleted && index >= 0 && index < total - 1 ? index + 1 : null
}
