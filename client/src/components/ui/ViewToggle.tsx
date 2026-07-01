import React from 'react';

interface ViewOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ViewToggleProps {
  options: ViewOption[];
  active: string;
  onChange: (id: string) => void;
  style?: React.CSSProperties;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ options, active, onChange, style }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '2px',
        background: 'rgba(255,255,255,0.03)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        alignSelf: 'flex-start',
        ...style,
      }}
    >
      {options.map((opt) => {
        const isActive = opt.id === active;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: isActive ? 600 : 400,
              borderRadius: '6px',
              background: isActive ? 'var(--primary)' : 'none',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
