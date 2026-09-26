export default function DonutChart({ data = [], size = 140, thickness = 16 }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-3)',
          fontSize: 12.5,
        }}
      >
        Нет данных
      </div>
    );
  }

  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {/* фон */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={thickness}
        />

        {/* сегменты */}
        {data.map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return el;
        })}

        {/* центр */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill="var(--text)"
          fontSize="20"
          fontWeight="650"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill="var(--text-3)"
          fontSize="10"
        >
          всего
        </text>
      </svg>

      {/* легенда */}
      <div className="stack" style={{ gap: 6 }}>
        {data.map((d, i) => (
          <div
            key={i}
            className="row"
            style={{ gap: 8, fontSize: 12.5 }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: d.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--text-2)' }}>{d.label}</span>
            <span
              className="mono"
              style={{
                marginLeft: 'auto',
                color: 'var(--text-3)',
                fontWeight: 500,
              }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}