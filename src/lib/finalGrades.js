import { supabase } from './supabase';

export async function getFinalGrades() {
  const { data, error } = await supabase
    .from('final_grades')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка загрузки итоговых оценок:', error);
    return [];
  }
  return data || [];
}

export async function upsertFinalGrade({
  teacherId,
  studentId,
  subject,
  period,
  grade,
  comment,
}) {
  const { data, error } = await supabase
    .from('final_grades')
    .upsert(
      {
        teacher_id: teacherId,
        student_id: studentId,
        subject,
        period,
        grade,
        comment: comment || '',
      },
      { onConflict: 'student_id,subject,period' }
    )
    .select()
    .single();

  if (error) {
    console.error('Ошибка сохранения итоговой оценки:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, grade: data };
}

export async function deleteFinalGrade(id) {
  const { error } = await supabase
    .from('final_grades')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}