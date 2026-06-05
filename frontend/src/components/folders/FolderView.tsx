import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { foldersApi, notesApi } from '../../utils/api';
import { useData } from '../../contexts/DataContext';
import type { Folder, Note } from '../../types';

export function FolderView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (id) {
      loadFolderData();
    }
  }, [id]);

  const loadFolderData = async () => {
    try {
      const folders = await foldersApi.list();
      const foundFolder = folders.find((f: Folder) => f.id === parseInt(id!));
      
      if (!foundFolder) {
        navigate('/');
        return;
      }
      
      setFolder(foundFolder);
      setNewName(foundFolder.name);
      
      const allNotes = await notesApi.list();
      const folderNotes = allNotes.filter((n: Note) => n.folder_id === parseInt(id!));
      setNotes(folderNotes);
    } catch (error) {
      console.error('Failed to load folder:', error);
      navigate('/');
    }
  };

  const handleRename = async () => {
    if (!folder || !newName.trim()) return;
    
    try {
      await foldersApi.update(folder.id, newName.trim());
      setIsEditing(false);
      await refreshData();
      const folders = await foldersApi.list();
      const foundFolder = folders.find((f: Folder) => f.id === parseInt(id!));
      if (foundFolder) {
        setFolder(foundFolder);
        setNewName(foundFolder.name);
      }
    } catch (error) {
      console.error('Failed to rename folder:', error);
    }
  };

  const handleShare = async () => {
    if (!folder) return;
    
    try {
      const result = await foldersApi.share(folder.id);
      const url = `${window.location.origin}/shared/${result.share_token}`;
      setShareUrl(url);
      setFolder({ ...folder, is_shared: 1, share_token: result.share_token });
      setShowShareConfirm(true);
      await refreshData();
    } catch (error) {
      console.error('Failed to share folder:', error);
    }
  };

  const handleUnshare = async () => {
    if (!folder) return;
    
    try {
      await foldersApi.unshare(folder.id);
      setFolder({ ...folder, is_shared: 0, share_token: null });
      setShowShareConfirm(false);
      setShareUrl('');
      await refreshData();
    } catch (error) {
      console.error('Failed to unshare folder:', error);
    }
  };

  const handleDelete = async () => {
    if (!folder) return;
    
    if (!confirm('Delete this folder? Notes will be moved to root.')) return;
    
    try {
      await foldersApi.delete(folder.id);
      await refreshData();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const note = await notesApi.create({
        title: 'Untitled',
        content: '',
        folder_id: parseInt(id!)
      });
      await refreshData();
      navigate(`/note/${note.id}`);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  const moveNoteUp = async (index: number) => {
    if (index === 0) return;
    const newNotes = [...notes];
    [newNotes[index - 1], newNotes[index]] = [newNotes[index], newNotes[index - 1]];
    setNotes(newNotes);
    
    try {
      const noteIds = newNotes.map(n => n.id);
      await notesApi.reorder(noteIds);
      await refreshData();
    } catch (error) {
      console.error('Failed to save order:', error);
      loadFolderData();
    }
  };

  const moveNoteDown = async (index: number) => {
    if (index === notes.length - 1) return;
    const newNotes = [...notes];
    [newNotes[index], newNotes[index + 1]] = [newNotes[index + 1], newNotes[index]];
    setNotes(newNotes);
    
    try {
      const noteIds = newNotes.map(n => n.id);
      await notesApi.reorder(noteIds);
      await refreshData();
    } catch (error) {
      console.error('Failed to save order:', error);
      loadFolderData();
    }
  };

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

  if (!folder) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          {isEditing ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setNewName(folder.name);
                }
              }}
              onBlur={handleRename}
              className="flex-1 text-xl font-semibold text-neutral-900 border border-neutral-200 rounded px-2 py-1"
              autoFocus
            />
          ) : (
            <h1 
              className="flex-1 text-xl font-semibold text-neutral-900 cursor-pointer hover:text-neutral-600"
              onClick={() => setIsEditing(true)}
            >
              {folder.name}
            </h1>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNote}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
          
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
          >
            Rename
          </button>
          
          {folder.is_shared ? (
            <>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Copy Link
              </button>
              <button
                onClick={handleUnshare}
                className="px-4 py-2 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors text-neutral-600"
              >
                Unshare
              </button>
            </>
          ) : (
            <button
              onClick={handleShare}
              className="px-4 py-2 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50 transition-colors"
            >
              Share
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-500 mb-2">No notes in this folder yet</p>
            <button
              onClick={handleCreateNote}
              className="text-neutral-600 hover:text-neutral-800 underline"
            >
              Create your first note
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {notes.map((note, index) => (
              <div
                key={note.id}
                className="flex items-center gap-2 p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors group"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveNoteUp(index);
                    }}
                    disabled={index === 0}
                    className={`p-1 rounded transition-colors ${
                      index === 0 
                        ? 'text-neutral-200 cursor-not-allowed' 
                        : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                    }`}
                    title="Move up"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveNoteDown(index);
                    }}
                    disabled={index === notes.length - 1}
                    className={`p-1 rounded transition-colors ${
                      index === notes.length - 1 
                        ? 'text-neutral-200 cursor-not-allowed' 
                        : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                    }`}
                    title="Move down"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={() => navigate(`/note/${note.id}`)}
                  className="flex-1 text-left"
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
              </div>
            ))}
          </div>
        )}
      </div>

      {showShareConfirm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Folder Shared</h2>
            <p className="text-sm text-neutral-600 mb-4">
              Anyone with this link can view all notes in this folder:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-neutral-200 rounded text-sm"
              />
              <button
                onClick={handleCopyShareUrl}
                className="px-4 py-2 bg-neutral-900 text-white rounded text-sm font-medium hover:bg-neutral-800"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setShowShareConfirm(false)}
              className="w-full px-4 py-2 border border-neutral-200 rounded font-medium hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}