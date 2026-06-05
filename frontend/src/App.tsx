import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import { DataProvider } from './contexts/DataContext';
import { LoginPage } from './components/auth/LoginPage';
import { SharedView } from './components/shared/SharedView';
import { MainLayout } from './components/layout/MainLayout';
import { FolderView } from './components/folders/FolderView';
import { NoteView } from './components/notes/NoteView';

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/login" element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/shared/:token" element={<SharedView />} />
          <Route path="/folder/:id" element={isAuthenticated() ? <MainLayout><FolderView /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/note/:id" element={isAuthenticated() ? <MainLayout><NoteView /></MainLayout> : <Navigate to="/login" />} />
          <Route path="/*" element={isAuthenticated() ? <MainLayout><></></MainLayout> : <Navigate to="/login" />} />
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;