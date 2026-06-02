/**
 * Table view component for JSON data
 * Renders JSON (especially arrays of objects) as a sortable HTML table.
 */

import { useState, useCallback, useMemo } from 'react'
import type { TableData } from '../../utils/json-to-table'
import styles from './table-view.module.css'

interface TableViewProps {
  tableData: TableData
}

type SortDirection = 'asc' | 'desc' | null

export function TableView({ tableData }: TableViewProps) {
  const { headers, rows, originalRows } = tableData
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set())

  const handleSort = useCallback(
    (colIndex: number) => {
      if (sortColumn === colIndex) {
        // Cycle: asc → desc → none
        if (sortDirection === 'asc') {
          setSortDirection('desc')
        } else if (sortDirection === 'desc') {
          setSortColumn(null)
          setSortDirection(null)
        }
      } else {
        setSortColumn(colIndex)
        setSortDirection('asc')
      }
    },
    [sortColumn, sortDirection],
  )

  const toggleCellExpand = useCallback((cellKey: string) => {
    setExpandedCells((prev) => {
      const next = new Set(prev)
      if (next.has(cellKey)) {
        next.delete(cellKey)
      } else {
        next.add(cellKey)
      }
      return next
    })
  }, [])

  // Sort rows
  const sortedRows = useMemo(() => {
    if (sortColumn === null || sortDirection === null) {
      return rows.map((row, index) => ({ row, originalIndex: index }))
    }

    const indexed = rows.map((row, index) => ({ row, originalIndex: index }))

    indexed.sort((a, b) => {
      const aVal = a.row[sortColumn]
      const bVal = b.row[sortColumn]

      // null/undefined sort last
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Boolean comparison
      if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        const cmp = (aVal ? 1 : 0) - (bVal ? 1 : 0)
        return sortDirection === 'asc' ? cmp : -cmp
      }

      // String comparison
      const aStr = String(aVal)
      const bStr = String(bVal)
      const cmp = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return indexed
  }, [rows, sortColumn, sortDirection])

  // Format cell value for display
  const formatCellValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (value === undefined) return ''
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  // Get cell type for styling
  const getCellType = (value: unknown): string => {
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    return 'object'
  }

  const getSortIndicator = (colIndex: number) => {
    if (sortColumn !== colIndex) return ' ↕'
    if (sortDirection === 'asc') return ' ↑'
    if (sortDirection === 'desc') return ' ↓'
    return ' ↕'
  }

  if (headers.length === 0 && rows.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Empty array — nothing to display in table view.</p>
      </div>
    )
  }

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.info}>
        <span className={styles.rowCount}>{originalRows.length} {originalRows.length === 1 ? 'row' : 'rows'}</span>
        <span className={styles.colCount}>{headers.length} {headers.length === 1 ? 'column' : 'columns'}</span>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.rowNumberHeader}>#</th>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={styles.th}
                  onClick={() => handleSort(i)}
                  aria-sort={
                    sortColumn === i
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <span className={styles.headerText}>{header}</span>
                  <span className={styles.sortIndicator}>
                    {getSortIndicator(i)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(({ row, originalIndex }) => (
              <tr key={originalIndex} className={styles.tr}>
                <td className={styles.rowNumber}>{originalIndex + 1}</td>
                {row.map((cell, colIndex) => {
                  const cellKey = `${originalIndex}-${colIndex}`
                  const displayValue = formatCellValue(cell)
                  const cellType = getCellType(cell)
                  const isExpanded = expandedCells.has(cellKey)
                  const isLong = displayValue.length > 80

                  return (
                    <td
                      key={colIndex}
                      className={`${styles.td} ${styles[`cell-${cellType}`]}`}
                      title={displayValue}
                    >
                      {isLong && !isExpanded ? (
                        <span
                          className={styles.cellTruncated}
                          onClick={() => toggleCellExpand(cellKey)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleCellExpand(cellKey)
                            }
                          }}
                        >
                          {displayValue.slice(0, 80)}…
                          <span className={styles.expandHint}> (click to expand)</span>
                        </span>
                      ) : isLong && isExpanded ? (
                        <span
                          className={styles.cellExpanded}
                          onClick={() => toggleCellExpand(cellKey)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleCellExpand(cellKey)
                            }
                          }}
                        >
                          {displayValue}
                          <span className={styles.expandHint}> (click to collapse)</span>
                        </span>
                      ) : (
                        displayValue
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
