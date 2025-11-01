import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'dark',
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === 'light' ? 'dark' : 'light',
        })),
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

