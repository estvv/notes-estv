import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NoteEditor } from '../notes/NoteEditor';
import { EmptyState } from '../notes/EmptyState';
import { FolderView } from '../folders/FolderView';
import { notesApi, foldersApi } from '../../utils/api';
import type { Note, Folder } from '../../types';

export function MainLayout() {
  const navigate = useNavigate();
  const { noteId, folderId } = useParams<{ noteId?: string; folderId?: string }>();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
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
      setNotes(notesData || []);
      setFolders(foldersData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setNotes([]);
      setFolders([]);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(n => n.id !== id));
      navigate('/');
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

  const handleSelectNote = (id: number) => {
    navigate(`/note/${id}`);
  };

  const handleSelectFolder = (id: number | null) => {
    if (id) {
      navigate(`/folder/${id}`);
    } else {
      navigate('/');
    }
  };

  const selectedNote = noteId ? notes.find(n => n.id === parseInt(noteId)) || null : null;
  const selectedFolderId = folderId ? parseInt(folderId) : null;

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          folders={folders}
          notes={notes}
          selectedNoteId={noteId ? parseInt(noteId) : null}
          selectedFolderId={selectedFolderId}
          onSelectNote={handleSelectNote}
          onSelectFolder={handleSelectFolder}
          onDataUpdate={loadData}
        />
        
        <Routes>
          <Route path="/note/:noteId" element={
            selectedNote ? (
              <NoteEditor
                note={selectedNote}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
              />
            ) : (
              <EmptyState />
            )
          } />
          
          <Route path="/folder/:folderId" element={<FolderView />} />
          
          <Route path="/" element={<EmptyState />} />
        </Routes>
      </div>
    </div>
  );
}