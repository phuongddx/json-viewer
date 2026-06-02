import { useState, useEffect, useCallback } from 'react'
import styles from './copy-path-overlay.module.css'

interface CopyPathOverlayProps {
  path: string
  onDismiss: () => void
}

export function CopyPathOverlay({ path, onDismiss }: CopyPathOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setVisible(true))

    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300) // Wait for exit animation
    }, 2000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(path)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = path
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }, [path])

  useEffect(() => {
    handleCopy()
  }, [handleCopy])

  return (
    <div
      className={`${styles.toast} ${visible ? styles.visible : ''}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className={styles.label}>Path copied</span>
      <code className={styles.path}>{path}</code>
    </div>
  )
}
