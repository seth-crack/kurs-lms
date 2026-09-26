import { create } from 'zustand';
import {
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,
} from '../lib/homework';

export const useHomework = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // ----- Загрузка всех заданий, доступных пользователю -----
  refresh: async () => {
    set({ loading: true, error: null });
    const items = await getHomework();
    set({ items, loading: false });
  },

  // ----- Создать задание -----
  add: async (hw) => {
    const res = await createHomework(hw);
    if (!res.ok) {
      set({ error: res.error });
      return { ok: false, error: res.error };
    }
    set((s) => ({ items: [res.homework, ...s.items] }));
    return { ok: true, homework: res.homework };
  },

  // ----- Обновить (ответ ученика, оценка, статус) -----
  update: async (id, patch) => {
    // оптимистично обновляем локально
    set((s) => ({
      items: s.items.map((h) =>
        h.id === id ? { ...h, ...patch } : h
      ),
    }));

    const res = await updateHomework(id, patch);
    if (!res.ok) {
      set({ error: res.error });
      // откатить при ошибке? — упрощаем, оставляем как есть
      return { ok: false, error: res.error };
    }
    return { ok: true, homework: res.homework };
  },

  // ----- Удалить -----
  remove: async (id) => {
    set((s) => ({ items: s.items.filter((h) => h.id !== id) }));
    const res = await deleteHomework(id);
    if (!res.ok) set({ error: res.error });
    return res;
  },

  // ----- Получить по id -----
  byId: (id) => get().items.find((h) => h.id === id),
}));