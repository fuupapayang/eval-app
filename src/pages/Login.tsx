import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const Login: React.FC = () => {
  const staffList = useStore(state => state.staffList);
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');

  const handleMasterLogin = () => {
    if (masterPassword === 'blackwork5963') {
      login({ type: 'MASTER' });
      navigate('/dashboard');
    } else {
      setError('Masterパスワードが間違っています。');
    }
  };

  const handleStaffLogin = () => {
    if (!selectedStaffId) return;
    const staff = staffList.find(s => s.id === selectedStaffId);
    if (staff) {
      // Create expected password based on ID (staff-1 -> 0001)
      const expectedPassword = staff.id.replace('staff-', '').padStart(4, '0');
      if (staffPassword === expectedPassword) {
        login({ type: 'STAFF', staff });
        navigate('/mypage');
      } else {
        setError('スタッフパスワードが間違っています。');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: 'var(--spacing-8)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Evaluation System
        </h1>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-4)', textAlign: 'center', fontSize: '0.875rem' }}>{error}</div>}
        
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-4)', color: 'var(--text-secondary)' }}>スタッフとしてログイン</h2>
          <select 
            className="form-select" 
            value={selectedStaffId} 
            onChange={e => setSelectedStaffId(e.target.value)}
            style={{ marginBottom: 'var(--spacing-4)' }}
          >
            <option value="">-- 名前を選択 --</option>
            {staffList.map(staff => (
              <option key={staff.id} value={staff.id}>{staff.name}</option>
            ))}
          </select>
          <input 
            type="password" 
            className="form-input" 
            placeholder="パスワード（例: 0001）" 
            value={staffPassword} 
            onChange={e => setStaffPassword(e.target.value)}
            style={{ marginBottom: 'var(--spacing-4)' }}
          />
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }} 
            onClick={handleStaffLogin}
            disabled={!selectedStaffId || !staffPassword}
          >
            ログイン
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-4)', color: 'var(--text-secondary)' }}>管理者としてログイン</h2>
          <input 
            type="password" 
            className="form-input" 
            placeholder="Masterパスワード" 
            value={masterPassword} 
            onChange={e => setMasterPassword(e.target.value)}
            style={{ marginBottom: 'var(--spacing-4)' }}
          />
          <button 
            className="btn btn-outline" 
            style={{ width: '100%' }} 
            onClick={handleMasterLogin}
            disabled={!masterPassword}
          >
            MASTERログイン
          </button>
        </div>
      </div>
    </div>
  );
};
