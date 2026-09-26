import { supabase } from './supabase';

// Получить всю посещаемость (в рамках RLS)
export async function getAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('lesson_date', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки посещаемости:', error);
    return [];
  }
  return data || [];
}

// Отметить посещаемость (upsert — если запись есть, обновить)
export async function markAttendance({
  teacherId,
  studentId,
  lessonDate,
  subject,
  present,
  note,
}) {
  const { data, error } = await supabase
    .from('attendance')
    .upsert(
      {
        teacher_id: teacherId,
        student_id: studentId,
        lesson_date: lessonDate,
        subject,
        present,
        note: note || '',
      },
      {
        onConflict: 'student_id,lesson_date,subject',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Ошибка отметки посещаемости:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, record: data };
}

// Удалить отметку
export async function deleteAttendance(id) {
  const { error } = await supabase.from('attendance').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}