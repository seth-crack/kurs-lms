import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light',
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'kurs-auth' }
  )
);