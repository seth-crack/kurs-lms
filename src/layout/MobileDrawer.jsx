import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import { NAV_STUDENT, NAV_TEACHER } from '../lib/nav';

export default function MobileDrawer({ open, onClose }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const askConfirm = useUI((s) => s.askConfirm);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;
  if (!open) return null;

  const nav = user.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;
  const initials = user.name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    askConfirm({
      title: 'Выйти из аккаунта?',
      desc: 'Вы вернётесь на экран входа.',
      confirmText: 'Выйти',
      danger: true,
      onConfirm: logout,
    });
  };

  return (
    <>
      {/* затемнение */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,16,19,.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 90,
          animation: 'fade .2s ease',
        }}
      />

      {/* сам drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          zIndex: 91,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideRight .25s cubic-bezier(.2,.8,.2,1)',
          overflowY: 'auto',
        }}
      >
        <div className="row between" style={{ marginBottom: 18 }}>
          <div className="brand" style={{ padding: 0 }}>
            <div className="brand-mark">К</div> Курс
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div
          className="row"
          style={{
            gap: 10,
            padding: 10,
            background: 'var(--surface-2)',
            borderRadius: 10,
            marginBottom: 14,
          }}
        >
          <Avatar short={initials} color={user.color || '#4F46E5'} size="m" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
            <div className="small muted">
              {user.role === 'teacher' ? 'Учитель' : `Ученик · ${user.group || '—'}`}
            </div>
          </div>
        </div>

        <nav className="nav">
          {nav.map((n) => {
            const active = location.pathname === n.path;
            return (
              <button
                key={n.id}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => handleNav(n.path)}
              >
                <Icon name={n.icon} size={17} />
                <span>{n.label}</span>
                {n.badge && <span className="badge-mini">{n.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        <div className="divider" />

        <button className="nav-item" onClick={handleLogout}>
          <Icon name="log-out" size={17} />
          <span>Выйти</span>
        </button>
      </aside>
    </>
  );
}