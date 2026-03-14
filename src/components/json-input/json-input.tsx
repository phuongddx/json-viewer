import type { ChangeEvent } from 'react'
import styles from './json-input.module.css'
import { FixSuggestionBanner } from './fix-suggestion-banner'

export interface JsonInputProps {
  value: string
  error: string | null
  isValid: boolean
  onChange: (text: string) => void
  onBeautify: () => void
  onMinify: () => void
  onClear: () => void
  // Fix suggestion props (optional — not needed in compare mode)
  hasFixAvailable?: boolean
  onApplyFix?: () => void
  onUndo?: () => void
  canUndo?: boolean
  placeholder?: string
}

export function JsonInput({
  value,
  error,
  isValid,
  onChange,
  onBeautify,
  onMinify,
  onClear,
  hasFixAvailable = false,
  onApplyFix,
  onUndo,
  canUndo = false,
  placeholder = 'Paste your JSON here...',
}: JsonInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Beautify on Cmd/Ctrl + Shift + F
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
      e.preventDefault()
      onBeautify()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>JSON Input</span>
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={onBeautify}
            disabled={!isValid}
            title="Beautify JSON (Cmd+Shift+F)"
          >
            Beautify
          </button>
          <button
            className={styles.button}
            onClick={onMinify}
            disabled={!isValid}
            title="Minify JSON"
          >
            Minify
          </button>
          <button
            className={styles.button}
            onClick={onClear}
            disabled={!value}
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.textareaWrapper}>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          spellCheck={false}
        />
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorTitle}>Parse Error</div>
          <div className={styles.errorMessage}>{error}</div>
        </div>
      )}

      {error && hasFixAvailable && onApplyFix && onUndo && (
        <FixSuggestionBanner
          onApplyFix={onApplyFix}
          onUndo={onUndo}
          canUndo={canUndo}
        />
      )}

      {value && !error && (
        <div className={`${styles.status} ${styles.statusValid}`}>
          Valid JSON
        </div>
      )}
    </div>
  )
}
