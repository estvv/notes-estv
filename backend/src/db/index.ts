import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Note, Folder } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/notes.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

export function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database initialized');
}

export function getNotes(folderId?: number, search?: string): Note[] {
  let query = 'SELECT * FROM notes';
  const params: any[] = [];
  
  const conditions: string[] = [];
  
  if (folderId) {
    conditions.push('folder_id = ?');
    params.push(folderId);
  }
  
  if (search) {
    conditions.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY updated_at DESC';
  
  return db.prepare(query).all(...params) as Note[];
}

export function createNote(title: string, content: string, folderId?: number): Note {
  const stmt = db.prepare('INSERT INTO notes (title, content, folder_id) VALUES (?, ?, ?)');
  const result = stmt.run(title, content, folderId || null);
  return getNoteById(result.lastInsertRowid as number)!;
}

export function getNoteById(id: number): Note | undefined {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined;
}

export function getNoteByShareToken(token: string): Note | undefined {
  return db.prepare('SELECT * FROM notes WHERE share_token = ? AND is_shared = 1').get(token) as Note | undefined;
}

export function updateNote(id: number, updates: Partial<Note>): Note {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  db.prepare(`UPDATE notes SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
  return getNoteById(id)!;
}

export function deleteNote(id: number) {
  return db.prepare('DELETE FROM notes WHERE id = ?').run(id);
}

export function generateShareToken(id: number): string {
  const { v4: uuidv4 } = require('uuid');
  const token = uuidv4();
  db.prepare('UPDATE notes SET share_token = ?, is_shared = 1 WHERE id = ?').run(token, id);
  return token;
}

export function disableSharing(id: number) {
  db.prepare('UPDATE notes SET share_token = NULL, is_shared = 0 WHERE id = ?').run(id);
}

export function getFolders(): Folder[] {
  return db.prepare('SELECT * FROM folders ORDER BY name').all() as Folder[];
}

export function createFolder(name: string, parentId?: number): Folder {
  const stmt = db.prepare('INSERT INTO folders (name, parent_id) VALUES (?, ?)');
  const result = stmt.run(name, parentId || null);
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(result.lastInsertRowid) as Folder;
}

export function getFolderById(id: number): Folder | undefined {
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(id) as Folder | undefined;
}

export function updateFolder(id: number, name: string): Folder {
  db.prepare('UPDATE folders SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, id);
  return getFolderById(id)!;
}

export function deleteFolder(id: number) {
  db.prepare('UPDATE notes SET folder_id = NULL WHERE folder_id = ?').run(id);
  db.prepare('DELETE FROM folders WHERE id = ?').run(id);
}

export function getFolderDepth(folderId: number): number {
  let depth = 0;
  let currentId: number | null = folderId;
  
  while (currentId && depth < 10) {
    const parent = db.prepare('SELECT parent_id FROM folders WHERE id = ?').get(currentId) as { parent_id: number | null } | undefined;
    if (parent && parent.parent_id) {
      currentId = parent.parent_id;
      depth++;
    } else {
      break;
    }
  }
  
  return depth;
}