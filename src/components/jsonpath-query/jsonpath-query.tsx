/**
 * JSONPath Query component
 * Provides a query input for JSONPath expressions and displays matching results
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { query, validateJsonPath } from '../../utils/jsonpath'
import type { JsonPathResult } from '../../utils/jsonpath'
import styles from './jsonpath-query.module.css'

interface JsonPathQueryProps {
  data: unknown
}

function getValueType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function getValueClass(type: string): string {
  switch (type) {
    case 'string': return styles.valueString
    case 'number': return styles.valueNumber
    case 'boolean': return styles.valueBoolean
    case 'null': return styles.valueNull
    default: return ''
  }
}

function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return `"${value}"`
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value)
      return str.length > 120 ? str.slice(0, 117) + '...' : str
    } catch {
      return String(value)
    }
  }
  return String(value)
}

export function JsonPathQuery({ data }: JsonPathQueryProps) {
  const [expression, setExpression] = useState('')
  const [isOpen, setIsOpen] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const validationError = useMemo(() => validateJsonPath(expression), [expression])

  const results: JsonPathResult[] = useMemo(() => {
    if (!expression.trim() || validationError) return []
    try {
      return query(data, expression)
    } catch {
      return []
    }
  }, [data, expression, validationError])

  const hasQuery = expression.trim().length > 0
  const showError = hasQuery && validationError !== null
  const showNoResults = hasQuery && !validationError && results.length === 0

  const handleClear = useCallback(() => {
    setExpression('')
    inputRef.current?.focus()
  }, [])

  const handleCopyResult = useCallback(async (result: JsonPathResult) => {
    try {
      const text = typeof result.value === 'object'
        ? JSON.stringify(result.value, null, 2)
        : String(result.value)
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback — silently ignore
    }
  }, [])

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
      >
        <span className={styles.headerLeft}>
          <TerminalIcon />
          JSONPath Query
        </span>
        <span className={styles.headerRight}>
          {hasQuery && !validationError && (
            <span className={styles.badge}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </span>
          )}
          {showError && (
            <span className={`${styles.badge} ${styles.badgeError}`}>invalid</span>
          )}
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
            <ChevronIcon />
          </span>
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.inputRow}>
            <span className={styles.inputIcon}>
              <DollarIcon />
            </span>
            <input
              ref={inputRef}
              type="text"
              className={`${styles.input} ${showError ? styles.inputError : ''}`}
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="$.store.book[0].title"
              spellCheck={false}
              autoComplete="off"
              aria-label="JSONPath expression"
            />
            {hasQuery && (
              <button
                className={styles.clearBtn}
                onClick={handleClear}
                aria-label="Clear query"
                title="Clear query"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {showError && (
            <div className={styles.errorMessage}>{validationError}</div>
          )}

          {hasQuery && !validationError && results.length > 0 && (
            <div className={styles.resultsCount}>
              {results.length} {results.length === 1 ? 'match' : 'matches'} found
            </div>
          )}

          {hasQuery && !validationError && results.length > 0 && (
            <div className={styles.resultsContainer}>
              {results.map((result, index) => {
                const type = getValueType(result.value)
                return (
                  <div
                    key={`${result.path}-${index}`}
                    className={styles.resultItem}
                    onClick={() => handleCopyResult(result)}
                    title={`Click to copy value\nPath: ${result.path}`}
                  >
                    <span className={styles.resultPath}>{result.path}</span>
                    <span className={`${styles.resultValue} ${getValueClass(type)}`}>
                      {formatValue(result.value)}
                    </span>
                    <span className={styles.resultType}>{type}</span>
                  </div>
                )
              })}
            </div>
          )}

          {showNoResults && (
            <div className={styles.resultsEmpty}>
              <p>No matches found</p>
            </div>
          )}

          {!hasQuery && (
            <div className={styles.resultsEmpty}>
              <p>Enter a JSONPath expression to query data</p>
              <p style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                e.g. $.store.book[*].author
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const DollarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
