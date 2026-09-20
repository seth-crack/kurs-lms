export function Skeleton({ w = '100%', h = 14, r = 6, style }) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton w="60%" h={16} />
      <Skeleton w="100%" h={12} />
      <Skeleton w="80%" h={12} />
      <Skeleton w="40%" h={12} />
    </div>
  );
}