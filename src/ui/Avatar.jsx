export default function Avatar({ name, short, color, size = 'm' }) {
  const initials =
    short ||
    (name
      ? name
          .split(' ')
          .map((x) => x[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : '?');

  return (
    <div
      className={`avatar ${size}`}
      style={{ background: color || 'var(--accent)' }}
    >
      {initials}
    </div>
  );
}