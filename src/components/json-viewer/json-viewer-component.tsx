/**
 * JSON Viewer component
 * Displays JSON data in an interactive tree view using @textea/json-viewer
 */

import { useRef, useCallback } from 'react'
import { JsonViewer } from '@textea/json-viewer'
import { Toolbar } from '../toolbar/toolbar'
import styles from './json-viewer.module.css'

interface JsonViewerComponentProps {
  data: unknown
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function JsonViewerComponent({ data, theme = 'dark', onThemeChange }: JsonViewerComponentProps) {
  const viewerRef = useRef<HTMLDivElement>(null)

  const handleExpandAll = useCallback(() => {
    // @textea/json-viewer handles expand internally via collapse all button
    // Simulate clicking expand buttons in the viewer
    const expandButtons = viewerRef.current?.querySelectorAll('[aria-label*="expand"], [aria-label*="Expand"]')
    expandButtons?.forEach((btn) => {
      if (btn instanceof HTMLButtonElement) btn.click()
    })
  }, [])

  const handleCollapseAll = useCallback(() => {
    // @textea/json-viewer handles collapse internally
    // Simulate clicking collapse buttons in the viewer
    const collapseButtons = viewerRef.current?.querySelectorAll('[aria-label*="collapse"], [aria-label*="Collapse"]')
    collapseButtons?.forEach((btn) => {
      if (btn instanceof HTMLButtonElement) btn.click()
    })
  }, [])

  const jsonString = JSON.stringify(data, null, 2)

  return (
    <div className={styles.container}>
      <Toolbar
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        jsonData={jsonString}
        theme={theme}
        onThemeChange={onThemeChange}
      />
      <div className={styles.viewer} ref={viewerRef}>
        <JsonViewer
          value={data}
          theme={theme}
          defaultInspectDepth={2}
          displayDataTypes={true}
          editable={false}
          enableClipboard={true}
        />
      </div>
    </div>
  )
}
