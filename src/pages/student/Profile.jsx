import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';

import Avatar from '../../ui/Avatar';
import Button from '../../ui/Button';
import Field from '../../ui/Field';
import Icon from '../../ui/Icon';

export default function Profile() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const theme = useAuth((s) => s.theme);
  const setTheme = useAuth((s) => s.setTheme);
  const logout = useAuth((s) => s.logout);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const initials = name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const save = () => {
    // если нет setUser — просто обновляем локально (в нашем сторе он есть)
    if (typeof setUser === 'function') {
      setUser({ ...user, name, email, short: initials });
    }
    toast('success', 'Профиль обновлён', 'Изменения сохранены');
  };

  const handleLogout = () => {
    askConfirm({
      title: 'Выйти из аккаунта?',
      desc: 'Вы вернётесь на экран входа. Черновики останутся в браузере.',
      confirmText: 'Выйти',
      danger: true,
      onConfirm: logout,
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Профиль</div>
          <div className="page-sub">Личные данные и настройки</div>
        </div>
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: '1fr 1.4fr', gap: 16 }}
      >
        {/* ----- Левая карточка ----- */}
        <div className="card" style={{ textAlign: 'center' }}>
          <Avatar
            short={initials}
            color={user.color || '#4F46E5'}
            size="xl"
          />
          <div style={{ fontWeight: 650, fontSize: 16, marginTop: 12 }}>
            {name}
          </div>
          <div className="small muted" style={{ marginTop: 2 }}>
            {user.role === 'teacher' ? 'Учитель' : 'Ученик'}
            {user.group ? ` · ${user.group}` : ''}
          </div>

          <div className="divider" />

          <div
            className="row"
            style={{ justifyContent: 'space-around' }}
          >
            <div>
              <div style={{ fontWeight: 650 }}>4.6</div>
              <div className="small muted">средний балл</div>
            </div>
            <div>
              <div style={{ fontWeight: 650 }}>24</div>
              <div className="small muted">заданий</div>
            </div>
            <div>
              <div style={{ fontWeight: 650 }}>96%</div>
              <div className="small muted">посещаемость</div>
            </div>
          </div>
        </div>

        {/* ----- Правая колонка ----- */}
        <div className="stack">
          {/* Личные данные */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 14 }}>
              Личные данные
            </div>
            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Имя и фамилия">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Email">
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Роль">
                <input
                  className="input"
                  value={user.role === 'teacher' ? 'Учитель' : 'Ученик'}
                  readOnly
                />
              </Field>
              <Field label="Группа">
                <input
                  className="input"
                  value={user.group || '—'}
                  readOnly
                />
              </Field>
            </div>
            <div style={{ marginTop: 14 }}>
              <Button variant="primary" onClick={save}>
                Сохранить
              </Button>
            </div>
          </div>

          {/* Настройки */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 14 }}>
              Настройки
            </div>

            <div
              className="row between"
              style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                  Тёмная тема
                </div>
                <div className="small muted">
                  Переключение оформления интерфейса
                </div>
              </div>
              <button
                className={`btn sm ${
                  theme === 'dark' ? 'primary' : ''
                }`}
                onClick={() =>
                  setTheme(theme === 'light' ? 'dark' : 'light')
                }
              >
                {theme === 'dark' ? 'Включена' : 'Выключена'}
              </button>
            </div>

            <div
              className="row between"
              style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                  Уведомления на почту
                </div>
                <div className="small muted">
                  О новых заданиях и оценках
                </div>
              </div>
              <input type="checkbox" defaultChecked />
            </div>

            <div
              className="row between"
              style={{ padding: '10px 0' }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                  Push-уведомления
                </div>
                <div className="small muted">О сообщениях в чате</div>
              </div>
              <input type="checkbox" defaultChecked />
            </div>

            <div className="divider" />

            <Button
              icon="lock"
              onClick={() =>
                toast(
                  'info',
                  'Смена пароля',
                  'На вашу почту отправлена ссылка'
                )
              }
            >
              Сменить пароль
            </Button>
          </div>

          {/* Выход */}
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 14 }}>
              Аккаунт
            </div>
            <div
              className="row between"
              style={{ padding: '10px 0' }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                  Выйти из аккаунта
                </div>
                <div className="small muted">
                  Завершить текущую сессию
                </div>
              </div>
              <Button
                variant="danger"
                icon="log-out"
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}