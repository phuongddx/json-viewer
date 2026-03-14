/**
 * JSON Viewer component
 * Displays JSON data in an interactive tree view using @textea/json-viewer
 */

import { useState, useCallback } from 'react'
import { JsonViewer } from '@textea/json-viewer'
import { Toolbar } from '../toolbar/toolbar'
import styles from './json-viewer.module.css'

/** Default depth for initial tree expansion */
const DEFAULT_DEPTH = 2
/** Large depth value to expand all nodes */
const EXPAND_ALL_DEPTH = 100

interface JsonViewerComponentProps {
  data: unknown
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function JsonViewerComponent({ data, theme = 'dark', onThemeChange }: JsonViewerComponentProps) {
  const [inspectDepth, setInspectDepth] = useState(DEFAULT_DEPTH)
  // Key forces JsonViewer remount to apply new defaultInspectDepth
  const [viewerKey, setViewerKey] = useState(0)

  const handleExpandAll = useCallback(() => {
    setInspectDepth(EXPAND_ALL_DEPTH)
    setViewerKey((k) => k + 1)
  }, [])

  const handleCollapseAll = useCallback(() => {
    setInspectDepth(0)
    setViewerKey((k) => k + 1)
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
    </div>
  )
}
