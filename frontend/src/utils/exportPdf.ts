import html2pdf from 'html2pdf.js';
import type { Note } from '../types';

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: any }>;
  attrs?: any;
}

function nodeToHtml(node: TiptapNode): string {
  switch (node.type) {
    case 'paragraph':
      const paragraphContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<p>${paragraphContent}</p>`;
    
    case 'heading':
      const level = node.attrs?.level || 1;
      const headingContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<h${level}>${headingContent}</h${level}>`;
    
    case 'text':
      let text = node.text || '';
      if (node.marks) {
        node.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'strike':
              text = `<s>${text}</s>`;
              break;
            case 'code':
              text = `<code>${text}</code>`;
              break;
          }
        });
      }
      return text;
    
    case 'bulletList':
      const bulletItems = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<ul>${bulletItems}</ul>`;
    
    case 'orderedList':
      const orderedItems = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<ol>${orderedItems}</ol>`;
    
    case 'listItem':
      const listItemContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<li>${listItemContent}</li>`;
    
    case 'blockquote':
      const blockquoteContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<blockquote>${blockquoteContent}</blockquote>`;
    
    case 'codeBlock':
      const codeContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<pre><code>${codeContent}</code></pre>`;
    
    case 'hardBreak':
      return '<br>';
    
    case 'table':
      const tableContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<table>${tableContent}</table>`;
    
    case 'tableRow':
      const rowContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      return `<tr>${rowContent}</tr>`;
    
    case 'tableCell':
    case 'tableHeader':
      const cellContent = node.content?.map(n => nodeToHtml(n)).join('') || '';
      const tag = node.type === 'tableHeader' ? 'th' : 'td';
      return `<${tag}>${cellContent}</${tag}>`;
    
    default:
      return '';
  }
}

function parseNoteContent(content: string): string {
  try {
    const parsed = JSON.parse(content);
    if (parsed.content && Array.isArray(parsed.content)) {
      return parsed.content.map((node: TiptapNode) => nodeToHtml(node)).join('');
    }
    return '';
  } catch {
    return content;
  }
}

export async function exportFolderToPdf(folderName: string, notes: Note[]): Promise<void> {
  const notesHtml = notes
    .map((note, index) => {
      const content = parseNoteContent(note.content);
      const divider = index < notes.length - 1 ? '<div class="page-break"></div>' : '';
      return `
        <div class="note">
          <h1 class="note-title">${note.title}</h1>
          <div class="note-content">${content}</div>
          ${divider}
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: #171717;
          line-height: 1.6;
          max-width: 100%;
          padding: 20px;
        }
        
        .folder-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 30px;
          color: #171717;
          border-bottom: 2px solid #e5e5e5;
          padding-bottom: 15px;
        }
        
        .note {
          margin-bottom: 30px;
        }
        
        .note-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #171717;
        }
        
        .note-content {
          color: #404040;
          line-height: 1.7;
        }
        
        h1 { font-size: 24px; font-weight: 600; margin: 15px 0 10px 0; color: #171717; }
        h2 { font-size: 20px; font-weight: 600; margin: 15px 0 10px 0; color: #171717; }
        h3 { font-size: 16px; font-weight: 600; margin: 15px 0 10px 0; color: #171717; }
        
        p {
          margin-bottom: 10px;
        }
        
        ul, ol {
          margin-left: 20px;
          margin-bottom: 10px;
        }
        
        ul {
          list-style-type: disc;
        }
        
        ol {
          list-style-type: decimal;
        }
        
        li {
          margin-bottom: 5px;
        }
        
        blockquote {
          border-left: 4px solid #22c55e;
          padding-left: 15px;
          margin: 15px 0;
          color: #737373;
          font-style: italic;
        }
        
        code {
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 14px;
          font-family: 'Courier New', monospace;
        }
        
        pre {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
          margin: 15px 0;
        }
        
        pre code {
          background: none;
          padding: 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th, td {
          border: 1px solid #e5e5e5;
          padding: 10px;
          text-align: left;
        }
        
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        strong { font-weight: 600; }
        em { font-style: italic; }
        u { text-decoration: underline; }
        s { text-decoration: line-through; }
      </style>
    </head>
    <body>
      <h1 class="folder-title">${folderName}</h1>
      ${notesHtml}
    </body>
    </html>
  `;

  const element = document.createElement('div');
  element.innerHTML = html;
  
  const opt = {
    margin: 10,
    filename: `${folderName}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const }
  };

  await html2pdf().set(opt).from(element).save();
}