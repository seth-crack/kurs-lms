export default function LineChart({
  data = [],
  height = 120,
  color = 'var(--accent)',
  label = '',
}) {
  const width = 400;
  const padX = 20;
  const padY = 16;

  if (data.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-3)',
          fontSize: 12.5,
        }}
      >
        Нет данных для графика
      </div>
    );
  }

  const max = 5; // шкала 1–5
  const min = 1;
  const points = data.map((v, i) => {
    const x = padX + (i * (width - padX * 2)) / Math.max(data.length - 1, 1);
    const norm = (v - min) / (max - min);
    const y = height - padY - norm * (height - padY * 2);
    return { x, y, v };
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  // заливка под линией
  const areaPath =
    `M ${points[0].x} ${height - padY} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ` L ${points[points.length - 1].x} ${height - padY} Z`;

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block' }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* сетка по горизонтали */}
        {[1, 2, 3, 4, 5].map((v) => {
          const y = height - padY - ((v - min) / (max - min)) * (height - padY * 2);
          return (
            <line
              key={v}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* заливка */}
        <path d={areaPath} fill="url(#lineGrad)" />

        {/* линия */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* точки */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="var(--surface)"
            stroke={color}
            strokeWidth="2"
          />
        ))}
      </svg>

      {label && (
        <div
          className="small muted"
          style={{ textAlign: 'center', marginTop: 4 }}
        >
          {label}
        </div>
      )}
    </div>
  );
}