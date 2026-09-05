export const SETTINGS_KEY = 'ad-ec:settings:v1'
export interface Settings { version: 1; autoAdvance: boolean }

export function readSettings(raw: string | null): Settings {
  const defaults: Settings = { version: 1, autoAdvance: true }
  if (!raw) return defaults
  try {
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1) return defaults
    return { version: 1, autoAdvance: 'autoAdvance' in data && typeof data.autoAdvance === 'boolean' ? data.autoAdvance : true }
  } catch { return defaults }
}
