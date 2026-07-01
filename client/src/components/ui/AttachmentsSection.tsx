import React from 'react';
import { Paperclip } from 'lucide-react';

interface Attachment {
  id: string;
  filename: string;
  size: string;
}

interface AttachmentsSectionProps {
  attachments: Attachment[];
  newValue: string;
  onChange: (val: string) => void;
  onAdd: () => void;
  placeholder?: string;
  submitLabel?: string;
}

export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  newValue,
  onChange,
  onAdd,
  placeholder = 'Add filename (e.g. log_dump.txt)...',
  submitLabel = 'Attach',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
        }}
      >
        <Paperclip size={13} />
        Attachments
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: 'rgba(255,255,255,0.02)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {attachments.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            No attachments yet.
          </p>
        ) : (
          attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}
            >
              <span style={{ color: 'var(--primary-hover)', fontWeight: 500 }}>
                📎 {att.filename}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>({att.size})</span>
            </div>
          ))
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: attachments.length > 0 ? '6px' : '0' }}>
          <input
            type="text"
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              padding: '7px 12px',
              fontSize: '12.5px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              color: '#fff',
              outline: 'none',
            }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onAdd}
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
