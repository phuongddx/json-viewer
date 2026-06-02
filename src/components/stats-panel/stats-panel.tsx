import { useState, useCallback, useMemo } from 'react'
import { analyzeJson } from '../../utils/json-stats'
import type { JsonStats } from '../../utils/json-stats'
import styles from './stats-panel.module.css'

interface StatsPanelProps {
  data: unknown
}

const ChevronIcon = () => (
  <svg
    className={styles.chevron}
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
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const breakdownItems: { key: keyof JsonStats['typeBreakdown']; label: string; dotClass: string }[] = [
  { key: 'strings', label: 'Strings', dotClass: styles.dotString },
  { key: 'numbers', label: 'Numbers', dotClass: styles.dotNumber },
  { key: 'booleans', label: 'Booleans', dotClass: styles.dotBoolean },
  { key: 'nulls', label: 'Nulls', dotClass: styles.dotNull },
  { key: 'objects', label: 'Objects', dotClass: styles.dotObject },
  { key: 'arrays', label: 'Arrays', dotClass: styles.dotArray },
]

export function StatsPanel({ data }: StatsPanelProps) {
  const [isOpen, setIsOpen] = useState(true)

  const stats = useMemo(() => analyzeJson(data), [data])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <div className={styles.panel}>
      <button className={styles.header} onClick={toggle} aria-expanded={isOpen}>
        <span className={styles.headerLeft}>
          <ChartIcon />
          Stats
        </span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <ChevronIcon />
        </span>
      </button>
      {isOpen && (
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Keys</div>
              <div className={styles.statValue}>{stats.totalKeys.toLocaleString()}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Max Depth</div>
              <div className={styles.statValue}>{stats.maxDepth}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Data Size</div>
              <div className={styles.statValue}>{stats.sizeFormatted}</div>
            </div>
            {stats.arrayLength !== null ? (
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Array Length</div>
                <div className={styles.statValue}>{stats.arrayLength.toLocaleString()}</div>
              </div>
            ) : (
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Root Type</div>
                <div className={styles.statValue}>{stats.rootType}</div>
              </div>
            )}
          </div>

          <div className={styles.breakdown}>
            <div className={styles.breakdownTitle}>Type Breakdown</div>
            <div className={styles.breakdownList}>
              {breakdownItems.map(({ key, label, dotClass }) => (
                <div key={key} className={styles.breakdownItem}>
                  <span className={`${styles.breakdownDot} ${dotClass}`} />
                  <span className={styles.breakdownCount}>{stats.typeBreakdown[key]}</span>
                  <span className={styles.breakdownLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
