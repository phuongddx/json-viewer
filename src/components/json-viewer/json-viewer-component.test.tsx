/**
 * Unit tests for JsonViewerComponent
 * Covers expand/collapse all functionality and theme propagation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { JsonViewerComponent } from './json-viewer-component'

// Mock @textea/json-viewer to capture props without rendering the full tree
vi.mock('@textea/json-viewer', () => ({
  JsonViewer: vi.fn(({ defaultInspectDepth, theme }: { defaultInspectDepth: number; theme: string }) => (
    <div
      data-testid="json-viewer"
      data-depth={defaultInspectDepth}
      data-theme={theme}
    />
  )),
}))

// Mock clipboard API
Object.assign(navigator, {
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
})

const sampleData = { name: 'test', nested: { a: 1 }, arr: [1, 2, 3] }

describe('JsonViewerComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with default inspect depth of 2', () => {
    render(<JsonViewerComponent data={sampleData} />)
    expect(screen.getByTestId('json-viewer')).toHaveAttribute('data-depth', '2')
  })

  it('passes theme prop to JsonViewer', () => {
    render(<JsonViewerComponent data={sampleData} theme="light" />)
    expect(screen.getByTestId('json-viewer')).toHaveAttribute('data-theme', 'light')
  })

  it('Expand All sets depth to 100', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    await userEvent.click(screen.getByRole('button', { name: /expand all/i }))
    expect(screen.getByTestId('json-viewer')).toHaveAttribute('data-depth', '100')
  })

  it('Collapse All sets depth to 0', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    await userEvent.click(screen.getByRole('button', { name: /collapse all/i }))
    expect(screen.getByTestId('json-viewer')).toHaveAttribute('data-depth', '0')
  })

  it('Expand All then Collapse All resets depth to 0', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    await userEvent.click(screen.getByRole('button', { name: /expand all/i }))
    await userEvent.click(screen.getByRole('button', { name: /collapse all/i }))
    expect(screen.getByTestId('json-viewer')).toHaveAttribute('data-depth', '0')
  })

  it('each expand/collapse click remounts the viewer (key increments)', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    const initial = screen.getByTestId('json-viewer')

    await userEvent.click(screen.getByRole('button', { name: /expand all/i }))
    expect(screen.getByTestId('json-viewer')).not.toBe(initial)

    const afterExpand = screen.getByTestId('json-viewer')
    await userEvent.click(screen.getByRole('button', { name: /collapse all/i }))
    expect(screen.getByTestId('json-viewer')).not.toBe(afterExpand)
  })
})
