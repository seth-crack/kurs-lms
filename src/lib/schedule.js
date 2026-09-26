import { supabase } from './supabase';

export async function getSchedule() {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки расписания:', error);
    return [];
  }
  return data || [];
}

export async function getScheduleByTeacher(teacherId) {
  const { data, error } = await supabase
    .from('schedule')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('day', { ascending: true })
    .order('time', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function createLesson(lesson) {
  const { data, error } = await supabase
    .from('schedule')
    .insert(lesson)
    .select()
    .single();

  if (error) {
    console.error('Ошибка создания занятия:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, lesson: data };
}

export async function updateLesson(id, patch) {
  const { data, error } = await supabase
    .from('schedule')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, lesson: data };
}

export async function deleteLesson(id) {
  const { error } = await supabase.from('schedule').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}