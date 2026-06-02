import styles from './copy-path-overlay.module.css'

/** Convert a Path array to a dotted JSON path string */
export function formatPath(path: (string | number)[]): string {
  if (!path || path.length === 0) return 'root'

  let result = 'root'
  for (const segment of path) {
    if (typeof segment === 'number') {
      result += `[${segment}]`
    } else {
      result += `.${segment}`
    }
  }
  return result
}

interface CopyPathOverlayProps {
  /** The copied path string to display */
  copiedPath: string | null
  /** Callback to dismiss the toast */
  onDismiss: () => void
}

export function CopyPathOverlay({ copiedPath, onDismiss }: CopyPathOverlayProps) {
  if (!copiedPath) return null

  return (
    <div
      className={styles.toast}
      onClick={onDismiss}
      role="status"
      aria-live="polite"
    >
      <svg
        className={styles.icon}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
      <span className={styles.pathText}>{copiedPath}</span>
      <span className={styles.hint}>copied to clipboard</span>
    </div>
  )
}
