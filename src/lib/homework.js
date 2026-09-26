import { supabase } from './supabase';

// ============================================
// Задания (homework)
// ============================================

// Получить все задания, доступные текущему пользователю
export async function getHomework() {
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки заданий:', error);
    return [];
  }
  return data || [];
}

// Получить задания конкретного учителя
export async function getHomeworkByTeacher(teacherId) {
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// Получить задания конкретного ученика
export async function getHomeworkByStudent(studentId) {
  const { data, error } = await supabase
    .from('homework')
    .select('*')
    .contains('student_ids', [studentId])
    .order('deadline', { ascending: true });

  if (error) return [];
  return data || [];
}

// Создать задание
export async function createHomework(hw) {
  const { data, error } = await supabase
    .from('homework')
    .insert(hw)
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания задания:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, homework: data };
}

// Обновить задание (оценка, ответ, статус)
export async function updateHomework(id, patch) {
  const { data, error } = await supabase
    .from('homework')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Ошибка обновления:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, homework: data };
}

// Удалить задание
export async function deleteHomework(id) {
  const { error } = await supabase
    .from('homework')
    .delete()
    .eq('id', id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}