/**
 * JSON Viewer component
 * Displays JSON data in an interactive tree view using @textea/json-viewer
 * With integrated search functionality and tree/raw/split/table view modes
 * Plus a minify toggle for compact JSON display
 */

import { useState, useCallback, useMemo } from 'react'
import { JsonViewer } from '@textea/json-viewer'
import { Toolbar } from '../toolbar/toolbar'
import { SearchBar } from '../search-bar'
import { TableView } from '../table-view'
import { searchJson } from '../../utils/json-search'
import { jsonToTable } from '../../utils/json-to-table'
import styles from './json-viewer.module.css'

/** Default depth for initial tree expansion */
const DEFAULT_DEPTH = 2
/** Large depth value to expand all nodes */
const EXPAND_ALL_DEPTH = 100

type ViewMode = 'tree' | 'raw' | 'split' | 'table'

interface JsonViewerComponentProps {
  data: unknown
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function JsonViewerComponent({ data, theme = 'dark', onThemeChange }: JsonViewerComponentProps) {
  const [inspectDepth, setInspectDepth] = useState(DEFAULT_DEPTH)
  // Key forces JsonViewer remount to apply new defaultInspectDepth
  const [viewerKey, setViewerKey] = useState(0)

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('tree')

  // Minify toggle state
  const [isMinified, setIsMinified] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  const handleExpandAll = useCallback(() => {
    setInspectDepth(EXPAND_ALL_DEPTH)
    setViewerKey((k) => k + 1)
  }, [])

  const handleCollapseAll = useCallback(() => {
    setInspectDepth(0)
    setViewerKey((k) => k + 1)
  }, [])

  const handleMinifyToggle = useCallback(() => {
    setIsMinified((prev) => !prev)
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

  // Pre-compute formatted and minified JSON strings
  const prettyJson = useMemo(() => JSON.stringify(data, null, 2), [data])
  const minifiedJson = useMemo(() => JSON.stringify(data), [data])

  // Select display string based on minify toggle
  const displayJson = isMinified ? minifiedJson : prettyJson

  // Convert data to table format
  const tableData = useMemo(() => jsonToTable(data), [data])
  const isTableAvailable = tableData !== null

  // When in table view, switch away if data becomes non-table-compatible
  // (handled gracefully by just not showing the table button)

  // Simple syntax-highlighted raw view using spans with inline styles
  const highlightedJson = useMemo(() => {
    const json = isMinified ? minifiedJson : prettyJson
    // Use lighter colors for dark theme, darker for light theme
    const colors = theme === 'dark'
      ? { key: '#60A5FA', string: '#34D399', number: '#FBBF24', boolean: '#A78BFA', nullVal: '#F87171' }
      : { key: '#2563EB', string: '#059669', number: '#D97706', boolean: '#7C3AED', nullVal: '#DC2626' }
    // Escape HTML entities, then apply syntax coloring via regex
    const escaped = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return escaped
      // strings (keys and values)
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, _content, _esc, offset, str) => {
        // Determine if this is a key: preceded by whitespace + followed by ':'
        const after = str.slice(offset + match.length).trimStart()
        if (after.startsWith(':')) {
          return `<span style="color: ${colors.key}">${match}</span>` // key
        }
        return `<span style="color: ${colors.string}">${match}</span>` // string value
      })
      // numbers
      .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, `<span style="color: ${colors.number}">$1</span>`)
      // booleans
      .replace(/\b(true|false)\b/g, `<span style="color: ${colors.boolean}">$1</span>`)
      // null
      .replace(/\bnull\b/g, `<span style="color: ${colors.nullVal}">null</span>`)
  }, [prettyJson, minifiedJson, isMinified, theme])

  return (
    <div className={styles.container}>
      <div className={styles.toolbarRow}>
        <Toolbar
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          jsonData={displayJson}
          theme={theme}
          onThemeChange={onThemeChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isMinified={isMinified}
          onMinifyToggle={handleMinifyToggle}
          isTableAvailable={isTableAvailable}
        />
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          matchCount={searchMatches.length}
          currentMatch={currentMatchIndex}
          onNavigateMatch={handleNavigateMatch}
        />
      </div>

      {searchQuery && searchMatches.length > 0 && viewMode !== 'table' && (
        <div className={styles.searchResults}>
          <span className={styles.searchResultText}>
            Found <strong>{searchMatches.length}</strong> matches for &ldquo;{searchQuery}&rdquo;
          </span>
        </div>
      )}

      {searchQuery && searchMatches.length === 0 && viewMode !== 'table' && (
        <div className={styles.noResults}>
          <span>No matches found for &ldquo;{searchQuery}&rdquo;</span>
        </div>
      )}

      {viewMode === 'tree' && (
        <div className={styles.viewer}>
          <JsonViewer
            key={viewerKey}
            value={data}
            theme={theme}
            defaultInspectDepth={inspectDepth}
            displayDataTypes={true}
            editable={false}
            enableClipboard={true}
          />
        </div>
      )}

      {viewMode === 'raw' && (
        <div className={styles.viewer}>
          <pre className={styles.rawPre}>
            <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
          </pre>
        </div>
      )}

      {viewMode === 'split' && (
        <div className={styles.splitContainer}>
          <div className={styles.splitPane}>
            <div className={styles.splitLabel}>Tree</div>
            <div className={styles.splitViewer}>
              <JsonViewer
                key={viewerKey}
                value={data}
                theme={theme}
                defaultInspectDepth={inspectDepth}
                displayDataTypes={true}
                editable={false}
                enableClipboard={true}
              />
            </div>
          </div>
          <div className={styles.splitDivider} />
          <div className={styles.splitPane}>
            <div className={styles.splitLabel}>Raw</div>
            <div className={styles.splitViewer}>
              <pre className={styles.rawPre}>
                <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
              </pre>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'table' && tableData && (
        <TableView tableData={tableData} />
      )}
    </div>
  )
}
