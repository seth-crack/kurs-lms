import { useState, useEffect, useRef, useCallback } from 'react';
import { saveDraft, loadDraft, clearDraft } from '../../lib/draft';

/**
 * Хук автосохранения черновика.
 *
 * @param {string} hwId — id задания
 * @param {object} initial — { answer, files }
 * @param {boolean} enabled — включить автосохранение (false для проверенных заданий)
 * @param {number} delay — задержка в мс (по умолчанию 2000)
 */
export function useDraft(hwId, initial, enabled = true, delay = 2000) {
  const [state, setState] = useState(() => {
    if (!enabled) {
      return { answer: initial.answer || '', files: initial.files || [] };
    }
    const saved = loadDraft(hwId);
    if (saved) {
      return {
        answer: saved.answer || initial.answer || '',
        files: saved.files?.length ? saved.files : initial.files || [],
      };
    }
    return { answer: initial.answer || '', files: initial.files || [] };
  });

  // 'idle' | 'dirty' | 'saving' | 'saved'
  const [status, setStatus] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const timerRef = useRef(null);
  const firstRunRef = useRef(true);

  // обновление
  const update = useCallback(
    (patch) => {
      setState((s) => ({ ...s, ...patch }));
      if (enabled) setStatus('dirty');
    },
    [enabled]
  );

  // очистка
  const clear = useCallback(() => {
    clearDraft(hwId);
    setState({ answer: '', files: [] });
    setStatus('idle');
    setLastSavedAt(null);
  }, [hwId]);

  // автосохранение
  useEffect(() => {
    if (!enabled) return;
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (status !== 'dirty') return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStatus('saving');
      const ok = saveDraft(hwId, state);
      setTimeout(() => {
        if (ok) {
          setStatus('saved');
          setLastSavedAt(Date.now());
        } else {
          setStatus('dirty');
        }
      }, 300);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [state, enabled, hwId, delay, status]);

  // при первом сохранении — сбросить "saved" через 2 сек
  useEffect(() => {
    if (status !== 'saved') return;
    const t = setTimeout(() => {
      setStatus((s) => (s === 'saved' ? 'idle' : s));
    }, 2000);
    return () => clearTimeout(t);
  }, [status]);

  return {
    answer: state.answer,
    files: state.files,
    setAnswer: (v) => update({ answer: v }),
    setFiles: (v) =>
      update({ files: typeof v === 'function' ? v(state.files) : v }),
    status,
    lastSavedAt,
    clear,
  };
}