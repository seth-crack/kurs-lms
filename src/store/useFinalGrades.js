import { create } from 'zustand';
import {
  getFinalGrades,
  upsertFinalGrade,
  deleteFinalGrade,
} from '../lib/finalGrades';

export const useFinalGrades = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    const items = await getFinalGrades();
    set({ items, loading: false });
  },

  upsert: async (payload) => {
    const res = await upsertFinalGrade(payload);
    if (!res.ok) {
      set({ error: res.error });
      return res;
    }
    set((s) => {
      const filtered = s.items.filter(
        (g) =>
          !(
            g.student_id === res.grade.student_id &&
            g.subject === res.grade.subject &&
            g.period === res.grade.period
          )
      );
      return { items: [res.grade, ...filtered] };
    });
    return res;
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((g) => g.id !== id) }));
    return await deleteFinalGrade(id);
  },

  get: (studentId, subject, period) =>
    get().items.find(
      (g) =>
        g.student_id === studentId &&
        g.subject === subject &&
        g.period === period
    ),
}));