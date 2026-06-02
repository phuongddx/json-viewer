/**
 * Toolbar component for JSON Viewer
 * Provides controls for copy, expand/collapse, theme toggle, and CSV export
 */

import { useState } from 'react'
import { jsonToCsv } from '../../utils/json-to-csv'
import styles from './toolbar.module.css'

interface ToolbarProps {
  onExpandAll: () => void
  onCollapseAll: () => void
  jsonData: string
  parsedData?: unknown
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function Toolbar({ onExpandAll, onCollapseAll, jsonData, parsedData, theme = 'dark', onThemeChange }: ToolbarProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const isDark = theme === 'dark'

  const isCsvExportable = Array.isArray(parsedData) && parsedData.length > 0

  const handleExportCsv = () => {
    if (!isCsvExportable) return
    const csv = jsonToCsv(parsedData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonData)
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }

  const handleThemeToggle = () => {
    const newTheme = isDark ? 'light' : 'dark'
    onThemeChange?.(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copied': return 'Copied!'
      case 'error': return 'Copy Failed'
      default: return 'Copy'
    }
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.buttonGroup}>
        <button
          onClick={handleCopy}
          className={`${styles.button} ${copyStatus === 'copied' ? styles.success : ''} ${copyStatus === 'error' ? styles.error : ''}`}
          aria-label="Copy JSON to clipboard"
        >
          {getCopyButtonText()}
        </button>
        <button
          onClick={onExpandAll}
          className={styles.button}
          aria-label="Expand all nodes"
        >
          Expand All
        </button>
        <button
          onClick={onCollapseAll}
          className={styles.button}
          aria-label="Collapse all nodes"
        >
          Collapse All
        </button>
        <button
          onClick={handleExportCsv}
          className={styles.button}
          disabled={!isCsvExportable}
          aria-label="Export as CSV"
          title={isCsvExportable ? 'Export as CSV' : 'Requires an array of objects'}
        >
          Export CSV
        </button>
      </div>
      <button
        onClick={handleThemeToggle}
        className={`${styles.button} ${styles.themeToggle}`}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  )
}
