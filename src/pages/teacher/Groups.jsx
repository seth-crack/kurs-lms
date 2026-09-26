import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUsers } from '../../store/useUsers';
import { useGroups } from '../../store/useGroups';
import { useUI } from '../../store/useUI';
import { SUBJECTS } from '../../data/mock';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Empty from '../../ui/Empty';

export default function TeacherGroups() {
  const teacher = useAuth((s) => s.user);
  const users = useUsers((s) => s.users);
  const groups = useGroups((s) => s.groups);
  const refreshGroups = useGroups((s) => s.refresh);
  const addGroup = useGroups((s) => s.add);
  const updateGroup = useGroups((s) => s.update);
  const removeGroup = useGroups((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);

  const [createOpen, setCreateOpen] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    subject: 'Математика',
    student_ids: [],
  });

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  const myGroups = groups.filter((g) => g.teacher_id === teacher?.id);

  const myStudents = users.filter(
    (u) => u.role === 'student' && u.teacher_id === teacher?.id
  );

  const openCreate = () => {
    setForm({ name: '', subject: 'Математика', student_ids: [] });
    setCreateOpen(true);
  };

  const openEdit = (g) => {
    setForm({
      name: g.name,
      subject: g.subject,
      student_ids: g.student_ids || [],
    });
    setEditGroup(g);
  };

  const toggleStudent = (id) => {
    setForm((f) => ({
      ...f,
      student_ids: f.student_ids.includes(id)
        ? f.student_ids.filter((x) => x !== id)
        : [...f.student_ids, id],
    }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast('warn', 'Укажите название', '');
      return;
    }

    setSaving(true);

    if (editGroup) {
      await updateGroup(editGroup.id, {
        name: form.name.trim(),
        subject: form.subject,
        student_ids: form.student_ids,
      });
      toast('success', 'Группа обновлена', form.name);
      setEditGroup(null);
    } else {
      await addGroup({
        teacher_id: teacher.id,
        name: form.name.trim(),
        subject: form.subject,
        student_ids: form.student_ids,
      });
      toast('success', 'Группа создана', form.name);
      setCreateOpen(false);
    }
    setSaving(false);
  };

  const handleRemove = (g) => {
    askConfirm({
      title: `Удалить группу "${g.name}"?`,
      desc: 'Ученики останутся, но группа исчезнет.',
      confirmText: 'Удалить',
      danger: true,
      onConfirm: async () => {
        await removeGroup(g.id);
        toast('success', 'Группа удалена', g.name);
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
          <div className="page-title">Группы</div>
          <div className="page-sub">
            {myGroups.length === 0
              ? 'Создайте группу и добавьте в неё учеников'
              : `Ваших групп: ${myGroups.length}`}
          </div>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={openCreate}
          disabled={myStudents.length === 0}
        >
          Создать группу
        </Button>
      </div>

      {myStudents.length === 0 && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            background: 'var(--warning-soft)',
            borderColor: 'var(--warning)',
            color: 'var(--warning)',
            fontSize: 13,
          }}
        >
          <div className="row" style={{ gap: 8 }}>
            <Icon name="info" size={14} />
            Сначала пригласите учеников в разделе «Ученики»
          </div>
        </div>
      )}

      {myGroups.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="layers"
            title="Групп пока нет"
            desc="Создайте группу — например, «10-А Математика» — и добавьте туда учеников"
            action={
              myStudents.length > 0 && (
                <Button
                  variant="primary"
                  icon="plus"
                  onClick={openCreate}
                  style={{ marginTop: 8 }}
                >
                  Создать группу
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid cols-2">
          {myGroups.map((g) => {
            const students = (g.student_ids || [])
              .map((id) => users.find((u) => u.id === id))
              .filter(Boolean);
            return (
              <div key={g.id} className="card">
                <div className="row between" style={{ marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 650, fontSize: 15 }}>
                      {g.name}
                    </div>
                    <div className="small muted">
                      {g.subject} · {students.length} учеников
                    </div>
                  </div>
                  <button className="icon-btn" onClick={() => openEdit(g)}>
                    <Icon name="edit-2" size={15} />
                  </button>
                </div>

                {students.length === 0 ? (
                  <div
                    className="small muted"
                    style={{ padding: '12px 0' }}
                  >
                    В группе пока никого
                  </div>
                ) : (
                  <div className="stack" style={{ gap: 8 }}>
                    {students.map((s) => (
                      <div key={s.id} className="row" style={{ gap: 8 }}>
                        <Avatar
                          short={initials(s.name)}
                          color={s.color || '#4F46E5'}
                          size="s"
                        />
                        <span style={{ fontSize: 13 }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="divider" />

                <div className="row" style={{ gap: 8 }}>
                  <Button
                    size="sm"
                    icon="edit-2"
                    onClick={() => openEdit(g)}
                  >
                    Изменить
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon="trash"
                    onClick={() => handleRemove(g)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(createOpen || editGroup) && (
        <Modal
          open
          onClose={() => {
            setCreateOpen(false);
            setEditGroup(null);
          }}
          title={editGroup ? 'Редактирование группы' : 'Новая группа'}
          footer={
            <>
              <Button
                onClick={() => {
                  setCreateOpen(false);
                  setEditGroup(null);
                }}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Сохранение…' : editGroup ? 'Сохранить' : 'Создать'}
              </Button>
            </>
          }
        >
          <div className="stack">
            <Field label="Название">
              <input
                className="input"
                placeholder="10-А Математика"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </Field>
            <Field label="Предмет">
              <select
                className="select"
                value={form.subject}
                onChange={(e) =>
                  setForm({ ...form, subject: e.target.value })
                }
              >
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Ученики">
              {myStudents.length === 0 ? (
                <div className="small muted">У вас пока нет учеников</div>
              ) : (
                <div
                  className="stack"
                  style={{
                    gap: 6,
                    maxHeight: 220,
                    overflow: 'auto',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  {myStudents.map((s) => (
                    <label
                      key={s.id}
                      className="row"
                      style={{
                        gap: 8,
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.student_ids.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                      />
                      <Avatar
                        short={initials(s.name)}
                        color={s.color || '#4F46E5'}
                        size="s"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}