/**
 * JSON Viewer component
 * Displays JSON data in an interactive tree view using @textea/json-viewer
 * With integrated search functionality and copy-path feature
 */

import { useState, useCallback, useMemo } from 'react'
import { JsonViewer, type Path } from '@textea/json-viewer'
import { Toolbar } from '../toolbar/toolbar'
import { SearchBar } from '../search-bar'
import { searchJson } from '../../utils/json-search'
import { CopyPathOverlay, formatPath } from '../copy-path-overlay'
import styles from './json-viewer.module.css'

/** Default depth for initial tree expansion */
const DEFAULT_DEPTH = 2
/** Large depth value to expand all nodes */
const EXPAND_ALL_DEPTH = 100
/** Toast auto-dismiss delay (ms) — match CSS animation */
const TOAST_DURATION = 2500

interface JsonViewerComponentProps {
  data: unknown
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function JsonViewerComponent({ data, theme = 'dark', onThemeChange }: JsonViewerComponentProps) {
  const [inspectDepth, setInspectDepth] = useState(DEFAULT_DEPTH)
  // Key forces JsonViewer remount to apply new defaultInspectDepth
  const [viewerKey, setViewerKey] = useState(0)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  // Copy-path toast state
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const dismissTimer = useMemo(() => ({ current: undefined as ReturnType<typeof setTimeout> | undefined }), [])

  const handleExpandAll = useCallback(() => {
    setInspectDepth(EXPAND_ALL_DEPTH)
    setViewerKey((k) => k + 1)
  }, [])

  const handleCollapseAll = useCallback(() => {
    setInspectDepth(0)
    setViewerKey((k) => k + 1)
  }, [])

  // Search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery || !data) return []
    return searchJson(data, searchQuery)
  }, [data, searchQuery])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentMatchIndex(0)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setCurrentMatchIndex(0)
  }, [])

  const handleNavigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return
    setCurrentMatchIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % searchMatches.length
      } else {
        return (prev - 1 + searchMatches.length) % searchMatches.length
      }
    })
  }, [searchMatches.length])

  /** Intercept copy action: copy path string to clipboard and show toast */
  const handleCopy = useCallback(
    async (path: Path, _value: unknown, copy: (text: string) => Promise<void>) => {
      const pathStr = formatPath(path)
      await copy(pathStr)

      // Clear any existing dismiss timer
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current)
      }
      setCopiedPath(pathStr)
      dismissTimer.current = setTimeout(() => {
        setCopiedPath(null)
      }, TOAST_DURATION)
    },
    [dismissTimer],
  )

  const handleDismissToast = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current)
    }
    setCopiedPath(null)
  }, [dismissTimer])

  const jsonString = JSON.stringify(data, null, 2)

  return (
    <div className={styles.container}>
      <div className={styles.toolbarRow}>
        <Toolbar
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          jsonData={jsonString}
          theme={theme}
          onThemeChange={onThemeChange}
        />
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          matchCount={searchMatches.length}
          currentMatch={currentMatchIndex}
          onNavigateMatch={handleNavigateMatch}
        />
      </div>
      
      {searchQuery && searchMatches.length > 0 && (
        <div className={styles.searchResults}>
          <span className={styles.searchResultText}>
            Found <strong>{searchMatches.length}</strong> matches for &ldquo;{searchQuery}&rdquo;
          </span>
        </div>
      )}
      
      {searchQuery && searchMatches.length === 0 && (
        <div className={styles.noResults}>
          <span>No matches found for &ldquo;{searchQuery}&rdquo;</span>
        </div>
      )}
      
      <div className={styles.viewer}>
        <JsonViewer
          key={viewerKey}
          value={data}
          theme={theme}
          defaultInspectDepth={inspectDepth}
          displayDataTypes={true}
          editable={false}
          enableClipboard={true}
          onCopy={handleCopy}
        />
      </div>

      <CopyPathOverlay copiedPath={copiedPath} onDismiss={handleDismissToast} />
    </div>
  )
}
