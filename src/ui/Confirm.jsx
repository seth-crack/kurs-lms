import Modal from './Modal';
import Button from './Button';
import { useUI } from '../store/useUI';

export default function ConfirmHost() {
  const confirm = useUI((s) => s.confirm);
  const closeConfirm = useUI((s) => s.closeConfirm);

  if (!confirm) return null;

  return (
    <Modal
      open
      onClose={closeConfirm}
      title={confirm.title}
      footer={
        <>
          <Button onClick={closeConfirm}>Отмена</Button>
          <Button
            variant={confirm.danger ? 'danger' : 'primary'}
            onClick={() => {
              confirm.onConfirm?.();
              closeConfirm();
            }}
          >
            {confirm.confirmText || 'Подтвердить'}
          </Button>
        </>
      }
    >
      <div
        style={{
          fontSize: 14,
          color: 'var(--text-2)',
          lineHeight: 1.6,
        }}
      >
        {confirm.desc}
      </div>
    </Modal>
  );
}