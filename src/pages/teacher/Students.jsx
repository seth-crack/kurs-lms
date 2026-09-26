import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUsers } from '../../store/useUsers';
import { useHomework } from '../../store/useHomework';
import { useUI } from '../../store/useUI';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Progress from '../../ui/Progress';
import Empty from '../../ui/Empty';

export default function TeacherStudents() {
  const teacher = useAuth((s) => s.user);
  const users = useUsers((s) => s.users);
  const refresh = useUsers((s) => s.refresh);
  const removeUser = useUsers((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);
  const items = useHomework((s) => s.items);

  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Автообновление при заходе на страницу
  useEffect(() => {
    refresh();
  }, [refresh]);

  const students = useMemo(
    () =>
      users.filter(
        (u) => u.role === 'student' && u.teacher_id === teacher?.id
      ),
    [users, teacher?.id]
  );

  const filtered = students.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(q.toLowerCase()) ||
      (s.group_name || '').toLowerCase().includes(q.toLowerCase())
  );

  const student = openId ? students.find((s) => s.id === openId) : null;

  const studentHw = student
    ? items.filter(
        (h) => h.student_ids?.includes(student.id) && h.grade != null
      )
    : [];

  const inviteUrl = `${window.location.origin}/?teacher=${teacher?.id || ''}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast('success', 'Ссылка скопирована', 'Отправьте её ученикам');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast('error', 'Не удалось скопировать', 'Скопируйте вручную');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
    toast('info', 'Список обновлён', '');
  };

  const handleRemove = (s) => {
    askConfirm({
      title: `Удалить ${s.name}?`,
      desc: 'Ученик больше не сможет войти в систему.',
      confirmText: 'Удалить',
      danger: true,
      onConfirm: async () => {
        await removeUser(s.id);
        setOpenId(null);
        toast('success', 'Ученик удалён', s.name);
      },
    });
  };

  const initials = (name) =>
    (name || '')
      .split(' ')
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Ученики</div>
          <div className="page-sub">
            {students.length === 0
              ? 'Пригласите первого ученика по ссылке'
              : `Ваших учеников: ${students.length}`}
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Button
            icon="refresh-cw"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Обновление…' : 'Обновить'}
          </Button>
          <Button
            variant="primary"
            icon={copied ? 'check' : 'copy'}
            onClick={copyLink}
          >
            {copied ? 'Скопировано' : 'Ссылка-приглашение'}
          </Button>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginBottom: 16,
          background: 'var(--accent-soft)',
          borderColor: 'var(--accent)',
        }}
      >
        <div className="row" style={{ gap: 10, marginBottom: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="link" size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Как добавить учеников
            </div>
            <div
              className="small muted"
              style={{ marginTop: 2, lineHeight: 1.5 }}
            >
              Отправьте ученикам ссылку ниже. Они зарегистрируются сами и
              автоматически привяжутся к вам.
            </div>
          </div>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12.5,
            fontFamily: 'ui-monospace, monospace',
            wordBreak: 'break-all',
          }}
        >
          {inviteUrl}
        </div>
      </div>

      {students.length > 0 && (
        <div
          style={{
            position: 'relative',
            marginBottom: 16,
            maxWidth: 320,
          }}
        >
          <Icon
            name="search"
            size={15}
            style={{
              position: 'absolute',
              left: 11,
              top: 11,
              color: 'var(--text-3)',
            }}
          />
          <input
            className="input"
            style={{ paddingLeft: 34 }}
            placeholder="Поиск по имени или группе…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

      {students.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="users"
            title="Учеников пока нет"
            desc="Скопируйте ссылку-приглашение выше и отправьте её ученикам. Они появятся здесь после регистрации."
            action={
              <Button
                variant="primary"
                icon={copied ? 'check' : 'copy'}
                onClick={copyLink}
                style={{ marginTop: 8 }}
              >
                {copied ? 'Скопировано' : 'Скопировать ссылку'}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="card pad-0">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Группа</th>
                  <th>Прогресс</th>
                  <th>Средний балл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const sHw = items.filter((h) =>
                    h.student_ids?.includes(s.id)
                  );
                  const sGraded = sHw.filter((h) => h.grade != null);
                  const sAvg = sGraded.length
                    ? (
                        sGraded.reduce((a, h) => a + h.grade, 0) /
                        sGraded.length
                      ).toFixed(1)
                    : '—';
                  const done = sHw.filter((h) => h.status === 'graded').length;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setOpenId(s.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="row" style={{ gap: 10 }}>
                          <Avatar
                            short={initials(s.name)}
                            color={s.color || '#4F46E5'}
                            size="m"
                          />
                          <div>
                            <div
                              style={{ fontWeight: 600, fontSize: 13.5 }}
                            >
                              {s.name}
                            </div>
                            <div className="small muted">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{s.group_name || '—'}</td>
                      <td style={{ minWidth: 140 }}>
                        <div
                          className="small muted"
                          style={{ marginBottom: 4 }}
                        >
                          {done}/{sHw.length || 0} заданий
                        </div>
                        <Progress
                          value={
                            sHw.length ? (done / sHw.length) * 100 : 0
                          }
                        />
                      </td>
                      <td>
                        <b>{sAvg}</b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {student && (
        <Modal
          open
          onClose={() => setOpenId(null)}
          wide
          title={student.name}
          footer={
            <>
              <Button
                variant="danger"
                icon="trash"
                onClick={() => handleRemove(student)}
              >
                Удалить
              </Button>
              <Button onClick={() => setOpenId(null)}>Закрыть</Button>
            </>
          }
        >
          <div className="row" style={{ gap: 14, marginBottom: 16 }}>
            <Avatar
              short={initials(student.name)}
              color={student.color || '#4F46E5'}
              size="l"
            />
            <div>
              <div style={{ fontWeight: 650, fontSize: 16 }}>
                {student.name}
              </div>
              <div className="small muted">
                {student.group_name || 'Без группы'} · {student.email}
              </div>
            </div>
          </div>

          <div
            className="grid cols-3"
            style={{ gap: 12, marginBottom: 16 }}
          >
            <div className="card stat">
              <div className="s-label">Средний балл</div>
              <div className="s-value">
                {studentHw.length
                  ? (
                      studentHw.reduce((a, h) => a + h.grade, 0) /
                      studentHw.length
                    ).toFixed(1)
                  : '—'}
              </div>
            </div>
            <div className="card stat">
              <div className="s-label">Оценок</div>
              <div className="s-value">{studentHw.length}</div>
            </div>
            <div className="card stat">
              <div className="s-label">Дата регистрации</div>
              <div className="s-value" style={{ fontSize: 13 }}>
                {student.created_at
                  ? new Date(student.created_at).toLocaleDateString('ru-RU')
                  : '—'}
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Последние оценки
          </div>
          {studentHw.length === 0 ? (
            <div className="small muted" style={{ marginBottom: 14 }}>
              Оценок пока нет
            </div>
          ) : (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead>
                <tr>
                  <th>Задание</th>
                  <th>Оценка</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {studentHw.slice(0, 5).map((h) => (
                  <tr key={h.id}>
                    <td>{h.title}</td>
                    <td>
                      <span
                        className={`grade-circle grade-${h.grade}`}
                        style={{ width: 30, height: 30, fontSize: 12 }}
                      >
                        {h.grade}
                      </span>
                    </td>
                    <td className="small muted">
                      {h.graded_at
                        ? new Date(h.graded_at).toLocaleDateString('ru-RU')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </>
  );
}