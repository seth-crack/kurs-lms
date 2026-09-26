import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useSchedule } from '../../store/useSchedule';
import { useUI } from '../../store/useUI';
import { SUBJECTS } from '../../data/mock';

import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Empty from '../../ui/Empty';

const DAYS = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export default function TeacherSchedule() {
  const teacher = useAuth((s) => s.user);
  const items = useSchedule((s) => s.items);
  const refresh = useSchedule((s) => s.refresh);
  const add = useSchedule((s) => s.add);
  const update = useSchedule((s) => s.update);
  const remove = useSchedule((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);

  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    subject: 'Математика',
    day: 0,
    time: '18:00',
    dur: '60 мин',
    room: '',
    group_name: '',
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  const myLessons = items.filter((l) => l.teacher_id === teacher?.id);

  const openCreate = (day = 0) => {
    setForm({
      subject: 'Математика',
      day,
      time: '18:00',
      dur: '60 мин',
      room: '',
      group_name: '',
    });
    setEditModal({ isNew: true });
  };

  const openEdit = (lesson) => {
    setForm({
      subject: lesson.subject,
      day: lesson.day,
      time: lesson.time,
      dur: lesson.dur || '60 мин',
      room: lesson.room || '',
      group_name: lesson.group_name || '',
    });
    setEditModal({ isNew: false, id: lesson.id });
  };

  const save = async () => {
    if (!form.subject.trim()) {
      toast('warn', 'Укажите предмет', '');
      return;
    }

    setSaving(true);

    if (editModal.isNew) {
      await add({
        teacher_id: teacher.id,
        subject: form.subject,
        day: form.day,
        time: form.time,
        dur: form.dur,
        room: form.room,
        group_name: form.group_name,
      });
      toast('success', 'Занятие добавлено', form.subject);
    } else {
      await update(editModal.id, form);
      toast('success', 'Занятие обновлено', form.subject);
    }

    setSaving(false);
    setEditModal(null);
  };

  const handleRemove = (lesson) => {
    askConfirm({
      title: 'Удалить занятие?',
      desc: `${lesson.subject} · ${DAYS[lesson.day]} в ${lesson.time}`,
      confirmText: 'Удалить',
      danger: true,
      onConfirm: async () => {
        await remove(lesson.id);
        toast('success', 'Занятие удалено', lesson.subject);
      },
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Расписание</div>
          <div className="page-sub">Ваши занятия на неделю</div>
        </div>
        <Button variant="primary" icon="plus" onClick={() => openCreate(0)}>
          Добавить занятие
        </Button>
      </div>

      <div className="card pad-0">
        {DAYS.map((day, i) => {
          const dayLessons = myLessons.filter((l) => l.day === i);
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
                <div className="row" style={{ gap: 8 }}>
                  <div className="small muted">
                    {dayLessons.length} занятий
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => openCreate(i)}
                    title="Добавить"
                  >
                    <Icon name="plus" size={14} />
                  </button>
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
                dayLessons.map((l) => (
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
                        background: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                        {l.subject}
                      </div>
                      <div className="small muted">
                        {l.group_name || '—'} · {l.room || '—'} · {l.dur}
                      </div>
                    </div>
                    <button
                      className="icon-btn"
                      onClick={() => openEdit(l)}
                      title="Изменить"
                    >
                      <Icon name="edit-2" size={14} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleRemove(l)}
                      title="Удалить"
                    >
                      <Icon name="trash-2" size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {myLessons.length === 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <Empty
            icon="calendar"
            title="Ваше расписание пустое"
            desc="Добавьте первое занятие — ученики увидят его в своём расписании"
            action={
              <Button
                variant="primary"
                icon="plus"
                onClick={() => openCreate(0)}
                style={{ marginTop: 8 }}
              >
                Добавить занятие
              </Button>
            }
          />
        </div>
      )}

      {editModal && (
        <Modal
          open
          onClose={() => setEditModal(null)}
          title={editModal.isNew ? 'Новое занятие' : 'Изменить занятие'}
          footer={
            <>
              <Button onClick={() => setEditModal(null)}>Отмена</Button>
              <Button
                variant="primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Сохранение…' : editModal.isNew ? 'Добавить' : 'Сохранить'}
              </Button>
            </>
          }
        >
          <div className="stack">
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

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="День">
                <select
                  className="select"
                  value={form.day}
                  onChange={(e) =>
                    setForm({ ...form, day: Number(e.target.value) })
                  }
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Время">
                <input
                  className="input"
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({ ...form, time: e.target.value })
                  }
                />
              </Field>
            </div>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Длительность">
                <select
                  className="select"
                  value={form.dur}
                  onChange={(e) =>
                    setForm({ ...form, dur: e.target.value })
                  }
                >
                  <option>45 мин</option>
                  <option>60 мин</option>
                  <option>90 мин</option>
                  <option>120 мин</option>
                </select>
              </Field>
              <Field label="Кабинет">
                <input
                  className="input"
                  placeholder="каб. 214"
                  value={form.room}
                  onChange={(e) =>
                    setForm({ ...form, room: e.target.value })
                  }
                />
              </Field>
            </div>

            <Field label="Группа">
              <input
                className="input"
                placeholder="10-А"
                value={form.group_name}
                onChange={(e) =>
                  setForm({ ...form, group_name: e.target.value })
                }
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}