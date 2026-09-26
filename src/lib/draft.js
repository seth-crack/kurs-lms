const PREFIX = 'kurs_draft_';

export function saveDraft(hwId, data) {
  try {
    const payload = {
      answer: data.answer || '',
      files: data.files || [],
      savedAt: Date.now(),
    };
    localStorage.setItem(PREFIX + hwId, JSON.stringify(payload));
    return true;
  } catch (e) {
    console.error('Ошибка сохранения черновика', e);
    return false;
  }
}

export function loadDraft(hwId) {
  try {
    const raw = localStorage.getItem(PREFIX + hwId);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearDraft(hwId) {
  try {
    localStorage.removeItem(PREFIX + hwId);
  } catch (e) {
    // ignore
  }
}