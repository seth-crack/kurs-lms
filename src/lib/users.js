import { supabase } from './supabase';

// Получить всех пользователей
export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки пользователей:', error);
    return [];
  }
  return data || [];
}

// Найти пользователя по email
export async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  if (error) return null;
  return data;
}

// Найти пользователя по id
export async function findUserById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) return null;
  return data;
}

// Обновить профиль
export async function updateUser(id, patch) {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id);

  if (error) {
    console.error('Ошибка обновления профиля:', error);
    return false;
  }
  return true;
}

// Удалить пользователя (профиль)
// ⚠️ Полное удаление из auth.users возможно только через service_role
// Здесь удаляем только профиль
export async function removeUser(id) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Ошибка удаления:', error);
    return false;
  }
  return true;
}

// Ученики конкретного учителя
export async function getStudentsByTeacher(teacherId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// Все учителя
export async function getTeachers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher');

  if (error) return [];
  return data || [];
}