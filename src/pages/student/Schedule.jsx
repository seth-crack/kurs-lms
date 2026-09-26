import { useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useSchedule } from '../../store/useSchedule';
import { useUsers } from '../../store/useUsers';
import Icon from '../../ui/Icon';

const DAYS = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export default function SchedulePage() {
  const user = useAuth((s) => s.user);
  const items = useSchedule((s) => s.items);
  const refresh = useSchedule((s) => s.refresh);
  const users = useUsers((s) => s.users);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  // Ученик видит занятия своего учителя
  const teacherLessons = user?.teacher_id
    ? items.filter((l) => l.teacher_id === user.teacher_id)
    : [];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Расписание</div>
          <div className="page-sub">Занятия на эту неделю</div>
        </div>
      </div>

      <div className="card pad-0">
        {DAYS.map((day, i) => {
          const dayLessons = teacherLessons.filter((l) => l.day === i);
          const isToday = i === todayIdx;

          return (
            <div
              key={day}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div
                className="row between"
                style={{
                  padding: '10px 18px',
                  background: isToday
                    ? 'var(--accent-soft)'
                    : 'transparent',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {day}
                  {isToday && (
                    <span
                      className="badge new"
                      style={{ marginLeft: 8 }}
                    >
                      сегодня
                    </span>
                  )}
                </div>
                <div className="small muted">
                  {dayLessons.length}{' '}
                  {dayLessons.length === 1
                    ? 'занятие'
                    : dayLessons.length < 5
                    ? 'занятия'
                    : 'занятий'}
                </div>
              </div>

              {dayLessons.length === 0 ? (
                <div
                  className="small muted"
                  style={{ padding: '10px 18px 14px' }}
                >
                  Нет занятий
                </div>
              ) : (
                dayLessons.map((l) => {
                  const t = users.find((u) => u.id === l.teacher_id);
                  return (
                    <div
                      key={l.id}
                      className="row"
                      style={{
                        gap: 14,
                        padding: '12px 18px',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="mono"
                        style={{
                          width: 56,
                          fontWeight: 600,
                          fontSize: 13.5,
                        }}
                      >
                        {l.time}
                      </div>
                      <div
                        style={{
                          width: 4,
                          height: 34,
                          borderRadius: 4,
                          background: t?.color || 'var(--accent)',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                          {l.subject}
                        </div>
                        <div className="small muted">
                          {t ? `${t.name} · ` : ''}
                          {l.room || '—'} · {l.dur}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ gap: 8 }}>
          <Icon
            name="info"
            size={14}
            style={{ color: 'var(--text-3)' }}
          />
          <div className="small muted">
            Расписание редактируется учителем. Если нужны изменения —
            напишите ему в чат.
          </div>
        </div>
      </div>
    </>
  );
}