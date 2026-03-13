import type { ChangeEvent } from 'react'
import styles from './json-input.module.css'

export interface JsonInputProps {
  value: string
  error: string | null
  isValid: boolean
  onChange: (text: string) => void
  onFormat: () => void
  onClear: () => void
  placeholder?: string
}

export function JsonInput({
  value,
  error,
  isValid,
  onChange,
  onFormat,
  onClear,
  placeholder = 'Paste your JSON here...',
}: JsonInputProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Format on Cmd/Ctrl + Shift + F
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
      e.preventDefault()
      onFormat()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>JSON Input</span>
        <div className={styles.actions}>
          <button
            className={styles.button}
            onClick={onFormat}
            disabled={!isValid}
            title="Format JSON (Cmd+Shift+F)"
          >
            Format
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

      {value && !error && (
        <div className={`${styles.status} ${styles.statusValid}`}>
          Valid JSON
        </div>
      )}
    </div>
  )
}
