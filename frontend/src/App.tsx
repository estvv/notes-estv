import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import { LoginPage } from './components/auth/LoginPage';
import { SharedView } from './components/shared/SharedView';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated() ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/shared/:token" element={<SharedView />} />
        <Route path="/*" element={isAuthenticated() ? <MainLayout /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;