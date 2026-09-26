import { supabase } from './supabase';

// Создать chat_id из двух id (отсортированных)
export function makeChatId(id1, id2) {
  return [id1, id2].sort().join('__');
}

// Загрузить сообщения чата
export async function getMessages(chatId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки сообщений:', error);
    return [];
  }
  return data || [];
}

// Отправить сообщение
export async function sendMessage({ chatId, senderId, text, files }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      text: text || '',
      files: files || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Ошибка отправки:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, message: data };
}

// Пометить сообщения как прочитанные
export async function markChatRead(chatId, userId) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) console.error('Ошибка отметки прочтения:', error);
}

// Подписка на новые сообщения в чате (Realtime)
export function subscribeToChat(chatId, callback) {
  const channel = supabase
    .channel('messages_' + chatId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}