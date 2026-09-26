import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifs } from '../store/useNotifs';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import { fmtTime } from '../lib/time';
import Icon from './Icon';
import Button from './Button';

const ICONS = {
  homework: 'file-text',
  grade: 'award',
  message: 'message-circle',
  reminder: 'clock',
};

const COLORS = {
  homework: 'var(--info)',
  grade: 'var(--success)',
  message: 'var(--accent)',
  reminder: 'var(--warning)',
};

export default function NotifBell() {
  const user = useAuth((s) => s.user);
  const items = useNotifs((s) => s.items);
  const refresh = useNotifs((s) => s.refresh);
  const subscribe = useNotifs((s) => s.subscribe);
  const markRead = useNotifs((s) => s.markRead);
  const markAllRead = useNotifs((s) => s.markAllRead);
  const clearRead = useNotifs((s) => s.clearRead);
  const toast = useUI((s) => s.toast);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    refresh();
    subscribe((n) => {
      // Показываем тост при новом уведомлении
      toast('info', n.title, n.description || '');

      // Браузерное push-уведомление
      if (
        'Notification' in window &&
        Notification.permission === 'granted' &&
        document.hidden
      ) {
        try {
          new Notification(n.title, {
            body: n.description || '',
            icon: '/favicon.ico',
          });
        } catch (e) {}
      }
    });

    return () => {};
  }, [refresh, subscribe, toast]);

  // Закрытие при клике вне
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleClick = (n) => {
    markRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  const handleMarkAll = async () => {
    await markAllRead();
    toast('success', 'Все прочитаны', '');
  };

  const handleClearRead = async () => {
    await clearRead();
    toast('info', 'Прочитанные очищены', '');
  };

  // Запрос разрешения на push при первом монтировании
  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      // Запрашиваем через 3 секунды после захода
      const t = setTimeout(() => {
        Notification.requestPermission().catch(() => {});
      }, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={wrapRef}>
      <button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        title="Уведомления"
      >
        <Icon name="bell" size={17} />
        {unread > 0 && <span className="dot" />}
      </button>

      {open && (
        <div
          className="card pad-0"
          style={{
            position: 'absolute',
            right: 0,
            top: 44,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            zIndex: 40,
            boxShadow: 'var(--shadow-3)',
          }}
        >
          <div
            className="row between"
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              Уведомления{' '}
              {unread > 0 && (
                <span style={{ color: 'var(--accent)' }}>({unread})</span>
              )}
            </div>
            <div className="row" style={{ gap: 8 }}>
              {unread > 0 && (
                <button className="link small" onClick={handleMarkAll}>
                  Прочитать
                </button>
              )}
              {items.some((n) => n.read) && (
                <button className="link small" onClick={handleClearRead}>
                  Очистить
                </button>
              )}
            </div>
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {items.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  color: 'var(--text-3)',
                  fontSize: 13,
                }}
              >
                Нет уведомлений
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: n.read ? 'transparent' : 'var(--accent-soft)',
                    transition: 'background .15s',
                  }}
                >
                  <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'var(--surface-2)',
                        color: COLORS[n.type] || 'var(--accent)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon name={ICONS[n.type] || 'bell'} size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: n.read ? 500 : 600,
                          fontSize: 13,
                        }}
                      >
                        {n.title}
                      </div>
                      {n.description && (
                        <div
                          className="small muted"
                          style={{
                            marginTop: 2,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {n.description}
                        </div>
                      )}
                      <div
                        className="small muted"
                        style={{ marginTop: 4, fontSize: 11 }}
                      >
                        {fmtTime(new Date(n.created_at).getTime())}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}