import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/useAuth';
import { useUI } from '../store/useUI';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Icon from '../ui/Icon';

export default function ResetPassword() {
  const updatePassword = useAuth((s) => s.updatePassword);
  const toast = useUI((s) => s.toast);
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Проверяем, что сессия есть (Supabase установил её после клика по ссылке)
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Ссылка недействительна или устарела');
      } else {
        setReady(true);
      }
    };
    check();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль не короче 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    toast('success', 'Пароль обновлён', 'Войдите с новым паролем');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="brand">
          <div className="brand-mark">К</div> Курс
        </div>
        <div className="auth-hero">
          <h1>Сброс пароля</h1>
          <p>Введите новый пароль для вашего аккаунта.</p>
        </div>
        <div className="small muted">© 2025 Курс</div>
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="brand" style={{ padding: '0 0 18px' }}>
            <div className="brand-mark">К</div> Курс
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 650, marginBottom: 6 }}>
            Новый пароль
          </h2>
          <p className="muted small" style={{ marginBottom: 18 }}>
            Придумайте пароль не короче 6 символов
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

          {ready && (
            <>
              <Field label="Новый пароль">
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <div style={{ height: 12 }} />
              <Field label="Повторите пароль">
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </Field>
              <div style={{ height: 20 }} />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                block
                disabled={loading}
              >
                {loading ? 'Сохранение…' : 'Сохранить пароль'}
              </Button>
            </>
          )}

          {!ready && !error && (
            <div className="small muted">Проверяем ссылку…</div>
          )}
        </form>
      </div>
    </div>
  );
}