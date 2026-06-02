/**
 * Keyboard shortcuts overlay
 * Displays a modal listing all available keyboard shortcuts.
 */

import { useEffect, useRef } from 'react'
import styles from './shortcuts-overlay.module.css'

interface ShortcutsOverlayProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { label: 'Search', keys: ['⌘', 'F'] },
  { label: 'Beautify', keys: ['⌘', '⇧', 'F'] },
  { label: 'Download', keys: ['⌘', 'D'] },
  { label: 'Copy (tree focus)', keys: ['⌘', 'C'] },
  { label: 'Close search / modal', keys: ['Esc'] },
  { label: 'Show shortcuts', keys: ['?'] },
]

export function ShortcutsOverlay({ open, onClose }: ShortcutsOverlayProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Focus the close button on open and handle Escape
  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button
            ref={closeRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close shortcuts overlay"
          >
            <CloseIcon />
          </button>
        </div>

        <ul className={styles.list}>
          {shortcuts.map(({ label, keys }) => (
            <li key={label} className={styles.item}>
              <span className={styles.label}>{label}</span>
              <span className={styles.keys}>
                {keys.map((k, i) => (
                  <span key={i}>
                    {i > 0 && <span className={styles.separator}>+</span>}
                    <kbd className={styles.kbd}>{k}</kbd>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className={styles.hint}>Press <kbd className={styles.kbd}>?</kbd> or <kbd className={styles.kbd}>Esc</kbd> to close</p>
      </div>
    </div>
  )
}

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
