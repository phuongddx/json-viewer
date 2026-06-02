/**
 * Toolbar component for JSON Viewer
 * Provides controls for copy, expand/collapse, download, and theme toggle
 */

import { useState } from 'react'
import styles from './toolbar.module.css'

interface ToolbarProps {
  onExpandAll: () => void
  onCollapseAll: () => void
  jsonData: string
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function Toolbar({ onExpandAll, onCollapseAll, jsonData, theme = 'dark', onThemeChange }: ToolbarProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const isDark = theme === 'dark'

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

  const handleDownload = () => {
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
          onClick={handleDownload}
          className={styles.button}
          aria-label="Download JSON file"
          title="Download formatted JSON"
        >
          <DownloadIcon />
          Download
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

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)
