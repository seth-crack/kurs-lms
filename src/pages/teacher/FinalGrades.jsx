import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUsers } from '../../store/useUsers';
import { useGroups } from '../../store/useGroups';
import { useHomework } from '../../store/useHomework';
import { useFinalGrades } from '../../store/useFinalGrades';
import { useUI } from '../../store/useUI';
import { SUBJECTS } from '../../data/mock';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Empty from '../../ui/Empty';
import Tabs from '../../ui/Tabs';

const PERIODS = ['I четверть', 'II четверть', 'III четверть', 'IV четверть', 'Год'];

export default function TeacherFinalGrades() {
  const teacher = useAuth((s) => s.user);
  const users = useUsers((s) => s.users);
  const groups = useGroups((s) => s.groups);
  const homework = useHomework((s) => s.items);
  const finalGrades = useFinalGrades((s) => s.items);
  const refresh = useFinalGrades((s) => s.refresh);
  const upsert = useFinalGrades((s) => s.upsert);
  const toast = useUI((s) => s.toast);

  const [period, setPeriod] = useState('I четверть');
  const [subject, setSubject] = useState('Алгебра');
  const [groupId, setGroupId] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myStudents = users.filter(
    (u) => u.role === 'student' && u.teacher_id === teacher?.id
  );

  const myGroups = groups.filter((g) => g.teacher_id === teacher?.id);

  useEffect(() => {
    if (myGroups.length > 0 && !groupId) {
      setGroupId(myGroups[0].id);
    }
  }, [myGroups, groupId]);

  const activeStudents = useMemo(() => {
    if (groupId) {
      const g = myGroups.find((x) => x.id === groupId);
      if (!g) return myStudents;
      return myStudents.filter((s) => g.student_ids?.includes(s.id));
    }
    return myStudents;
  }, [groupId, myGroups, myStudents]);

  // Средний балл ученика по предмету (для подсказки)
  const getAvg = (studentId) => {
    const list = homework.filter(
      (h) =>
        h.student_ids?.includes(studentId) &&
        h.subject === subject &&
        h.grade != null
    );
    if (list.length === 0) return null;
    return (
      list.reduce((s, h) => s + h.grade, 0) / list.length
    ).toFixed(1);
  };

  const getFinal = (studentId) =>
    finalGrades.find(
      (g) =>
        g.student_id === studentId &&
        g.subject === subject &&
        g.period === period
    );

  const openEdit = (student) => {
    const existing = getFinal(student.id);
    setEditModal({
      student,
      grade: existing?.grade || '',
      comment: existing?.comment || '',
    });
  };

  const save = async () => {
    const g = Number(editModal.grade);
    if (!g || g < 2 || g > 5) {
      toast('warn', 'Оценка 2–5', '');
      return;
    }

    setSaving(true);
    await upsert({
      teacherId: teacher.id,
      studentId: editModal.student.id,
      subject,
      period,
      grade: g,
      comment: editModal.comment,
    });
    setSaving(false);
    setEditModal(null);
    toast('success', 'Оценка сохранена', `${editModal.student.name}: ${g}`);
  };

  const initials = (name) =>
    (name || '')
      .split(' ')
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const subjects = [...new Set([
    ...SUBJECTS,
  ])];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Итоговые оценки</div>
          <div className="page-sub">
            Оценки за четверть и год
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-3" style={{ gap: 12 }}>
          <Field label="Период">
            <select
              className="select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {PERIODS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="Предмет">
            <select
              className="select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Группа">
            <select
              className="select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              <option value="">Все ученики</option>
              {myGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Список */}
      {activeStudents.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="users"
            title="Нет учеников"
            desc="Пригласите учеников в разделе «Ученики»"
          />
        </div>
      ) : (
        <div className="card pad-0">
          {activeStudents.map((s) => {
            const avg = getAvg(s.id);
            const final = getFinal(s.id);

            return (
              <div
                key={s.id}
                className="row"
                style={{
                  gap: 12,
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <Avatar
                  short={initials(s.name)}
                  color={s.color || '#4F46E5'}
                  size="m"
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {s.name}
                  </div>
                  <div className="small muted">
                    {s.group_name || '—'}
                    {avg && ` · средний балл ${avg}`}
                  </div>
                </div>

                <button
                  onClick={() => openEdit(s)}
                  style={{
                    minWidth: 60,
                    height: 44,
                    borderRadius: 12,
                    border: '2px solid',
                    borderColor: final
                      ? `var(--grade-${final.grade}, var(--accent))`
                      : 'var(--border)',
                    background: final
                      ? `var(--grade-${final.grade}-soft, var(--accent-soft))`
                      : 'var(--surface)',
                    color: final
                      ? `var(--grade-${final.grade}, var(--accent))`
                      : 'var(--text-3)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 18,
                    transition: 'all .15s',
                  }}
                  title={final ? `Итог: ${final.grade}` : 'Поставить оценку'}
                >
                  {final ? final.grade : '—'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Модалка оценки */}
      {editModal && (
        <Modal
          open
          onClose={() => setEditModal(null)}
          title={`Итоговая оценка — ${editModal.student.name}`}
          footer={
            <>
              <Button onClick={() => setEditModal(null)}>Отмена</Button>
              <Button
                variant="primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Button>
            </>
          }
        >
          <div className="stack">
            <div className="row between small">
              <span className="muted">Предмет:</span>
              <b>{subject}</b>
            </div>
            <div className="row between small">
              <span className="muted">Период:</span>
              <b>{period}</b>
            </div>
            <div className="row between small">
              <span className="muted">Средний балл:</span>
              <b>{getAvg(editModal.student.id) || '—'}</b>
            </div>

            <div className="divider" />

            <Field label="Оценка (2–5)">
              <div className="row" style={{ gap: 8 }}>
                {[2, 3, 4, 5].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setEditModal({ ...editModal, grade: g })}
                    className={`grade-circle grade-${g}`}
                    style={{
                      width: 52,
                      height: 52,
                      fontSize: 20,
                      border:
                        Number(editModal.grade) === g
                          ? '3px solid currentColor'
                          : '3px solid transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Комментарий">
              <textarea
                className="textarea"
                placeholder="Комментарий к итоговой оценке…"
                value={editModal.comment}
                onChange={(e) =>
                  setEditModal({ ...editModal, comment: e.target.value })
                }
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}