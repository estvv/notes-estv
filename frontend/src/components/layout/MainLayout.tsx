import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { EmptyState } from '../notes/EmptyState';
import { notesApi, foldersApi } from '../../utils/api';
import type { Note, Folder } from '../../types';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const loadData = async () => {
    try {
      const [notesData, foldersData] = await Promise.all([
        notesApi.list(searchQuery),
        foldersApi.list()
      ]);
      setNotes(notesData || []);
      setFolders(foldersData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setNotes([]);
      setFolders([]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          folders={folders}
          notes={notes}
          onDataUpdate={loadData}
        />
        
        {children || <EmptyState />}
      </div>
    </div>
  );
}