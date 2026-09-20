import { useState, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useHomework } from '../../store/useHomework';
import { studentById } from '../../data/mock';
import { fmtDate } from '../../lib/time';

import Avatar from '../../ui/Avatar';
import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';
import Tabs from '../../ui/Tabs';

export default function TeacherGrades() {
  const user = useAuth((s) => s.user);
  const items = useHomework((s) => s.items);
  const [tab, setTab] = useState('all');

  // Все проверенные работы этого учителя
  const graded = useMemo(
    () =>
      items
        .filter((h) => h.teacherId === user.id && h.grade != null)
        .sort((a, b) => (b.gradedAt || 0) - (a.gradedAt || 0)),
    [items, user.id]
  );

  // Статистика
  const avg =
    graded.length
      ? (graded.reduce((s, h) => s + h.grade, 0) / graded.length).toFixed(1)
      : '—';

  const grades5 = graded.filter((h) => h.grade === 5).length;
  const grades4 = graded.filter((h) => h.grade === 4).length;
  const grades3 = graded.filter((h) => h.grade === 3).length;
  const grades2 = graded.filter((h) => h.grade === 2).length;

  // Фильтр по предметам
  const subjects = [...new Set(graded.map((h) => h.subject))];

  const filtered = useMemo(() => {
    if (tab === 'all') return graded;
    return graded.filter((h) => h.subject === tab);
  }, [graded, tab]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Оценки</div>
          <div className="page-sub">
            Журнал всех выставленных оценок
          </div>
        </div>
      </div>

      {/* ----- Статистика ----- */}
      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="s-label">
            <Icon name="bar-chart-2" size={13} /> Средний балл
          </div>
          <div className="s-value">{avg}</div>
          <div className="s-sub">по {graded.length} работам</div>
        </div>
        <div className="card stat">
          <div className="s-label">
            <Icon name="award" size={13} /> Пятёрок
          </div>
          <div className="s-value" style={{ color: 'var(--success)' }}>
            {grades5}
          </div>
          <div className="s-sub">отличных работ</div>
        </div>
        <div className="card stat">
          <div className="s-label">
            <Icon name="check-circle-2" size={13} /> Четвёрок
          </div>
          <div className="s-value" style={{ color: 'var(--info)' }}>
            {grades4}
          </div>
          <div className="s-sub">хороших работ</div>
        </div>
        <div className="card stat">
          <div className="s-label">
            <Icon name="alert-circle" size={13} /> Троек и двоек
          </div>
          <div className="s-value" style={{ color: 'var(--warning)' }}>
            {grades3 + grades2}
          </div>
          <div className="s-sub">требуют внимания</div>
        </div>
      </div>

      {/* ----- Табы по предметам ----- */}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: `Все (${graded.length})` },
          ...subjects.map((s) => ({
            value: s,
            label: `${s} (${graded.filter((h) => h.subject === s).length})`,
          })),
        ]}
      />

      {/* ----- Таблица ----- */}
      {filtered.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="award"
            title="Оценок пока нет"
            desc="Проверьте работы учеников в разделе «Задания»"
          />
        </div>
      ) : (
        <div className="card pad-0">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Задание</th>
                  <th>Предмет</th>
                  <th>Оценка</th>
                  <th>Дата</th>
                  <th>Комментарий</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((h) => {
                  const s = studentById(h.studentIds[0]);
                  if (!s) return null;
                  return (
                    <tr key={h.id}>
                      <td>
                        <div className="row" style={{ gap: 10 }}>
                          <Avatar
                            short={s.short}
                            color={s.color}
                            size="s"
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {s.name}
                            </div>
                            <div className="small muted">{s.group}</div>
                          </div>
                        </div>
                      </td>
                      <td>{h.title}</td>
                      <td className="muted">{h.subject}</td>
                      <td>
                        <span
                          className={`grade-circle grade-${h.grade}`}
                          style={{ width: 30, height: 30, fontSize: 12 }}
                        >
                          {h.grade}
                        </span>
                      </td>
                      <td className="small muted">
                        {h.gradedAt ? fmtDate(h.gradedAt) : '—'}
                      </td>
                      <td
                        className="small muted"
                        style={{ maxWidth: 280, lineHeight: 1.5 }}
                      >
                        {h.comment || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}