import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (title: string, message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} color="var(--success)" />;
      case 'error': return <AlertOctagon size={16} color="var(--danger)" />;
      case 'warning': return <AlertTriangle size={16} color="var(--warning)" />;
      default: return <Info size={16} color="var(--info)" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'rgba(16, 185, 129, 0.3)';
      case 'error': return 'rgba(239, 68, 68, 0.3)';
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      default: return 'rgba(6, 182, 212, 0.3)';
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '360px',
        width: '100%',
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              background: 'rgba(18, 20, 30, 0.95)',
              border: `1px solid ${getBorderColor(toast.type)}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              color: '#fff',
              position: 'relative',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ marginTop: '2px', display: 'flex', alignSelf: 'flex-start' }}>
              {getIcon(toast.type)}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{toast.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-muted)',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '50%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
