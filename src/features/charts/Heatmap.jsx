export default function Heatmap({
  weeks = 12,
  data = [], // массив чисел: по одному на день (последние 84 дня)
}) {
  const cols = weeks;
  const rows = 7;
  const cell = 12;
  const gap = 3;

  // Строим матрицу rows × cols
  const matrix = Array.from({ length: rows }, (_, y) =>
    Array.from({ length: cols }, (_, x) => {
      const idx = x * rows + y;
      return data[idx] || 0;
    })
  );

  const max = Math.max(1, ...data);

  const colorFor = (v) => {
    if (v === 0) return 'var(--surface-2)';
    const pct = v / max;
    if (pct < 0.25) return 'var(--accent-soft)';
    if (pct < 0.5) return 'var(--accent)';
    if (pct < 0.75) return 'var(--accent)';
    return 'var(--accent)';
  };

  const opacityFor = (v) => {
    if (v === 0) return 1;
    const pct = v / max;
    return 0.3 + pct * 0.7;
  };

  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'inline-block', minWidth: 'max-content' }}>
        {/* Названия месяцев сверху */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
            gap,
            marginLeft: 30,
            marginBottom: 4,
          }}
        >
          {Array.from({ length: cols }).map((_, x) => (
            <div
              key={x}
              style={{
                fontSize: 9,
                color: 'var(--text-3)',
                textAlign: 'left',
                gridColumn: x + 1,
              }}
            >
              {x % 4 === 0 ? monthNames[(x + 8) % 12] : ''}
            </div>
          ))}
        </div>

        {/* Дни недели + матрица */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${rows}, ${cell}px)`,
              gap,
              fontSize: 9,
              color: 'var(--text-3)',
              alignItems: 'center',
            }}
          >
            {['Пн', '', 'Ср', '', 'Пт', '', 'Вс'].map((d, i) => (
              <div key={i} style={{ lineHeight: `${cell}px` }}>
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
              gridTemplateRows: `repeat(${rows}, ${cell}px)`,
              gap,
              gridAutoFlow: 'column',
            }}
          >
            {matrix.map((col, x) =>
              col.map((v, y) => (
                <div
                  key={`${x}_${y}`}
                  title={`${v} событий`}
                  style={{
                    width: cell,
                    height: cell,
                    borderRadius: 3,
                    background: colorFor(v),
                    opacity: opacityFor(v),
                    transition: 'opacity .15s',
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Легенда */}
        <div
          className="row"
          style={{
            gap: 4,
            justifyContent: 'flex-end',
            marginTop: 10,
            fontSize: 10,
            color: 'var(--text-3)',
          }}
        >
          <span>меньше</span>
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background:
                  pct === 0 ? 'var(--surface-2)' : 'var(--accent)',
                opacity: pct === 0 ? 1 : 0.3 + pct * 0.7,
              }}
            />
          ))}
          <span>больше</span>
        </div>
      </div>
    </div>
  );
}