import { create } from 'zustand';
import {
  getNotifications,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
  deleteNotification,
  clearRead,
  subscribeToNotifications,
} from '../lib/notifications';

export const useNotifs = create((set, get) => ({
  items: [],
  loading: false,
  unsub: null,

  refresh: async () => {
    set({ loading: true });
    const items = await getNotifications();
    set({ items, loading: false });
  },

  subscribe: (onNew) => {
    if (get().unsub) return;

    const unsub = subscribeToNotifications((notif) => {
      set((s) => {
        if (s.items.some((n) => n.id === notif.id)) return s;
        return { items: [notif, ...s.items] };
      });
      if (onNew) onNew(notif);
    });

    set({ unsub });
  },

  unsubscribe: () => {
    const u = get().unsub;
    if (u) u();
    set({ unsub: null });
  },

  markRead: async (id) => {
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    await apiMarkRead(id);
  },

  markAllRead: async () => {
    set((s) => ({
      items: s.items.map((n) => ({ ...n, read: true })),
    }));
    await apiMarkAllRead();
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((n) => n.id !== id) }));
    await deleteNotification(id);
  },

  clearRead: async () => {
    set((s) => ({ items: s.items.filter((n) => !n.read) }));
    await clearRead();
  },

  unreadCount: () => get().items.filter((n) => !n.read).length,

  reset: () => {
    get().unsubscribe();
    set({ items: [], unsub: null });
  },
}));