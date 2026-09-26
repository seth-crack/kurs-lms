import { supabase } from './supabase';

// Получить уведомления текущего пользователя
export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Ошибка загрузки уведомлений:', error);
    return [];
  }
  return data || [];
}

// Отметить одно прочитанным
export async function markRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Отметить все прочитанными
export async function markAllRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Удалить одно
export async function deleteNotification(id) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Удалить все прочитанные
export async function clearRead() {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('read', true);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Realtime-подписка на новые уведомления
export function subscribeToNotifications(callback) {
  const channel = supabase
    .channel('notifications_' + Date.now())
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}