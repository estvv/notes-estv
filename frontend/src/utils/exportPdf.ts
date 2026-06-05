import type { Note } from '../types';

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: any }>;
  attrs?: any;
}

type PdfContent = any;

function extractTextFromNode(node: TiptapNode): string | any[] {
  if (node.type === 'text') {
    let text = node.text || '';
    if (node.marks && node.marks.length > 0) {
      const styles: any = {};
      node.marks.forEach(mark => {
        switch (mark.type) {
          case 'bold':
            styles.bold = true;
            break;
          case 'italic':
            styles.italics = true;
            break;
          case 'underline':
            styles.decoration = 'underline';
            break;
          case 'strike':
            styles.decoration = 'lineThrough';
            break;
          case 'code':
            styles.font = 'Courier';
            styles.background = '#f5f5f5';
            break;
        }
      });
      return { text, ...styles };
    }
    return text;
  }
  
  if (node.type === 'paragraph' && node.content) {
    const texts = node.content.map(n => extractTextFromNode(n)).flat(Infinity);
    return texts.length === 1 ? texts[0] : texts;
  }
  
  if (node.content) {
    const contents = node.content.map(n => extractTextFromNode(n));
    return contents.flat(Infinity);
  }
  
  return '';
}

function extractTextContent(node: TiptapNode): any {
  const result = extractTextFromNode(node);
  if (Array.isArray(result) && result.length === 0) {
    return '';
  }
  return result;
}

function nodeToPdfmake(node: TiptapNode): PdfContent[] {
  switch (node.type) {
    case 'paragraph': {
      const content = node.content?.map(n => extractTextContent(n)) || [];
      return [{ text: content, style: 'paragraph' }];
    }
    
    case 'heading': {
      const level = node.attrs?.level || 1;
      const content = node.content?.map(n => extractTextContent(n)) || [];
      const style = `heading${level}` as const;
      return [{ text: content, style, margin: [0, 10, 0, 5] }];
    }
    
    case 'bulletList': {
      const items = node.content?.map(listItem => {
        const itemContent = listItem.content?.map(n => nodeToPdfmake(n)).flat() || [];
        return itemContent;
      }) || [];
      return [{ ul: items, style: 'list' }];
    }
    
    case 'orderedList': {
      const items = node.content?.map(listItem => {
        const itemContent = listItem.content?.map(n => nodeToPdfmake(n)).flat() || [];
        return itemContent;
      }) || [];
      return [{ ol: items, style: 'list' }];
    }
    
    case 'listItem': {
      const content = node.content?.map(n => nodeToPdfmake(n)).flat() || [];
      return content;
    }
    
    case 'blockquote': {
      const content = node.content?.map(n => extractTextContent(n)) || [];
      return [{ text: content, style: 'quote', margin: [10, 5, 10, 5] }];
    }
    
    case 'codeBlock': {
      const codeText = node.content?.map(n => n.text).join('') || '';
      return [{ text: codeText, style: 'code', margin: [10, 10, 10, 10] }];
    }
    
    case 'hardBreak':
      return [{ text: '\n' }];
    
    case 'table': {
      console.log('Table node:', JSON.stringify(node, null, 2));
      const rows = node.content?.map(row => {
        console.log('Row:', row);
        const cells = row.content?.map(cell => {
          console.log('Cell:', cell);
          const cellContent = cell.content?.map(n => {
            const text = extractTextContent(n);
            console.log('Cell content node:', n, '->', text);
            return text;
          }).flat(Infinity) || [];
          console.log('Cell content:', cellContent);
          return {
            text: cellContent,
            border: [true, true, true, true],
            fillColor: cell.type === 'tableHeader' ? '#f5f5f5' : undefined,
          };
        }) || [];
        return cells;
      }) || [];
      
      console.log('PDF rows:', rows);
      
      return [{ 
        table: { 
          body: rows,
          widths: Array(rows[0]?.length || 0).fill('*')
        },
        style: 'table',
        margin: [0, 10, 0, 10]
      }];
    }
    
    default:
      return [];
  }
}

function parseNoteContent(content: string): PdfContent[] {
  try {
    const parsed = JSON.parse(content);
    if (parsed.content && Array.isArray(parsed.content)) {
      return parsed.content.flatMap((node: TiptapNode) => nodeToPdfmake(node));
    }
    return [];
  } catch {
    return [{ text: content }];
  }
}

export async function exportFolderToPdf(folderName: string, notes: Note[]): Promise<void> {
  const pdfMake = await import('pdfmake/build/pdfmake');
  const pdfFonts = await import('pdfmake/build/vfs_fonts');
  
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs || pdfFonts;

  const docDefinition: any = {
    content: [],
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        margin: [0, 0, 0, 20]
      },
      heading1: {
        fontSize: 18,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      heading2: {
        fontSize: 15,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      heading3: {
        fontSize: 13,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      noteTitle: {
        fontSize: 20,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      paragraph: {
        fontSize: 11,
        margin: [0, 0, 0, 8]
      },
      list: {
        fontSize: 11,
        margin: [0, 0, 0, 8]
      },
      quote: {
        fontSize: 11,
        italics: true,
        color: '#737373',
        borderLeft: { width: 2, color: '#22c55e' }
      },
      code: {
        fontSize: 10,
        font: 'Courier',
        background: '#f5f5f5'
      },
      table: {
        fontSize: 10,
        margin: [0, 10, 0, 10]
      }
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.5
    },
    pageMargins: [40, 60, 40, 60]
  };

  docDefinition.content.push({ text: folderName, style: 'header' });

  notes.forEach((note, index) => {
    if (index > 0) {
      docDefinition.content.push({ text: '', pageBreak: 'before' });
    }
    
    docDefinition.content.push({ text: note.title, style: 'noteTitle' });
    
    const noteContent = parseNoteContent(note.content);
    docDefinition.content.push(...noteContent);
    
    if (index < notes.length - 1) {
      docDefinition.content.push({ text: '', margin: [0, 20, 0, 0] });
    }
  });

  pdfMake.createPdf(docDefinition).download(`${folderName}.pdf`);
}