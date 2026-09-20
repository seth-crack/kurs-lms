import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { HOMEWORK } from '../../data/mock';
import { fmtDate } from '../../lib/time';

import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';
import { CardSkeleton } from '../../ui/Skeleton';

export default function StudentGrades() {
  const user = useAuth((s) => s.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const myGraded = useMemo(
    () =>
      HOMEWORK.filter(
        (h) => h.studentIds.includes(user.id) && h.grade != null
      ).sort((a, b) => (b.gradedAt || 0) - (a.gradedAt || 0)),
    [user.id]
  );

  const myAll = useMemo(
    () => HOMEWORK.filter((h) => h.studentIds.includes(user.id)),
    [user.id]
  );

  const avg = myGraded.length
    ? (myGraded.reduce((sum, h) => sum + h.grade, 0) / myGraded.length).toFixed(1)
    : '—';

  const overdueCount = myAll.filter((h) => h.status === 'overdue').length;

  if (loading) {
    return (
      <>
        <div className="page-head">
          <div>
            <div
              className="sk"
              style={{ width: 140, height: 22, marginBottom: 8 }}
            />
            <div className="sk" style={{ width: 280, height: 14 }} />
          </div>
        </div>
        <div className="grid cols-3" style={{ marginBottom: 16 }}>
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <CardSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Оценки</div>
          <div className="page-sub">
            Успеваемость и обратная связь от преподавателей
          </div>
        </div>
      </div>

      {/* ----- Статистика ----- */}
      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="s-label">
            <Icon name="bar-chart-2" size={13} /> Средний балл
          </div>
          <div className="s-value">{avg}</div>
          <div className="s-sub">по {myGraded.length} работам</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="check-circle-2" size={13} /> Выполнено заданий
          </div>
          <div className="s-value">{myGraded.length}</div>
          <div className="s-sub">всего оценок</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="clock" size={13} /> Просрочено
          </div>
          <div
            className="s-value"
            style={{ color: overdueCount ? 'var(--danger)' : 'inherit' }}
          >
            {overdueCount}
          </div>
          <div className="s-sub">требует внимания</div>
        </div>
      </div>

      {/* ----- Таблица оценок ----- */}
      <div className="card pad-0">
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            fontWeight: 600,
          }}
        >
          История оценок
        </div>

        {myGraded.length === 0 ? (
          <Empty
            icon="award"
            title="Оценок пока нет"
            desc="Как только преподаватель проверит работу, оценка появится здесь"
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Предмет</th>
                  <th>Задание</th>
                  <th>Оценка</th>
                  <th>Дата</th>
                  <th>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {myGraded.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 500 }}>{h.subject}</td>
                    <td>{h.title}</td>
                    <td>
                      <span
                        className={`grade-circle grade-${h.grade}`}
                        style={{ width: 32, height: 32, fontSize: 13 }}
                      >
                        {h.grade}
                      </span>
                    </td>
                    <td className="muted small">
                      {h.gradedAt ? fmtDate(h.gradedAt) : '—'}
                    </td>
                    <td
                      className="muted small"
                      style={{ maxWidth: 320, lineHeight: 1.5 }}
                    >
                      {h.comment || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}