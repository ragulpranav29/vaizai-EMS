import React from 'react';
import { MessageSquare } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  newValue: string;
  onChange: (val: string) => void;
  onAdd: () => void;
  maxHeight?: string;
  placeholder?: string;
  submitLabel?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  newValue,
  onChange,
  onAdd,
  maxHeight = '180px',
  placeholder = 'Write a comment...',
  submitLabel = 'Post',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onAdd();
    }
  };

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
        <MessageSquare size={13} />
        Comments
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: 'rgba(255,255,255,0.02)',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          maxHeight,
          overflowY: 'auto',
        }}
      >
        {comments.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            No comments yet.
          </p>
        ) : (
          comments.map((comm) => (
            <div
              key={comm.id}
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                paddingBottom: '8px',
                fontSize: '12.5px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '3px',
                }}
              >
                <span>{comm.author}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {new Date(comm.date).toLocaleDateString()}
                </span>
              </div>
              <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{comm.text}</div>
            </div>
          ))
        )}

        {/* Input row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: comments.length > 0 ? '4px' : '0' }}>
          <input
            type="text"
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
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
            className="btn btn-primary"
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
