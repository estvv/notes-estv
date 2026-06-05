import type { Note } from '../../types';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: number | null;
  onSelectNote: (noteId: number) => void;
  onCreateNote: () => void;
}

export function NoteList({ notes, selectedNoteId, onSelectNote, onCreateNote }: NoteListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 border-r border-neutral-200 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200">
        <button
          onClick={onCreateNote}
          className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
        >
          New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-sm text-neutral-500">
            No notes yet
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left p-4 transition-colors ${
                  selectedNoteId === note.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-semibold text-neutral-900 truncate flex-1">
                    {note.title}
                  </h3>
                  {note.is_shared === 1 && (
                    <svg className="w-4 h-4 text-green-600 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Updated {formatDate(note.updated_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}