import { useState, useCallback, useMemo } from 'react'

/**
 * Hook for managing JSON state with parsing, error handling, beautify/minify, and undo
 */
export function useJsonState(initialValue: string = '') {
  const [rawText, setRawText] = useState(initialValue)
  // Stores previous text for single-level undo after beautify/minify/fix
  const [previousText, setPreviousText] = useState<string | null>(null)

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

  const beautifyJson = useCallback(() => {
    if (!rawText.trim() || error) return

    try {
      const parsed = JSON.parse(rawText)
      setPreviousText(rawText)
      setRawText(JSON.stringify(parsed, null, 2))
    } catch {
      // Error already handled by useMemo
    }
  }, [rawText, error])

  const minifyJson = useCallback(() => {
    if (!rawText.trim() || error) return

    try {
      const parsed = JSON.parse(rawText)
      setPreviousText(rawText)
      setRawText(JSON.stringify(parsed))
    } catch {
      // Error already handled by useMemo
    }
  }, [rawText, error])

  /** Applies a repaired text, storing current text for undo */
  const applyFix = useCallback((repairedText: string) => {
    setPreviousText(rawText)
    setRawText(repairedText)
  }, [rawText])

  const undoText = useCallback(() => {
    if (previousText !== null) {
      setRawText(previousText)
      setPreviousText(null)
    }
  }, [previousText])

  const clearAll = useCallback(() => {
    setRawText('')
    setPreviousText(null)
  }, [])

  const isValid = useMemo(() => {
    return rawText.trim() !== '' && !error && parsedJson !== null
  }, [rawText, error, parsedJson])

  return {
    rawText,
    parsedJson,
    error,
    isValid,
    previousText,
    updateText,
    beautifyJson,
    minifyJson,
    applyFix,
    undoText,
    clearAll,
  }
}

export type UseJsonStateReturn = ReturnType<typeof useJsonState>
