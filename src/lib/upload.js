import { supabase } from './supabase';

/**
 * Загружает файл в Supabase Storage.
 * Возвращает объект { name, size, type, url }.
 */
export async function uploadFile(file, folder = 'general') {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const uniqueName = `${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const path = `${folder}/${uniqueName}`;

  const { data, error } = await supabase.storage
    .from('kurs-files')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Ошибка загрузки файла:', error);
    return { ok: false, error: error.message };
  }

  // Получаем публичную ссылку
  const { data: urlData } = supabase.storage
    .from('kurs-files')
    .getPublicUrl(path);

  // Определяем тип
  let type = 'file';
  if (file.type.startsWith('image/')) type = 'img';
  else if (ext === 'pdf') type = 'pdf';
  else if (['py', 'js', 'ts', 'java', 'cpp', 'cs'].includes(ext))
    type = 'code';
  else if (['doc', 'docx'].includes(ext)) type = 'doc';

  return {
    ok: true,
    file: {
      name: file.name,
      size:
        file.size < 1024 * 1024
          ? Math.round(file.size / 1024) + ' КБ'
          : (file.size / 1024 / 1024).toFixed(1) + ' МБ',
      type,
      url: urlData.publicUrl,
      path,
    },
  };
}

/**
 * Загружает несколько файлов последовательно.
 */
export async function uploadFiles(files, folder = 'general') {
  const results = [];
  for (const f of files) {
    const res = await uploadFile(f, folder);
    if (res.ok) results.push(res.file);
  }
  return results;
}

/**
 * Открывает файл в новой вкладке.
 */
export function openFile(url) {
  if (!url) return;
  window.open(url, '_blank');
}

/**
 * Скачивает файл.
 */
export function downloadFile(url, name) {
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = name || 'file';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}