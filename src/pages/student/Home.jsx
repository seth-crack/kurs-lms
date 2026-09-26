import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/useAuth';
import { useHomework } from '../../store/useHomework';
import { useUsers } from '../../store/useUsers';
import { SUBJECTS, SCHEDULE_TEMPLATE } from '../../data/mock';
import { fmtRelative, fmtDate } from '../../lib/time';

import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Progress from '../../ui/Progress';
import { CardSkeleton } from '../../ui/Skeleton';
import Empty from '../../ui/Empty';

import DonutChart from '../../features/charts/DonutChart';

export default function StudentHome() {
  const user = useAuth((s) => s.user);
  const items = useHomework((s) => s.items);
  const users = useUsers((s) => s.users);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const teacher = user.teacherId
    ? users.find((u) => u.id === user.teacherId)
    : null;

  const myHw = items.filter((h) => h.student_ids?.includes(user.id));
  const upcoming = [...myHw]
    .filter((h) => h.status !== 'graded')
    .sort((a, b) => a.deadline - b.deadline);

  const recentGrades = myHw
    .filter((h) => h.grade != null)
    .sort((a, b) => (b.gradedAt || 0) - (a.gradedAt || 0))
    .slice(0, 3);

  const subjectProgress = SUBJECTS.map((s) => {
    const list = myHw.filter((h) => h.subject === s);
    const done = list.filter((h) => h.status === 'graded').length;
    return {
      subject: s,
      total: list.length,
      done,
      pct: list.length ? Math.round((done / list.length) * 100) : 0,
    };
  }).filter((x) => x.total > 0);

  const gradedOnly = myHw.filter((h) => h.grade != null);
  const avgGrade = gradedOnly.length
    ? gradedOnly.reduce((a, h) => a + h.grade, 0) / gradedOnly.length
    : 0;

  const statusCounts = [
    { label: 'Новые',      value: myHw.filter((h) => h.status === 'new').length,       color: 'var(--info)' },
    { label: 'В процессе', value: myHw.filter((h) => h.status === 'in_progress').length, color: 'var(--warning)' },
    { label: 'Отправлено', value: myHw.filter((h) => h.status === 'submitted').length, color: 'var(--accent)' },
    { label: 'Проверено',  value: myHw.filter((h) => h.status === 'graded').length,    color: 'var(--success)' },
    { label: 'Просрочено', value: myHw.filter((h) => h.status === 'overdue').length,   color: 'var(--danger)' },
  ].filter((s) => s.value > 0);

  if (loading) {
    return (
      <>
        <div className="page-head">
          <div>
            <div className="sk" style={{ width: 220, height: 22, marginBottom: 8 }} />
            <div className="sk" style={{ width: 320, height: 14 }} />
          </div>
        </div>
        <div className="grid cols-4" style={{ marginBottom: 16 }}>
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">
            Привет, {user.name.split(' ')[0]} 👋
          </div>
          <div className="page-sub">
            {teacher
              ? `Твой преподаватель: ${teacher.name}`
              : 'Добро пожаловать на платформу'}
            {upcoming.length > 0 &&
              ` · У тебя ${upcoming.length} ${
                upcoming.length === 1 ? 'задание' : 'задания'
              }`}
          </div>
        </div>
        <Button
          variant="primary"
          icon="file-text"
          onClick={() => navigate('/homework')}
        >
          К заданиям
        </Button>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="card stat">
          <div className="s-label">
            <Icon name="file-text" size={13} /> Активных
          </div>
          <div className="s-value">{upcoming.length}</div>
          <div className="s-sub">
            {upcoming.filter((h) => h.status === 'new').length} новых
          </div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="award" size={13} /> Средний балл
          </div>
          <div className="s-value">
            {avgGrade > 0 ? avgGrade.toFixed(1) : '—'}
          </div>
          <div className="s-sub">
            {gradedOnly.length > 0 ? `по ${gradedOnly.length} работам` : 'нет оценок'}
          </div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="check-circle-2" size={13} /> Выполнено
          </div>
          <div className="s-value">
            {myHw.filter((h) => h.status === 'graded').length}
          </div>
          <div className="s-sub">из {myHw.length}</div>
        </div>

        <div className="card stat">
          <div className="s-label">
            <Icon name="clock" size={13} /> Просрочено
          </div>
          <div
            className="s-value"
            style={{
              color: myHw.filter((h) => h.status === 'overdue').length
                ? 'var(--danger)'
                : 'inherit',
            }}
          >
            {myHw.filter((h) => h.status === 'overdue').length}
          </div>
          <div className="s-sub">требует внимания</div>
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
            <div style={{ fontWeight: 600 }}>Ближайшие дедлайны</div>
            <span className="link small" onClick={() => navigate('/homework')}>
              Все →
            </span>
          </div>

          {upcoming.length === 0 ? (
            <Empty
              icon="check-circle-2"
              title="Нет активных заданий"
              desc="Когда учитель назначит задание — оно появится здесь"
            />
          ) : (
            upcoming.slice(0, 4).map((h) => {
              const t = users.find((u) => u.id === h.teacherId);
              return (
                <div
                  key={h.id}
                  className="hw-row"
                  onClick={() => navigate('/homework')}
                >
                  <div className="hw-ic">
                    <Icon name="file-text" size={17} />
                  </div>
                  <div className="hw-body">
                    <div className="hw-title">{h.title}</div>
                    <div className="hw-meta">
                      <span>{h.subject}</span>
                      {t && (
                        <>
                          <span>·</span>
                          <span>{t.name}</span>
                        </>
                      )}
                    </div>
                    <div className="hw-meta" style={{ marginTop: 6 }}>
                      <Badge status={h.status} />
                      <span
                        style={{
                          color:
                            h.deadline < Date.now()
                              ? 'var(--danger)'
                              : 'var(--text-3)',
                        }}
                      >
                        <Icon name="clock" size={11} />{' '}
                        {fmtRelative(h.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="stack">
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              Прогресс по предметам
            </div>
            {subjectProgress.length === 0 ? (
              <div className="small muted">Пока нет данных</div>
            ) : (
              subjectProgress.map((sp) => (
                <div key={sp.subject} style={{ marginBottom: 12 }}>
                  <div
                    className="row between small"
                    style={{ marginBottom: 5 }}
                  >
                    <span>{sp.subject}</span>
                    <span className="muted">
                      {sp.done}/{sp.total}
                    </span>
                  </div>
                  <Progress value={sp.pct} />
                </div>
              ))
            )}
          </div>

          <div className="card pad-0">
            <div
              className="row between"
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 600 }}>Последние оценки</div>
              <span className="link small" onClick={() => navigate('/grades')}>
                Все →
              </span>
            </div>
            {recentGrades.length === 0 ? (
              <Empty icon="award" title="Оценок пока нет" />
            ) : (
              recentGrades.map((h) => (
                <div
                  key={h.id}
                  className="row"
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--border)',
                    gap: 12,
                  }}
                >
                  <div className={`grade-circle grade-${h.grade}`}>
                    {h.grade}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>
                      {h.title}
                    </div>
                    <div className="small muted">
                      {h.subject} ·{' '}
                      {h.gradedAt ? fmtDate(h.gradedAt) : '—'}
                    </div>
                  </div>
                </div>
              ))
            )}
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