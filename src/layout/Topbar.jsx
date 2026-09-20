import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { useAuth } from '../store/useAuth';
import { NAV_STUDENT, NAV_TEACHER } from '../lib/nav';

const NOTIFS = [
  { id: 'n1', type: 'grade',  title: 'Новая оценка',    desc: 'Андрей Волков выставил 5 по Информатике', at: '1 день назад', read: false },
  { id: 'n2', type: 'hw',     title: 'Новое задание',   desc: '«Тригонометрия: формулы»',                 at: '1 час назад',  read: false },
  { id: 'n3', type: 'remind', title: 'Скоро дедлайн',   desc: 'Осталось 8 часов до сдачи',                at: '30 мин назад', read: false },
  { id: 'n4', type: 'msg',    title: 'Новое сообщение', desc: 'Мария Иванова: «Напоминаю про сочинение…»', at: '5 ч назад',    read: true },
];

export default function Topbar() {
  const user = useAuth((s) => s.user);
  const theme = useAuth((s) => s.theme);
  const setTheme = useAuth((s) => s.setTheme);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return null;

  const nav = user.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;
  const current = nav.find((n) => n.path === location.pathname);
  const title = current?.label || 'Курс';

  const initials = user.name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const unread = NOTIFS.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-spacer" />

      <button
        className="icon-btn"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        title="Переключить тему"
      >
        <Icon name={theme === 'light' ? 'moon' : 'sun'} size={17} />
      </button>

      <div style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          onClick={() => setNotifOpen((o) => !o)}
          title="Уведомления"
        >
          <Icon name="bell" size={17} />
          {unread > 0 && <span className="dot" />}
        </button>

        {notifOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 30 }}
              onClick={() => setNotifOpen(false)}
            />
            <div
              style={{ position: 'absolute', right: 0, top: 44, width: 340, zIndex: 40 }}
              className="card pad-0"
            >
              <div
                className="row between"
                style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                  Уведомления
                </div>
                <button className="link small">Прочитать все</button>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : 'var(--accent-soft)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {n.desc}
                    </div>
                    <div className="small muted" style={{ marginTop: 4, fontSize: 11 }}>
                      {n.at}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <button className="icon-btn" onClick={() => navigate('/profile')}>
        <Avatar short={initials} color={user.color || '#4F46E5'} size="s" />
      </button>
    </header>
  );
}