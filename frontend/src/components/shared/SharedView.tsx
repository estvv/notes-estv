import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { foldersApi } from '../../utils/api';

interface SharedFolder {
  folder: { id: number; name: string };
  notes: Array<{ id: number; title: string; content: string; updated_at: string }>;
  childFolders: Array<{ id: number; name: string; share_token: string | null; is_shared: number }>;
}

export function SharedView() {
  const { token } = useParams<{ token: string }>();
  const [content, setContent] = useState<SharedFolder | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadContent();
    }
  }, [token]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const folderData = await foldersApi.getShared(token!);
      setContent({ 
        folder: folderData.folder,
        notes: folderData.notes,
        childFolders: folderData.childFolders
      });
    } catch (err: any) {
      setError('Folder not found or sharing is disabled');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-neutral-600">{error || 'Folder not found'}</p>
        </div>
      </div>
    );
  }

  const selectedNote = content.notes.find(n => n.id === selectedNoteId);

  if (content.notes.length > 0 && !selectedNoteId) {
    setSelectedNoteId(content.notes[0].id);
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="h-14 border-b border-neutral-200 flex items-center px-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="font-semibold text-neutral-900">{content.folder.name}</span>
          <span className="text-xs text-neutral-400 ml-2">(Shared - Read Only)</span>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-neutral-200 flex flex-col h-full">
          <div className="p-4 border-b border-neutral-200">
            <div className="text-sm text-neutral-500">Notes: {content.notes.length}</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {content.notes.length === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No notes in this folder
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {content.notes.map(note => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`w-full text-left p-4 transition-colors ${
                      selectedNoteId === note.id ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                    }`}
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
                ))}
              </div>
            )}
          </div>
        </aside>
        
        <main className="flex-1 overflow-y-auto">
          {selectedNote ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-neutral-900">{selectedNote.title}</h1>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6">
                  <div 
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderContent(selectedNote.content) 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-500">
              <div className="text-center">
                <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a note to view</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function renderContent(content: string): string {
  try {
    const json = JSON.parse(content);
    return renderNode(json);
  } catch {
    return content;
  }
}

function renderNode(node: any): string {
  if (!node) return '';
  
  if (node.type === 'doc' && node.content) {
    return node.content.map(renderNode).join('');
  }
  
  if (node.type === 'paragraph') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<p>${content}</p>`;
  }
  
  if (node.type === 'heading') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<h${node.attrs?.level || 1}>${content}</h${node.attrs?.level || 1}>`;
  }
  
  if (node.type === 'text') {
    let text = node.text || '';
    if (node.marks) {
      node.marks.forEach((mark: any) => {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
        if (mark.type === 'italic') text = `<em>${text}</em>`;
        if (mark.type === 'underline') text = `<u>${text}</u>`;
        if (mark.type === 'strike') text = `<s>${text}</s>`;
        if (mark.type === 'code') text = `<code>${text}</code>`;
      });
    }
    return text;
  }
  
  if (node.type === 'bulletList') {
    const items = node.content ? node.content.map(renderNode).join('') : '';
    return `<ul>${items}</ul>`;
  }
  
  if (node.type === 'orderedList') {
    const items = node.content ? node.content.map(renderNode).join('') : '';
    return `<ol>${items}</ol>`;
  }
  
  if (node.type === 'listItem') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<li>${content}</li>`;
  }
  
  if (node.type === 'blockquote') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<blockquote>${content}</blockquote>`;
  }
  
  if (node.type === 'codeBlock') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<pre><code>${content}</code></pre>`;
  }
  
  if (node.type === 'horizontalRule') {
    return '<hr>';
  }
  
  if (node.type === 'table') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<table>${content}</table>`;
  }
  
  if (node.type === 'tableRow') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<tr>${content}</tr>`;
  }
  
  if (node.type === 'tableCell' || node.type === 'tableHeader') {
    const content = node.content ? node.content.map(renderNode).join('') : '';
    const tag = node.type === 'tableHeader' ? 'th' : 'td';
    return `<${tag}>${content}</${tag}>`;
  }
  
  return '';
}