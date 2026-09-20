import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import { GROUPS, STUDENTS, studentById } from '../../data/mock';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Modal from '../../ui/Modal';

export default function TeacherGroups() {
  const user = useAuth((s) => s.user);
  const toast = useUI((s) => s.toast);
  const [createOpen, setCreateOpen] = useState(false);

  const myGroups = GROUPS.filter((g) => g.teacher === user.id);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Группы</div>
          <div className="page-sub">
            Управление группами и назначение заданий
          </div>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => setCreateOpen(true)}
        >
          Создать группу
        </Button>
      </div>

      <div className="grid cols-2">
        {myGroups.map((g) => {
          const students = g.students
            .map((id) => studentById(id))
            .filter(Boolean);

          return (
            <div key={g.id} className="card">
              <div
                className="row between"
                style={{ marginBottom: 12 }}
              >
                <div>
                  <div style={{ fontWeight: 650, fontSize: 15 }}>
                    {g.name} · {g.subject}
                  </div>
                  <div className="small muted">
                    {students.length} учеников
                  </div>
                </div>
              </div>

              <div className="stack" style={{ gap: 8 }}>
                {students.map((s) => (
                  <div
                    key={s.id}
                    className="row"
                    style={{ gap: 8 }}
                  >
                    <Avatar short={s.short} color={s.color} size="s" />
                    <span style={{ fontSize: 13 }}>{s.name}</span>
                    <span
                      className="small muted"
                      style={{ marginLeft: 'auto' }}
                    >
                      {s.avg}
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="row" style={{ gap: 8 }}>
                <Button
                  size="sm"
                  icon="plus"
                  onClick={() =>
                    toast(
                      'info',
                      'Добавить ученика',
                      'Функция появится в следующем спринте'
                    )
                  }
                >
                  Добавить
                </Button>
                <Button size="sm" icon="file-text">
                  Задание группе
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {createOpen && (
        <Modal
          open
          onClose={() => setCreateOpen(false)}
          title="Новая группа"
          footer={
            <>
              <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setCreateOpen(false);
                  toast(
                    'success',
                    'Группа создана',
                    'Теперь можно добавлять учеников'
                  );
                }}
              >
                Создать
              </Button>
            </>
          }
        >
          <div className="stack">
            <Field label="Название">
              <input className="input" placeholder="10-В" />
            </Field>
            <Field label="Предмет">
              <select className="select">
                <option>Математика</option>
                <option>Русский язык</option>
                <option>Физика</option>
                <option>Английский язык</option>
                <option>Информатика</option>
              </select>
            </Field>
            <Field label="Ученики">
              <div
                className="stack"
                style={{
                  gap: 6,
                  maxHeight: 200,
                  overflow: 'auto',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                {STUDENTS.map((s) => (
                  <label
                    key={s.id}
                    className="row"
                    style={{ gap: 8, fontSize: 13, cursor: 'pointer' }}
                  >
                    <input type="checkbox" />
                    <Avatar short={s.short} color={s.color} size="s" />
                    {s.name}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}