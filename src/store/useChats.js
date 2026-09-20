import { create } from 'zustand';

const INITIAL = {
  c1: [
    {
      id: 'm1',
      from: 't1',
      text: 'Здравствуй, Алексей! Напоминаю про домашнее задание по квадратным уравнениям.',
      at: Date.now() - 3 * 3600 * 1000,
      read: true,
    },
    {
      id: 'm2',
      from: 's1',
      text: 'Здравствуйте! Да, я помню, почти доделал.',
      at: Date.now() - 2.5 * 3600 * 1000,
      read: true,
    },
    {
      id: 'm3',
      from: 't1',
      text: 'Отлично. Если будут вопросы — пиши.',
      at: Date.now() - 2 * 3600 * 1000,
      read: true,
    },
    {
      id: 'm4',
      from: 's1',
      text: 'Я выполнил домашнее задание',
      at: Date.now() - 40 * 60 * 1000,
      read: true,
      files: [{ name: 'homework_equations.pdf', size: '1.2 МБ', type: 'pdf' }],
    },
  ],
  c2: [
    {
      id: 'm5',
      from: 't2',
      text: 'Алексей, напоминаю про сочинение. Срок — послезавтра.',
      at: Date.now() - 5 * 3600 * 1000,
      read: false,
    },
  ],
  c3: [
    {
      id: 'm6',
      from: 't3',
      text: 'Задача 7 решается через второй закон Ньютона.',
      at: Date.now() - 24 * 3600 * 1000,
      read: true,
    },
  ],
};

export const useChats = create((set) => ({
  threads: INITIAL,

  addMessage: (chatId, msg) =>
    set((s) => ({
      threads: {
        ...s.threads,
        [chatId]: [...(s.threads[chatId] || []), msg],
      },
    })),

  markRead: (chatId, userId) =>
    set((s) => ({
      threads: {
        ...s.threads,
        [chatId]: (s.threads[chatId] || []).map((m) =>
          m.from !== userId ? { ...m, read: true } : m
        ),
      },
    })),
}));