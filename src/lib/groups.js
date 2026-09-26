import { supabase } from './supabase';

// Все доступные группы
export async function getGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки групп:', error);
    return [];
  }
  return data || [];
}

// Группы конкретного учителя
export async function getGroupsByTeacher(teacherId) {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// Создать группу
export async function createGroup(group) {
  const { data, error } = await supabase
    .from('groups')
    .insert(group)
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания группы:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, group: data };
}

// Обновить группу
export async function updateGroup(id, patch) {
  const { data, error } = await supabase
    .from('groups')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Ошибка обновления группы:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, group: data };
}

// Удалить группу
export async function deleteGroup(id) {
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}