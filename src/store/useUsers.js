import { create } from 'zustand';
import { getUsers, removeUser, updateUser } from '../lib/users';

export const useUsers = create((set) => ({
  users: [],
  loading: false,

  refresh: async () => {
    set({ loading: true });
    const users = await getUsers();
    set({ users, loading: false });
  },

  remove: async (id) => {
    await removeUser(id);
    const users = await getUsers();
    set({ users });
  },

  update: async (id, patch) => {
    await updateUser(id, patch);
    const users = await getUsers();
    set({ users });
  },
}));