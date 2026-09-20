export default function Progress({ value, max = 100, color }) {
  const p = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress">
      <i style={{ width: p + '%', ...(color ? { background: color } : {}) }} />
    </div>
  );
}