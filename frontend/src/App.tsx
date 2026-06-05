import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import { LoginPage } from './components/auth/LoginPage';
import { SharedNoteView } from './components/shared/SharedNoteView';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/shared/:token" element={<SharedNoteView />} />
        <Route path="/*" element={isAuthenticated() ? <MainLayout /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;