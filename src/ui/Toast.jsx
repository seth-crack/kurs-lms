import Icon from './Icon';
import { useUI } from '../store/useUI';

const ICONS = {
  success: 'check-circle-2',
  error: 'alert-circle',
  info: 'info',
  warn: 'alert-triangle',
};

const COLORS = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--info)',
  warn: 'var(--warning)',
};

export default function ToastHost() {
  const toasts = useUI((s) => s.toasts);

  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <div
            className="t-icon"
            style={{ color: COLORS[t.type] || COLORS.info }}
          >
            <Icon name={ICONS[t.type] || 'info'} size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-title">{t.title}</div>
            {t.desc && <div className="t-desc">{t.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}