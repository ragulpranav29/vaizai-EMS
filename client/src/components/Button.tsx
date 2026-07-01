import React from 'react';
import { Search } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  /** When true, renders as a compact icon-only button (no text padding). */
  iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconOnly = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const loadingClass = loading ? 'btn-loading' : '';
  const iconOnlyStyle = iconOnly
    ? { padding: '6px', minWidth: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }
    : {};

  return (
    <button
      className={`${baseStyle} ${variantClass} ${sizeClass} ${loadingClass} ${className}`}
      disabled={disabled || loading}
      style={iconOnly ? iconOnlyStyle : undefined}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner"></span>
      ) : (
        <>
          {icon && <span className="btn-icon" style={{ marginRight: children ? '6px' : 0, display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

// ─────────────────────────────────────────
// SearchInput — standalone inline search bar
// ─────────────────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  style,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,0.03)',
      padding: '7px 12px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      ...style,
    }}
  >
    <Search size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        outline: 'none',
        fontSize: '13px',
        width: '100%',
        color: '#fff',
      }}
    />
  </div>
);
