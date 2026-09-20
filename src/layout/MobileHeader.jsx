import Icon from '../ui/Icon';
import { useAuth } from '../store/useAuth';

export default function MobileHeader({ onMenu, onNotifs }) {
  const user = useAuth((s) => s.user);
  const theme = useAuth((s) => s.theme);
  const setTheme = useAuth((s) => s.setTheme);

  if (!user) return null;

  return (
    <header className="mobile-header">
      <button className="icon-btn" onClick={onMenu} title="Меню">
        <Icon name="menu" size={20} />
      </button>

      <div className="brand" style={{ padding: 0, fontSize: 14 }}>
        <div className="brand-mark" style={{ width: 24, height: 24, fontSize: 12 }}>
          К
        </div>
        Курс
      </div>

      <div style={{ flex: 1 }} />

      <button
        className="icon-btn"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
      </button>
      <button className="icon-btn" onClick={onNotifs}>
        <Icon name="bell" size={18} />
        <span className="dot" />
      </button>
    </header>
  );
}