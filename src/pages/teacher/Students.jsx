import { useState } from 'react';
import { STUDENTS } from '../../data/mock';
import { fmtTime } from '../../lib/time';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';
import Field from '../../ui/Field';
import Modal from '../../ui/Modal';
import Progress from '../../ui/Progress';

export default function TeacherStudents() {
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  const filtered = STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.group.toLowerCase().includes(q.toLowerCase())
  );

  const student = openId ? STUDENTS.find((s) => s.id === openId) : null;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Ученики</div>
          <div className="page-sub">Все ученики и их прогресс</div>
        </div>

        <div style={{ position: 'relative', minWidth: 220 }}>
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
      </div>

      <div className="card pad-0">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>Класс</th>
                <th>Прогресс</th>
                <th>Средний балл</th>
                <th>Активность</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setOpenId(s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <Avatar short={s.short} color={s.color} size="m" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                          {s.name}
                        </div>
                        <div className="small muted">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.group}</td>
                  <td style={{ minWidth: 140 }}>
                    <div className="small muted" style={{ marginBottom: 4 }}>
                      {s.done}/26 заданий
                    </div>
                    <Progress value={(s.done / 26) * 100} />
                  </td>
                  <td>
                    <b>{s.avg}</b>
                  </td>
                  <td className="small muted">
                    {fmtTime(Date.now() - Math.random() * 24 * 3600 * 1000)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {student && (
        <Modal
          open
          onClose={() => setOpenId(null)}
          wide
          title={student.name}
        >
          <div className="row" style={{ gap: 14, marginBottom: 16 }}>
            <Avatar short={student.short} color={student.color} size="l" />
            <div>
              <div style={{ fontWeight: 650, fontSize: 16 }}>
                {student.name}
              </div>
              <div className="small muted">
                {student.group} · {student.email}
              </div>
            </div>
          </div>

          <div className="grid cols-3" style={{ gap: 12, marginBottom: 16 }}>
            <div className="card stat">
              <div className="s-label">Средний балл</div>
              <div className="s-value">{student.avg}</div>
            </div>
            <div className="card stat">
              <div className="s-label">Выполнено</div>
              <div className="s-value">{student.done}</div>
            </div>
            <div className="card stat">
              <div className="s-label">Посещаемость</div>
              <div className="s-value">{student.attendance}%</div>
            </div>
          </div>

          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Последние оценки
          </div>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead>
              <tr>
                <th>Задание</th>
                <th>Оценка</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Алгоритмы сортировки</td>
                <td>
                  <span className="grade-circle grade-5" style={{ width: 30, height: 30, fontSize: 12 }}>
                    5
                  </span>
                </td>
                <td className="small muted">вчера</td>
              </tr>
              <tr>
                <td>Производная: контрольная</td>
                <td>
                  <span className="grade-circle grade-4" style={{ width: 30, height: 30, fontSize: 12 }}>
                    4
                  </span>
                </td>
                <td className="small muted">5 дней назад</td>
              </tr>
            </tbody>
          </table>

          <Button
            variant="primary"
            block
            icon="message-circle"
            onClick={() => setOpenId(null)}
          >
            Написать сообщение
          </Button>
        </Modal>
      )}
    </>
  );
}