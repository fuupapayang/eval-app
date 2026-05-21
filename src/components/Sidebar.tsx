import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, FileText, BarChart3, Settings, ShieldCheck, LogOut, User } from 'lucide-react';
import { useStore } from '../store';
import './Layout.css';

export const Sidebar: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <ShieldCheck className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
          <span>QLEA Career Compass</span>
        </div>
      </div>
      <nav className="nav-links" style={{ flexGrow: 1 }}>
        {currentUser?.type === 'MASTER' ? (
          <>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <Users className="w-5 h-5" />
              <span>スタッフ一覧</span>
            </NavLink>
            <NavLink to="/evaluate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText className="w-5 h-5" />
              <span>評価入力</span>
            </NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 className="w-5 h-5" />
              <span>評価集計・ログ</span>
            </NavLink>
            <NavLink to="/master" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings className="w-5 h-5" />
              <span>評価マスタ</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/mypage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <User className="w-5 h-5" />
              <span>マイページ</span>
            </NavLink>
          </>
        )}
      </nav>
      <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--border-color)' }}>
        <button className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
};
