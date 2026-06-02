/**
 * Lightweight JSONPath evaluator — zero external dependencies.
 *
 * Supported syntax:
 *   $.key           – property access
 *   $.arr[0]        – array index
 *   $.arr[*]        – wildcard (all array items)
 *   $.**.key        – recursive descent (find key at any depth)
 *   $.key1.key2     – chained property access
 *   $['key']        – bracket notation with quoted keys
 */

export interface JsonPathResult {
  path: string
  value: unknown
}

/**
 * Parse a JSONPath expression into an array of segments.
 * Handles dot notation, bracket notation, wildcard, and recursive descent.
 */
function parseSegments(expression: string): string[] {
  const trimmed = expression.trim()

  // Must start with $
  if (!trimmed.startsWith('$')) {
    throw new Error('JSONPath must start with $')
  }

  const rest = trimmed.slice(1)
  const segments: string[] = []
  let i = 0

  while (i < rest.length) {
    const ch = rest[i]

    if (ch === '.') {
      // Check for recursive descent
      if (rest[i + 1] === '.' && rest[i + 2] === '.') {
        // $.** or $...key — treat ** as a special recursive marker
        i += 3
        // Consume the key after ...
        let key = ''
        while (i < rest.length && rest[i] !== '.' && rest[i] !== '[') {
          key += rest[i]
          i++
        }
        if (key) {
          segments.push('**', key)
        } else {
          segments.push('**')
        }
      } else if (rest[i + 1] === '*') {
        // $.** — wildcard at object level? Treat as recursive
        i += 2
        segments.push('**')
      } else {
        // Regular dot notation
        i++
        let key = ''
        while (i < rest.length && rest[i] !== '.' && rest[i] !== '[') {
          key += rest[i]
          i++
        }
        if (key) {
          segments.push(key)
        }
      }
    } else if (ch === '[') {
      // Bracket notation
      i++
      if (rest[i] === '*') {
        // [*] wildcard
        segments.push('*')
        i++
        if (rest[i] === ']') i++
      } else if (rest[i] === "'") {
        // ['key'] quoted key
        i++
        let key = ''
        while (i < rest.length && rest[i] !== "'") {
          key += rest[i]
          i++
        }
        segments.push(key)
        i++ // skip closing quote
        if (rest[i] === ']') i++
      } else {
        // [0] numeric index
        let numStr = ''
        while (i < rest.length && rest[i] !== ']') {
          numStr += rest[i]
          i++
        }
        const num = parseInt(numStr, 10)
        if (!isNaN(num)) {
          segments.push(String(num))
        }
        if (rest[i] === ']') i++
      }
    } else if (ch === '*') {
      // Bare wildcard (after implicit dot)
      segments.push('*')
      i++
    } else {
      // Implicit dot — bare key
      let key = ''
      while (i < rest.length && rest[i] !== '.' && rest[i] !== '[') {
        key += rest[i]
        i++
      }
      if (key) {
        segments.push(key)
      }
    }
  }

  return segments
}

/**
 * Collect all values from a nested structure that match a key (recursive descent).
 */
function collectRecursive(data: unknown, key: string, currentPath: string): JsonPathResult[] {
  const results: JsonPathResult[] = []

  if (data === null || data === undefined) return results

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const childPath = `${currentPath}[${index}]`
      // Check if the item itself has the key
      if (item !== null && typeof item === 'object' && !Array.isArray(item) && key in (item as Record<string, unknown>)) {
        results.push({ path: `${childPath}.${key}`, value: (item as Record<string, unknown>)[key] })
      }
      // Recurse deeper
      results.push(...collectRecursive(item, key, childPath))
    })
  } else if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (key in obj) {
      results.push({ path: `${currentPath}.${key}`, value: obj[key] })
    }
    for (const k of Object.keys(obj)) {
      results.push(...collectRecursive(obj[k], key, `${currentPath}.${k}`))
    }
  }

  return results
}

/**
 * Evaluate a single data node against a sequence of remaining segments.
 * Returns all matching path/value pairs.
 */
function evaluateSegments(
  data: unknown,
  segments: string[],
  currentPath: string,
): JsonPathResult[] {
  if (segments.length === 0) {
    return [{ path: currentPath, value: data }]
  }

  const [segment, ...rest] = segments

  // Recursive descent
  if (segment === '**') {
    const keyAfter = rest[0]
    if (keyAfter) {
      // $.**.key — collect all matching keys at any depth
      const results = collectRecursive(data, keyAfter, currentPath)
      // If there are remaining segments after the key, filter further
      if (rest.length > 1) {
        const furtherResults: JsonPathResult[] = []
        for (const result of results) {
          furtherResults.push(...evaluateSegments(result.value, rest.slice(1), result.path))
        }
        return furtherResults
      }
      return results
    }
    // Bare ** — return everything at every depth
    return collectAll(data, currentPath)
  }

  // Wildcard (array or object)
  if (segment === '*') {
    if (Array.isArray(data)) {
      const results: JsonPathResult[] = []
      data.forEach((item, index) => {
        results.push(...evaluateSegments(item, rest, `${currentPath}[${index}]`))
      })
      return results
    } else if (data !== null && typeof data === 'object') {
      const results: JsonPathResult[] = []
      for (const key of Object.keys(data as Record<string, unknown>)) {
        results.push(...evaluateSegments(
          (data as Record<string, unknown>)[key],
          rest,
          `${currentPath}.${key}`,
        ))
      }
      return results
    }
    return []
  }

  // Numeric index (array)
  const numIndex = parseInt(segment, 10)
  if (!isNaN(numIndex) && Array.isArray(data)) {
    const item = data[numIndex]
    if (item === undefined) return []
    return evaluateSegments(item, rest, `${currentPath}[${numIndex}]`)
  }

  // Property access (object)
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>
    if (segment in obj) {
      return evaluateSegments(obj[segment], rest, `${currentPath}.${segment}`)
    }
    return []
  }

  return []
}

/**
 * Collect all leaf and intermediate values from a nested structure.
 */
function collectAll(data: unknown, currentPath: string): JsonPathResult[] {
  const results: JsonPathResult[] = []

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const childPath = `${currentPath}[${index}]`
      results.push({ path: childPath, value: item })
      results.push(...collectAll(item, childPath))
    })
  } else if (data !== null && typeof data === 'object') {
    for (const key of Object.keys(data as Record<string, unknown>)) {
      const childPath = `${currentPath}.${key}`
      const value = (data as Record<string, unknown>)[key]
      results.push({ path: childPath, value })
      results.push(...collectAll(value, childPath))
    }
  }

  return results
}

/**
 * Evaluate a JSONPath expression against a parsed JSON value.
 *
 * @param data       – the parsed JSON value (object/array)
 * @param expression – the JSONPath string, e.g. "$.store.book[0].title"
 * @returns          – array of { path, value } matches
 *
 * @example
 *   const data = { store: { book: [{ title: "Sayings" }] } }
 *   query(data, "$.store.book[0].title")
 *   // => [{ path: "$.store.book[0].title", value: "Sayings" }]
 */
export function query(data: unknown, expression: string): JsonPathResult[] {
  if (!expression.trim()) return []

  const segments = parseSegments(expression)

  // Special case: root $ with no segments
  if (segments.length === 0) {
    return [{ path: '$', value: data }]
  }

  return evaluateSegments(data, segments, '$')
}

/**
 * Validate a JSONPath expression — returns null if valid, error message if not.
 */
export function validateJsonPath(expression: string): string | null {
  const trimmed = expression.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('$')) return 'Path must start with $'
  try {
    parseSegments(trimmed)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : 'Invalid path'
  }
}
