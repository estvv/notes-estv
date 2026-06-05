const API_BASE = import.meta.env.VITE_API_URL || '/api';
import type { Note, Folder } from '../types';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
}

export const notesApi = {
  list: (search?: string, folderId?: number): Promise<Note[]> => 
    request(`/notes?${search ? `search=${encodeURIComponent(search)}` : ''}${folderId ? `&folder_id=${folderId}` : ''}`),
  
  get: (id: number): Promise<Note> => request(`/notes/${id}`),
  
  create: (note: { title: string; content: string; folder_id?: number }): Promise<Note> =>
    request('/notes', { method: 'POST', body: JSON.stringify(note) }),
  
  update: (id: number, note: Partial<{ title: string; content: string; folder_id: number }>): Promise<Note> =>
    request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(note) }),
  
  delete: (id: number): Promise<void> => request(`/notes/${id}`, { method: 'DELETE' }),
  
  share: (id: number): Promise<{ share_token: string }> => request(`/notes/${id}/share`, { method: 'POST' }),
  
  unshare: (id: number): Promise<void> => request(`/notes/${id}/share`, { method: 'DELETE' }),
  
  getShared: (token: string): Promise<{ title: string; content: string }> => request(`/shared/${token}`)
};

export const foldersApi = {
  list: (): Promise<Folder[]> => request('/folders'),
  create: (folder: { name: string; parent_id?: number }): Promise<Folder> =>
    request('/folders', { method: 'POST', body: JSON.stringify(folder) }),
  update: (id: number, name: string): Promise<Folder> =>
    request(`/folders/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  delete: (id: number): Promise<void> => request(`/folders/${id}`, { method: 'DELETE' }),
  share: (id: number): Promise<{ share_token: string }> => request(`/folders/${id}/share`, { method: 'POST' }),
  unshare: (id: number): Promise<void> => request(`/folders/${id}/share`, { method: 'DELETE' }),
  getShared: (token: string): Promise<{
    type: 'folder';
    folder: { id: number; name: string };
    notes: Array<{ id: number; title: string; content: string; updated_at: string }>;
    childFolders: Array<{ id: number; name: string; share_token: string | null; is_shared: number }>;
  }> => request(`/shared/${token}`)
};