import { useState } from 'react';
import { foldersApi, notesApi } from '../../utils/api';
import type { Folder, Note } from '../../types';

interface SidebarProps {
  folders: Folder[];
  notes: Note[];
  selectedNoteId: number | null;
  selectedFolderId: number | null;
  onSelectNote: (noteId: number) => void;
  onSelectFolder: (folderId: number | null) => void;
  onDataUpdate: () => void;
}

export function Sidebar({ 
  folders, 
  notes, 
  selectedNoteId, 
  selectedFolderId, 
  onSelectNote, 
  onSelectFolder, 
  onDataUpdate 
}: SidebarProps) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await foldersApi.create({ name: newFolderName.trim() });
      setNewFolderName('');
      setShowNewFolder(false);
      onDataUpdate();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleShareFolder = async (id: number) => {
    try {
      const result = await foldersApi.share(id);
      const shareUrl = `${window.location.origin}/shared/${result.share_token}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
      onDataUpdate();
    } catch (error) {
      console.error('Failed to share folder:', error);
      alert('Failed to create share link');
    }
  };

  const handleUnshareFolder = async (id: number) => {
    try {
      await foldersApi.unshare(id);
      onDataUpdate();
    } catch (error) {
      console.error('Failed to unshare folder:', error);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!confirm('Delete this folder? Notes will be moved to root.')) return;
    
    try {
      await foldersApi.delete(id);
      onDataUpdate();
      if (selectedFolderId === id) {
        onSelectFolder(null);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const handleCreateNoteInFolder = async (folderId: number | null) => {
    try {
      const note = await notesApi.create({
        title: 'Untitled',
        content: '',
        folder_id: folderId || undefined
      });
      onDataUpdate();
      onSelectNote(note.id);
    } catch (error) {
      console.error('Failed to create note:', error);
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
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const rootNotes = notes.filter(n => !n.folder_id);

  return (
    <aside className="w-80 border-r border-neutral-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">

          <div className="flex items-center justify-between mb-2 px-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Folders</span>
            <button
              onClick={() => setShowNewFolder(true)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {showNewFolder && (
            <div className="mb-2 px-3">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') {
                    setShowNewFolder(false);
                    setNewFolderName('');
                  }
                }}
                placeholder="Folder name..."
                className="w-full px-3 py-1.5 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-500"
                autoFocus
              />
            </div>
          )}

          {folders.map(folder => {
            const folderNotes = notes.filter(n => n.folder_id === folder.id);
            
            return (
              <div key={folder.id} className="mb-1">
                <div className="flex items-center group px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors">
                  <button
                    onClick={() => handleCreateNoteInFolder(folder.id)}
                    className="text-neutral-400 hover:text-neutral-600 transition-colors mr-2"
                    title="Create note in folder"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onSelectFolder(folder.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <svg className="w-4 h-4 text-neutral-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    
                    <span className="flex-1 text-sm font-medium text-neutral-700 truncate">
                      {folder.name}
                    </span>
                    
                    <span className="text-xs text-neutral-400 mr-2">
                      {folderNotes.length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => folder.is_shared ? handleShareFolder(folder.id) : handleShareFolder(folder.id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity mr-1 ${
                      folder.is_shared ? 'text-green-500 hover:text-green-700' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                    title={folder.is_shared ? 'Copy share link' : 'Share folder'}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}