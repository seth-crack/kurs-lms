import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useMaterials } from '../../store/useMaterials';
import { useUI } from '../../store/useUI';
import { SUBJECTS } from '../../data/mock';
import { uploadFiles, downloadFile } from '../../lib/upload';

import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';
import Modal from '../../ui/Modal';
import Empty from '../../ui/Empty';
import Tabs from '../../ui/Tabs';

export default function TeacherMaterials() {
  const teacher = useAuth((s) => s.user);
  const items = useMaterials((s) => s.items);
  const refresh = useMaterials((s) => s.refresh);
  const add = useMaterials((s) => s.add);
  const remove = useMaterials((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);

  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    subject: 'Математика',
    description: '',
    type: 'file',
    file: null,
    link: '',
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const my = items.filter((m) => m.teacher_id === teacher?.id);

  const subjects = [...new Set(my.map((m) => m.subject))];

  const filtered = my.filter((m) => {
    const matchFilter = filter === 'all' || m.subject === filter;
    const query = q.trim().toLowerCase();
    const matchQ =
      !query ||
      m.title.toLowerCase().includes(query) ||
      (m.description || '').toLowerCase().includes(query);
    return matchFilter && matchQ;
  });

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploaded = await uploadFiles([file], 'materials');
    if (uploaded[0]) {
      setForm((f) => ({ ...f, file: uploaded[0] }));
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast('warn', 'Укажите название', '');
      return;
    }
    if (form.type === 'file' && !form.file) {
      toast('warn', 'Выберите файл', '');
      return;
    }
    if (form.type === 'link' && !form.link.trim()) {
      toast('warn', 'Укажите ссылку', '');
      return;
    }

    setSaving(true);
    await add({
      teacher_id: teacher.id,
      title: form.title.trim(),
      subject: form.subject,
      description: form.description.trim(),
      type: form.type,
      file: form.file,
      link: form.type === 'link' ? form.link.trim() : null,
    });
    setSaving(false);
    setOpen(false);
    setForm({
      title: '',
      subject: 'Математика',
      description: '',
      type: 'file',
      file: null,
      link: '',
    });
    toast('success', 'Материал добавлен', form.title);
  };

  const handleRemove = (m) => {
    askConfirm({
      title: 'Удалить материал?',
      desc: m.title,
      confirmText: 'Удалить',
      danger: true,
      onConfirm: async () => {
        await remove(m.id);
        toast('success', 'Материал удалён', m.title);
      },
    });
  };

  const openMaterial = (m) => {
    if (m.type === 'link' && m.link) {
      window.open(m.link, '_blank');
    } else if (m.file?.url) {
      downloadFile(m.file.url, m.file.name);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Материалы</div>
          <div className="page-sub">
            Учебные материалы для ваших учеников
          </div>
        </div>
        <Button
          variant="primary"
          icon="upload"
          onClick={() => setOpen(true)}
        >
          Добавить материал
        </Button>
      </div>

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
          placeholder="Поиск по материалам…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {subjects.length > 0 && (
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: `Все (${my.length})` },
            ...subjects.map((s) => ({
              value: s,
              label: `${s} (${my.filter((m) => m.subject === s).length})`,
            })),
          ]}
        />
      )}

      {filtered.length === 0 ? (
        <div className="card pad-0">
          <Empty
            icon="folder"
            title={my.length === 0 ? 'Материалов пока нет' : 'Ничего не найдено'}
            desc={
              my.length === 0
                ? 'Загрузите учебники, конспекты, видео или ссылки'
                : 'Попробуйте изменить фильтр'
            }
            action={
              my.length === 0 && (
                <Button
                  variant="primary"
                  icon="upload"
                  onClick={() => setOpen(true)}
                  style={{ marginTop: 8 }}
                >
                  Добавить материал
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid cols-3">
          {filtered.map((m) => (
            <div key={m.id} className="card hover-card">
              <div className="row" style={{ gap: 10, marginBottom: 12 }}>
                <div
                  className="hw-ic"
                  style={{
                    background:
                      m.type === 'link'
                        ? 'var(--info-soft)'
                        : 'var(--accent-soft)',
                    color:
                      m.type === 'link' ? 'var(--info)' : 'var(--accent)',
                  }}
                >
                  <Icon
                    name={m.type === 'link' ? 'link' : 'file-text'}
                    size={18}
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.title}
                  </div>
                  <div className="small muted">
                    {m.subject}
                    {m.file ? ` · ${m.file.size}` : ''}
                  </div>
                </div>
              </div>

              {m.description && (
                <div
                  className="small muted"
                  style={{
                    marginBottom: 12,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {m.description}
                </div>
              )}

              <div className="row" style={{ gap: 6 }}>
                <Button
                  size="sm"
                  icon={m.type === 'link' ? 'external-link' : 'download'}
                  onClick={() => openMaterial(m)}
                >
                  {m.type === 'link' ? 'Открыть' : 'Скачать'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon="trash"
                  onClick={() => handleRemove(m)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          title="Новый материал"
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Отмена</Button>
              <Button
                variant="primary"
                onClick={save}
                disabled={saving || uploading}
              >
                {saving ? 'Сохранение…' : 'Добавить'}
              </Button>
            </>
          }
        >
          <div className="stack">
            <Field label="Тип материала">
              <div className="role-pills">
                <button
                  type="button"
                  className={`role-pill ${form.type === 'file' ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, type: 'file' })}
                >
                  <Icon name="file-text" size={18} />
                  <div className="rp-title">Файл</div>
                  <div className="rp-desc">PDF, документ, картинка</div>
                </button>
                <button
                  type="button"
                  className={`role-pill ${form.type === 'link' ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, type: 'link' })}
                >
                  <Icon name="link" size={18} />
                  <div className="rp-title">Ссылка</div>
                  <div className="rp-desc">Видео, статья, сайт</div>
                </button>
              </div>
            </Field>

            <Field label="Название">
              <input
                className="input"
                placeholder="Учебник по алгебре"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
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

            {form.type === 'file' ? (
              <Field label="Файл">
                <label
                  className="btn"
                  style={{
                    cursor: uploading ? 'wait' : 'pointer',
                    opacity: uploading ? 0.6 : 1,
                  }}
                >
                  <Icon
                    name={uploading ? 'refresh-cw' : 'upload'}
                    size={14}
                  />
                  {uploading
                    ? 'Загрузка…'
                    : form.file
                    ? form.file.name
                    : 'Выбрать файл'}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFile}
                    disabled={uploading}
                  />
                </label>
                {form.file && (
                  <div className="small muted" style={{ marginTop: 6 }}>
                    {form.file.size}
                  </div>
                )}
              </Field>
            ) : (
              <Field label="Ссылка">
                <input
                  className="input"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.link}
                  onChange={(e) =>
                    setForm({ ...form, link: e.target.value })
                  }
                />
              </Field>
            )}

            <Field label="Описание (необязательно)">
              <textarea
                className="textarea"
                placeholder="Краткое описание материала"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}