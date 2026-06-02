/**
 * Convert JSON data to CSV string.
 * Works best with arrays of objects. Nested objects are flattened with dot notation.
 */

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey))
    } else if (Array.isArray(value)) {
      result[fullKey] = JSON.stringify(value)
    } else {
      result[fullKey] = value
    }
  }

  return result
}

function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function jsonToCsv(data: unknown): string {
  if (!Array.isArray(data) || data.length === 0) {
    return ''
  }

  // Flatten each row and collect all unique headers
  const rows: Record<string, unknown>[] = []
  const headerSet = new Set<string>()

  for (const item of data) {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      const flat = flattenObject(item as Record<string, unknown>)
      rows.push(flat)
      for (const key of Object.keys(flat)) {
        headerSet.add(key)
      }
    }
  }

  if (rows.length === 0) return ''

  const headers = Array.from(headerSet)
  const headerLine = headers.map(escapeCsvField).join(',')
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCsvField(row[h])).join(',')
  )

  return [headerLine, ...dataLines].join('\n')
}
