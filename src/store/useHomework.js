import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HOMEWORK as INITIAL } from '../data/mock';

export const useHomework = create(
  persist(
    (set, get) => ({
      items: INITIAL,

      // Добавить новое задание
      add: (hw) =>
        set((s) => ({ items: [hw, ...s.items] })),

      // Обновить задание (оценка, ответ, статус)
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      // Удалить задание
      remove: (id) =>
        set((s) => ({ items: s.items.filter((h) => h.id !== id) })),

      // Сбросить к исходным (если что-то сломалось)
      reset: () => set({ items: INITIAL }),

      // Получить по id
      byId: (id) => get().items.find((h) => h.id === id),
    }),
    {
      name: 'kurs-homework',
      version: 1,
    }
  )
);