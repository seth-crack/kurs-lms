import { useAuth } from '../../store/useAuth';
import { useUI } from '../../store/useUI';
import Button from '../../ui/Button';

export default function TeacherSettings() {
  const theme = useAuth((s) => s.theme);
  const setTheme = useAuth((s) => s.setTheme);
  const logout = useAuth((s) => s.logout);
  const toast = useUI((s) => s.toast);
  const askConfirm = useUI((s) => s.askConfirm);

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
          <div className="page-sub">
            Параметры аккаунта и платформы
          </div>
        </div>
      </div>

      <div className="stack" style={{ maxWidth: 640 }}>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            Интерфейс
          </div>
          <div
            className="row between"
            style={{ padding: '10px 0' }}
          >
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
            'Еженедельный отчёт',
          ].map((n, i) => (
            <div
              key={i}
              className="row between"
              style={{
                padding: '10px 0',
                borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13.5 }}>{n}</span>
              <input type="checkbox" defaultChecked={i < 3} />
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>
            Безопасность
          </div>
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

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Аккаунт</div>
          <Button
            variant="danger"
            icon="log-out"
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </>
  );
}