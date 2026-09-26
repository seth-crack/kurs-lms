import { create } from 'zustand';
import {
  getSchedule,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../lib/schedule';

export const useSchedule = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    const items = await getSchedule();
    set({ items, loading: false });
  },

  add: async (lesson) => {
    const res = await createLesson(lesson);
    if (!res.ok) {
      set({ error: res.error });
      return { ok: false, error: res.error };
    }
    set((s) => ({ items: [...s.items, res.lesson] }));
    return { ok: true, lesson: res.lesson };
  },

  update: async (id, patch) => {
    set((s) => ({
      items: s.items.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
    const res = await updateLesson(id, patch);
    if (!res.ok) set({ error: res.error });
    return res;
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((l) => l.id !== id) }));
    const res = await deleteLesson(id);
    if (!res.ok) set({ error: res.error });
    return res;
  },

  byId: (id) => get().items.find((l) => l.id === id),
}));