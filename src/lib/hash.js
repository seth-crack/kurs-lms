// Хеширование пароля через Web Crypto API (встроено в браузер)
// Это не bcrypt, но для локальной авторизации — достаточно.
// При переходе на Supabase — заменим на серверный bcrypt/scrypt.

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
  const arr = Array.from(new Uint8Array(buf));
  return arr.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password, hash) {
  const h = await hashPassword(password);
  return h === hash;
}