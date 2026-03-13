import { useCallback, useState, useEffect } from 'react'
import { Layout } from './components/layout'
import { JsonInput } from './components/json-input'
import { JsonViewerComponent } from './components/json-viewer/json-viewer-component'
import { FileDropZone } from './components/file-drop-zone'
import { useJsonState } from './hooks/use-json-state'
import styles from './App.module.css'

type Theme = 'light' | 'dark'

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const {
    rawText,
    parsedJson,
    error,
    isValid,
    updateText,
    formatJson,
    clearAll,
  } = useJsonState()

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  // Handle data loaded from file drop zone
  const handleDataLoaded = useCallback(
    (data: unknown) => {
      if (data) {
        const formatted = JSON.stringify(data, null, 2)
        updateText(formatted)
      }
    },
    [updateText]
  )

  // Render header
  const header = (
    <div className={styles.header}>
      <h1 className={styles.title}>JSON Viewer</h1>
      <div className={styles.headerActions}>
        <button className={styles.themeBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )

  // Render sidebar with input and file drop
  const sidebar = (
    <div className={styles.sidebar}>
      <div className={styles.inputSection}>
        <JsonInput
          value={rawText}
          error={error}
          isValid={isValid}
          onChange={updateText}
          onFormat={formatJson}
          onClear={clearAll}
        />
      </div>
      <div className={styles.dropSection}>
        <FileDropZone onDataLoaded={handleDataLoaded} />
      </div>
    </div>
  )

  // Render main content with viewer
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
            <span className={styles.placeholderIcon}>📋</span>
            <h2>No JSON to display</h2>
            <p>Paste JSON in the input area or drag & drop a file</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Layout header={header} sidebar={sidebar} main={main} />
  )
}

export default App
