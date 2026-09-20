import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import { NAV_STUDENT, NAV_TEACHER } from '../lib/nav';

export default function Sidebar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const askConfirm = useUI((s) => s.askConfirm);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const nav = user.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;
  const initials = user.name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    askConfirm({
      title: 'Выйти из аккаунта?',
      desc: 'Вы вернётесь на экран входа. Черновики останутся в браузере.',
      confirmText: 'Выйти',
      danger: true,
      onConfirm: logout,
    });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">К</div> Курс
      </div>

      <nav className="nav">
        {nav.map((n) => {
          const active = location.pathname === n.path;
          return (
            <button
              key={n.id}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              <Icon name={n.icon} size={17} />
              <span>{n.label}</span>
              {n.badge && <span className="badge-mini">{n.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="divider" />

      <div className="row between">
        <div className="row" style={{ gap: 8, minWidth: 0 }}>
          <Avatar short={initials} color={user.color || '#4F46E5'} size="m" />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user.name}
            </div>
            <div className="small muted">
              {user.role === 'teacher' ? 'Учитель' : `Ученик · ${user.group || '—'}`}
            </div>
          </div>
        </div>
        <button className="icon-btn" onClick={handleLogout} title="Выйти">
          <Icon name="log-out" size={16} />
        </button>
      </div>
    </aside>
  );
}