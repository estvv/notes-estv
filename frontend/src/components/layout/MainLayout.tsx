import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { EmptyState } from '../notes/EmptyState';
import { useData } from '../../contexts/DataContext';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { notes, folders, searchQuery, setSearchQuery, refreshData } = useData();

  return (
    <div className="h-screen flex flex-col bg-white">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          folders={folders}
          notes={notes}
          onDataUpdate={refreshData}
        />
        
        {children || <EmptyState />}
      </div>
    </div>
  );
}