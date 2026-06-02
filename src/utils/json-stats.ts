export interface JsonStats {
  totalKeys: number
  maxDepth: number
  sizeBytes: number
  sizeFormatted: string
  rootType: 'object' | 'array' | 'primitive'
  arrayLength: number | null
  typeBreakdown: {
    strings: number
    numbers: number
    booleans: number
    nulls: number
    objects: number
    arrays: number
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getUtf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length
}

interface WalkResult {
  totalKeys: number
  maxDepth: number
  typeBreakdown: JsonStats['typeBreakdown']
}

function walk(data: unknown, currentDepth: number): WalkResult {
  const result: WalkResult = {
    totalKeys: 0,
    maxDepth: currentDepth,
    typeBreakdown: { strings: 0, numbers: 0, booleans: 0, nulls: 0, objects: 0, arrays: 0 },
  }

  if (data === null || data === undefined) {
    result.typeBreakdown.nulls++
    return result
  }

  if (typeof data === 'string') {
    result.typeBreakdown.strings++
    return result
  }

  if (typeof data === 'number') {
    result.typeBreakdown.numbers++
    return result
  }

  if (typeof data === 'boolean') {
    result.typeBreakdown.booleans++
    return result
  }

  if (Array.isArray(data)) {
    result.typeBreakdown.arrays++
    for (const item of data) {
      const child = walk(item, currentDepth + 1)
      result.totalKeys += child.totalKeys
      result.maxDepth = Math.max(result.maxDepth, child.maxDepth)
      result.typeBreakdown.strings += child.typeBreakdown.strings
      result.typeBreakdown.numbers += child.typeBreakdown.numbers
      result.typeBreakdown.booleans += child.typeBreakdown.booleans
      result.typeBreakdown.nulls += child.typeBreakdown.nulls
      result.typeBreakdown.objects += child.typeBreakdown.objects
      result.typeBreakdown.arrays += child.typeBreakdown.arrays
    }
    return result
  }

  if (typeof data === 'object') {
    result.typeBreakdown.objects++
    const keys = Object.keys(data as Record<string, unknown>)
    result.totalKeys += keys.length
    for (const key of keys) {
      const child = walk((data as Record<string, unknown>)[key], currentDepth + 1)
      result.totalKeys += child.totalKeys
      result.maxDepth = Math.max(result.maxDepth, child.maxDepth)
      result.typeBreakdown.strings += child.typeBreakdown.strings
      result.typeBreakdown.numbers += child.typeBreakdown.numbers
      result.typeBreakdown.booleans += child.typeBreakdown.booleans
      result.typeBreakdown.nulls += child.typeBreakdown.nulls
      result.typeBreakdown.objects += child.typeBreakdown.objects
      result.typeBreakdown.arrays += child.typeBreakdown.arrays
    }
    return result
  }

  return result
}

export function analyzeJson(data: unknown): JsonStats {
  const jsonString = JSON.stringify(data)
  const sizeBytes = getUtf8ByteLength(jsonString)

  let rootType: JsonStats['rootType'] = 'primitive'
  let arrayLength: number | null = null

  if (Array.isArray(data)) {
    rootType = 'array'
    arrayLength = data.length
  } else if (data !== null && typeof data === 'object') {
    rootType = 'object'
  }

  const { totalKeys, maxDepth, typeBreakdown } = walk(data, 0)

  return {
    totalKeys,
    maxDepth,
    sizeBytes,
    sizeFormatted: formatBytes(sizeBytes),
    rootType,
    arrayLength,
    typeBreakdown,
  }
}
