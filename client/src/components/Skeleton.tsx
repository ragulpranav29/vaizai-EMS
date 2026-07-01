import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = 'var(--radius-xs)', 
  className = '',
  style: customStyle = {}
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius,
    background: 'linear-gradient(90deg, var(--bg-surface-1) 25%, var(--bg-surface-2) 50%, var(--bg-surface-1) 75%)',
    backgroundSize: '200% 100%',
    animation: 'pulse-glow 1.6s infinite ease-in-out',
    display: 'inline-block',
    border: 'none',
    ...customStyle
  };

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={style} className={className} />
    </>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-default)' }}>
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton key={idx} width={`${100 / cols - 5}%`} height="18px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} width={`${100 / cols - 5}%`} height="14px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonKpiRow: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton width="40%" height="14px" />
          <Skeleton width="70%" height="28px" />
          <Skeleton width="55%" height="12px" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="30%" height="20px" />
        <Skeleton width="15%" height="14px" />
      </div>
      <Skeleton width="100%" height="80px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <Skeleton width="25%" height="12px" />
        <Skeleton width="10%" height="12px" />
      </div>
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: 'var(--bg-surface-1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <Skeleton width="36px" height="36px" borderRadius="var(--radius-full)" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="40%" height="14px" />
            <Skeleton width="80%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <SkeletonKpiRow />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton width="30%" height="20px" />
          <SkeletonTable rows={4} cols={3} />
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton width="40%" height="20px" />
          <SkeletonList count={3} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};
