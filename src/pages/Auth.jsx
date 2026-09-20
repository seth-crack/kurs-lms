import { useState } from 'react';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Icon from '../ui/Icon';

export default function Auth() {
  const login = useAuth((s) => s.login);
  const toast = useUI((s) => s.toast);

  const [mode, setMode] = useState('login'); // login | register | forgot
  const [role, setRole] = useState('student'); // student | teacher
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    remember: true,
  });

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (mode === 'forgot') {
        toast(
          'success',
          'Письмо отправлено',
          'Проверьте почту — мы отправили ссылку для восстановления'
        );
        setMode('login');
        return;
      }

      const email =
        form.email ||
        (role === 'teacher' ? 'a.volkov@kurs.ru' : 'a.smirnov@kurs.ru');
      const name =
        form.name || (role === 'teacher' ? 'Андрей Волков' : 'Алексей Смирнов');

      login({
        id: role === 'teacher' ? 't1' : 's1',
        name,
        email,
        role,
        group: role === 'student' ? '10-А' : null,
        color: '#4F46E5',
      });

      toast(
        'success',
        mode === 'register' ? 'Аккаунт создан' : 'Добро пожаловать!',
        name
      );
    }, 700);
  };

  const quick = (r) => {
    setRole(r);
    setForm((f) => ({
      ...f,
      email: r === 'teacher' ? 'a.volkov@kurs.ru' : 'a.smirnov@kurs.ru',
      password: 'demo',
    }));
  };

  return (
    <div className="auth-wrap">
      {/* -------- Левая половина -------- */}
      <div className="auth-left">
        <div className="brand">
          <div className="brand-mark">К</div> Курс
        </div>

        <div className="auth-hero">
          <h1>
            Учебная платформа
            <br />
            для школы и репетиторов
          </h1>
          <p>
            Задания, чат с преподавателем, расписание и оценки — всё в одном
            месте. Учителя создают задания, ученики сдают работы и получают
            обратную связь.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="af-ic">
                <Icon name="file-text" size={14} />
              </div>
              <div>Домашние задания с файлами и дедлайнами</div>
            </div>
            <div className="auth-feature">
              <div className="af-ic">
                <Icon name="message-circle" size={14} />
              </div>
              <div>Встроенный чат между учеником и учителем</div>
            </div>
            <div className="auth-feature">
              <div className="af-ic">
                <Icon name="bar-chart-2" size={14} />
              </div>
              <div>Оценки и статистика прогресса</div>
            </div>
          </div>
        </div>

        <div className="small muted">© 2025 Курс · Все права защищены</div>
      </div>

      {/* -------- Правая половина -------- */}
      <div className="auth-right">
        <form className="auth-form" onSubmit={submit}>
          <div className="brand" style={{ padding: '0 0 18px' }}>
            <div className="brand-mark">К</div> Курс
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 650, marginBottom: 6 }}>
            {mode === 'login'
              ? 'Вход в аккаунт'
              : mode === 'register'
              ? 'Регистрация'
              : 'Восстановление пароля'}
          </h2>
          <p className="muted small" style={{ marginBottom: 18 }}>
            {mode === 'login'
              ? 'Введите данные, чтобы продолжить обучение'
              : mode === 'register'
              ? 'Создайте аккаунт ученика или учителя'
              : 'Укажите email — мы отправим ссылку для сброса пароля'}
          </p>

          {mode === 'register' && (
            <>
              <Field label="Имя и фамилия">
                <input
                  className="input"
                  placeholder="Например, Алексей Смирнов"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </Field>
              <div style={{ height: 12 }} />

              <Field label="Роль">
                <div className="role-pills">
                  <button
                    type="button"
                    className={`role-pill ${role === 'student' ? 'active' : ''}`}
                    onClick={() => setRole('student')}
                  >
                    <Icon name="graduation-cap" size={18} />
                    <div className="rp-title">Ученик</div>
                    <div className="rp-desc">
                      Сдаю задания, слежу за оценками
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`role-pill ${role === 'teacher' ? 'active' : ''}`}
                    onClick={() => setRole('teacher')}
                  >
                    <Icon name="book-open" size={18} />
                    <div className="rp-title">Учитель</div>
                    <div className="rp-desc">
                      Создаю задания, проверяю работы
                    </div>
                  </button>
                </div>
              </Field>
              <div style={{ height: 12 }} />
            </>
          )}

          <Field label="Email">
            <input
              className="input"
              type="email"
              required
              placeholder="you@kurs.ru"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          {mode !== 'forgot' && (
            <>
              <div style={{ height: 12 }} />
              <Field label="Пароль">
                <input
                  className="input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </Field>
            </>
          )}

          {mode === 'login' && (
            <div
              className="row between"
              style={{ marginTop: 12, marginBottom: 16 }}
            >
              <label
                className="row small"
                style={{ gap: 6, cursor: 'pointer' }}
              >
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                  }
                />
                Запомнить меня
              </label>
              <span className="link small" onClick={() => setMode('forgot')}>
                Забыли пароль?
              </span>
            </div>
          )}

          <div style={{ height: 16 }} />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            block
            disabled={loading}
          >
            {loading
              ? 'Подождите…'
              : mode === 'login'
              ? 'Войти'
              : mode === 'register'
              ? 'Создать аккаунт'
              : 'Отправить ссылку'}
          </Button>

          {mode === 'login' && (
            <>
              <div className="divider" />
              <div
                className="small muted"
                style={{ textAlign: 'center', marginBottom: 10 }}
              >
                Быстрый вход для демо
              </div>
              <div className="row" style={{ gap: 8 }}>
                <Button
                  type="button"
                  block
                  size="sm"
                  icon="graduation-cap"
                  onClick={() => quick('student')}
                >
                  Ученик
                </Button>
                <Button
                  type="button"
                  block
                  size="sm"
                  icon="book-open"
                  onClick={() => quick('teacher')}
                >
                  Учитель
                </Button>
              </div>
            </>
          )}

          <div
            className="small muted"
            style={{ textAlign: 'center', marginTop: 20 }}
          >
            {mode === 'login' && (
              <>
                Нет аккаунта?{' '}
                <span className="link" onClick={() => setMode('register')}>
                  Зарегистрироваться
                </span>
              </>
            )}
            {mode === 'register' && (
              <>
                Уже есть аккаунт?{' '}
                <span className="link" onClick={() => setMode('login')}>
                  Войти
                </span>
              </>
            )}
            {mode === 'forgot' && (
              <span className="link" onClick={() => setMode('login')}>
                ← Вернуться ко входу
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}