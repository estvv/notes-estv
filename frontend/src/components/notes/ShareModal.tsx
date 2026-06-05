import { useState } from 'react';
import type { Note } from '../../types';

interface ShareModalProps {
  note: Note;
  onClose: () => void;
  onShare: (token: string) => void;
  onUnshare: () => void;
}

export function ShareModal({ note, onClose, onShare, onUnshare }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  
  const shareUrl = note.share_token 
    ? `${window.location.origin}/shared/${note.share_token}`
    : '';

  const handleShareClick = async () => {
    setLoading(true);
    try {
      const { notesApi } = await import('../../utils/api');
      const { share_token } = await notesApi.share(note.id);
      onShare(share_token);
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnshareClick = async () => {
    setLoading(true);
    try {
      const { notesApi } = await import('../../utils/api');
      await notesApi.unshare(note.id);
      onUnshare();
    } catch (error) {
      console.error('Failed to unshare:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg border border-neutral-200 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Share Note</h3>
        </div>

        <div className="p-6 space-y-4">
          {note.is_shared === 1 && note.share_token ? (
            <>
              <p className="text-sm text-neutral-600">
                Anyone with the link can view this note (read-only).
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50"
                />
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
                >
                  Copy
                </button>
              </div>

              <button
                onClick={handleUnshareClick}
                disabled={loading}
                className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Disabling...' : 'Disable Sharing'}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-600">
                Generate a shareable link for read-only access.
              </p>
              
              <button
                onClick={handleShareClick}
                disabled={loading}
                className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Share Link'}
              </button>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-neutral-600 text-sm font-medium hover:bg-neutral-50 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}