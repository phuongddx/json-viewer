import { ReactNode } from 'react'
import styles from './layout.module.css'

export interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode | null
  main: ReactNode
  footer?: ReactNode
}

export function Layout({ header, sidebar, main, footer }: LayoutProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {header}
      </header>
      <div className={styles.content}>
        {sidebar && (
          <aside className={styles.sidebar}>
            {sidebar}
          </aside>
        )}
        <main className={`${styles.main} ${!sidebar ? styles.mainFull : ''}`}>
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
