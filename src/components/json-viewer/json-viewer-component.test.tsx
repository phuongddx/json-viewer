/**
 * Unit tests for JsonViewerComponent
 * Covers expand/collapse all, theme propagation, view modes, and minify toggle
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

  it('defaults to tree view mode', () => {
    render(<JsonViewerComponent data={sampleData} />)
    expect(screen.getByTestId('json-viewer')).toBeInTheDocument()
    expect(screen.queryByText('"name"')).not.toBeInTheDocument()
  })

  it('switches to raw view mode when Raw button clicked', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    await userEvent.click(screen.getByRole('button', { name: /raw view/i }))
    // Tree viewer should not be rendered in raw mode
    expect(screen.queryByTestId('json-viewer')).not.toBeInTheDocument()
    // Raw content should contain the JSON data
    expect(screen.getByText(/"name"/)).toBeInTheDocument()
  })

  it('switches to split view mode showing both tree and raw', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    await userEvent.click(screen.getByRole('button', { name: /split view/i }))
    // Tree viewer should be present
    expect(screen.getByTestId('json-viewer')).toBeInTheDocument()
    // Should show Tree and Raw split labels
    expect(screen.getAllByText('Tree').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Raw').length).toBeGreaterThanOrEqual(1)
  })

  it('minify button toggles between minified and pretty JSON', async () => {
    render(<JsonViewerComponent data={sampleData} />)
    // Switch to raw view first
    await userEvent.click(screen.getByRole('button', { name: /raw view/i }))

    // Minify button should exist
    const minifyButton = screen.getByRole('button', { name: /show minified json/i })
    expect(minifyButton).toBeInTheDocument()

    // Click minify
    await userEvent.click(minifyButton)

    // Button should now say "Pretty" (aria-label changes to "Show pretty-printed JSON")
    expect(screen.getByRole('button', { name: /show pretty-printed json/i })).toBeInTheDocument()
  })
})
