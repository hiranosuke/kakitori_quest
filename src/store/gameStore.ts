import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MSG } from '../config/messages'
import { calcStageGold } from '../logic/goldReward'
import { calculateStars } from '../logic/starLogic'
import { useGoldStore } from './goldStore'
import { useWardrobeStore } from './wardrobeStore'
import type {
  Screen,
  WritingAreaPosition,
  CharSize,
  StrokeEndingResult,
  BattlePhase,
  SaveData,
} from '../types/game'
import { WORD_LIST, type WordEntry } from '../data/wordList'
import { WORLDS } from '../config/worlds'

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
  lastStageGold: number
  isBossStage: boolean

  // クリーチャー
  stageCounter: number
  creatureSvg: string | null
  creatureName: string | null

  // アクション: クリーチャー
  setCreatureSvg: (svg: string) => void
  setCreatureName: (name: string) => void

  // アクション: 画面遷移
  goToTitle: () => void
  goToStageSelect: () => void
  goToSettings: () => void
  goToShop: () => void
  goToWardrobe: () => void
  goToWorldSelect: () => void
  goToWorldClear: () => void
  healHeart: () => void
  startStage: (entry: WordEntry) => void
  startBossStage: (worldId: string) => void

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
      stageCounter: 0,
      creatureSvg: null,
      creatureName: null,
      lastStageGold: 0,
      isBossStage: false,

      goToTitle: () => set({ screen: 'title' }),

      goToStageSelect: () => set({ screen: 'stageSelect' }),

      goToSettings: () => set({ screen: 'settings' }),

      goToShop: () => set({ screen: 'shop' }),

      goToWardrobe: () => set({ screen: 'wardrobe' }),

      goToWorldSelect: () => set({ screen: 'world-select' }),

      goToWorldClear: () => set({ screen: 'world-clear' }),

      startStage: (entry) =>
        set((state) => ({
          screen: 'game',
          currentEntry: entry,
          isBossStage: false,
          currentCharIndex: 0,
          hearts: MAX_HEARTS,
          endingResults: [],
          battlePhase: 'writing',
          battleMessage: MSG.loading,
          stageCounter: state.stageCounter + 1,
          creatureSvg: null,
          creatureName: null,
        })),

      startBossStage: (worldId) => {
        const world = WORLDS.find((w) => w.id === worldId)
        if (!world || !world.bossWord) return
        set((state) => ({
          screen: 'game',
          currentEntry: {
            id: `boss-${worldId}`,
            word: world.bossWord,
            reading: world.bossWord,
            hint: world.bossHint,
          },
          isBossStage: true,
          currentCharIndex: 0,
          hearts: MAX_HEARTS,
          endingResults: [],
          battlePhase: 'writing',
          battleMessage: MSG.loading,
          stageCounter: state.stageCounter + 1,
          creatureSvg: null,
          creatureName: null,
        }))
      },

      onStrokeMistake: () => {
        const hearts = get().hearts - 1
        if (hearts <= 0) {
          set({ screen: 'gameOver', battlePhase: 'lost' })
        } else {
          set({ hearts, battleMessage: MSG.strokeMistake })
        }
      },

      onCharComplete: (results) => {
        set((state) => ({
          endingResults: [...state.endingResults, ...results],
          battlePhase: 'battling',
          battleMessage: MSG.battle(state.creatureName ?? state.currentEntry?.word ?? ''),
        }))
      },

      onBattleWin: () => {
        const { currentEntry, currentCharIndex, isBossStage } = get()
        if (!currentEntry) return
        const nextIndex = currentCharIndex + 1

        if (nextIndex >= currentEntry.word.length) {
          if (isBossStage) {
            set({ screen: 'world-clear', battlePhase: 'won' })
          } else {
            const stars = calculateStars(get().endingResults)
            const goldEarned = calcStageGold({
              species: 0,
              strokeCount: 0,
              wordLength: currentEntry.word.length,
              bestStarRating: stars,
              playCount: 1,
            })
            useGoldStore.getState().addGold(goldEarned)
            set({ screen: 'stageComplete', battlePhase: 'won', lastStageGold: goldEarned })
          }
        } else {
          set({
            currentCharIndex: nextIndex,
            battlePhase: 'writing',
            battleMessage: MSG.nextChar(get().creatureName ?? currentEntry.word),
          })
        }
      },

      onBattleLose: () => {
        const hearts = get().hearts - 1
        const currentEntry = get().currentEntry
        if (hearts <= 0) {
          set({ screen: 'gameOver', battlePhase: 'lost' })
        } else {
          set({
            hearts,
            battlePhase: 'writing',
            battleMessage: MSG.defeat(currentEntry?.word ?? ''),
          })
        }
      },

      setBattleMessage: (msg) => set({ battleMessage: msg }),

      setCreatureSvg: (svg) => set({ creatureSvg: svg }),

      setCreatureName: (name) => set({ creatureName: name }),

      setBattleFeedback: (result, message) =>
        set({ battlePhase: 'feedback', battleResult: result, battleMessage: message }),

      confirmBattle: () => {
        const { battleResult } = get()
        if (battleResult === 'win') get().onBattleWin()
        else if (battleResult === 'lose') get().onBattleLose()
      },

      setWritingAreaPosition: (pos) => set({ writingAreaPosition: pos }),

      setCharSize: (size) => set({ charSize: size }),

      healHeart: () => {
        const { hearts } = get()
        if (hearts >= MAX_HEARTS) return
        if (!useWardrobeStore.getState().usePotion()) return
        set((s) => ({
          hearts: Math.min(s.hearts + 1, MAX_HEARTS),
          battleMessage: MSG.potion.used,
        }))
      },
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
