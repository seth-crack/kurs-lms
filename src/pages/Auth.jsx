import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Icon from '../ui/Icon';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const teacherIdFromUrl = searchParams.get('teacher');

  const signIn = useAuth((s) => s.signIn);
  const signUp = useAuth((s) => s.signUp);
  const sendResetEmail = useAuth((s) => s.sendResetEmail);
  const toast = useUI((s) => s.toast);

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(teacherIdFromUrl ? 'student' : 'teacher');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [forgotEmail, setForgotEmail] = useState('');
  const strength = getStrength(form.password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn({ email: form.email, password: form.password });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast('success', 'Добро пожаловать!', res.user?.name || '');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signUp({
      name: form.name,
      email: form.email,
      password: form.password,
      role,
      teacherId: teacherIdFromUrl,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.needsConfirmation) {
      setConfirmEmail(res.email);
      setMode('confirm');
      return;
    }
    toast('success', 'Аккаунт создан', res.user?.name || '');
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await sendResetEmail(forgotEmail);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast(
      'success',
      'Письмо отправлено',
      `Проверьте ${forgotEmail} — там ссылка для сброса пароля`
    );
    setMode('login');
  };

  return (
    <div className="auth-wrap">
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
            месте.
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

      <div className="auth-right">
        {mode === 'confirm' ? (
          <div className="auth-form" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Icon name="mail" size={28} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 650, marginBottom: 8 }}>
              Проверьте почту
            </h2>
            <p className="muted small" style={{ marginBottom: 8 }}>
              Мы отправили письмо на
            </p>
            <p
              style={{
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 20,
                color: 'var(--accent)',
              }}
            >
              {confirmEmail}
            </p>
            <p
              className="small muted"
              style={{ marginBottom: 24, lineHeight: 1.6 }}
            >
              Откройте письмо и нажмите ссылку для подтверждения регистрации.
            </p>
            <Button
              block
              variant="primary"
              onClick={() => {
                setMode('login');
                setForm({ ...form, email: confirmEmail, password: '' });
              }}
            >
              Войти
            </Button>
          </div>
        ) : (
          <form
            className="auth-form"
            onSubmit={
              mode === 'login'
                ? handleLogin
                : mode === 'register'
                ? handleRegister
                : handleForgot
            }
          >
            <div className="brand" style={{ padding: '0 0 18px' }}>
              <div className="brand-mark">К</div> Курс
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 650, marginBottom: 6 }}>
              {mode === 'login' && 'Вход в аккаунт'}
              {mode === 'register' && 'Регистрация'}
              {mode === 'forgot' && 'Восстановление пароля'}
            </h2>
            <p className="muted small" style={{ marginBottom: 18 }}>
              {mode === 'login' && 'Введите email и пароль'}
              {mode === 'register' && 'Создайте аккаунт учителя или ученика'}
              {mode === 'forgot' && 'Укажите email — мы отправим ссылку сброса'}
            </p>

            {error && (
              <div
                className="card"
                style={{
                  marginBottom: 14,
                  background: 'var(--danger-soft)',
                  borderColor: 'var(--danger)',
                  color: 'var(--danger)',
                  fontSize: 13,
                  padding: 10,
                }}
              >
                <div className="row" style={{ gap: 8 }}>
                  <Icon name="alert-circle" size={14} />
                  {error}
                </div>
              </div>
            )}

            {/* Плашка для ученика, пришедшего по ссылке */}
            {mode === 'register' && teacherIdFromUrl && (
              <div
                className="card"
                style={{
                  marginBottom: 14,
                  background: 'var(--accent-soft)',
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                  fontSize: 13,
                  padding: 10,
                }}
              >
                <div className="row" style={{ gap: 8 }}>
                  <Icon name="info" size={14} />
                  Вы регистрируетесь как ученик — вас пригласил учитель
                </div>
              </div>
            )}

            {mode === 'register' && (
              <>
                <Field label="Имя и фамилия">
                  <input
                    className="input"
                    placeholder="Алексей Смирнов"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </Field>
                <div style={{ height: 12 }} />

                {/* Скрываем роль, если пришёл по ссылке (только ученик) */}
                {!teacherIdFromUrl && (
                  <Field label="Роль">
                    <div className="role-pills">
                      <button
                        type="button"
                        className={`role-pill ${
                          role === 'teacher' ? 'active' : ''
                        }`}
                        onClick={() => setRole('teacher')}
                      >
                        <Icon name="book-open" size={18} />
                        <div className="rp-title">Учитель</div>
                        <div className="rp-desc">
                          Создаю задания, добавляю учеников
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`role-pill ${
                          role === 'student' ? 'active' : ''
                        }`}
                        onClick={() => setRole('student')}
                      >
                        <Icon name="graduation-cap" size={18} />
                        <div className="rp-title">Ученик</div>
                        <div className="rp-desc">Учусь, сдаю задания</div>
                      </button>
                    </div>
                  </Field>
                )}

                <div style={{ height: 12 }} />
              </>
            )}

            {mode === 'forgot' ? (
              <Field label="Email">
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="you@school.ru"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </Field>
            ) : (
              <>
                <Field label="Email">
                  <input
                    className="input"
                    type="email"
                    required
                    placeholder="you@school.ru"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>

                <div style={{ height: 12 }} />

                <Field
                  label="Пароль"
                  hint={mode === 'register' ? strength.label : undefined}
                >
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      style={{ paddingRight: 40 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        width: 24,
                        height: 24,
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--text-3)',
                      }}
                    >
                      <Icon
                        name={showPass ? 'eye-off' : 'eye'}
                        size={16}
                      />
                    </button>
                  </div>
                </Field>

                {mode === 'register' && form.password && (
                  <div style={{ marginTop: 6 }}>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 4,
                        background: 'var(--surface-2)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${strength.pct}%`,
                          background: strength.color,
                          transition: 'all .2s',
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === 'login' && (
              <div
                className="row between"
                style={{ marginTop: 12, marginBottom: 16 }}
              >
                <div />
                <span
                  className="link small"
                  onClick={() => {
                    setError('');
                    setMode('forgot');
                  }}
                >
                  Забыли пароль?
                </span>
              </div>
            )}

            <div style={{ height: mode === 'login' ? 0 : 16 }} />

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

            <div
              className="small muted"
              style={{ textAlign: 'center', marginTop: 20 }}
            >
              {mode === 'login' && (
                <>
                  Нет аккаунта?{' '}
                  <span
                    className="link"
                    onClick={() => {
                      setError('');
                      setMode('register');
                    }}
                  >
                    Зарегистрироваться
                  </span>
                </>
              )}
              {mode === 'register' && (
                <>
                  Уже есть аккаунт?{' '}
                  <span
                    className="link"
                    onClick={() => {
                      setError('');
                      setMode('login');
                    }}
                  >
                    Войти
                  </span>
                </>
              )}
              {mode === 'forgot' && (
                <span
                  className="link"
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                >
                  ← Вернуться ко входу
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function getStrength(pwd) {
  if (!pwd) return { pct: 0, color: 'var(--surface-2)', label: '' };
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-ZА-Я]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-zА-Яа-я0-9]/.test(pwd)) score++;

  if (score <= 1)
    return { pct: 25, color: 'var(--danger)', label: 'Слабый пароль' };
  if (score <= 3)
    return { pct: 60, color: 'var(--warning)', label: 'Средний пароль' };
  return { pct: 100, color: 'var(--success)', label: 'Надёжный пароль' };
}