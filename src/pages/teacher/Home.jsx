import { useAuth } from '../../store/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../store/useUsers';
import { useHomework } from '../../store/useHomework';
import { fmtRelative } from '../../lib/time';

import Icon from '../../ui/Icon';
import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Empty from '../../ui/Empty';

import DonutChart from '../../features/charts/DonutChart';

export default function TeacherHome() {
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const users = useUsers((s) => s.users);
  const items = useHomework((s) => s.items);

  const myItems = items.filter((h) => h.teacherId === user.id);
  const toCheck = myItems.filter((h) => h.status === 'submitted');
  const myStudents = users.filter(
    (u) => u.role === 'student' && u.teacherId === user.id
  );

  const graded = myItems.filter((h) => h.grade != null);
  const avg = graded.length
    ? (graded.reduce((a, h) => a + h.grade, 0) / graded.length).toFixed(1)
    : '—';

  const statusCounts = [
    { label: 'Новые',       value: myItems.filter((h) => h.status === 'new').length,       color: 'var(--info)' },
    { label: 'В процессе',  value: myItems.filter((h) => h.status === 'in_progress').length, color: 'var(--warning)' },
    { label: 'На проверку', value: myItems.filter((h) => h.status === 'submitted').length, color: 'var(--accent)' },
    { label: 'Проверено',   value: myItems.filter((h) => h.status === 'graded').length,    color: 'var(--success)' },
    { label: 'Просрочено',  value: myItems.filter((h) => h.status === 'overdue').length,   color: 'var(--danger)' },
  ].filter((s) => s.value > 0);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            Добрый день, {user.name.split(' ')[0]}
          </div>
          <div className="page-sub">
            {toCheck.length} работ ожидают проверки · {myStudents.length}{' '}
            учеников
          </div>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => navigate('/homework')}
          disabled={myStudents.length === 0}
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
          <div className="s-sub">в вашей школе</div>
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
            <Icon name="file-text" size={13} /> Всего заданий
          </div>
          <div className="s-value">{myItems.length}</div>
          <div className="s-sub">создано вами</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="bar-chart-2" size={13} /> Средний балл
          </div>
          <div className="s-value">{avg}</div>
          <div className="s-sub">
            {graded.length > 0 ? `по ${graded.length} работам` : 'нет оценок'}
          </div>
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
            <span
              className="link small"
              onClick={() => navigate('/homework')}
            >
              Все задания →
            </span>
          </div>

          {toCheck.length === 0 ? (
            <Empty
              icon="check-circle-2"
              title="Всё проверено"
              desc="Новые работы появятся здесь, когда ученики их отправят"
            />
          ) : (
            toCheck.map((h) => {
              const s = users.find((u) => u.id === h.student_ids?.[0]);
              if (!s) return null;
              return (
                <div
                  key={h.id}
                  className="hw-row"
                  onClick={() => navigate('/homework')}
                >
                  <Avatar
                    short={s.name
                      .split(' ')
                      .map((x) => x[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()}
                    color={s.color}
                    size="m"
                  />
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
          {myStudents.length === 0 && (
            <div
              className="card"
              style={{
                background: 'var(--accent-soft)',
                borderColor: 'var(--accent)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Начните работу
              </div>
              <div
                className="small"
                style={{
                  color: 'var(--text-2)',
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                Добавьте первого ученика — он получит email и пароль для
                входа в систему.
              </div>
              <Button
                variant="primary"
                block
                icon="plus"
                onClick={() => navigate('/students')}
              >
                Добавить ученика
              </Button>
            </div>
          )}

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
                Ученики
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
                icon="file-text"
                onClick={() => navigate('/homework')}
              >
                Задания
              </Button>
            </div>
          </div>
        </div>
      </div>

      {statusCounts.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>
            Статусы заданий
          </div>
          <DonutChart data={statusCounts} size={130} />
        </div>
      )}
    </>
  );
}