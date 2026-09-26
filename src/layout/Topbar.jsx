import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import Avatar from '../ui/Avatar';
import NotifBell from '../ui/NotifBell';
import { useAuth } from '../store/useAuth';
import { NAV_STUDENT, NAV_TEACHER } from '../lib/nav';

export default function Topbar() {
  const user = useAuth((s) => s.user);
  const theme = useAuth((s) => s.theme);
  const setTheme = useAuth((s) => s.setTheme);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const nav = user.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;
  const current = nav.find((n) => n.path === location.pathname);
  const title = current?.label || 'Курс';

  const initials = (user.name || '')
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

      <NotifBell />

      <button className="icon-btn" onClick={() => navigate('/profile')}>
        <Avatar short={initials} color={user.color || '#4F46E5'} size="s" />
      </button>
    </header>
  );
}