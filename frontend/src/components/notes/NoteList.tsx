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