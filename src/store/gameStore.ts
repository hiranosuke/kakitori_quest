import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Screen,
  WritingAreaPosition,
  CharSize,
  StrokeEndingResult,
  BattlePhase,
  SaveData,
} from '../types/game'
import { WORD_LIST, type WordEntry } from '../data/wordList'

const MAX_HEARTS = 3

interface GameStore extends SaveData {
  // 画面状態
  screen: Screen

  // 現在のステージ
  currentEntry: WordEntry | null
  currentCharIndex: number
  hearts: number
  endingResults: StrokeEndingResult[]
  battlePhase: BattlePhase
  battleMessage: string
  battleResult: 'win' | 'lose' | null

  // アクション: 画面遷移
  goToTitle: () => void
  goToStageSelect: () => void
  goToSettings: () => void
  startStage: (entry: WordEntry) => void

  // アクション: ゲームループ
  onStrokeMistake: () => void
  onCharComplete: (results: StrokeEndingResult[]) => void
  onBattleWin: () => void
  onBattleLose: () => void
  setBattleMessage: (msg: string) => void
  setBattleFeedback: (result: 'win' | 'lose', message: string) => void
  confirmBattle: () => void

  // アクション: 設定
  setWritingAreaPosition: (pos: WritingAreaPosition) => void
  setCharSize: (size: CharSize) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 永続化対象の初期値
      clearedWords: {},
      writingAreaPosition: 'auto',
      charSize: 'medium',

      // セッション状態の初期値
      screen: 'title',
      currentEntry: null,
      currentCharIndex: 0,
      hearts: MAX_HEARTS,
      endingResults: [],
      battlePhase: 'writing',
      battleMessage: '',
      battleResult: null,

      goToTitle: () => set({ screen: 'title' }),

      goToStageSelect: () => set({ screen: 'stageSelect' }),

      goToSettings: () => set({ screen: 'settings' }),

      startStage: (entry) =>
        set({
          screen: 'game',
          currentEntry: entry,
          currentCharIndex: 0,
          hearts: MAX_HEARTS,
          endingResults: [],
          battlePhase: 'writing',
          battleMessage: `${entry.word[0]}があらわれた！`,
        }),

      onStrokeMistake: () => {
        const hearts = get().hearts - 1
        if (hearts <= 0) {
          set({ screen: 'gameOver', battlePhase: 'lost' })
        } else {
          set({ hearts, battleMessage: 'まちがえた！' })
        }
      },

      onCharComplete: (results) => {
        set((state) => ({
          endingResults: [...state.endingResults, ...results],
          battlePhase: 'battling',
          battleMessage: 'バトル！',
        }))
      },

      onBattleWin: () => {
        const { currentEntry, currentCharIndex } = get()
        if (!currentEntry) return
        const nextIndex = currentCharIndex + 1

        if (nextIndex >= currentEntry.word.length) {
          // 全文字クリア → ステージクリア
          set({ screen: 'stageComplete', battlePhase: 'won' })
        } else {
          // 次の文字へ
          set({
            currentCharIndex: nextIndex,
            battlePhase: 'writing',
            battleMessage: `${currentEntry.word[nextIndex]}があらわれた！`,
          })
        }
      },

      onBattleLose: () => {
        const hearts = get().hearts - 1
        if (hearts <= 0) {
          set({ screen: 'gameOver', battlePhase: 'lost' })
        } else {
          set({
            hearts,
            battlePhase: 'writing',
            battleMessage: 'まけた…もういちど！',
          })
        }
      },

      setBattleMessage: (msg) => set({ battleMessage: msg }),

      setBattleFeedback: (result, message) =>
        set({ battlePhase: 'feedback', battleResult: result, battleMessage: message }),

      confirmBattle: () => {
        const { battleResult } = get()
        if (battleResult === 'win') get().onBattleWin()
        else if (battleResult === 'lose') get().onBattleLose()
      },

      setWritingAreaPosition: (pos) => set({ writingAreaPosition: pos }),

      setCharSize: (size) => set({ charSize: size }),
    }),
    {
      name: 'kakitori-quest-save-v1',
      partialize: (state) => ({
        clearedWords: state.clearedWords,
        writingAreaPosition: state.writingAreaPosition,
        charSize: state.charSize,
      }),
    },
  ),
)

// 単語リストのゲッター（store 外で使う）
export { WORD_LIST }
