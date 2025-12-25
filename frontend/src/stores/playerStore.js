// src/stores/playerStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // تم‌های پخش کننده
      playerTheme: 'dark',
      playerThemes: {
        dark: {
          bg: 'from-slate-800/90 to-slate-900/90',
          border: 'border-slate-700/50',
          progress: 'from-blue-500 to-gray-400',
          button: 'from-blue-500 to-gray-400',
          text: 'text-white'
        },
        glass: {
          bg: 'from-white/20 to-white/10',
          border: 'border-white/30',
          progress: 'from-white to-gray-300',
          button: 'from-white to-gray-300',
          text: 'text-white'
        },
        gold: {
          bg: 'from-amber-800/90 to-yellow-900/90',
          border: 'border-amber-700/50',
          progress: 'from-yellow-500 to-amber-400',
          button: 'from-yellow-500 to-amber-400',
          text: 'text-white'
        },
        red: {
          bg: 'from-rose-800/90 to-red-900/90',
          border: 'border-rose-700/50',
          progress: 'from-rose-500 to-pink-400',
          button: 'from-rose-500 to-pink-400',
          text: 'text-white'
        }
      },
      
      // تنظیمات پخش
      isLooping: false,
      isShuffling: false,
      volume: 80,

      // اکشن‌ها
      setPlayerTheme: (theme) => set({ playerTheme: theme }),
      toggleLoop: () => set(state => ({ isLooping: !state.isLooping })),
      toggleShuffle: () => set(state => ({ isShuffling: !state.isShuffling })),
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: 'player-settings',
    }
  )
);