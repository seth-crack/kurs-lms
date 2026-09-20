import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import { SCHEDULE, teacherById } from '../../data/mock';

import Icon from '../../ui/Icon';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Modal from '../../ui/Modal';

const DAYS = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
];

export default function SchedulePage({ asTeacher = false }) {
  const user = useAuth((s) => s.user);
  const toast = useUI((s) => s.toast);
  const [editModal, setEditModal] = useState(null);

  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  const lessons =
    asTeacher && user?.id
      ? SCHEDULE.filter((l) => l.teacherId === user.id)
      : SCHEDULE;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Расписание</div>
          <div className="page-sub">
            {asTeacher ? 'Ваши занятия' : 'Занятия на эту неделю'}
          </div>
        </div>

        {asTeacher && (
          <Button
            variant="primary"
            icon="plus"
            onClick={() => setEditModal({})}
          >
            Добавить занятие
          </Button>
        )}
      </div>

      <div className="card pad-0">
        {DAYS.map((day, i) => {
          const dayLessons = lessons.filter((l) => l.day === i);
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
                  background: isToday ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                  {day}
                  {isToday && (
                    <span className="badge new" style={{ marginLeft: 8 }}>
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
                  const t = teacherById(l.teacherId);
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
                          {t?.name} · {l.group} · {l.room}
                        </div>
                      </div>

                      <div
                        className="small muted hide-mobile"
                        style={{ width: 60, textAlign: 'right' }}
                      >
                        {l.dur}
                      </div>

                      {asTeacher && (
                        <Button
                          size="sm"
                          onClick={() => setEditModal(l)}
                        >
                          Изменить
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      {editModal && (
        <Modal
          open
          onClose={() => setEditModal(null)}
          title={
            editModal.id ? 'Редактирование занятия' : 'Новое занятие'
          }
          footer={
            <>
              <Button onClick={() => setEditModal(null)}>Отмена</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setEditModal(null);
                  toast(
                    'success',
                    'Занятие сохранено',
                    'Изменения появятся в расписании'
                  );
                }}
              >
                Сохранить
              </Button>
            </>
          }
        >
          <div className="stack">
            <Field label="Предмет">
              <input
                className="input"
                defaultValue={editModal.subject || ''}
                placeholder="Математика"
              />
            </Field>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="День">
                <select
                  className="select"
                  defaultValue={editModal.day ?? 0}
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
                  defaultValue={editModal.time || '18:00'}
                />
              </Field>
            </div>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Группа">
                <input
                  className="input"
                  defaultValue={editModal.group || '10-А'}
                />
              </Field>
              <Field label="Кабинет">
                <input
                  className="input"
                  defaultValue={editModal.room || ''}
                  placeholder="каб. 214"
                />
              </Field>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}