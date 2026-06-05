import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NoteEditor } from '../notes/NoteEditor';
import { EmptyState } from '../notes/EmptyState';
import { notesApi, foldersApi } from '../../utils/api';
import type { Note, Folder } from '../../types';

export function MainLayout() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const loadData = async () => {
    try {
      const [notesData, foldersData] = await Promise.all([
        notesApi.list(searchQuery),
        foldersApi.list()
      ]);
      setNotes(notesData);
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleUpdateNote = async (id: number, updates: { title?: string; content?: string }) => {
    try {
      await notesApi.update(id, updates);
      loadData();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          folders={folders}
          notes={notes}
          selectedNoteId={selectedNoteId}
          selectedFolderId={null}
          onSelectNote={setSelectedNoteId}
          onSelectFolder={() => {}}
          onDataUpdate={loadData}
        />
        
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}