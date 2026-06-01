import { DQWindow } from '../ui/DQWindow'

interface MessageWindowProps {
  message: string
}

export function MessageWindow({ message }: MessageWindowProps) {
  return (
    <DQWindow style={{ minHeight: '60px' }}>
      <p style={{ fontSize: '0.9em', lineHeight: 1.8, color: 'var(--color-text)' }}>
        {message}
      </p>
    </DQWindow>
  )
}
