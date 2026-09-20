import { useAuth } from '../../store/useAuth';
import { HOMEWORK, SUBJECTS, TEACHERS } from '../../data/mock';
import Icon from '../../ui/Icon';
import Progress from '../../ui/Progress';

export default function StudentSubjects() {
  const user = useAuth((s) => s.user);

  const myHw = HOMEWORK.filter((h) => h.studentIds.includes(user.id));

  const subjects = SUBJECTS.map((s) => ({
    subject: s,
    list: myHw.filter((h) => h.subject === s),
    teacher: TEACHERS.find((t) => t.subject === s),
  })).filter((x) => x.list.length > 0 || x.teacher);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Мои предметы</div>
          <div className="page-sub">Предметы, которые вы изучаете</div>
        </div>
      </div>

      <div className="grid cols-3">
        {subjects.map(({ subject, list, teacher }) => {
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
                <span>{done} проверено</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}