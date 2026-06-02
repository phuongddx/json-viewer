import { useState, useCallback, ReactNode } from 'react'
import styles from './layout.module.css'

export interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode | null
  main: ReactNode
  footer?: ReactNode
}

export function Layout({ header, sidebar, main, footer }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev)
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {header}
      </header>
      <div className={styles.content}>
        {sidebar && (
          <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
            <button
              className={styles.collapseBtn}
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <CollapseIcon isCollapsed={isSidebarCollapsed} />
            </button>
            <div className={styles.sidebarContent}>
              {sidebar}
            </div>
          </aside>
        )}
        <main className={`${styles.main} ${!sidebar ? styles.mainFull : ''} ${isSidebarCollapsed ? styles.mainExpanded : ''}`}>
          {main}
        </main>
      </div>
      {footer && (
        <footer className={styles.footer}>
          {footer}
        </footer>
      )}
    </div>
  )
}

const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
