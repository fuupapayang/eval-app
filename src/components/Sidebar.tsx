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
    <div className="sidebar-container">
      {/* 1. Primary Dark Sidebar (Icons Only) */}
      <aside className="nav-primary">
        <div className="sidebar-brand">
          <ShieldCheck className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} />
        </div>
        
        <nav className="nav-links">
          {currentUser?.type === 'MASTER' ? (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end title="スタッフ一覧">
                <Users className="w-5 h-5" />
              </NavLink>
              <NavLink to="/evaluate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="評価入力">
                <FileText className="w-5 h-5" />
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="評価集計・ログ">
                <BarChart3 className="w-5 h-5" />
              </NavLink>
            </>
          ) : (
            <NavLink to="/mypage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="マイページ">
              <User className="w-5 h-5" />
            </NavLink>
          )}
        </nav>

        <div className="nav-primary-bottom">
          {currentUser?.type === 'MASTER' && (
            <NavLink to="/master" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="評価マスタ">
              <Settings className="w-5 h-5" />
            </NavLink>
          )}
          <button className="nav-item" onClick={handleLogout} title="ログアウト">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* 2. Secondary Light Sidebar (Text & Labels) */}
      <aside className="nav-secondary">
        <div className="user-profile">
          <div className="user-avatar">
            <User className="w-5 h-5" />
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.type === 'STAFF' ? currentUser.staff.name : 'Administrator'}</span>
            <span className="user-email">{currentUser?.type === 'MASTER' ? 'System Management' : currentUser?.type === 'STAFF' ? currentUser.staff.roleTitle : 'Guest'}</span>
          </div>
        </div>

        <div className="nav-secondary-section">
          <h3 className="nav-secondary-title">Menus</h3>
          {currentUser?.type === 'MASTER' ? (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <span>スタッフ一覧</span>
              </NavLink>
              <NavLink to="/evaluate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>評価入力</span>
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>評価集計・ログ</span>
              </NavLink>
            </>
          ) : (
            <NavLink to="/mypage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>マイページ</span>
            </NavLink>
          )}
        </div>

        {currentUser?.type === 'MASTER' && (
          <div className="nav-secondary-section">
            <h3 className="nav-secondary-title">Settings</h3>
            <NavLink to="/master" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span>評価マスタ</span>
            </NavLink>
          </div>
        )}
      </aside>
    </div>
  );
};
