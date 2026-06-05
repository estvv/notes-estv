import { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  const [isInTable, setIsInTable] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const updateTableState = () => {
      setIsInTable(editor.isActive('table'));
    };

    // Update on every editor state change
    editor.on('transaction', updateTableState);
    editor.on('focus', updateTableState);
    editor.on('selectionUpdate', updateTableState);

    // Initial state
    updateTableState();

    return () => {
      editor.off('transaction', updateTableState);
      editor.off('focus', updateTableState);
      editor.off('selectionUpdate', updateTableState);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-3 border-b border-neutral-200 flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('bold') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        B
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded text-sm italic transition-colors ${
          editor.isActive('italic') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        I
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1.5 rounded text-sm underline transition-colors ${
          editor.isActive('underline') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        U
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1.5 rounded text-sm line-through transition-colors ${
          editor.isActive('strike') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        S
      </button>

      <div className="w-px h-6 bg-neutral-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        H1
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        H2
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
          editor.isActive('heading', { level: 3 }) ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        H3
      </button>

      <div className="w-px h-6 bg-neutral-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          editor.isActive('bulletList') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        • List
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          editor.isActive('orderedList') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        1. List
      </button>

      <div className="w-px h-6 bg-neutral-200 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          editor.isActive('blockquote') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        Quote
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          editor.isActive('codeBlock') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
        }`}
      >
        Code
      </button>

      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="px-3 py-1.5 rounded text-sm hover:bg-neutral-100 transition-colors"
        title="Insert table"
      >
        Table
      </button>

      {isInTable && (
        <>
          <div className="w-px h-6 bg-neutral-200 mx-1" />
          
          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors"
            title="Add column before"
          >
            +←Col
          </button>
          
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors"
            title="Add column after"
          >
            +Col→
          </button>
          
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors text-red-600"
            title="Delete column"
          >
            -Col
          </button>
          
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors"
            title="Add row above"
          >
            +↑Row
          </button>
          
          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors"
            title="Add row below"
          >
            +Row↓
          </button>
          
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors text-red-600"
            title="Delete row"
          >
            -Row
          </button>
          
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          
          <button
            onClick={() => editor.chain().focus().mergeCells().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors"
            title="Merge cells"
            disabled={!editor.can().mergeCells()}
          >
            Merge
          </button>
          
          <button
            onClick={() => editor.chain().focus().splitCell().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-neutral-100 transition-colors"
            title="Split cell"
            disabled={!editor.can().splitCell()}
          >
            Split
          </button>
          
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          
          <button
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className={`px-2 py-1.5 rounded text-xs transition-colors ${
              editor.isActive('headerRow') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
            }`}
            title="Toggle header row"
          >
            HRow
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
            className={`px-2 py-1.5 rounded text-xs transition-colors ${
              editor.isActive('headerColumn') ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100'
            }`}
            title="Toggle header column"
          >
            HCol
          </button>
          
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1.5 rounded text-xs hover:bg-red-50 transition-colors text-red-600"
            title="Delete table"
          >
            Delete Table
          </button>
        </>
      )}
    </div>
  );
}