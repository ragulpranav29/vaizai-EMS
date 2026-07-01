import React from 'react';

type AccentColor = 'default' | 'danger' | 'warning' | 'success' | 'info' | 'primary' | string;

const ACCENT_VAR: Record<string, string> = {
  default: 'var(--border-color)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  success: 'var(--success)',
  info: 'var(--info)',
  primary: 'var(--primary)',
};

interface KpiCardProps {
  label: string;
  value: string | number;
  /** Sub-label shown below the value (e.g., "12% from last week"). */
  subLabel?: string;
  /** Color token key or CSS color for the left accent border. */
  accent?: AccentColor;
  /** Optional icon shown left of the label. */
  icon?: React.ReactNode;
  /** Inline style overrides for the card container. */
  style?: React.CSSProperties;
  /** Value color override (defaults to accent color or white). */
  valueColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subLabel,
  accent = 'default',
  icon,
  style,
  valueColor,
}) => {
  const borderColor = ACCENT_VAR[accent] ?? accent;
  const resolvedValueColor = valueColor ?? (accent !== 'default' ? borderColor : '#fff');

  return (
    <div
      className="card"
      style={{
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderLeft: `3px solid ${borderColor}`,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        {icon}
        {label}
      </span>
      <span
        style={{
          fontSize: '26px',
          fontWeight: 700,
          color: resolvedValueColor,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      {subLabel && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {subLabel}
        </span>
      )}
    </div>
  );
};
