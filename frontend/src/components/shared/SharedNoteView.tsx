import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notesApi } from '../../utils/api';

interface SharedNote {
  title: string;
  content: string;
}

export function SharedNoteView() {
  const { token } = useParams<{ token: string }>();
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadNote();
    }
  }, [token]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getShared(token!);
      setNote(data);
    } catch (err: any) {
      setError('Note not found or sharing is disabled');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-neutral-600">{error || 'Note not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">{note.title}</h1>
        <div 
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: renderContent(note.content) 
          }}
        />
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