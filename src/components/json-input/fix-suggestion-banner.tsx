import styles from './json-input.module.css'
import { FixDiffPreview } from './fix-diff-preview'

interface FixSuggestionBannerProps {
  onApplyFix: () => void
  onUndo: () => void
  canUndo: boolean
  // diff preview props (optional — omit to hide Preview toggle)
  originalText?: string
  repairedText?: string
  showDiff?: boolean
  onToggleDiff?: () => void
}

/** Banner shown when jsonrepair can fix the current invalid JSON */
export function FixSuggestionBanner({
  onApplyFix,
  onUndo,
  canUndo,
  originalText,
  repairedText,
  showDiff = false,
  onToggleDiff,
}: FixSuggestionBannerProps) {
  return (
    <div className={styles.fixBanner}>
      <div className={styles.fixBannerRow}>
        <span className={styles.fixBannerText}>Fix available — common JSON errors detected</span>
        <div className={styles.fixBannerActions}>
          {onToggleDiff && (
            <button className={`${styles.button} ${styles.buttonPreview}`} onClick={onToggleDiff}>
              {showDiff ? 'Hide Diff' : 'Preview Fix'}
            </button>
          )}
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
      {showDiff && originalText !== undefined && repairedText !== undefined && (
        <FixDiffPreview originalText={originalText} repairedText={repairedText} />
      )}
    </div>
  )
}
