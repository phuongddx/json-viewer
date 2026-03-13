import { ReactNode } from 'react'
import styles from './layout.module.css'

export interface LayoutProps {
  header: ReactNode
  sidebar: ReactNode
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
        <aside className={styles.sidebar}>
          {sidebar}
        </aside>
        <main className={styles.main}>
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
