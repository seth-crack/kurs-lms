import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import { useHomework } from '../../store/useHomework';
import { useUsers } from '../../store/useUsers';
import { fmtRelative, fmtDate } from '../../lib/time';
import { useDraft } from '../../features/drafts/useDraft';
import DraftIndicator from '../../features/drafts/DraftIndicator';
import { clearDraft } from '../../lib/draft';
import { uploadFiles, downloadFile } from '../../lib/upload';

import Badge from '../../ui/Badge';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Field from '../../ui/Field';
import Modal from '../../ui/Modal';
import Empty from '../../ui/Empty';
import Tabs from '../../ui/Tabs';
import { CardSkeleton } from '../../ui/Skeleton';

export default function StudentHomework() {
  const user = useAuth((s) => s.user);
  const items = useHomework((s) => s.items);
  const update = useHomework((s) => s.update);
  const users = useUsers((s) => s.users);
  const refresh = useHomework((s) => s.refresh);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const load = async () => {
      await refresh();
      setLoading(false);
    };
    load();
  }, [refresh]);

  const my = useMemo(
    () => items.filter((h) => h.student_ids?.includes(user.id)),
    [items, user.id]
  );

  const filtered = useMemo(() => {
    return my.filter((h) => {
      const matchFilter = filter === 'all' || h.status === filter;
      const query = q.trim().toLowerCase();
      const matchQ =
        !query ||
        h.title.toLowerCase().includes(query) ||
        h.subject.toLowerCase().includes(query);
      return matchFilter && matchQ;
    });
  }, [my, filter, q]);

  const current = items.find((h) => h.id === openId);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Домашние задания</div>
          <div className="page-sub">
            Все задания от ваших преподавателей
          </div>
        </div>
      </div>

      <div
        className="row"
        style={{ marginBottom: 16, gap: 10, flexWrap: 'wrap' }}
      >
        <div
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 200,
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
            placeholder="Поиск по заданиям…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={[
          { value: 'all', label: 'Все' },
          { value: 'new', label: 'Новые' },
          { value: 'in_progress', label: 'В процессе' },
          { value: 'submitted', label: 'Отправленные' },
          { value: 'graded', label: 'Проверенные' },
          { value: 'overdue', label: 'Просроченные' },
        ]}
      />

      {loading ? (
        <div className="stack">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="file-text"
            title={
              my.length === 0 ? 'Заданий пока нет' : 'Ничего не найдено'
            }
            desc={
              my.length === 0
                ? 'Когда учитель назначит задание — оно появится здесь'
                : 'Попробуйте изменить фильтр или поиск'
            }
          />
        </div>
      ) : (
        <div className="card pad-0">
          {filtered.map((h) => {
            const t = users.find((u) => u.id === h.teacher_id);
            const deadlineTs = h.deadline
              ? new Date(h.deadline).getTime()
              : 0;
            const overdue =
              deadlineTs < Date.now() && h.status !== 'graded';
            return (
              <div
                key={h.id}
                className="hw-row"
                onClick={() => setOpenId(h.id)}
              >
                <div
                  className="hw-ic"
                  style={
                    h.status === 'overdue'
                      ? {
                          background: 'var(--danger-soft)',
                          color: 'var(--danger)',
                        }
                      : undefined
                  }
                >
                  <Icon
                    name={
                      h.status === 'graded' ? 'check-circle-2' : 'file-text'
                    }
                    size={17}
                  />
                </div>

                <div className="hw-body">
                  <div className="row between" style={{ gap: 10 }}>
                    <div className="hw-title">{h.title}</div>
                    {h.grade != null && (
                      <div
                        className={`grade-circle grade-${h.grade}`}
                        style={{ width: 32, height: 32, fontSize: 13 }}
                      >
                        {h.grade}
                      </div>
                    )}
                  </div>

                  <div className="hw-meta">
                    <span>{h.subject}</span>
                    {t && (
                      <>
                        <span>·</span>
                        <span>{t.name}</span>
                      </>
                    )}
                    <span>·</span>
                    <span
                      style={{
                        color: overdue ? 'var(--danger)' : 'inherit',
                      }}
                    >
                      <Icon name="clock" size={11} />{' '}
                      {fmtRelative(deadlineTs)}
                    </span>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <Badge status={h.status} />
                  </div>
                </div>

                <Icon
                  name="chevron-right"
                  size={18}
                  style={{ color: 'var(--text-3)', alignSelf: 'center' }}
                />
              </div>
            );
          })}
        </div>
      )}

      {current && (
        <HomeworkDetail
          key={current.id}
          hw={current}
          onClose={() => setOpenId(null)}
          onUpdate={update}
          teacher={users.find((u) => u.id === current.teacher_id) || null}
        />
      )}
    </>
  );
}

/* ============================================================
   Модалка задания
   ============================================================ */
function HomeworkDetail({ hw, onClose, onUpdate, teacher }) {
  const toast = useUI((s) => s.toast);
  const isGraded = hw.status === 'graded';
  const isSubmitted = hw.status === 'submitted';

  const draft = useDraft(
    hw.id,
    { answer: hw.answer || '', files: hw.answer_files || [] },
    !isGraded,
    2000
  );

  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;
    setUploading(true);
    const uploaded = await uploadFiles(list, 'answers');
    draft.setFiles((arr) => [...arr, ...uploaded]);
    setUploading(false);
  };

  const removeFile = (i) => {
    draft.setFiles((arr) => arr.filter((_, j) => j !== i));
  };

  const submit = async () => {
    if (!draft.answer.trim() && draft.files.length === 0) {
      toast('warn', 'Пустой ответ', 'Введите текст или прикрепите файл');
      return;
    }
    setSending(true);
    await onUpdate(hw.id, {
      answer: draft.answer.trim(),
      answer_files: draft.files,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
    clearDraft(hw.id);
    setSending(false);
    setSaved(true);
    toast(
      'success',
      'Задание отправлено',
      teacher ? `${teacher.name} получил вашу работу` : 'Работа отправлена'
    );
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const deadlineTs = hw.deadline ? new Date(hw.deadline).getTime() : 0;

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Задание"
      footer={
        <>
          <Button onClick={onClose}>Закрыть</Button>
          {!isGraded && (
            <Button
              variant="primary"
              onClick={submit}
              disabled={sending || uploading}
            >
              {sending
                ? 'Отправка…'
                : isSubmitted
                ? 'Отправить заново'
                : 'Отправить задание'}
            </Button>
          )}
        </>
      }
    >
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 650, fontSize: 16 }}>{hw.title}</div>
          <div className="small muted" style={{ marginTop: 2 }}>
            {hw.subject}
            {teacher ? ` · ${teacher.name}` : ''}
          </div>
        </div>
        <Badge status={hw.status} />
      </div>

      <div
        className="row"
        style={{ gap: 16, marginBottom: 14, flexWrap: 'wrap' }}
      >
        <div className="small">
          <span className="muted">Дедлайн: </span>
          <b
            style={{
              color: deadlineTs < Date.now() ? 'var(--danger)' : 'inherit',
            }}
          >
            {fmtRelative(deadlineTs)}
          </b>
        </div>
        {hw.submitted_at && (
          <div className="small">
            <span className="muted">Отправлено: </span>
            <b>{fmtRelative(new Date(hw.submitted_at).getTime())}</b>
          </div>
        )}
      </div>

      <div
        className="card"
        style={{ background: 'var(--surface-2)', marginBottom: 14 }}
      >
        <div
          className="small muted"
          style={{ marginBottom: 6, fontWeight: 600 }}
        >
          Описание
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          {hw.description}
        </div>
      </div>

      {hw.attachments?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            className="small muted"
            style={{ marginBottom: 6, fontWeight: 600 }}
          >
            Файлы от учителя
          </div>
          {hw.attachments.map((f, i) => (
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
                  name={f.type === 'pdf' ? 'file-text' : 'paperclip'}
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

      {isGraded && (
        <div
          className="row"
          style={{ gap: 12, alignItems: 'flex-start', marginBottom: 14 }}
        >
          <div
            className={`grade-circle grade-${hw.grade}`}
            style={{ width: 52, height: 52, fontSize: 18 }}
          >
            {hw.grade}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>
              Оценка преподавателя
            </div>
            <div
              className="small muted"
              style={{ marginTop: 4, lineHeight: 1.5 }}
            >
              {hw.comment || 'Без комментария'}
            </div>
            {hw.graded_at && (
              <div className="small muted" style={{ marginTop: 6 }}>
                {fmtDate(new Date(hw.graded_at).getTime())}
              </div>
            )}
          </div>
        </div>
      )}

      <Field
        label="Ваш ответ"
        hint={
          isGraded
            ? 'Работа проверена — редактирование недоступно'
            : 'Черновик сохраняется автоматически'
        }
      >
        <textarea
          className="textarea"
          placeholder="Введите ответ…"
          value={draft.answer}
          onChange={(e) => draft.setAnswer(e.target.value)}
          disabled={isGraded}
        />
      </Field>

      {!isGraded && (
        <DraftIndicator
          status={draft.status}
          lastSavedAt={draft.lastSavedAt}
          onClear={draft.clear}
        />
      )}

      {!isGraded && (
        <div style={{ marginTop: 12 }}>
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
            {uploading ? 'Загрузка…' : 'Прикрепить файл'}
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFiles}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {draft.files.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {draft.files.map((f, i) => (
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
              {!isGraded && (
                <button
                  className="icon-btn"
                  onClick={() => removeFile(i)}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {saved && (
        <div
          className="card"
          style={{
            marginTop: 14,
            background: 'var(--success-soft)',
            borderColor: 'var(--success)',
            color: 'var(--success)',
          }}
        >
          <div className="row" style={{ gap: 8 }}>
            <Icon name="check-circle-2" size={16} />
            <b>Задание отправлено</b>
          </div>
        </div>
      )}
    </Modal>
  );
}