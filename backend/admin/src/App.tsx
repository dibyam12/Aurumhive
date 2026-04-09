import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Careers from './pages/Careers';
import Contacts from './pages/Contacts';
import ContentEditor from './pages/ContentEditor';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import NotFound from './pages/NotFound'; // Assuming NotFound is a new page

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/content" element={<ContentEditor />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
