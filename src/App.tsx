import { useGameStore } from './store/gameStore'
import { TitleScreen } from './screens/TitleScreen'
import { WorldSelectScreen } from './screens/WorldSelectScreen'
import { StageSelectScreen } from './screens/StageSelectScreen'
import { GameScreen } from './components/game/GameScreen'
import { StageCompleteScreen } from './screens/StageCompleteScreen'
import { GameOverScreen } from './screens/GameOverScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ShopScreen } from './screens/ShopScreen'
import { WardrobeScreen } from './screens/WardrobeScreen'
import { WorldClearScreen } from './screens/WorldClearScreen'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  switch (screen) {
    case 'title':         return <TitleScreen />
    case 'world-select':  return <WorldSelectScreen />
    case 'stageSelect':   return <StageSelectScreen />
    case 'game':          return <GameScreen />
    case 'stageComplete': return <StageCompleteScreen />
    case 'gameOver':      return <GameOverScreen />
    case 'settings':      return <SettingsScreen />
    case 'shop':          return <ShopScreen />
    case 'wardrobe':      return <WardrobeScreen />
    case 'world-clear':   return <WorldClearScreen />
    default:              return <TitleScreen />
  }
}
