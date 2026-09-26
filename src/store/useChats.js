import { create } from 'zustand';
import {
  getMessages,
  sendMessage,
  markChatRead,
  subscribeToChat,
} from '../lib/messages';

export const useChats = create((set, get) => ({
  // { [chatId]: messages[] }
  threads: {},
  loading: false,
  // { [chatId]: unsubscribe }
  subscriptions: {},

  // Загрузить сообщения чата
  load: async (chatId) => {
    set({ loading: true });
    const messages = await getMessages(chatId);
    set((s) => ({
      threads: { ...s.threads, [chatId]: messages },
      loading: false,
    }));
    return messages;
  },

  // Подписаться на чат (Realtime)
  subscribe: (chatId) => {
    // если уже подписаны — пропустить
    if (get().subscriptions[chatId]) return;

    const unsub = subscribeToChat(chatId, (newMsg) => {
      set((s) => {
        const existing = s.threads[chatId] || [];
        // защита от дублей
        if (existing.some((m) => m.id === newMsg.id)) return s;
        return {
          threads: {
            ...s.threads,
            [chatId]: [...existing, newMsg],
          },
        };
      });
    });

    set((s) => ({
      subscriptions: { ...s.subscriptions, [chatId]: unsub },
    }));
  },

  unsubscribe: (chatId) => {
    const unsub = get().subscriptions[chatId];
    if (unsub) unsub();
    set((s) => {
      const next = { ...s.subscriptions };
      delete next[chatId];
      return { subscriptions: next };
    });
  },

  // Отправить сообщение
  send: async ({ chatId, senderId, text, files }) => {
    const res = await sendMessage({ chatId, senderId, text, files });
    if (!res.ok) return res;

    // оптимистично добавляем (если Realtime ещё не успел)
    set((s) => {
      const existing = s.threads[chatId] || [];
      if (existing.some((m) => m.id === res.message.id)) return s;
      return {
        threads: {
          ...s.threads,
          [chatId]: [...existing, res.message],
        },
      };
    });

    return res;
  },

  // Пометить прочитанным
  markRead: async (chatId, userId) => {
    await markChatRead(chatId, userId);
    set((s) => ({
      threads: {
        ...s.threads,
        [chatId]: (s.threads[chatId] || []).map((m) =>
          m.sender_id !== userId ? { ...m, read: true } : m
        ),
      },
    }));
  },

  // Сброс (при выходе)
  reset: () => {
    Object.values(get().subscriptions).forEach((unsub) => unsub());
    set({ threads: {}, subscriptions: {} });
  },
}));