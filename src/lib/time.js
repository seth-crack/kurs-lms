const H = 3600 * 1000;
const D = 24 * H;

export function fmtTime(ts) {
  const d = new Date(ts);
  const diff = Date.now() - ts;
  if (diff < 60 * 1000) return 'только что';
  if (diff < H) return `${Math.floor(diff / 60000)} мин назад`;
  if (diff < D)
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtShortDate(ts) {
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function fmtRelative(ts) {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const unit = abs < H ? 'мин' : abs < D ? 'ч' : 'д';
  const val =
    unit === 'мин'
      ? Math.round(diff / 60000)
      : unit === 'ч'
      ? Math.round(diff / H)
      : Math.round(diff / D);
  if (diff > 0) return `через ${val} ${unit}`;
  return `${Math.abs(val)} ${unit} назад`;
}

export const HOUR = H;
export const DAY = D;