import { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import Button from '../../ui/Button';
import Icon from '../../ui/Icon';

export default function TeacherSettings() {
  const user = useAuth((s) => s.user);
  const theme = useAuth((s) => s.theme);
  const setTheme = useAuth((s) => s.setTheme);
  const logout = useAuth((s) => s.logout);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);

  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/?teacher=${user?.id || ''}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast('success', 'Ссылка скопирована', 'Отправьте её ученикам');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast('error', 'Не удалось скопировать', 'Скопируйте вручную');
    }
  };

  const handleLogout = () => {
    askConfirm({
      title: 'Выйти из аккаунта?',
      desc: 'Вы вернётесь на экран входа.',
      confirmText: 'Выйти',
      danger: true,
      onConfirm: logout,
    });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Настройки</div>
          <div className="page-sub">Параметры аккаунта и платформы</div>
        </div>
      </div>

      <div className="stack" style={{ maxWidth: 720 }}>
        <div
          className="card"
          style={{
            background: 'var(--accent-soft)',
            borderColor: 'var(--accent)',
          }}
        >
          <div className="row" style={{ gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--accent)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="users" size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 650, fontSize: 15 }}>
                Пригласите учеников
              </div>
              <div className="small muted" style={{ marginTop: 2 }}>
                Отправьте им ссылку — они зарегистрируются и сразу будут
                привязаны к вам
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 13,
              fontFamily: 'ui-monospace, monospace',
              wordBreak: 'break-all',
            }}
          >
            {inviteUrl}
          </div>

          <div className="row" style={{ gap: 8, marginTop: 12 }}>
            <Button
              variant="primary"
              icon={copied ? 'check' : 'copy'}
              onClick={copyLink}
            >
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </Button>
          </div>

          <div
            className="small muted"
            style={{ marginTop: 12, lineHeight: 1.5 }}
          >
            💡 Ученики откроют эту ссылку → зарегистрируются → появятся в
            разделе «Ученики». Вы сможете сразу назначать им задания.
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            Интерфейс
          </div>
          <div className="row between" style={{ padding: '10px 0' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Тема</div>
              <div className="small muted">Светлая или тёмная</div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <Button
                size="sm"
                variant={theme === 'light' ? 'primary' : 'default'}
                onClick={() => setTheme('light')}
              >
                Светлая
              </Button>
              <Button
                size="sm"
                variant={theme === 'dark' ? 'primary' : 'default'}
                onClick={() => setTheme('dark')}
              >
                Тёмная
              </Button>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            Уведомления
          </div>
          {[
            'Новые задания от учеников',
            'Сообщения в чате',
            'Напоминания о дедлайнах',
          ].map((n, i) => (
            <div
              key={i}
              className="row between"
              style={{
                padding: '10px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13.5 }}>{n}</span>
              <input type="checkbox" defaultChecked={i < 2} />
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Аккаунт</div>
          <Button variant="danger" icon="log-out" onClick={handleLogout}>
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </>
  );
}