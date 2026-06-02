/**
 * JSON Search Utility
 * Searches through JSON data and returns matching paths
 */

export interface SearchMatch {
  path: string[]
  key?: string
  value?: string
  type: 'key' | 'value' | 'both'
}

/**
 * Search through JSON data for matching keys and values
 */
export function searchJson(data: unknown, query: string): SearchMatch[] {
  const matches: SearchMatch[] = []
  const normalizedQuery = query.toLowerCase()

  function traverse(obj: unknown, path: string[] = []) {
    if (obj === null || obj === undefined) return

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        traverse(item, [...path, `[${index}]`])
      })
    } else if (typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        const keyMatch = key.toLowerCase().includes(normalizedQuery)
        const valueMatch = typeof value === 'string' && value.toLowerCase().includes(normalizedQuery)
        const numberMatch = typeof value === 'number' && value.toString().includes(query)

        if (keyMatch && (valueMatch || numberMatch)) {
          matches.push({ path: [...path, key], key, value: String(value), type: 'both' })
        } else if (keyMatch) {
          matches.push({ path: [...path, key], key, type: 'key' })
        } else if (valueMatch || numberMatch) {
          matches.push({ path: [...path, key], key, value: String(value), type: 'value' })
        }

        traverse(value, [...path, key])
      })
    }
  }

  traverse(data)
  return matches
}

/**
 * Build a path string from path array
 */
export function pathToString(path: string[]): string {
  return path.join('.')
}

/**
 * Get the JSON value at a specific path
 */
export function getValueAtPath(data: unknown, path: string[]): unknown {
  let current = data
  for (const key of path) {
    if (current === null || current === undefined) return undefined
    if (key.startsWith('[') && key.endsWith(']')) {
      const index = parseInt(key.slice(1, -1))
      current = (current as unknown[])[index]
    } else {
      current = (current as Record<string, unknown>)[key]
    }
  }
  return current
}
