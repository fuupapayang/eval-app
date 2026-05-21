import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Users, FileText, BarChart3, Settings, ShieldCheck, LogOut, User } from 'lucide-react';
import { useStore } from '../store';
import './Layout.css';

export const Sidebar: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const evaluations = useStore(state => state.evaluations);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRankLetter = (score: number) => {
    if (score >= 90) return { letter: 'S', color: 'var(--accent-primary)' };
    if (score >= 80) return { letter: 'A', color: 'var(--success)' };
    if (score >= 70) return { letter: 'B', color: 'var(--warning)' };
    if (score >= 60) return { letter: 'C', color: 'var(--text-primary)' };
    return { letter: 'D', color: 'var(--danger)' };
  };

  const currentEval = useMemo(() => {
    if (currentUser?.type !== 'STAFF') return null;
    const myEvaluations = evaluations.filter(e => e.staffId === currentUser.staff.id).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.period === '下期' ? -1 : 1;
    });
    return myEvaluations[0] || null;
  }, [evaluations, currentUser]);

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

          {currentUser?.type === 'STAFF' && currentEval && currentEval.totalScore > 0 && (
            <div style={{ marginTop: 'var(--spacing-6)', paddingTop: 'var(--spacing-6)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '76px', fontWeight: 'bold', lineHeight: 1, color: getRankLetter(currentEval.totalScore).color, textShadow: '2px 2px 8px rgba(0,0,0,0.1)', marginBottom: '8px' }}>
                {getRankLetter(currentEval.totalScore).letter}
              </div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '4px' }}>
                総合: {currentEval.totalScore} / 120 点
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {currentEval.year}年度{currentEval.period === '上期' ? '上半期' : '下半期'}
              </p>
            </div>
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
