import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  subtitle,
  actionLabel,
  onAction,
  style = {}
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--bg-surface-0)',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-secondary)',
        minHeight: '240px',
        width: '100%',
        ...style
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface-1)',
          color: 'var(--text-muted)',
          marginBottom: '16px'
        }}
      >
        <Icon size={24} />
      </div>
      <h3 
        style={{ 
          fontSize: '15px', 
          fontWeight: 700, 
          color: 'var(--text-primary)',
          marginBottom: '6px'
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p 
          style={{ 
            fontSize: '13px', 
            color: 'var(--text-muted)', 
            maxWidth: '320px',
            marginBottom: actionLabel ? '16px' : '0',
            lineHeight: 1.5
          }}
        >
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <button 
          className="btn btn-secondary" 
          onClick={onAction}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
