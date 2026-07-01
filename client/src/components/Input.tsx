import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`} style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={`form-control ${className}`}
        {...props}
      />
      {error && <span className="error-message" style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{error}</span>}
      {!error && helperText && <span className="helper-text" style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{helperText}</span>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`} style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={selectId}>{label}</label>}
      <select
        id={selectId}
        className={`form-control ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message" style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${error ? 'has-error' : ''}`} style={{ marginBottom: '16px' }}>
      {label && <label htmlFor={textareaId}>{label}</label>}
      <textarea
        id={textareaId}
        className={`form-control ${className}`}
        {...props}
      />
      {error && <span className="error-message" style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  const checkId = id || `check-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '8px 0' }}>
      <input
        type="checkbox"
        id={checkId}
        className={className}
        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
        {...props}
      />
      <label htmlFor={checkId} style={{ cursor: 'pointer', userSelect: 'none', margin: 0, fontSize: '13.5px', color: 'var(--text-primary)' }}>
        {label}
      </label>
    </div>
  );
};
