import { useMemo } from 'react'
import { jsonrepair } from 'jsonrepair'

/**
 * Attempts to repair invalid JSON using jsonrepair.
 * Returns repaired text only if repair succeeds and differs from original.
 */
export function useJsonRepair(rawText: string, hasError: boolean) {
  const repairResult = useMemo(() => {
    if (!hasError || !rawText.trim()) return null

    try {
      const repaired = jsonrepair(rawText)
      // Verify the repair actually produces valid JSON
      JSON.parse(repaired)
      // Only suggest if repair differs from original
      if (repaired === rawText) return null
      return { repairedText: repaired }
    } catch {
      return null // Unfixable
    }
  }, [rawText, hasError])

  return repairResult
}
