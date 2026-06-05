import type { Editor } from '@tiptap/react';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
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
      >
        Table
      </button>
    </div>
  );
}