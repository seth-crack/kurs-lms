import { create } from 'zustand';
import {
  getMaterials,
  createMaterial,
  deleteMaterial,
} from '../lib/materials';

export const useMaterials = create((set, get) => ({
  items: [],
  loading: false,

  refresh: async () => {
    set({ loading: true });
    const items = await getMaterials();
    set({ items, loading: false });
  },

  add: async (material) => {
    const res = await createMaterial(material);
    if (!res.ok) return res;
    set((s) => ({ items: [res.material, ...s.items] }));
    return res;
  },

  remove: async (id) => {
    set((s) => ({ items: s.items.filter((m) => m.id !== id) }));
    return await deleteMaterial(id);
  },
}));