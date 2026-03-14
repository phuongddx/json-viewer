/**
 * Unit tests for Toolbar component
 * Covers copy, expand/collapse callbacks, and theme toggle
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Toolbar } from './toolbar'

const mockClipboard = { writeText: vi.fn() }
Object.assign(navigator, { clipboard: mockClipboard })

const defaultProps = {
  onExpandAll: vi.fn(),
  onCollapseAll: vi.fn(),
  jsonData: '{"a":1}',
  theme: 'dark' as const,
  onThemeChange: vi.fn(),
}

describe('Toolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls onExpandAll when Expand All clicked', async () => {
    render(<Toolbar {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /expand all/i }))
    expect(defaultProps.onExpandAll).toHaveBeenCalledOnce()
  })

  it('calls onCollapseAll when Collapse All clicked', async () => {
    render(<Toolbar {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /collapse all/i }))
    expect(defaultProps.onCollapseAll).toHaveBeenCalledOnce()
  })

  it('copies jsonData to clipboard and shows Copied! feedback', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    render(<Toolbar {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(mockClipboard.writeText).toHaveBeenCalledWith('{"a":1}')
    expect(await screen.findByText('Copied!')).toBeInTheDocument()
  })

  it('shows Copy Failed on clipboard error', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('denied'))
    render(<Toolbar {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(await screen.findByText('Copy Failed')).toBeInTheDocument()
  })

  it('calls onThemeChange with light when in dark mode', async () => {
    render(<Toolbar {...defaultProps} theme="dark" />)
    // aria-label is "Switch to light theme" when currently in dark mode
    await userEvent.click(screen.getByRole('button', { name: /switch to light theme/i }))
    expect(defaultProps.onThemeChange).toHaveBeenCalledWith('light')
  })

  it('calls onThemeChange with dark when in light mode', async () => {
    render(<Toolbar {...defaultProps} theme="light" />)
    // aria-label is "Switch to dark theme" when currently in light mode
    await userEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }))
    expect(defaultProps.onThemeChange).toHaveBeenCalledWith('dark')
  })

  it('resets copy button text to Copy after 2 seconds', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    render(<Toolbar {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /copy/i }))
    expect(await screen.findByText('Copied!')).toBeInTheDocument()

    // Wait for the 2s reset using real timers
    await new Promise((r) => setTimeout(r, 2100))
    expect(screen.getByRole('button', { name: /copy json/i })).toHaveTextContent('Copy')
  }, 10000)
})
