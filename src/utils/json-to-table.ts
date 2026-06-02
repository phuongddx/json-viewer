/**
 * Utility to convert JSON data (arrays of objects) into a flat table structure.
 * Handles nested objects using dot-notation keys.
 */

export interface TableData {
  /** Column headers (dot-notation paths for nested keys) */
  headers: string[]
  /** Rows of data, each cell is the stringified value at that column path */
  rows: (string | number | boolean | null | undefined)[][]
  /** Original row objects for reference */
  originalRows: unknown[]
}

/**
 * Flattens a nested object into dot-notation key-value pairs.
 * E.g. { a: { b: 1 }, c: 2 } → { "a.b": 1, "c": 2 }
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey))
    } else if (Array.isArray(value)) {
      // For arrays, stringify them (don't flatten array elements)
      result[fullKey] = JSON.stringify(value)
    } else {
      result[fullKey] = value
    }
  }

  return result
}

/**
 * Converts JSON data into a flat table structure.
 *
 * - If data is an array of objects → each object becomes a row
 * - If data is a single object → becomes a 2-column key/value table
 * - If data is an array of primitives → single-column table
 *
 * Returns null if the data cannot be meaningfully represented as a table.
 */
export function jsonToTable(data: unknown): TableData | null {
  if (data === null || data === undefined) {
    return null
  }

  // Array of objects → flat table
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { headers: [], rows: [], originalRows: [] }
    }

    // Check if it's an array of objects
    const allObjects = data.every(
      (item) => item !== null && typeof item === 'object' && !Array.isArray(item),
    )

    if (allObjects) {
      // Flatten each object and collect all unique headers
      const headerSet = new Set<string>()
      const flatRows: Record<string, unknown>[] = []

      for (const item of data) {
        const flat = flattenObject(item as Record<string, unknown>)
        flatRows.push(flat)
        for (const key of Object.keys(flat)) {
          headerSet.add(key)
        }
      }

      const headers = Array.from(headerSet)
      const rows = flatRows.map((flat) =>
        headers.map((h) => flat[h] as string | number | boolean | null | undefined),
      )

      return { headers, rows, originalRows: data }
    }

    // Array of primitives → single column
    const primitives = data.filter(
      (item) => item === null || typeof item !== 'object',
    )
    if (primitives.length === data.length) {
      return {
        headers: ['value'],
        rows: data.map((item) => [item as string | number | boolean | null]),
        originalRows: data,
      }
    }

    // Mixed array — can't represent as a simple table
    return null
  }

  // Single object → key/value table
  if (typeof data === 'object') {
    const flat = flattenObject(data as Record<string, unknown>)
    return {
      headers: ['key', 'value'],
      rows: Object.entries(flat).map(([k, v]) => [k, v as string | number | boolean | null]),
      originalRows: [data],
    }
  }

  // Primitive value
  return {
    headers: ['value'],
    rows: [[data as string | number | boolean]],
    originalRows: [data],
  }
}
