import React from 'react';
import { Breadcrumbs } from '../Common';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Content rendered on the right side (buttons, toggles, etc.). */
  actions?: React.ReactNode;
  /** Margin bottom override. Defaults to 0 (parent gap handles spacing). */
  style?: React.CSSProperties;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        ...style,
      }}
    >
      {/* Left: breadcrumbs + title + subtitle */}
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} />
        )}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#fff',
            margin: breadcrumbs ? '4px 0 0 0' : '0',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              margin: '4px 0 0 0',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: action buttons / toggles */}
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
