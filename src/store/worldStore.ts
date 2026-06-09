import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorldState {
  clearedWorlds: string[]
  currentWorldId: string
  setClearedWorld: (id: string) => void
  setCurrentWorld: (id: string) => void
}

export const useWorldStore = create<WorldState>()(
  persist(
    (set, get) => ({
      clearedWorlds: [],
      currentWorldId: 'grade1',

      setClearedWorld: (id) => {
        if (get().clearedWorlds.includes(id)) return
        set((s) => ({ clearedWorlds: [...s.clearedWorlds, id] }))
      },

      setCurrentWorld: (id) => set({ currentWorldId: id }),
    }),
    { name: 'kakitori-quest-worlds-v1' },
  ),
)
