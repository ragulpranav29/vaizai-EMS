import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronRight, Inbox, RefreshCw } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

// 1. Breadcrumbs
interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight size={12} color="var(--text-muted)" />}
          <span
            onClick={item.onClick}
            style={{
              cursor: item.onClick ? 'pointer' : 'default',
              color: idx === items.length - 1 ? '#fff' : 'var(--text-secondary)',
              fontWeight: idx === items.length - 1 ? 600 : 400
            }}
            onMouseEnter={(e) => item.onClick && (e.currentTarget.style.color = 'var(--primary-hover)')}
            onMouseLeave={(e) => item.onClick && (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            {item.label}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

// 2. Tabs
interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      background: 'rgba(255,255,255,0.02)',
      padding: '4px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      alignSelf: 'flex-start'
    }}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              borderRadius: '6px',
              background: isActive ? 'var(--primary)' : 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

// 3. Accordion
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(255,255,255,0.01)',
      overflow: 'hidden'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '12px 16px',
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.02)',
          userSelect: 'none',
          fontSize: '14px'
        }}
      >
        <span>{title}</span>
        <span style={{
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)'
        }}>▶</span>
      </div>
      {expanded && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// 4. Dropdown Context Menu
interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        {trigger}
      </div>
      {isOpen && (
        <>
          {/* Backdrop to close click-outside */}
          <div 
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 900 }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '6px',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 999,
            minWidth: '160px',
            padding: '4px 0',
            backdropFilter: 'blur(10px)'
          }}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  color: opt.danger ? 'var(--danger)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                {opt.icon}
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// 5. Loader
export const Loader: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '32px 0' }}>
      <RefreshCw size={18} className="spin-loader" style={{ animation: 'spin 1.2s linear infinite', color: 'var(--primary)' }} />
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Syncing configurations...</span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// 6. Skeleton Loading Line
export const SkeletonLine: React.FC<{ width?: string; height?: string }> = ({ width = '100%', height = '12px' }) => {
  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)',
      backgroundSize: '200% 100%',
      borderRadius: '4px',
      animation: 'shimmer 1.5s infinite',
    }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

// 7. Empty State Layout
interface EmptyStateProps {
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center', gap: '12px' }}>
      <Inbox size={32} color="var(--text-muted)" style={{ opacity: 0.5 }} />
      <div>
        <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 600, margin: 0 }}>{title}</h4>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px' }}>{description}</p>
      </div>
    </div>
  );
};

// 8. Error State Banner
interface ErrorStateProps {
  title?: string;
  message: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ title = 'Failed Ingesting Live Logs', message }) => {
  return (
    <div className="card" style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      background: 'rgba(239, 68, 68, 0.03)',
      padding: '16px'
    }}>
      <AlertCircle size={18} color="var(--danger)" style={{ marginTop: '2px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h4 style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 600, margin: 0 }}>{title}</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{message}</p>
      </div>
    </div>
  );
};

// 9. Card Glowing Frame
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  /** Optional left accent border color (CSS variable key or raw color). */
  accent?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, className = '', hoverable = false, onClick, accent }) => {
  const accentStyle = accent ? { borderLeft: `3px solid ${accent}` } : {};
  return (
    <div 
      className={`card ${className}`}
      onClick={onClick}
      style={{
        boxShadow: hoverable ? 'var(--glow-shadow)' : 'none',
        transition: 'var(--transition-smooth)',
        cursor: onClick ? 'pointer' : 'default',
        ...accentStyle,
        ...style
      }}
    >
      {children}
    </div>
  );
};

// 10. Confirmation Dialog Modal
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  danger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} color={danger ? 'var(--danger)' : 'var(--warning)'} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
