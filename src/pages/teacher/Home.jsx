import { useAuth } from '../../store/useAuth';
import { useNavigate } from 'react-router-dom';
import { STUDENTS, GROUPS, SCHEDULE, studentById } from '../../data/mock';
import { useHomework } from '../../store/useHomework';
import { fmtRelative } from '../../lib/time';

import Icon from '../../ui/Icon';
import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Empty from '../../ui/Empty';

export default function TeacherHome() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const items = useHomework((s) => s.items);

  const toCheck = items.filter(
    (h) => h.status === 'submitted' && h.teacherId === user.id
  );

  const myGroups = GROUPS.filter((g) => g.teacher === user.id);
  const myStudents = STUDENTS.filter((s) =>
    myGroups.some((g) => g.students.includes(s.id))
  );

  const todayLessons = SCHEDULE.filter(
    (s) => s.teacherId === user.id
  ).slice(0, 3);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            Добрый день, {user.name.split(' ')[0]}
          </div>
          <div className="page-sub">
            {toCheck.length} работ ожидают проверки · {myStudents.length}{' '}
            учеников · {todayLessons.length} занятия сегодня
          </div>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => navigate('/homework')}
        >
          Новое задание
        </Button>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="s-label">
            <Icon name="users" size={13} /> Учеников
          </div>
          <div className="s-value">{myStudents.length}</div>
          <div className="s-sub">в {myGroups.length} группах</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="inbox" size={13} /> На проверку
          </div>
          <div
            className="s-value"
            style={{ color: toCheck.length ? 'var(--warning)' : 'inherit' }}
          >
            {toCheck.length}
          </div>
          <div className="s-sub">работ ожидают</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="calendar" size={13} /> Занятий сегодня
          </div>
          <div className="s-value">{todayLessons.length}</div>
          <div className="s-sub">по расписанию</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="bar-chart-2" size={13} /> Средний балл
          </div>
          <div className="s-value">4.4</div>
          <div className="s-sub">по всем ученикам</div>
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: '1.4fr 1fr', gap: 16 }}
      >
        <div className="card pad-0">
          <div
            className="row between"
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{ fontWeight: 600 }}>Работы на проверку</div>
            <span className="link small" onClick={() => navigate('/homework')}>
              Все задания →
            </span>
          </div>

          {toCheck.length === 0 ? (
            <Empty
              icon="check-circle-2"
              title="Всё проверено"
              desc="Новые работы появятся здесь, как только ученики их отправят"
            />
          ) : (
            toCheck.map((h) => {
              const s = studentById(h.studentIds[0]);
              if (!s) return null;
              return (
                <div
                  key={h.id}
                  className="hw-row"
                  onClick={() => navigate('/homework')}
                >
                  <Avatar short={s.short} color={s.color} size="m" />
                  <div className="hw-body">
                    <div className="hw-title">{s.name}</div>
                    <div className="hw-meta">
                      <span>{h.title}</span>
                      <span>·</span>
                      <span>{h.subject}</span>
                    </div>
                    <div className="hw-meta" style={{ marginTop: 6 }}>
                      <span className="muted">
                        Сдано {fmtRelative(h.submittedAt || Date.now())}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="primary">
                    Проверить
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <div className="stack">
          <div className="card pad-0">
            <div
              className="row between"
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 600 }}>Расписание на сегодня</div>
              <span
                className="link small"
                onClick={() => navigate('/schedule')}
              >
                Всё →
              </span>
            </div>
            {todayLessons.length === 0 ? (
              <Empty icon="calendar" title="Занятий нет" />
            ) : (
              todayLessons.map((l) => (
                <div
                  key={l.id}
                  className="row"
                  style={{
                    gap: 12,
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="mono"
                    style={{ width: 52, fontWeight: 600, fontSize: 13.5 }}
                  >
                    {l.time}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {l.subject}
                    </div>
                    <div className="small muted">
                      {l.group} · {l.room}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              Быстрые действия
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <Button
                block
                icon="users"
                onClick={() => navigate('/students')}
              >
                Все ученики
              </Button>
              <Button
                block
                icon="layers"
                onClick={() => navigate('/groups')}
              >
                Группы
              </Button>
              <Button
                block
                icon="folder"
                onClick={() => navigate('/materials')}
              >
                Материалы
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}