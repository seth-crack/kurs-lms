import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useHomework } from '../../store/useHomework';
import { useFinalGrades } from '../../store/useFinalGrades';
import { fmtDate } from '../../lib/time';

import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';
import Tabs from '../../ui/Tabs';
import { CardSkeleton } from '../../ui/Skeleton';

export default function StudentGrades() {
  const user = useAuth((s) => s.user);
  const items = useHomework((s) => s.items);
  const refreshHw = useHomework((s) => s.refresh);
  const finals = useFinalGrades((s) => s.items);
  const refreshFinals = useFinalGrades((s) => s.refresh);

  const [tab, setTab] = useState('work');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await refreshHw();
      await refreshFinals();
      setLoading(false);
    };
    load();
  }, [refreshHw, refreshFinals]);

  const myGraded = useMemo(
    () =>
      items
        .filter(
          (h) => h.student_ids?.includes(user.id) && h.grade != null
        )
        .sort(
          (a, b) =>
            new Date(b.graded_at || 0).getTime() -
            new Date(a.graded_at || 0).getTime()
        ),
    [items, user.id]
  );

  const myAll = useMemo(
    () => items.filter((h) => h.student_ids?.includes(user.id)),
    [items, user.id]
  );

  const myFinals = useMemo(
    () =>
      finals
        .filter((g) => g.student_id === user.id)
        .sort((a, b) => a.subject.localeCompare(b.subject)),
    [finals, user.id]
  );

  const avg = myGraded.length
    ? (
        myGraded.reduce((sum, h) => sum + h.grade, 0) / myGraded.length
      ).toFixed(1)
    : '—';

  const overdueCount = myAll.filter((h) => h.status === 'overdue').length;

  const finalsAvg = myFinals.length
    ? (
        myFinals.reduce((s, g) => s + g.grade, 0) / myFinals.length
      ).toFixed(1)
    : '—';

  if (loading) {
    return (
      <>
        <div className="page-head">
          <div>
            <div className="sk" style={{ width: 140, height: 22, marginBottom: 8 }} />
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

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'work', label: `За работы (${myGraded.length})` },
          { value: 'final', label: `За четверть (${myFinals.length})` },
        ]}
      />

      {tab === 'work' && (
        <>
          <div className="grid cols-3" style={{ marginBottom: 16 }}>
            <div className="card stat">
              <div className="s-label">
                <Icon name="bar-chart-2" size={13} /> Средний балл
              </div>
              <div className="s-value">{avg}</div>
              <div className="s-sub">
                {myGraded.length > 0
                  ? `по ${myGraded.length} работам`
                  : 'нет оценок'}
              </div>
            </div>

            <div className="card stat">
              <div className="s-label">
                <Icon name="check-circle-2" size={13} /> Выполнено
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
                style={{
                  color: overdueCount ? 'var(--danger)' : 'inherit',
                }}
              >
                {overdueCount}
              </div>
              <div className="s-sub">требует внимания</div>
            </div>
          </div>

          <div className="card pad-0">
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
              }}
            >
              История оценок за работы
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
                          {h.graded_at
                            ? fmtDate(new Date(h.graded_at).getTime())
                            : '—'}
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
      )}

      {tab === 'final' && (
        <>
          <div className="grid cols-2" style={{ marginBottom: 16 }}>
            <div className="card stat">
              <div className="s-label">
                <Icon name="award" size={13} /> Средний итоговый балл
              </div>
              <div className="s-value">{finalsAvg}</div>
              <div className="s-sub">
                {myFinals.length > 0
                  ? `по ${myFinals.length} предметам`
                  : 'нет итоговых'}
              </div>
            </div>

            <div className="card stat">
              <div className="s-label">
                <Icon name="book" size={13} /> Предметов с итогом
              </div>
              <div className="s-value">{myFinals.length}</div>
              <div className="s-sub">за все четверти</div>
            </div>
          </div>

          <div className="card pad-0">
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
              }}
            >
              Итоговые оценки по предметам
            </div>

            {myFinals.length === 0 ? (
              <Empty
                icon="award"
                title="Итоговых оценок пока нет"
                desc="Когда учитель выставит итоговую оценку за четверть, она появится здесь"
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Предмет</th>
                      <th>Период</th>
                      <th>Оценка</th>
                      <th>Комментарий</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myFinals.map((g) => (
                      <tr key={g.id}>
                        <td style={{ fontWeight: 500 }}>{g.subject}</td>
                        <td className="muted small">{g.period}</td>
                        <td>
                          <span
                            className={`grade-circle grade-${g.grade}`}
                            style={{ width: 32, height: 32, fontSize: 13 }}
                          >
                            {g.grade}
                          </span>
                        </td>
                        <td
                          className="muted small"
                          style={{ maxWidth: 320, lineHeight: 1.5 }}
                        >
                          {g.comment || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}