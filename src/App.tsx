import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StaffList } from './pages/StaffList';
import { EvaluationForm } from './pages/EvaluationForm';
import { Dashboard } from './pages/Dashboard';
import { MasterSettings } from './pages/MasterSettings';
import { Login } from './pages/Login';
import { MyPage } from './pages/MyPage';
import { useStore } from './store';

const ProtectedRoute = ({ children, requireMaster = false }: { children: React.ReactNode, requireMaster?: boolean }) => {
  const currentUser = useStore(state => state.currentUser);
  
  if (!currentUser) return <Navigate to="/login" replace />;
  if (requireMaster && currentUser.type !== 'MASTER') return <Navigate to="/mypage" replace />;
  if (!requireMaster && currentUser.type === 'MASTER') return <Navigate to="/" replace />; // Master doesn't use mypage
  
  return <>{children}</>;
};

function App() {
  const currentUser = useStore(state => state.currentUser);
  const initSync = useStore(state => state.initSync);

  React.useEffect(() => {
    initSync();
  }, [initSync]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={currentUser ? <Navigate to={currentUser.type === 'MASTER' ? "/" : "/mypage"} replace /> : <Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<ProtectedRoute requireMaster><StaffList /></ProtectedRoute>} />
          <Route path="evaluate" element={<ProtectedRoute requireMaster><EvaluationForm /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute requireMaster><Dashboard /></ProtectedRoute>} />
          <Route path="master" element={<ProtectedRoute requireMaster><MasterSettings /></ProtectedRoute>} />
          
          <Route path="mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to={currentUser?.type === 'MASTER' ? "/" : "/mypage"} replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
