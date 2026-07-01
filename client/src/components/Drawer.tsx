import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(5, 5, 8, 0.65)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Slide-in Content Panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        height: '100%',
        background: 'var(--bg-sidebar)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', margin: 0 }}>
            {title}
          </h3>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            style={{ padding: '6px', minWidth: 'auto', borderRadius: '50%' }}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Body content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
