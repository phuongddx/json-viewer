import { useJsonCompare } from '../../hooks/use-json-compare'
import { JsonInput } from '../json-input/json-input'
import { DiffOutput } from './diff-output'
import styles from './json-compare.module.css'

/**
 * Side-by-side JSON comparison view.
 * Two input panels + semantic diff output below using jsondiffpatch.
 */
export function JsonCompare() {
  const {
    leftText, setLeftText,
    rightText, setRightText,
    leftError, rightError,
    diffHtml, isIdentical, hasBothValid,
  } = useJsonCompare()

  const leftValid = leftText.trim() !== '' && !leftError
  const rightValid = rightText.trim() !== '' && !rightError

  return (
    <div className={styles.container}>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <JsonInput
            value={leftText}
            error={leftError}
            isValid={leftValid}
            onChange={setLeftText}
            onBeautify={() => {
              if (!leftValid) return
              try { setLeftText(JSON.stringify(JSON.parse(leftText), null, 2)) } catch {}
            }}
            onMinify={() => {
              if (!leftValid) return
              try { setLeftText(JSON.stringify(JSON.parse(leftText))) } catch {}
            }}
            onClear={() => setLeftText('')}
            placeholder="Paste left JSON here..."
          />
        </div>
        <div className={styles.panel}>
          <JsonInput
            value={rightText}
            error={rightError}
            isValid={rightValid}
            onChange={setRightText}
            onBeautify={() => {
              if (!rightValid) return
              try { setRightText(JSON.stringify(JSON.parse(rightText), null, 2)) } catch {}
            }}
            onMinify={() => {
              if (!rightValid) return
              try { setRightText(JSON.stringify(JSON.parse(rightText))) } catch {}
            }}
            onClear={() => setRightText('')}
            placeholder="Paste right JSON here..."
          />
        </div>
      </div>
      <div className={styles.diffSection}>
        <DiffOutput diffHtml={diffHtml} isIdentical={isIdentical} hasBothValid={hasBothValid} />
      </div>
    </div>
  )
}
