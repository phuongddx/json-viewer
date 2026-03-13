import { useState, useCallback, useMemo } from 'react'

/**
 * Hook for managing JSON state with parsing and error handling
 */
export function useJsonState(initialValue: string = '') {
  const [rawText, setRawText] = useState(initialValue)

  const { parsedJson, error } = useMemo(() => {
    if (!rawText.trim()) {
      return { parsedJson: null, error: null }
    }

    try {
      const parsed = JSON.parse(rawText)
      return { parsedJson: parsed, error: null }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
      return { parsedJson: null, error: errorMessage }
    }
  }, [rawText])

  const updateText = useCallback((text: string) => {
    setRawText(text)
  }, [])

  const formatJson = useCallback(() => {
    if (!rawText.trim() || error) return

    try {
      const parsed = JSON.parse(rawText)
      const formatted = JSON.stringify(parsed, null, 2)
      setRawText(formatted)
    } catch {
      // Error already handled by useMemo
    }
  }, [rawText, error])

  const clearAll = useCallback(() => {
    setRawText('')
  }, [])

  const isValid = useMemo(() => {
    return rawText.trim() !== '' && !error && parsedJson !== null
  }, [rawText, error, parsedJson])

  return {
    rawText,
    parsedJson,
    error,
    isValid,
    updateText,
    formatJson,
    clearAll,
  }
}

export type UseJsonStateReturn = ReturnType<typeof useJsonState>
