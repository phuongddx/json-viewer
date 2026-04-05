import { useMemo } from 'react'
import { diffLines } from '../../utils/text-diff'
import styles from './fix-diff-preview.module.css'

/** Max diff lines to render — prevents layout overflow for large JSON */
const MAX_DISPLAY_LINES = 150

interface FixDiffPreviewProps {
  originalText: string
  repairedText: string
}

/** Renders a line-by-line diff between original and repaired JSON */
export function FixDiffPreview({ originalText, repairedText }: FixDiffPreviewProps) {
  const diff = useMemo(() => diffLines(originalText, repairedText), [originalText, repairedText])

  const displayed = diff.slice(0, MAX_DISPLAY_LINES)
  const remaining = diff.length - displayed.length

  return (
    <div className={styles.diffPreview} aria-label="Fix diff preview">
      {displayed.map((line, i) => (
        <div
          key={i}
          className={`${styles.diffLine} ${
            line.type === 'remove'
              ? styles.diffLineRemove
              : line.type === 'add'
                ? styles.diffLineAdd
                : styles.diffLineUnchanged
          }`}
        >
          <span className={styles.diffLinePrefix} aria-hidden="true">
            {line.type === 'remove' ? '−' : line.type === 'add' ? '+' : ' '}
          </span>
          <span>{line.text}</span>
        </div>
      ))}
      {remaining > 0 && (
        <div className={styles.diffLineTruncated}>…{remaining} more lines</div>
      )}
    </div>
  )
}
