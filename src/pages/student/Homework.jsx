import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import { HOMEWORK, teacherById } from '../../data/mock';
import { fmtRelative } from '../../lib/time';
import { toFileMeta } from '../../lib/files';

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
  const toast = useUI((s) => s.toast);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  // локальное состояние домашних заданий (имитация базы)
  const [items, setItems] = useState(HOMEWORK);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const my = useMemo(
    () => items.filter((h) => h.studentIds.includes(user.id)),
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

  const updateHomework = (id, patch) => {
    setItems((arr) => arr.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

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

      {/* ----- Панель фильтров ----- */}
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

      {/* ----- Список ----- */}
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
            title="Ничего не найдено"
            desc="Попробуйте изменить фильтр или поисковый запрос"
          />
        </div>
      ) : (
        <div className="card pad-0">
          {filtered.map((h) => {
            const t = teacherById(h.teacherId);
            const overdue =
              h.deadline < Date.now() && h.status !== 'graded';
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
                  <div
                    className="row between"
                    style={{ gap: 10 }}
                  >
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
                    <span>·</span>
                    <span>{t?.name}</span>
                    <span>·</span>
                    <span
                      style={{
                        color: overdue ? 'var(--danger)' : 'inherit',
                      }}
                    >
                      <Icon name="clock" size={11} />{' '}
                      {fmtRelative(h.deadline)}
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

      {/* ----- Модалка деталей ----- */}
      {current && (
        <HomeworkDetail
          hw={current}
          onClose={() => setOpenId(null)}
          onUpdate={updateHomework}
          toast={toast}
        />
      )}
    </>
  );
}

/* ============================================================
   Модалка с деталями задания
   ============================================================ */
function HomeworkDetail({ hw, onClose, onUpdate, toast }) {
  const [answer, setAnswer] = useState(hw.answer || '');
  const [files, setFiles] = useState(hw.answerFiles || []);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);

  const teacher = teacherById(hw.teacherId);
  const isGraded = hw.status === 'graded';
  const isSubmitted = hw.status === 'submitted';

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    const metas = list.map((f) => {
      const m = toFileMeta(f);
      return { name: m.name, size: m.size, type: m.type };
    });
    setFiles((f) => [...f, ...metas]);
  };

  const removeFile = (i) => {
    setFiles((f) => f.filter((_, j) => j !== i));
  };

  const submit = () => {
    if (!answer.trim() && files.length === 0) {
      toast('warn', 'Пустой ответ', 'Введите текст или прикрепите файл');
      return;
    }
    setSending(true);
    setTimeout(() => {
      onUpdate(hw.id, {
        answer: answer.trim(),
        answerFiles: files,
        status: 'submitted',
        submittedAt: Date.now(),
      });
      setSending(false);
      setSaved(true);
      toast(
        'success',
        'Задание отправлено',
        `Преподаватель ${teacher?.name} получил вашу работу`
      );
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    }, 650);
  };

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
              disabled={sending}
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
      {/* ----- Заголовок ----- */}
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 650, fontSize: 16 }}>{hw.title}</div>
          <div className="small muted" style={{ marginTop: 2 }}>
            {hw.subject} · {teacher?.name}
          </div>
        </div>
        <Badge status={hw.status} />
      </div>

      {/* ----- Мета ----- */}
      <div
        className="row"
        style={{ gap: 16, marginBottom: 14, flexWrap: 'wrap' }}
      >
        <div className="small">
          <span className="muted">Дедлайн: </span>
          <b
            style={{
              color: hw.deadline < Date.now() ? 'var(--danger)' : 'inherit',
            }}
          >
            {fmtRelative(hw.deadline)}
          </b>
        </div>
        {hw.submittedAt && (
          <div className="small">
            <span className="muted">Отправлено: </span>
            <b>{fmtRelative(hw.submittedAt)}</b>
          </div>
        )}
      </div>

      {/* ----- Описание ----- */}
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
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{hw.desc}</div>
      </div>

      {/* ----- Файлы от учителя ----- */}
      {hw.attachments?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            className="small muted"
            style={{ marginBottom: 6, fontWeight: 600 }}
          >
            Файлы от преподавателя
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
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                <div className="small muted">{f.size}</div>
              </div>
              <Button size="sm" icon="download">
                Скачать
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ----- Доп. материалы ----- */}
      {hw.materials?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div
            className="small muted"
            style={{ marginBottom: 6, fontWeight: 600 }}
          >
            Дополнительные материалы
          </div>
          {hw.materials.map((m, i) => (
            <div
              key={i}
              className="link small"
              style={{ display: 'block', marginBottom: 4 }}
            >
              <Icon name="link" size={12} /> {m.name}
            </div>
          ))}
        </div>
      )}

      <div className="divider" />

      {/* ----- Оценка (если проверено) ----- */}
      {isGraded && (
        <div className="row" style={{ gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
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
          </div>
        </div>
      )}

      {/* ----- Поле ответа ----- */}
      <Field
        label="Ваш ответ"
        hint={
          isGraded
            ? 'Работа уже проверена — редактирование недоступно'
            : 'Можно прикрепить файл с решением'
        }
      >
        <textarea
          className="textarea"
          placeholder="Введите ответ или комментарий…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isGraded}
        />
      </Field>

      {/* ----- Прикрепление файлов ----- */}
      {!isGraded && (
        <div style={{ marginTop: 12 }}>
          <label className="btn" style={{ cursor: 'pointer' }}>
            <Icon name="paperclip" size={14} /> Прикрепить файл
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
          </label>
        </div>
      )}

      {files.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {files.map((f, i) => (
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
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
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

      {/* ----- Подтверждение отправки ----- */}
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
            <b>Задание отправлено преподавателю</b>
          </div>
        </div>
      )}
    </Modal>
  );
}