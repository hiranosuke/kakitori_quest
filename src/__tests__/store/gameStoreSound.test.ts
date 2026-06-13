// src/__tests__/store/gameStoreSound.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../../lib/soundManager', () => ({
  play: vi.fn(),
  setMuted: vi.fn(),
}))

import { play } from '../../lib/soundManager'
import { useGameStore } from '../../store/gameStore'
import { useWardrobeStore } from '../../store/wardrobeStore'
import { WORLDS } from '../../config/worlds'

const playMock = vi.mocked(play)

function resetStore() {
  useGameStore.setState({
    screen: 'title',
    currentWorldId: 'grade1',
    currentEntry: null,
    currentCharIndex: 0,
    hearts: 3,
    endingResults: [],
    battlePhase: 'writing',
    battleMessage: '',
    battleResult: null,
    isBossStage: false,
  })
}

describe('gameStore 効果音', () => {
  beforeEach(() => {
    playMock.mockClear()
    resetStore()
  })

  it('startStage で battle_start が鳴る', () => {
    useGameStore.getState().startStage({ id: 'w', word: 'やま', reading: 'やま', hint: '⛰' })
    expect(playMock).toHaveBeenCalledWith('battle_start')
  })

  it('startBossStage で boss_start が鳴る', () => {
    const boss = WORLDS.find((w) => w.bossWord)!
    useGameStore.getState().startBossStage(boss.id)
    expect(playMock).toHaveBeenCalledWith('boss_start')
  })

  it('onStrokeMistake で mistake が鳴る', () => {
    useGameStore.setState({ hearts: 3 })
    useGameStore.getState().onStrokeMistake()
    expect(playMock).toHaveBeenCalledWith('mistake')
  })

  it('onBattleLose で battle_lose が鳴る', () => {
    useGameStore.setState({ hearts: 3, currentEntry: { id: 'w', word: 'やま', reading: 'やま', hint: '⛰' } })
    useGameStore.getState().onBattleLose()
    expect(playMock).toHaveBeenCalledWith('battle_lose')
  })

  it('画のミスで力尽きると game_over が鳴り、mistake は鳴らない', () => {
    useGameStore.setState({ hearts: 1 })
    useGameStore.getState().onStrokeMistake()
    expect(playMock).toHaveBeenCalledWith('game_over')
    expect(playMock).not.toHaveBeenCalledWith('mistake')
  })

  it('バトル敗北で力尽きると game_over が鳴り、battle_lose は鳴らない', () => {
    useGameStore.setState({ hearts: 1, currentEntry: { id: 'w', word: 'やま', reading: 'やま', hint: '⛰' } })
    useGameStore.getState().onBattleLose()
    expect(playMock).toHaveBeenCalledWith('game_over')
    expect(playMock).not.toHaveBeenCalledWith('battle_lose')
  })

  it('非最終文字の勝利で char_complete が鳴る', () => {
    useGameStore.setState({
      currentEntry: { id: 'w', word: 'やま', reading: 'やま', hint: '⛰' },
      currentCharIndex: 0,
      isBossStage: false,
    })
    useGameStore.getState().onBattleWin()
    expect(playMock).toHaveBeenCalledWith('char_complete')
  })

  it('通常ステージ最終文字の勝利で stage_clear が鳴る', () => {
    useGameStore.setState({
      currentEntry: { id: 'w', word: 'や', reading: 'や', hint: '⛰' },
      currentCharIndex: 0,
      endingResults: [],
      isBossStage: false,
    })
    useGameStore.getState().onBattleWin()
    expect(playMock).toHaveBeenCalledWith('stage_clear')
  })

  it('ボス最終文字の勝利で boss_clear が鳴る', () => {
    useGameStore.setState({
      currentEntry: { id: 'b', word: 'り', reading: 'り', hint: '⚡' },
      currentCharIndex: 0,
      isBossStage: true,
      currentWorldId: 'grade1',
    })
    useGameStore.getState().onBattleWin()
    expect(playMock).toHaveBeenCalledWith('boss_clear')
  })

  it('healHeart 成功時に item_use が鳴る', () => {
    // ポーション1個・ハート減少状態を用意
    useWardrobeStore.setState({ potionCount: 1 })
    useGameStore.setState({ hearts: 1 })
    useGameStore.getState().healHeart()
    expect(playMock).toHaveBeenCalledWith('item_use')
  })
})
