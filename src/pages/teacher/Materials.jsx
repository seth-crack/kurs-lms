import { useState } from 'react';
import { useUI } from '../../store/useUI';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Field from '../../ui/Field';
import Modal from '../../ui/Modal';

const INITIAL = [
  {
    id: 'm1',
    name: 'Алгебра_10_класс.pdf',
    subject: 'Математика',
    size: '2.4 МБ',
    type: 'pdf',
  },
  {
    id: 'm2',
    name: 'Правила_русского_языка.pdf',
    subject: 'Русский язык',
    size: '1.8 МБ',
    type: 'pdf',
  },
  {
    id: 'm3',
    name: 'Механика_конспект.pdf',
    subject: 'Физика',
    size: '3.1 МБ',
    type: 'pdf',
  },
  {
    id: 'm4',
    name: 'Present_Perfect.pdf',
    subject: 'Английский язык',
    size: '820 КБ',
    type: 'pdf',
  },
  {
    id: 'm5',
    name: 'Алгоритмы_сортировки.py',
    subject: 'Информатика',
    size: '12 КБ',
    type: 'code',
  },
];

export default function TeacherMaterials() {
  const toast = useUI((s) => s.toast);
  const [items, setItems] = useState(INITIAL);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', subject: 'Математика' });
  const [q, setQ] = useState('');

  const filtered = items.filter((f) =>
    f.name.toLowerCase().includes(q.toLowerCase())
  );

  const add = () => {
    if (!form.name.trim()) {
      toast('warn', 'Укажите название', 'Введите имя файла');
      return;
    }
    const type = form.name.endsWith('.py') || form.name.endsWith('.js')
      ? 'code'
      : form.name.endsWith('.pdf')
      ? 'pdf'
      : 'file';

    setItems((arr) => [
      {
        id: 'm' + Math.random().toString(36).slice(2),
        name: form.name,
        subject: form.subject,
        size: '—',
        type,
      },
      ...arr,
    ]);
    setOpen(false);
    setForm({ name: '', subject: 'Математика' });
    toast('success', 'Материал добавлен', form.name);
  };

  const remove = (id) => {
    setItems((arr) => arr.filter((f) => f.id !== id));
    toast('info', 'Материал удалён', '');
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Материалы</div>
          <div className="page-sub">
            Учебные файлы для ваших учеников
          </div>
        </div>
        <Button
          variant="primary"
          icon="upload"
          onClick={() => setOpen(true)}
        >
          Загрузить
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

      <div className="grid cols-3">
        {filtered.map((f) => (
          <div key={f.id} className="card">
            <div className="row" style={{ gap: 10 }}>
              <div className="hw-ic">
                <Icon
                  name={f.type === 'pdf' ? 'file-text' : 'code'}
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
                  {f.name}
                </div>
                <div className="small muted">
                  {f.subject} · {f.size}
                </div>
              </div>
            </div>
            <div className="divider" />
            <div className="row" style={{ gap: 6 }}>
              <Button size="sm" icon="download">
                Скачать
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon="trash"
                onClick={() => remove(f.id)}
              />
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          title="Новый материал"
          footer={
            <>
              <Button onClick={() => setOpen(false)}>Отмена</Button>
              <Button variant="primary" onClick={add}>
                Добавить
              </Button>
            </>
          }
        >
          <div className="stack">
            <Field label="Название файла">
              <input
                className="input"
                placeholder="Конспект_лекции_3.pdf"
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
                <option>Математика</option>
                <option>Русский язык</option>
                <option>Физика</option>
                <option>Английский язык</option>
                <option>Информатика</option>
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}