import styles from './json-input.module.css'

interface FixSuggestionBannerProps {
  onApplyFix: () => void
  onUndo: () => void
  canUndo: boolean
}

/** Banner shown when jsonrepair can fix the current invalid JSON */
export function FixSuggestionBanner({ onApplyFix, onUndo, canUndo }: FixSuggestionBannerProps) {
  return (
    <div className={styles.fixBanner}>
      <span className={styles.fixBannerText}>Fix available — common JSON errors detected</span>
      <div className={styles.fixBannerActions}>
        <button className={`${styles.button} ${styles.buttonFix}`} onClick={onApplyFix}>
          Apply Fix
        </button>
        {canUndo && (
          <button className={styles.button} onClick={onUndo}>
            Undo
          </button>
        )}
      </div>
    </div>
  )
}
