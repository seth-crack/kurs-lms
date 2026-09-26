import { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { useHomework } from '../../store/useHomework';
import { useMaterials } from '../../store/useMaterials';
import { useUsers } from '../../store/useUsers';
import { SUBJECTS } from '../../data/mock';
import { downloadFile } from '../../lib/upload';
import Icon from '../../ui/Icon';
import Progress from '../../ui/Progress';
import Tabs from '../../ui/Tabs';
import Empty from '../../ui/Empty';
import Button from '../../ui/Button';

export default function StudentSubjects() {
  const user = useAuth((s) => s.user);
  const items = useHomework((s) => s.items);
  const materials = useMaterials((s) => s.items);
  const refreshMaterials = useMaterials((s) => s.refresh);
  const users = useUsers((s) => s.users);

  const [tab, setTab] = useState('overview');

  useEffect(() => {
    refreshMaterials();
  }, [refreshMaterials]);

  const myHw = items.filter((h) => h.student_ids?.includes(user.id));
  const myTeacher = user.teacher_id
    ? users.find((u) => u.id === user.teacher_id)
    : null;

  const myMaterials = materials.filter(
    (m) => m.teacher_id === user.teacher_id
  );

  const subjects = SUBJECTS.map((s) => {
    const list = myHw.filter((h) => h.subject === s);
    const mats = myMaterials.filter((m) => m.subject === s);
    return { subject: s, list, materials: mats, teacher: myTeacher };
  }).filter((x) => x.list.length > 0 || x.materials.length > 0);

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
          <div className="page-title">Мои предметы</div>
          <div className="page-sub">
            {myTeacher ? `Преподаватель: ${myTeacher.name}` : 'Предметы и материалы'}
          </div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: `Предметы (${subjects.length})` },
          { value: 'materials', label: `Материалы (${myMaterials.length})` },
        ]}
      />

      {tab === 'overview' && (
        <>
          {subjects.length === 0 ? (
            <div className="card pad-0">
              <Empty
                icon="library"
                title="Пока нет предметов"
                desc="Они появятся, когда учитель назначит задание или добавит материал"
              />
            </div>
          ) : (
            <div className="grid cols-3">
              {subjects.map(({ subject, list, materials: mats, teacher }) => {
                const done = list.filter((h) => h.status === 'graded').length;
                const pct = list.length
                  ? Math.round((done / list.length) * 100)
                  : 0;

                return (
                  <div key={subject} className="card">
                    <div className="row" style={{ gap: 10, marginBottom: 12 }}>
                      <div
                        className="hw-ic"
                        style={{
                          background: (teacher?.color || '#4F46E5') + '20',
                          color: teacher?.color || '#4F46E5',
                        }}
                      >
                        <Icon name="book" size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{subject}</div>
                        <div className="small muted">
                          {teacher?.name || 'Преподаватель'}
                        </div>
                      </div>
                    </div>

                    <div
                      className="row between small"
                      style={{ marginBottom: 6 }}
                    >
                      <span className="muted">Прогресс</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} />

                    <div
                      className="row between small muted"
                      style={{ marginTop: 10 }}
                    >
                      <span>{list.length} заданий</span>
                      <span>{mats.length} материалов</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'materials' && (
        <>
          {myMaterials.length === 0 ? (
            <div className="card pad-0">
              <Empty
                icon="folder"
                title="Материалов пока нет"
                desc="Учитель ещё не добавил учебные материалы"
              />
            </div>
          ) : (
            <div className="grid cols-3">
              {myMaterials.map((m) => (
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

                  <Button
                    size="sm"
                    icon={m.type === 'link' ? 'external-link' : 'download'}
                    onClick={() => openMaterial(m)}
                  >
                    {m.type === 'link' ? 'Открыть' : 'Скачать'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}