import React from 'react';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  /** Unique key for this filter */
  key: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

interface SearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface FilterPanelProps {
  /** Search bar config. Omit to hide search. */
  search?: SearchConfig;
  /** List of select filters to render. */
  filters?: FilterConfig[];
  /** Extra content on the right side (e.g., export button). */
  actions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  search,
  filters = [],
  actions,
  style,
}) => {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Search Input */}
      {search && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.03)',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            flex: 1,
            minWidth: '200px',
          }}
        >
          <Search size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder={search.placeholder ?? 'Search...'}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
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
      )}

      {/* Select Filters */}
      {filters.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              style={{
                padding: '7px 12px',
                fontSize: '12.5px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-sidebar)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                minWidth: '130px',
              }}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {/* Right-side actions */}
      {actions && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
