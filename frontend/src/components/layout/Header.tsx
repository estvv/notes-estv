import { useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearch, searchQuery }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-neutral-200 flex items-center px-6 gap-4">
      <div className="flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full max-w-md px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
        />
      </div>
      
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
      >
        Logout
      </button>
    </header>
  );
}