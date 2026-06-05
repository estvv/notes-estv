import { useState } from 'react';
import { foldersApi } from '../../utils/api';
import type { Folder } from '../../types';

interface SidebarProps {
  folders: Folder[];
  selectedFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
  onFolderUpdate: () => void;
}

export function Sidebar({ folders, selectedFolderId, onSelectFolder, onFolderUpdate }: SidebarProps) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await foldersApi.create({ name: newFolderName.trim() });
      setNewFolderName('');
      setShowNewFolder(false);
      onFolderUpdate();
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    if (!confirm('Delete this folder? Notes will be moved to root.')) return;
    
    try {
      await foldersApi.delete(id);
      onFolderUpdate();
      if (selectedFolderId === id) {
        onSelectFolder(null);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const buildFolderTree = (parentId: number | null = null): Folder[] => {
    return folders.filter(f => f.parent_id === parentId);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const children = buildFolderTree(folder.id);
    const isSelected = selectedFolderId === folder.id;
    
    return (
      <div key={folder.id}>
        <div 
          className={`flex items-center group px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-neutral-100' : 'hover:bg-neutral-50'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => onSelectFolder(folder.id)}
        >
          <span className="flex-1 text-sm font-medium text-neutral-700 truncate">
            {folder.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(folder.id);
            }}
            className="opacity-0 group-hover:opacity-100 ml-2 text-neutral-400 hover:text-neutral-600 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  const rootFolders = buildFolderTree(null);

  return (
    <aside className="w-64 border-r border-neutral-200 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedFolderId === null ? 'bg-neutral-100' : 'hover:bg-neutral-50'
          }`}
        >
          <span className="text-sm font-semibold text-neutral-900">All Notes</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
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

        <div className="space-y-1">
          {rootFolders.map(folder => renderFolder(folder))}
        </div>
      </div>
    </aside>
  );
}