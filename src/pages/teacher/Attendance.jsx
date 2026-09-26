import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUsers } from '../../store/useUsers';
import { useGroups } from '../../store/useGroups';
import { useAttendance } from '../../store/useAttendance';
import { useUI } from '../../store/useUI';
import { SUBJECTS } from '../../data/mock';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Empty from '../../ui/Empty';
import Progress from '../../ui/Progress';

export default function TeacherAttendance() {
  const teacher = useAuth((s) => s.user);
  const users = useUsers((s) => s.users);
  const groups = useGroups((s) => s.groups);
  const items = useAttendance((s) => s.items);
  const refresh = useAttendance((s) => s.refresh);
  const mark = useAttendance((s) => s.mark);
  const toast = useUI((s) => s.toast);

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [subject, setSubject] = useState('Математика');
  const [groupId, setGroupId] = useState('');
  const [saving, setSaving] = useState({});

  useEffect(() => {
    refresh();
  }, [refresh]);

  const myStudents = users.filter(
    (u) => u.role === 'student' && u.teacher_id === teacher?.id
  );

  const myGroups = groups.filter((g) => g.teacher_id === teacher?.id);

  // Выбор группы по умолчанию
  useEffect(() => {
    if (myGroups.length > 0 && !groupId) {
      setGroupId(myGroups[0].id);
    }
  }, [myGroups, groupId]);

  // Ученики выбранной группы (или все, если группа не выбрана)
  const activeStudents = useMemo(() => {
    if (groupId) {
      const g = myGroups.find((x) => x.id === groupId);
      if (!g) return myStudents;
      return myStudents.filter((s) => g.student_ids?.includes(s.id));
    }
    return myStudents;
  }, [groupId, myGroups, myStudents]);

  // Отметка для ученика
  const getMark = (studentId) =>
    items.find(
      (a) =>
        a.student_id === studentId &&
        a.lesson_date === date &&
        a.subject === subject
    );

  const handleMark = async (studentId, present) => {
    setSaving((s) => ({ ...s, [studentId]: true }));
    await mark({
      teacherId: teacher.id,
      studentId,
      lessonDate: date,
      subject,
      present,
    });
    setSaving((s) => ({ ...s, [studentId]: false }));
  };

  const initials = (name) =>
    (name || '')
      .split(' ')
      .map((x) => x[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  // Статистика по текущему дню
  const dayRecords = items.filter(
    (a) => a.lesson_date === date && a.subject === subject
  );
  const presentCount = dayRecords.filter((a) => a.present).length;
  const totalMarked = dayRecords.length;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Посещаемость</div>
          <div className="page-sub">
            Отметьте, кто был на занятии
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-3" style={{ gap: 12 }}>
          <Field label="Дата занятия">
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <Field label="Предмет">
            <select
              className="select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {SUBJECTS.map((s) => (
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

        {totalMarked > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              className="row between small"
              style={{ marginBottom: 6 }}
            >
              <span className="muted">
                Отмечено: {presentCount} из {totalMarked} присутствовали
              </span>
              <span>
                {Math.round((presentCount / totalMarked) * 100)}%
              </span>
            </div>
            <Progress
              value={(presentCount / totalMarked) * 100}
              color="var(--success)"
            />
          </div>
        )}
      </div>

      {/* Список учеников */}
      {activeStudents.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="users"
            title="Нет учеников"
            desc={
              myStudents.length === 0
                ? 'Пригласите учеников в разделе «Ученики»'
                : 'В выбранной группе нет учеников'
            }
          />
        </div>
      ) : (
        <div className="card pad-0">
          {activeStudents.map((s) => {
            const record = getMark(s.id);
            const isPresent = record?.present === true;
            const isAbsent = record?.present === false;
            const isLoading = saving[s.id];

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
                    {s.group_name || 'Без группы'}
                  </div>
                </div>

                {/* Две кнопки: галочка и крестик */}
                <div className="row" style={{ gap: 8 }}>
                  <button
                    onClick={() => handleMark(s.id, true)}
                    disabled={isLoading}
                    title="Присутствовал"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: '2px solid',
                      borderColor: isPresent
                        ? 'var(--success)'
                        : 'var(--border)',
                      background: isPresent
                        ? 'var(--success-soft)'
                        : 'var(--surface)',
                      color: isPresent
                        ? 'var(--success)'
                        : 'var(--text-3)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: isLoading ? 'wait' : 'pointer',
                      transition: 'all .15s ease',
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    <Icon
                      name={isLoading && !isAbsent ? 'refresh-cw' : 'check'}
                      size={22}
                      strokeWidth={2.5}
                    />
                  </button>

                  <button
                    onClick={() => handleMark(s.id, false)}
                    disabled={isLoading}
                    title="Отсутствовал"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: '2px solid',
                      borderColor: isAbsent
                        ? 'var(--danger)'
                        : 'var(--border)',
                      background: isAbsent
                        ? 'var(--danger-soft)'
                        : 'var(--surface)',
                      color: isAbsent
                        ? 'var(--danger)'
                        : 'var(--text-3)',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: isLoading ? 'wait' : 'pointer',
                      transition: 'all .15s ease',
                      opacity: isLoading ? 0.5 : 1,
                    }}
                  >
                    <Icon name="x" size={22} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}