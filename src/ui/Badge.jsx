const LABELS = {
  new: 'Новое',
  in_progress: 'В процессе',
  submitted: 'Отправлено',
  checking: 'Проверяется',
  graded: 'Проверено',
  overdue: 'Просрочено',
};

const CLASSES = {
  new: 'new',
  in_progress: 'progress',
  submitted: 'submitted',
  checking: 'checking',
  graded: 'graded',
  overdue: 'overdue',
};

export default function Badge({ status, children }) {
  if (status) {
    return (
      <span className={`badge ${CLASSES[status] || 'neutral'}`}>
        <span className="b-dot" />
        {LABELS[status] || status}
      </span>
    );
  }
  return <span className="badge neutral">{children}</span>;
}