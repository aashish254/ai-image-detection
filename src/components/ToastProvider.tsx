'use client';

import { Toaster, toast } from 'react-hot-toast';

type Kind = 'verified' | 'flagged' | 'caution' | 'neutral';

const kindLabel: Record<Kind, string> = {
  verified: 'noted',
  flagged: 'rejected',
  caution: 'caution',
  neutral: 'update',
};

function Note({ kind, title, body }: { kind: Kind; title: string; body?: string }) {
  return (
    <div className="ol-note" data-kind={kind} role="status">
      <p className="ol-note-kind">{kindLabel[kind]}</p>
      <p className="ol-note-title">{title}</p>
      {body && <p className="ol-note-body">{body}</p>}
    </div>
  );
}

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      // Above the navbar (1000), below the report drawer (1100) so a note opened
      // from the drawer cannot sit on top of its heading.
      containerStyle={{ top: 72, zIndex: 1050 }}
      toastOptions={{ duration: 4000 }}
    />
  );
}

const push = (node: React.ReactNode, duration: number) =>
  toast.custom((t) => <div style={{ opacity: t.visible ? 1 : 0 }}>{node}</div>, { duration });

export const showToast = {
  success: (message: string) => push(<Note kind="verified" title={message} />, 4000),

  error: (message: string) => push(<Note kind="flagged" title={message} />, 5000),

  warning: (message: string) => push(<Note kind="caution" title={message} />, 4000),

  info: (message: string) => push(<Note kind="neutral" title={message} />, 4000),

  upload: (message: string) => push(<Note kind="neutral" title={message} />, 3000),

  download: (message: string) => push(<Note kind="verified" title={message} />, 4000),

  analysisComplete: (isAI: boolean, confidence: number) =>
    push(
      <Note
        kind={isAI ? 'flagged' : 'verified'}
        title={isAI ? 'Synthetic' : 'Authentic'}
        body={`synthetic likelihood ${confidence.toFixed(2)} · report below`}
      />,
      6000
    ),
};
