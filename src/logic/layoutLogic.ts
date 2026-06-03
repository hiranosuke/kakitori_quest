import type { WritingAreaPosition } from '../types/game'

export function getEffectiveLayout(
  position: WritingAreaPosition,
  isLandscape: boolean,
): 'left' | 'right' | 'bottom' {
  if (position !== 'auto') return position
  return isLandscape ? 'right' : 'bottom'
}
