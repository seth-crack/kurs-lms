import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useAttendance } from '../../store/useAttendance';
import { fmtDate } from '../../lib/time';

import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';
import Progress from '../../ui/Progress';
import Tabs from '../../ui/Tabs';

export default function StudentAttendance() {
  const user = useAuth((s) => s.user);
  const items = useAttendance((s) => s.items);
  const refresh = useAttendance((s) => s.refresh);

  const [tab, setTab] = useState('all');

  useEffect(() => {
    refresh();
  }, [refresh]);

  const my = items
    .filter((a) => a.student_id === user.id)
    .sort(
      (a, b) =>
        new Date(b.lesson_date).getTime() -
        new Date(a.lesson_date).getTime()
    );

  const presentCount = my.filter((a) => a.present).length;
  const absentCount = my.filter((a) => !a.present).length;
  const total = my.length;
  const pct = total ? Math.round((presentCount / total) * 100) : 0;

  const subjects = [...new Set(my.map((a) => a.subject))];

  const filtered = my.filter((a) => {
    if (tab === 'all') return true;
    if (tab === 'present') return a.present;
    if (tab === 'absent') return !a.present;
    return a.subject === tab;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Посещаемость</div>
          <div className="page-sub">
            История ваших занятий
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="s-label">
            <Icon name="check-circle-2" size={13} /> Посещено
          </div>
          <div className="s-value" style={{ color: 'var(--success)' }}>
            {presentCount}
          </div>
          <div className="s-sub">занятий</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="x-circle" size={13} /> Пропущено
          </div>
          <div className="s-value" style={{ color: 'var(--danger)' }}>
            {absentCount}
          </div>
          <div className="s-sub">занятий</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="bar-chart-2" size={13} /> Процент
          </div>
          <div className="s-value">{pct}%</div>
          <div className="s-sub">
            {total > 0 ? `из ${total} занятий` : 'нет данных'}
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div
            className="row between small"
            style={{ marginBottom: 6 }}
          >
            <span className="muted">Общая посещаемость</span>
            <span>{pct}%</span>
          </div>
          <Progress
            value={pct}
            color={
              pct >= 80
                ? 'var(--success)'
                : pct >= 50
                ? 'var(--warning)'
                : 'var(--danger)'
            }
          />
        </div>
      )}

      {/* Фильтры */}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: `Все (${my.length})` },
          { value: 'present', label: `Посещено (${presentCount})` },
          { value: 'absent', label: `Пропущено (${absentCount})` },
          ...subjects.map((s) => ({
            value: s,
            label: `${s}`,
          })),
        ]}
      />

      {/* Список */}
      {filtered.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="calendar"
            title={
              my.length === 0
                ? 'Пока нет отметок'
                : 'Ничего не найдено'
            }
            desc={
              my.length === 0
                ? 'Когда учитель начнёт отмечать посещаемость, вы увидите её здесь'
                : 'Попробуйте изменить фильтр'
            }
          />
        </div>
      ) : (
        <div className="card pad-0">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="row"
              style={{
                gap: 12,
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {/* Иконка статуса */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  border: '2px solid',
                  borderColor: a.present
                    ? 'var(--success)'
                    : 'var(--danger)',
                  background: a.present
                    ? 'var(--success-soft)'
                    : 'var(--danger-soft)',
                  color: a.present ? 'var(--success)' : 'var(--danger)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon
                  name={a.present ? 'check' : 'x'}
                  size={20}
                  strokeWidth={2.5}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {a.subject || 'Занятие'}
                </div>
                <div className="small muted">
                  {new Date(a.lesson_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: a.present ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {a.present ? 'Был' : 'Отсутствовал'}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}