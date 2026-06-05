import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Toolbar } from './Toolbar';
import { useAutoSave } from '../../hooks/useAutoSave';
import type { Note } from '../../types';
import History from '@tiptap/extension-history';

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (id: number, updates: { title?: string; content?: string }) => void;
  onDelete: (id: number) => void;
}

export function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      History,
      Underline,
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 25,
      }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: note?.content ? JSON.parse(note.content) : '',
    onUpdate: ({ editor }) => {
      if (note) {
        handleContentUpdate(editor.getJSON());
      }
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      
      if (editor && note.content) {
        try {
          const parsedContent = JSON.parse(note.content);
          editor.commands.setContent(parsedContent);
        } catch (e) {
          editor.commands.setContent('');
        }
      }
    }
  }, [note?.id]);

  const handleTitleUpdate = (newTitle: string) => {
    setTitle(newTitle);
    if (note) {
      onUpdate(note.id, { title: newTitle });
    }
  };

  const handleContentUpdate = (content: any) => {
    if (note) {
      onUpdate(note.id, { content: JSON.stringify(content) });
    }
  };

  useAutoSave(() => {
    if (editor && note) {
      handleContentUpdate(editor.getJSON());
    }
  }, 500, [note?.id]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-neutral-500">No note selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b border-neutral-200 px-6 py-4 flex items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleUpdate(e.target.value)}
          placeholder="Note title..."
          className="flex-1 text-xl font-semibold text-neutral-900 border-none outline-none bg-transparent"
        />
        
        <button
          onClick={() => {
            if (confirm('Delete this note?')) {
              onDelete(note.id);
            }
          }}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <Toolbar editor={editor} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <EditorContent 
            editor={editor} 
            className="prose prose-neutral"
          />
        </div>
      </div>
    </div>
  );
}