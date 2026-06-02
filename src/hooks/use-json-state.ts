import { useState, useCallback, useMemo } from 'react'
import { extractJsonFromText } from '../utils/json-extract'

/**
 * Hook for managing JSON state with parsing, error handling, beautify/minify, and undo.
 * Supports auto-detection of JSON from pasted text (code blocks, embedded JSON, etc).
 */
export function useJsonState(initialValue: string = '') {
  const [rawText, setRawText] = useState(initialValue)
  // Stores previous text for single-level undo after beautify/minify/fix
  const [previousText, setPreviousText] = useState<string | null>(null)
  // Notification message shown when JSON was auto-detected from paste
  const [autoDetectNotification, setAutoDetectNotification] = useState<string | null>(null)

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
    // Clear auto-detect notification when manually editing
    setAutoDetectNotification(null)
  }, [])

  /**
   * Handle paste events: attempt to auto-detect JSON from the pasted text.
   * If detected, replaces the input with the extracted JSON.
   * Returns true if JSON was auto-detected and replaced, false otherwise.
   */
  const handlePaste = useCallback((pastedText: string): boolean => {
    const extracted = extractJsonFromText(pastedText)

    if (extracted && extracted !== pastedText.trim()) {
      setPreviousText(rawText)
      setRawText(extracted)
      setAutoDetectNotification('JSON auto-detected from pasted text')

      // Auto-dismiss notification after 3 seconds
      setTimeout(() => {
        setAutoDetectNotification(null)
      }, 3000)

      return true
    }

    // No extraction needed — just set the text as-is
    setRawText(pastedText)
    setAutoDetectNotification(null)
    return false
  }, [rawText])

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
    setAutoDetectNotification(null)
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
    autoDetectNotification,
    updateText,
    handlePaste,
    beautifyJson,
    minifyJson,
    applyFix,
    undoText,
    clearAll,
  }
}

export type UseJsonStateReturn = ReturnType<typeof useJsonState>
