import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 URL:', url);
console.log('🔍 KEY:', key ? 'есть' : 'нет');

if (!url || !key) {
  console.error(
    '❌ Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env.local'
  );
} else {
  console.log('✅ Supabase подключён:', url);
}

export const supabase = createClient(url, key);