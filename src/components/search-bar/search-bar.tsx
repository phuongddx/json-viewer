import { useState, useCallback, useEffect, useRef } from 'react'
import styles from './search-bar.module.css'

interface SearchBarProps {
  onSearch: (query: string) => void
  onClear: () => void
  matchCount?: number
  currentMatch?: number
  onNavigateMatch?: (direction: 'next' | 'prev') => void
}

export function SearchBar({ onSearch, onClear, matchCount = 0, currentMatch = 0, onNavigateMatch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = useCallback((value: string) => {
    setQuery(value)
    if (value.trim()) {
      onSearch(value.trim())
    } else {
      onClear()
    }
  }, [onSearch, onClear])

  const handleClear = useCallback(() => {
    setQuery('')
    onClear()
    inputRef.current?.focus()
  }, [onClear])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
      setIsOpen(false)
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onNavigateMatch?.('prev')
      } else {
        onNavigateMatch?.('next')
      }
    } else if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setIsOpen(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [handleClear, onNavigateMatch])

  // Global Cmd/Ctrl+F handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className={styles.container}>
      {!isOpen ? (
        <button
          className={styles.trigger}
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
          aria-label="Search JSON (Ctrl+F)"
          title="Search JSON (Ctrl+F)"
        >
          <SearchIcon />
          <span className={styles.triggerLabel}>Search</span>
          <kbd className={styles.shortcut}>⌘F</kbd>
        </button>
      ) : (
        <div className={styles.searchBox}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search keys, values..."
            autoFocus
            aria-label="Search JSON content"
          />
          {query && (
            <div className={styles.matchInfo}>
              <span className={styles.matchCount}>
                {matchCount > 0 ? `${currentMatch + 1}/${matchCount}` : 'No matches'}
              </span>
              <div className={styles.navButtons}>
                <button
                  className={styles.navBtn}
                  onClick={() => onNavigateMatch?.('prev')}
                  disabled={matchCount === 0}
                  aria-label="Previous match"
                  title="Previous match (Shift+Enter)"
                >
                  <ChevronUpIcon />
                </button>
                <button
                  className={styles.navBtn}
                  onClick={() => onNavigateMatch?.('next')}
                  disabled={matchCount === 0}
                  aria-label="Next match"
                  title="Next match (Enter)"
                >
                  <ChevronDownIcon />
                </button>
              </div>
            </div>
          )}
          <button
            className={styles.closeBtn}
            onClick={() => { handleClear(); setIsOpen(false) }}
            aria-label="Close search"
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </div>
  )
}

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
