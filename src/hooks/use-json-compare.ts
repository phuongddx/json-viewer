import { useState, useMemo } from 'react'
import { diff } from 'jsondiffpatch'
import { format as htmlFormat } from 'jsondiffpatch/formatters/html'

/**
 * Hook managing two JSON states + semantic diff computation via jsondiffpatch.
 * Diff is only computed when both inputs contain valid JSON.
 */
export function useJsonCompare() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')

  const leftParsed = useMemo(() => {
    try { return { data: JSON.parse(leftText), error: null } }
    catch (e) { return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' } }
  }, [leftText])

  const rightParsed = useMemo(() => {
    try { return { data: JSON.parse(rightText), error: null } }
    catch (e) { return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' } }
  }, [rightText])

  const delta = useMemo(() => {
    if (!leftParsed.data || !rightParsed.data) return null
    return diff(leftParsed.data, rightParsed.data)
  }, [leftParsed.data, rightParsed.data])

  const diffHtml = useMemo(() => {
    if (!leftParsed.data) return null
    // delta === undefined means no differences; pass undefined to show unchanged base
    return htmlFormat(delta ?? undefined, leftParsed.data) ?? null
  }, [delta, leftParsed.data])

  // delta === undefined (not null) means jsondiffpatch found no differences
  const isIdentical = delta === undefined && !!leftParsed.data && !!rightParsed.data
  const hasBothValid = !!leftParsed.data && !!rightParsed.data

  return {
    leftText, setLeftText,
    rightText, setRightText,
    leftError: leftText.trim() ? leftParsed.error : null,
    rightError: rightText.trim() ? rightParsed.error : null,
    diffHtml,
    isIdentical,
    hasBothValid,
  }
}
