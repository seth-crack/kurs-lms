import { fmtTime } from '../../lib/time';
import Icon from '../../ui/Icon';

export default function DraftIndicator({ status, lastSavedAt, onClear }) {
  if (status === 'idle') return null;

  const labels = {
    dirty: 'Есть несохранённые изменения',
    saving: 'Сохранение…',
    saved: 'Сохранено',
  };

  const colors = {
    dirty: 'var(--text-3)',
    saving: 'var(--warning)',
    saved: 'var(--success)',
  };

  const icons = {
    dirty: 'edit-2',
    saving: 'refresh-cw',
    saved: 'check-circle-2',
  };

  return (
    <div
      className="row"
      style={{
        gap: 6,
        fontSize: 12,
        color: colors[status],
        marginTop: 8,
        alignItems: 'center',
      }}
    >
      <Icon name={icons[status]} size={13} />
      <span>{labels[status]}</span>
      {status === 'saved' && lastSavedAt && (
        <span className="muted" style={{ fontSize: 11 }}>
          · {fmtTime(lastSavedAt)}
        </span>
      )}
      {onClear && (status === 'saved' || status === 'dirty') && (
        <>
          <span className="muted" style={{ margin: '0 4px' }}>·</span>
          <button
            onClick={onClear}
            style={{
              color: 'var(--text-3)',
              textDecoration: 'underline',
              fontSize: 12,
            }}
          >
            Очистить
          </button>
        </>
      )}
    </div>
  );
}