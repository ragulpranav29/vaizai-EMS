import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

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
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            minHeight: '300px',
            width: '100%',
            margin: '20px 0'
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
              background: 'var(--danger-glow)',
              color: 'var(--danger)',
              marginBottom: '16px'
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Something went wrong
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '360px', marginBottom: '20px', lineHeight: 1.5 }}>
            An unexpected error occurred in this module. {this.state.error?.message || ''}
          </p>
          <button 
            className="btn btn-primary"
            onClick={this.handleReset}
            style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} />
            Reload Workspace
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
