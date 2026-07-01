import React from 'react';
import { Button } from '../Button';

interface ModalFooterProps {
  /** Cancel handler */
  onCancel: () => void;
  /** Label for the submit/save button. Defaults to "Save Changes". */
  submitLabel?: string;
  /** If true, shows a spinner on the submit button. */
  loading?: boolean;
  /** Optional left-side action (e.g. a Delete button). */
  leftAction?: React.ReactNode;
  /** Pass "submit" (default) or "button" for the primary button type. */
  submitType?: 'submit' | 'button';
  /** Handler for the submit button when submitType="button". */
  onSubmit?: () => void;
  cancelLabel?: string;
  style?: React.CSSProperties;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  onCancel,
  submitLabel = 'Save Changes',
  loading = false,
  leftAction,
  submitType = 'submit',
  onSubmit,
  cancelLabel = 'Cancel',
  style,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: leftAction ? 'space-between' : 'flex-end',
        alignItems: 'center',
        gap: '10px',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '16px',
        marginTop: '8px',
        ...style,
      }}
    >
      {/* Left side — optional danger/secondary action */}
      {leftAction && <div>{leftAction}</div>}

      {/* Right side — cancel + save */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          type={submitType}
          loading={loading}
          onClick={submitType === 'button' ? onSubmit : undefined}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};
