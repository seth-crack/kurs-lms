import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useAuth } from '../store/useAuth';
import { NAV_STUDENT, NAV_TEACHER, MOBILE_NAV_IDS } from '../lib/nav';

export default function MobileNav() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const all = user.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;
  const nav = MOBILE_NAV_IDS.map((id) => all.find((n) => n.id === id)).filter(Boolean);

  return (
    <nav className="mobile-nav">
      {nav.map((n) => {
        const active = location.pathname === n.path;
        return (
          <button
            key={n.id}
            className={active ? 'active' : ''}
            onClick={() => navigate(n.path)}
          >
            <Icon name={n.icon} size={20} />
            <span>{n.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}