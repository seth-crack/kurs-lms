import { supabase } from './supabase';

export async function getMaterials() {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки материалов:', error);
    return [];
  }
  return data || [];
}

export async function createMaterial(material) {
  const { data, error } = await supabase
    .from('materials')
    .insert(material)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, material: data };
}

export async function updateMaterial(id, patch) {
  const { data, error } = await supabase
    .from('materials')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, material: data };
}

export async function deleteMaterial(id) {
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}