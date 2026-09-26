// Сессия пользователя: токен + id в localStorage или sessionStorage
// «Запомнить меня» = localStorage
// Иначе = sessionStorage (закрыл браузер — вышел)

const KEY = 'kurs_session';

export function createSession(userId, remember = true) {
  const token =
    'sess_' +
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36);

  const payload = JSON.stringify({ userId, token, at: Date.now() });

  try {
    if (remember) {
      localStorage.setItem(KEY, payload);
      sessionStorage.removeItem(KEY);
    } else {
      sessionStorage.setItem(KEY, payload);
      localStorage.removeItem(KEY);
    }
    return token;
  } catch (e) {
    console.error('Ошибка сохранения сессии', e);
    return null;
  }
}

export function getSession() {
  try {
    const raw =
      localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function destroySession() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}