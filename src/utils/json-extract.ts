/**
 * Utility for auto-detecting and extracting JSON from pasted text.
 * Handles markdown code blocks, JSON embedded in surrounding text, etc.
 */

/**
 * Attempts to extract valid JSON from arbitrary pasted text.
 * Returns the extracted JSON string, or null if no valid JSON found.
 *
 * Detection strategies (in priority order):
 * 1. ```json ... ``` or ``` ... ``` code blocks
 * 2. First top-level { ... } or [ ... ] substring that parses as valid JSON
 * 3. Trimmed text that parses as valid JSON directly
 */
export function extractJsonFromText(text: string): string | null {
  if (!text || !text.trim()) return null

  // Strategy 1: Extract from markdown code blocks
  const codeBlockResult = extractFromCodeBlock(text)
  if (codeBlockResult) return codeBlockResult

  // Strategy 2: Find first top-level JSON object or array
  const substringResult = extractTopLevelJson(text)
  if (substringResult) return substringResult

  // Strategy 3: Try trimmed text directly
  const trimmed = text.trim()
  if (isValidJson(trimmed)) return trimmed

  return null
}

/**
 * Extracts JSON from markdown code blocks.
 * Supports: ```json ... ```, ``` ... ```, and `inline` backticks.
 */
function extractFromCodeBlock(text: string): string | null {
  // Match ```json ... ``` or ``` ... ``` (with optional language tag)
  const codeBlockRegex = /```(?:json|JSON)?\s*\n?([\s\S]*?)```/g
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const content = match[1].trim()
    if (content && isValidJson(content)) {
      return content
    }
  }

  // Try single backtick inline: `{"key": "value"}`
  const inlineRegex = /`([^`]+)`/g
  while ((match = inlineRegex.exec(text)) !== null) {
    const content = match[1].trim()
    if (content && isValidJson(content)) {
      return content
    }
  }

  return null
}

/**
 * Finds the first top-level { ... } or [ ... ] in the text that is valid JSON.
 * Uses bracket matching to handle nested structures correctly.
 */
function extractTopLevelJson(text: string): string | null {
  const candidates: Array<{ start: number; end: number; char: string }> = []

  // Collect positions of all opening braces/brackets
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '{' || ch === '[') {
      candidates.push({ start: i, end: -1, char: ch })
    }
  }

  for (const candidate of candidates) {
    const closingChar = candidate.char === '{' ? '}' : ']'
    let depth = 0
    let inString = false
    let escape = false

    for (let i = candidate.start; i < text.length; i++) {
      const ch = text[i]

      if (escape) {
        escape = false
        continue
      }

      if (ch === '\\' && inString) {
        escape = true
        continue
      }

      if (ch === '"') {
        inString = !inString
        continue
      }

      if (inString) continue

      if (ch === candidate.char) {
        depth++
      } else if (ch === closingChar) {
        depth--
        if (depth === 0) {
          candidate.end = i
          break
        }
      }
    }

    if (candidate.end > candidate.start) {
      const extracted = text.substring(candidate.start, candidate.end + 1)
      if (isValidJson(extracted)) {
        return extracted
      }
    }
  }

  return null
}

/**
 * Checks whether a string is valid JSON.
 */
function isValidJson(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}
