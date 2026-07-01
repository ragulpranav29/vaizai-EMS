import React from 'react';
import { History } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  time: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxHeight?: string;
  label?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  maxHeight = '160px',
  label = 'Activity Log',
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
        <History size={12} />
        {label}
      </label>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight,
          overflowY: 'auto',
          fontSize: '11.5px',
          color: 'var(--text-secondary)',
          background: 'rgba(255,255,255,0.02)',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        {activities.length === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>No activity yet.</span>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}
            >
              <span
                style={{
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                  minWidth: '42px',
                }}
              >
                {new Date(act.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span>{act.action}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
