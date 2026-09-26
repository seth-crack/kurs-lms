import { useState, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUsers } from '../../store/useUsers';
import { useGroups } from '../../store/useGroups';
import { useHomework } from '../../store/useHomework';
import { useUI } from '../../store/useUI';
import { SUBJECTS } from '../../data/mock';
import { fmtRelative } from '../../lib/time';
import { uploadFiles } from '../../lib/upload';

import Avatar from '../../ui/Avatar';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Tabs from '../../ui/Tabs';
import Empty from '../../ui/Empty';

import CheckModal from './CheckModal';

export default function TeacherHomework() {
  const teacher = useAuth((s) => s.user);
  const users = useUsers((s) => s.users);
  const groups = useGroups((s) => s.groups);
  const items = useHomework((s) => s.items);
  const add = useHomework((s) => s.add);
  const loading = useHomework((s) => s.loading);
  const toast = useUI((s) => s.toast);

  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [checkId, setCheckId] = useState(null);

  const myStudents = users.filter(
    (u) => u.role === 'student' && u.teacher_id === teacher?.id
  );
  const myGroups = groups.filter((g) => g.teacher_id === teacher?.id);

  const my = useMemo(
    () => items.filter((h) => h.teacher_id === teacher?.id),
    [items, teacher?.id]
  );

  const toCheck = my.filter((h) => h.status === 'submitted');
  const graded = my.filter((h) => h.status === 'graded');

  const filtered = useMemo(() => {
    let list = my;
    if (tab === 'check') list = toCheck;
    else if (tab === 'graded') list = graded;

    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(query) ||
          h.subject.toLowerCase().includes(query)
      );
    }
    return list;
  }, [my, tab, q, toCheck, graded]);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Задания</div>
          <div className="page-sub">
            Создавайте задания и проверяйте работы
          </div>
        </div>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => setCreateOpen(true)}
          disabled={myStudents.length === 0}
        >
          Новое задание
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
          placeholder="Поиск…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'all', label: `Все (${my.length})` },
          { value: 'check', label: `На проверку (${toCheck.length})` },
          { value: 'graded', label: `Проверенные (${graded.length})` },
        ]}
      />

      {loading ? (
        <div className="card">
          <div
            className="small muted"
            style={{ padding: 20, textAlign: 'center' }}
          >
            Загрузка заданий…
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="file-text"
            title={tab === 'check' ? 'Всё проверено' : 'Заданий нет'}
            desc={
              tab === 'check'
                ? 'Новые работы появятся здесь'
                : 'Создайте первое задание'
            }
          />
        </div>
      ) : (
        <div className="card pad-0">
          {filtered.map((h) => {
            const students = (h.student_ids || [])
              .map((id) => users.find((u) => u.id === id))
              .filter(Boolean);
            const deadlineTs = h.deadline
              ? new Date(h.deadline).getTime()
              : 0;
            return (
              <div
                key={h.id}
                className="hw-row"
                onClick={() => {
                  if (h.status === 'submitted') setCheckId(h.id);
                }}
                style={{
                  cursor: h.status === 'submitted' ? 'pointer' : 'default',
                }}
              >
                <div
                  className="hw-ic"
                  style={
                    h.status === 'submitted'
                      ? {
                          background: 'var(--warning-soft)',
                          color: 'var(--warning)',
                        }
                      : undefined
                  }
                >
                  <Icon
                    name={h.status === 'submitted' ? 'inbox' : 'file-text'}
                    size={17}
                  />
                </div>

                <div className="hw-body">
                  <div className="hw-title">{h.title}</div>
                  <div className="hw-meta">
                    <span>{h.subject}</span>
                    <span>·</span>
                    <span>
                      {students.length}{' '}
                      {students.length === 1 ? 'ученик' : 'учеников'}
                    </span>
                    <span>·</span>
                    <span>дедлайн {fmtRelative(deadlineTs)}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Badge status={h.status} />
                  </div>
                </div>

                {h.status === 'submitted' && (
                  <Button size="sm" variant="primary">
                    Проверить
                  </Button>
                )}

                {h.status === 'graded' && (
                  <div
                    className={`grade-circle grade-${h.grade}`}
                    style={{ width: 36, height: 36, fontSize: 14 }}
                  >
                    {h.grade}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {createOpen && (
        <CreateModal
          onClose={() => setCreateOpen(false)}
          students={myStudents}
          groups={myGroups}
          onCreate={async (hw) => {
            const res = await add(hw);
            if (!res.ok) {
              toast('error', 'Ошибка', res.error);
              return;
            }
            setCreateOpen(false);
            toast(
              'success',
              'Задание опубликовано',
              `Отправлено ${hw.student_ids.length} ученикам`
            );
          }}
          teacherId={teacher.id}
        />
      )}

      {checkId && (
        <CheckModal id={checkId} onClose={() => setCheckId(null)} />
      )}
    </>
  );
}

/* ============================================================
   Модалка создания задания
   ============================================================ */
function CreateModal({ onClose, onCreate, students, groups, teacherId }) {
  const [form, setForm] = useState({
    title: '',
    subject: 'Математика',
    description: '',
    target: '',
    deadline: '',
    attachments: [],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;

    setUploading(true);
    const uploaded = await uploadFiles(list, 'attachments');
    setForm((f) => ({ ...f, attachments: [...f.attachments, ...uploaded] }));
    setUploading(false);
  };

  const removeFile = (i) => {
    setForm((f) => ({
      ...f,
      attachments: f.attachments.filter((_, j) => j !== i),
    }));
  };

  const publish = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.deadline) {
      alert('Заполните название, описание и дедлайн');
      return;
    }

    let student_ids = [];
    if (form.target.startsWith('group_')) {
      const gid = form.target.replace('group_', '');
      const g = groups.find((x) => x.id === gid);
      student_ids = g ? [...g.student_ids] : [];
    } else if (form.target.startsWith('student_')) {
      student_ids = [form.target.replace('student_', '')];
    }

    if (student_ids.length === 0) {
      alert('Выберите группу или ученика');
      return;
    }

    setSaving(true);

    const hw = {
      teacher_id: teacherId,
      student_ids,
      title: form.title.trim(),
      subject: form.subject,
      description: form.description.trim(),
      deadline: new Date(form.deadline).toISOString(),
      status: 'new',
      attachments: form.attachments,
      materials: [],
      answer_files: [],
      grade: null,
    };

    await onCreate(hw);
    setSaving(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Новое задание"
      footer={
        <>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            onClick={publish}
            disabled={saving || uploading}
          >
            {saving ? 'Публикация…' : 'Опубликовать'}
          </Button>
        </>
      }
    >
      <div className="stack">
        <Field label="Название">
          <input
            className="input"
            placeholder="Квадратные уравнения"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>

        <div className="grid cols-2" style={{ gap: 12 }}>
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
          <Field label="Дедлайн">
            <input
              className="input"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) =>
                setForm({ ...form, deadline: e.target.value })
              }
            />
          </Field>
        </div>

        <Field label="Описание">
          <textarea
            className="textarea"
            placeholder="Опишите задание…"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </Field>

        <Field label="Кому отправить">
          <select
            className="select"
            value={form.target}
            onChange={(e) => setForm({ ...form, target: e.target.value })}
          >
            <option value="">— выберите —</option>
            {groups.length > 0 && (
              <optgroup label="Группы">
                {groups.map((g) => (
                  <option key={g.id} value={'group_' + g.id}>
                    {g.name} · {g.subject} ({g.student_ids?.length || 0} чел.)
                  </option>
                ))}
              </optgroup>
            )}
            <optgroup label="Ученики">
              {students.map((s) => (
                <option key={s.id} value={'student_' + s.id}>
                  {s.name} {s.group_name ? '· ' + s.group_name : ''}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>

        <div>
          <label
            className="btn"
            style={{
              cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Icon
              name={uploading ? 'refresh-cw' : 'paperclip'}
              size={14}
            />
            {uploading ? 'Загрузка…' : 'Прикрепить файлы'}
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFiles}
              disabled={uploading}
            />
          </label>

          {form.attachments.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {form.attachments.map((f, i) => (
                <div
                  key={i}
                  className="row"
                  style={{
                    gap: 10,
                    padding: '8px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  <Icon name="file-text" size={14} />
                  <div style={{ flex: 1, fontSize: 13 }}>{f.name}</div>
                  <span className="small muted">{f.size}</span>
                  <button
                    className="icon-btn"
                    onClick={() => removeFile(i)}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}