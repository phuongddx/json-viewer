import { useCallback, useState, useEffect } from 'react'
import { Layout } from './components/layout'
import { JsonInput } from './components/json-input'
import { JsonViewerComponent } from './components/json-viewer/json-viewer-component'
import { FileDropZone } from './components/file-drop-zone'
import { JsonCompare } from './components/json-compare/json-compare'
import { useJsonState } from './hooks/use-json-state'
import { useJsonRepair } from './hooks/use-json-repair'
import styles from './App.module.css'

type Theme = 'light' | 'dark'
type AppMode = 'view' | 'compare'

/* Inline SVG icons — no emoji, no external dependency */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const JsonPlaceholderIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mode, setMode] = useState<AppMode>('view')

  const {
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
  } = useJsonState()

  // Attempt to repair invalid JSON when there's an error
  const repairResult = useJsonRepair(rawText, !!error)

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const handleDataLoaded = useCallback(
    (data: unknown) => {
      if (data) {
        const formatted = JSON.stringify(data, null, 2)
        updateText(formatted)
      }
    },
    [updateText]
  )

  const header = (
    <div className={styles.header}>
      <h1 className={styles.title}>
        <span className={styles.titleBrace}>{'{'}</span>
        JSON Viewer
        <span className={styles.titleBrace}>{'}'}</span>
      </h1>
      <div className={styles.headerActions}>
        {/* View / Compare mode tabs */}
        <div className={styles.modeTabs}>
          <button
            className={`${styles.modeTab} ${mode === 'view' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('view')}
          >
            View
          </button>
          <button
            className={`${styles.modeTab} ${mode === 'compare' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('compare')}
          >
            Compare
          </button>
        </div>
        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  )

  const sidebar = (
    <div className={styles.sidebar}>
      <div className={styles.inputSection}>
        <JsonInput
          value={rawText}
          error={error}
          isValid={isValid}
          onChange={updateText}
          onBeautify={beautifyJson}
          onMinify={minifyJson}
          onClear={clearAll}
          hasFixAvailable={!!repairResult}
          onApplyFix={() => repairResult && applyFix(repairResult.repairedText)}
          onUndo={undoText}
          canUndo={previousText !== null}
        />
      </div>
      <div className={styles.dropSection}>
        <FileDropZone onDataLoaded={handleDataLoaded} />
      </div>
    </div>
  )

  const main = (
    <div className={styles.main}>
      {parsedJson ? (
        <JsonViewerComponent
          data={parsedJson}
          theme={theme}
          onThemeChange={setTheme}
        />
      ) : (
        <div className={styles.placeholder}>
          <div className={styles.placeholderContent}>
            <div className={styles.placeholderIcon}>
              <JsonPlaceholderIcon />
            </div>
            <h2>No JSON to display</h2>
            <p>Paste JSON in the input area or drag &amp; drop a file</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Layout
      header={header}
      sidebar={mode === 'view' ? sidebar : null}
      main={mode === 'view' ? main : <JsonCompare />}
    />
  )
}

export default App
