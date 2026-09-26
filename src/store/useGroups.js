import { create } from 'zustand';
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../lib/groups';

export const useGroups = create((set, get) => ({
  groups: [],
  loading: false,
  error: null,

  refresh: async () => {
    set({ loading: true, error: null });
    const groups = await getGroups();
    set({ groups, loading: false });
  },

  add: async (group) => {
    const res = await createGroup(group);
    if (!res.ok) {
      set({ error: res.error });
      return { ok: false, error: res.error };
    }
    set((s) => ({ groups: [res.group, ...s.groups] }));
    return { ok: true, group: res.group };
  },

  update: async (id, patch) => {
    // оптимистично
    set((s) => ({
      groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
    const res = await updateGroup(id, patch);
    if (!res.ok) set({ error: res.error });
    return res;
  },

  remove: async (id) => {
    set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }));
    const res = await deleteGroup(id);
    if (!res.ok) set({ error: res.error });
    return res;
  },

  byId: (id) => get().groups.find((g) => g.id === id),
}));