import { useState, useMemo, useCallback, useRef } from 'react'
import { diffLines, DiffLine } from '../../utils/text-diff'
import styles from './text-compare.module.css'

type DiffMode = 'unified' | 'split'

export function TextCompare() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [diffMode, setDiffMode] = useState<DiffMode>('unified')
  const leftRef = useRef<HTMLTextAreaElement>(null)
  const rightRef = useRef<HTMLTextAreaElement>(null)
  const diffRef = useRef<HTMLDivElement>(null)

  const diffResult = useMemo(() => {
    if (!leftText.trim() && !rightText.trim()) return null
    return diffLines(leftText, rightText)
  }, [leftText, rightText])

  const stats = useMemo(() => {
    if (!diffResult) return null
    const added = diffResult.filter(l => l.type === 'add').length
    const removed = diffResult.filter(l => l.type === 'remove').length
    const unchanged = diffResult.filter(l => l.type === 'unchanged').length
    return { added, removed, unchanged, total: diffResult.length }
  }, [diffResult])

  const swap = useCallback(() => {
    setLeftText(rightText)
    setRightText(leftText)
  }, [leftText, rightText])

  const handlePaste = useCallback(
    (setter: (v: string) => void) => (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text')
      if (text) {
        e.preventDefault()
        setter(text)
      }
    },
    []
  )

  // Build unified view: pair remove/add lines together
  const unifiedLines = useMemo(() => {
    if (!diffResult) return []
    const result: { left: DiffLine | null; right: DiffLine | null; lineLeft: number; lineRight: number }[] = []
    let i = 0
    let lineL = 1
    let lineR = 1

    while (i < diffResult.length) {
      const line = diffResult[i]
      if (line.type === 'unchanged') {
        result.push({ left: line, right: line, lineLeft: lineL, lineRight: lineR })
        lineL++
        lineR++
        i++
      } else if (line.type === 'remove') {
        // Look ahead for matching add
        const nextAdd = i + 1 < diffResult.length && diffResult[i + 1].type === 'add'
          ? diffResult[i + 1]
          : null
        result.push({ left: line, right: nextAdd, lineLeft: lineL, lineRight: nextAdd ? lineR : 0 })
        lineL++
        if (nextAdd) {
          lineR++
          i += 2
        } else {
          i++
        }
      } else {
        // add without preceding remove
        result.push({ left: null, right: line, lineLeft: 0, lineRight: lineR })
        lineR++
        i++
      }
    }
    return result
  }, [diffResult])

  // Split view: separate left/right lines
  const splitLeft = useMemo(() => {
    if (!diffResult) return []
    const lines: { line: DiffLine; num: number }[] = []
    let n = 1
    for (const l of diffResult) {
      if (l.type === 'add') continue
      lines.push({ line: l, num: n++ })
    }
    return lines
  }, [diffResult])

  const splitRight = useMemo(() => {
    if (!diffResult) return []
    const lines: { line: DiffLine; num: number }[] = []
    let n = 1
    for (const l of diffResult) {
      if (l.type === 'remove') continue
      lines.push({ line: l, num: n++ })
    }
    return lines
  }, [diffResult])

  const isIdentical = !!diffResult && stats?.added === 0 && stats?.removed === 0

  return (
    <div className={styles.container}>
      {/* Input panels */}
      <div className={styles.panels}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Original</span>
            <div className={styles.panelActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setLeftText('')}
                disabled={!leftText}
                title="Clear"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            ref={leftRef}
            className={styles.textarea}
            value={leftText}
            onChange={e => setLeftText(e.target.value)}
            onPaste={handlePaste(setLeftText)}
            placeholder="Paste original text here..."
            spellCheck={false}
          />
        </div>

        <div className={styles.centerActions}>
          <button className={styles.swapBtn} onClick={swap} title="Swap" aria-label="Swap texts">
            ⇄
          </button>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>Modified</span>
            <div className={styles.panelActions}>
              <button
                className={styles.actionBtn}
                onClick={() => setRightText('')}
                disabled={!rightText}
                title="Clear"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            ref={rightRef}
            className={styles.textarea}
            value={rightText}
            onChange={e => setRightText(e.target.value)}
            onPaste={handlePaste(setRightText)}
            placeholder="Paste modified text here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Diff output */}
      <div className={styles.diffSection}>
        {!diffResult ? (
          <div className={styles.placeholder}>
            Paste text in both panels to see the diff
          </div>
        ) : isIdentical ? (
          <div className={styles.identical}>
            ✓ Texts are identical
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div className={styles.statsBar}>
              <div className={styles.stats}>
                <span className={styles.statAdded}>+{stats?.added} added</span>
                <span className={styles.statRemoved}>−{stats?.removed} removed</span>
                <span className={styles.statUnchanged}>{stats?.unchanged} unchanged</span>
              </div>
              <div className={styles.diffModeToggle}>
                <button
                  className={`${styles.modeBtn} ${diffMode === 'unified' ? styles.modeBtnActive : ''}`}
                  onClick={() => setDiffMode('unified')}
                >
                  Unified
                </button>
                <button
                  className={`${styles.modeBtn} ${diffMode === 'split' ? styles.modeBtnActive : ''}`}
                  onClick={() => setDiffMode('split')}
                >
                  Split
                </button>
              </div>
            </div>

            {/* Diff content */}
            <div className={styles.diffContent} ref={diffRef}>
              {diffMode === 'unified' ? (
                <table className={styles.diffTable}>
                  <tbody>
                    {unifiedLines.map((row, i) => (
                      <tr key={i} className={styles.diffRow}>
                        <td className={`${styles.lineNum} ${row.left?.type === 'remove' ? styles.lineNumRemove : ''}`}>
                          {row.lineLeft || ''}
                        </td>
                        <td className={`${styles.lineNum} ${row.right?.type === 'add' ? styles.lineNumAdd : ''}`}>
                          {row.lineRight || ''}
                        </td>
                        <td className={`${styles.lineContent} ${row.left?.type === 'remove' ? styles.lineRemove : row.right?.type === 'add' ? styles.lineAdd : ''}`}>
                          <span className={styles.linePrefix}>
                            {row.left?.type === 'remove' ? '−' : row.right?.type === 'add' ? '+' : ' '}
                          </span>
                          {row.left?.type === 'remove' ? row.left.text : row.right?.text ?? ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.splitContainer}>
                  <div className={styles.splitPane}>
                    <div className={styles.splitHeader}>Original</div>
                    <table className={styles.diffTable}>
                      <tbody>
                        {splitLeft.map((row, i) => (
                          <tr key={i} className={styles.diffRow}>
                            <td className={`${styles.lineNum} ${row.line.type === 'remove' ? styles.lineNumRemove : ''}`}>
                              {row.num}
                            </td>
                            <td className={`${styles.lineContent} ${row.line.type === 'remove' ? styles.lineRemove : ''}`}>
                              <span className={styles.linePrefix}>{row.line.type === 'remove' ? '−' : ' '}</span>
                              {row.line.text}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.splitPane}>
                    <div className={styles.splitHeader}>Modified</div>
                    <table className={styles.diffTable}>
                      <tbody>
                        {splitRight.map((row, i) => (
                          <tr key={i} className={styles.diffRow}>
                            <td className={`${styles.lineNum} ${row.line.type === 'add' ? styles.lineNumAdd : ''}`}>
                              {row.num}
                            </td>
                            <td className={`${styles.lineContent} ${row.line.type === 'add' ? styles.lineAdd : ''}`}>
                              <span className={styles.linePrefix}>{row.line.type === 'add' ? '+' : ' '}</span>
                              {row.line.text}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
