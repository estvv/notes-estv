import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { notesApi } from '../../utils/api';
import { useData } from '../../contexts/DataContext';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../../types';

export function NoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadNote();
    }
  }, [id]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const noteData = await notesApi.get(parseInt(id!));
      setNote(noteData);
    } catch (error) {
      console.error('Failed to load note:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (id: number, updates: { title?: string; content?: string }) => {
    try {
      await notesApi.update(id, updates);
      setNote({ ...note!, ...updates });
      refreshData();
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await notesApi.delete(id);
      refreshData();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-neutral-500">Note not found</div>
      </div>
    );
  }

  return (
    <NoteEditor
      note={note}
      onUpdate={handleUpdateNote}
      onDelete={handleDeleteNote}
    />
  );
}