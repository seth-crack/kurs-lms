import { create } from 'zustand';

export const useUI = create((set) => ({
  confirm: null,
  cmdOpen: false,
  toasts: [],

  askConfirm: (opts) => set({ confirm: opts }),
  closeConfirm: () => set({ confirm: null }),

  openCmd: () => set({ cmdOpen: true }),
  closeCmd: () => set({ cmdOpen: false }),

  toast: (type, title, desc) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, type, title, desc }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      3800
    );
  },
}));