import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notesApi, foldersApi } from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import type { Note, Folder } from '../types';

interface DataContextValue {
  notes: Note[];
  folders: Folder[];
  loading: boolean;
  refreshData: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated()) {
      refreshData();
    } else {
      setLoading(false);
    }
  }, [searchQuery]);

  const refreshData = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      notes,
      folders,
      loading,
      refreshData,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}