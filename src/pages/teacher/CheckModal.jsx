import { useState } from 'react';
import { useUI } from '../../store/useUI';
import { useHomework } from '../../store/useHomework';
import { useUsers } from '../../store/useUsers';
import { fmtRelative } from '../../lib/time';
import { downloadFile } from '../../lib/upload';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';

export default function CheckModal({ id, onClose }) {
  const update = useHomework((s) => s.update);
  const items = useHomework((s) => s.items);
  const users = useUsers((s) => s.users);
  const toast = useUI((s) => s.toast);

  const hw = items.find((h) => h.id === id);

  const [grade, setGrade] = useState(hw?.grade ?? '');
  const [comment, setComment] = useState(hw?.comment || '');
  const [saving, setSaving] = useState(false);

  if (!hw) return null;

  const student = users.find((u) => u.id === hw.student_ids?.[0]);
  if (!student) return null;

  const save = async () => {
    const g = Number(grade);
    if (!g || g < 1 || g > 5) {
      toast('warn', 'Некорректная оценка', 'Введите число от 1 до 5');
      return;
    }

    setSaving(true);
    await update(hw.id, {
      grade: g,
      comment: comment.trim(),
      status: 'graded',
      graded_at: new Date().toISOString(),
    });

    setSaving(false);
    toast(
      'success',
      'Оценка сохранена',
      `${student.name}: ${g} — ${hw.title}`
    );
    onClose();
  };

  const submittedTs = hw.submitted_at
    ? new Date(hw.submitted_at).getTime()
    : null;

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Проверка работы"
      footer={
        <>
          <Button onClick={onClose}>Закрыть</Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить оценку'}
          </Button>
        </>
      }
    >
      <div className="row" style={{ gap: 12, marginBottom: 16 }}>
        <Avatar
          short={(student.name || '')
            .split(' ')
            .map((x) => x[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
          color={student.color}
          size="l"
        />
        <div>
          <div style={{ fontWeight: 650, fontSize: 16 }}>
            {student.name}
          </div>
          <div className="small muted">
            {student.group_name || '—'} · {student.email}
          </div>
          {submittedTs && (
            <div className="small muted" style={{ marginTop: 4 }}>
              Сдано {fmtRelative(submittedTs)}
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      <div style={{ marginBottom: 14 }}>
        <div
          className="small muted"
          style={{ marginBottom: 4, fontWeight: 600 }}
        >
          Задание
        </div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{hw.title}</div>
        <div className="small muted" style={{ marginTop: 2 }}>
          {hw.subject}
        </div>
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: 'var(--surface-2)',
            borderRadius: 8,
            fontSize: 13.5,
            lineHeight: 1.6,
          }}
        >
          {hw.description}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div
          className="small muted"
          style={{ marginBottom: 6, fontWeight: 600 }}
        >
          Ответ ученика
        </div>
        {hw.answer ? (
          <div
            className="card"
            style={{
              background: 'var(--surface-2)',
              fontSize: 13.5,
              lineHeight: 1.6,
            }}
          >
            {hw.answer}
          </div>
        ) : (
          <div className="small muted">Нет текстового ответа</div>
        )}
      </div>

      {hw.answer_files?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            className="small muted"
            style={{ marginBottom: 6, fontWeight: 600 }}
          >
            Прикреплённые файлы
          </div>
          {hw.answer_files.map((f, i) => (
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
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon
                  name={
                    f.type === 'pdf'
                      ? 'file-text'
                      : f.type === 'img'
                      ? 'image'
                      : 'file'
                  }
                  size={14}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {f.name}
                </div>
                <div className="small muted">{f.size}</div>
              </div>
              {f.url && (
                <Button
                  size="sm"
                  icon="download"
                  onClick={() => downloadFile(f.url, f.name)}
                >
                  Скачать
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="divider" />

      <div className="grid cols-2" style={{ gap: 12 }}>
        <Field label="Оценка (1–5)">
          <input
            className="input"
            type="number"
            min="1"
            max="5"
            placeholder="5"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
        </Field>
        <Field label="Дата сдачи">
          <input
            className="input"
            readOnly
            value={
              submittedTs
                ? new Date(submittedTs).toLocaleDateString('ru-RU')
                : '—'
            }
          />
        </Field>
      </div>

      <div style={{ marginTop: 12 }}>
        <Field label="Комментарий">
          <textarea
            className="textarea"
            placeholder="Что понравилось, что стоит доработать…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}