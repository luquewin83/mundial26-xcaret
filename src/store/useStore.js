import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      guest: null,
      selectedMatch: null,
      currentPhase: 'antes',

      setGuest: (guest) => set({ guest }),
      setSelectedMatch: (match) => set({ selectedMatch: match }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      clearMatch: () => set({ selectedMatch: null, currentPhase: 'antes' }),
      logout: () => set({ guest: null, selectedMatch: null, currentPhase: 'antes' }),
    }),
    {
      name: 'xcaret-mundial-2026',
      partialize: (state) => ({ guest: state.guest }),
    },
  ),
)

export default useStore
