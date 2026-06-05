import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NoteList } from '../notes/NoteList';
import { NoteEditor } from '../notes/NoteEditor';
import { EmptyState } from '../notes/EmptyState';
import { notesApi, foldersApi } from '../../utils/api';
import type { Note, Folder } from '../../types';

export function MainLayout() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
    loadFolders();
  }, [selectedFolderId, searchQuery]);

  const loadNotes = async () => {
    try {
      const data = await notesApi.list(searchQuery, selectedFolderId || undefined);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const data = await foldersApi.list();
      setFolders(data);
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const note = await notesApi.create({
        title: 'Untitled',
        content: '',
        folder_id: selectedFolderId || undefined
      });
      setNotes([note, ...notes]);
      setSelectedNoteId(note.id);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async (id: number, updates: { title?: string; content?: string }) => {
    try {
      await notesApi.update(id, updates);
      loadNotes();
    } catch (error) {
      console.error('Failed to update note:', error);
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

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onFolderUpdate={loadFolders}
        />
        
        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onCreateNote={handleCreateNote}
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