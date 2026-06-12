import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OfflineBadge } from '../../components/ui/OfflineBadge'
import * as onlineStatusModule from '../../hooks/useOnlineStatus'

vi.mock('../../hooks/useOnlineStatus')
const mockUseOnlineStatus = vi.mocked(onlineStatusModule.useOnlineStatus)

describe('OfflineBadge', () => {
  it('オンライン時は何も表示しない', () => {
    mockUseOnlineStatus.mockReturnValue(true)
    const { container } = render(<OfflineBadge />)
    expect(container.firstChild).toBeNull()
  })

  it('オフライン時はバッジボタンを表示する', () => {
    mockUseOnlineStatus.mockReturnValue(false)
    render(<OfflineBadge />)
    expect(screen.getByRole('button', { name: /オフライン/ })).toBeInTheDocument()
  })

  it('バッジをタップするとポップアップが開く', () => {
    mockUseOnlineStatus.mockReturnValue(false)
    render(<OfflineBadge />)
    fireEvent.click(screen.getByRole('button', { name: /オフライン/ }))
    expect(screen.getByText('いちどあそんだことばは')).toBeInTheDocument()
  })

  it('とじるボタンでポップアップが閉じる', () => {
    mockUseOnlineStatus.mockReturnValue(false)
    render(<OfflineBadge />)
    fireEvent.click(screen.getByRole('button', { name: /オフライン/ }))
    fireEvent.click(screen.getByRole('button', { name: /とじる/ }))
    expect(screen.queryByText('いちどあそんだことばは')).not.toBeInTheDocument()
  })

  it('オーバーレイをタップするとポップアップが閉じる', () => {
    mockUseOnlineStatus.mockReturnValue(false)
    render(<OfflineBadge />)
    fireEvent.click(screen.getByRole('button', { name: /オフライン/ }))
    fireEvent.click(screen.getByTestId('offline-overlay'))
    expect(screen.queryByText('いちどあそんだことばは')).not.toBeInTheDocument()
  })
})
