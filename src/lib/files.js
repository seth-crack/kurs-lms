export function humanSize(bytes) {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' КБ';
  return (bytes / 1024 / 1024).toFixed(1) + ' МБ';
}

export function toFileMeta(file) {
  const url = URL.createObjectURL(file);
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  let type = 'file';
  if (file.type.startsWith('image/')) type = 'img';
  else if (ext === 'pdf') type = 'pdf';
  else if (['py', 'js', 'ts', 'java', 'cpp', 'cs'].includes(ext)) type = 'code';
  else if (['doc', 'docx'].includes(ext)) type = 'doc';

  return {
    id: Math.random().toString(36).slice(2),
    name: file.name,
    size: humanSize(file.size),
    rawSize: file.size,
    type,
    ext,
    url,
  };
}