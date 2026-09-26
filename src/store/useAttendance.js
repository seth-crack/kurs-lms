import { create } from 'zustand';
import {
  getAttendance,
  markAttendance,
  deleteAttendance,
} from '../lib/attendance';

export const useAttendance = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    const items = await getAttendance();
    set({ items, loading: false });
  },

  mark: async (payload) => {
    const res = await markAttendance(payload);
    if (!res.ok) {
      set({ error: res.error });
      return res;
    }

    // Обновляем локально: убираем старую запись с тем же student+date+subject
    set((s) => {
      const filtered = s.items.filter(
        (a) =>
          !(
            a.student_id === res.record.student_id &&
            a.lesson_date === res.record.lesson_date &&
            a.subject === res.record.subject
          )
      );
      return { items: [res.record, ...filtered] };
    });

    return res;
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((a) => a.id !== id) }));
    return await deleteAttendance(id);
  },

  // Получить отметку для конкретного ученика, даты и предмета
  get: (studentId, lessonDate, subject) =>
    get().items.find(
      (a) =>
        a.student_id === studentId &&
        a.lesson_date === lessonDate &&
        a.subject === subject
    ),
}));