import React, { useState } from 'react';
import { useStore } from '../store';
import type { Staff, Role, StaffType } from '../types';

export const StaffList: React.FC = () => {
  const staffList = useStore((state) => state.staffList);
  const updateStaff = useStore((state) => state.updateStaff);
  const addStaff = useStore((state) => state.addStaff);
  const masterItems = useStore((state) => state.masterItems);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Staff | null>(null);

  // Extract unique staff types from masterItems
  const availableTypes = React.useMemo(() => {
    const types = new Set(masterItems.map(item => item.type));
    return Array.from(types);
  }, [masterItems]);

  const handleEdit = (staff: Staff) => {
    setEditingId(staff.id);
    setEditForm({ ...staff });
  };

  const handleAdd = () => {
    setEditingId('NEW');
    setEditForm({
      id: Date.now().toString(),
      name: '',
      department: 'WEBチーム',
      role: 'WEBデザイナー',
      type: 'クリエイティブタイプ',
      isLeader: false,
      isSubLeader: false,
      roleTitle: '一般',
      createdAt: new Date().toISOString()
    });
  };

  const handleSave = () => {
    if (editForm) {
      if (editingId === 'NEW') {
        addStaff(editForm);
      } else {
        updateStaff(editForm);
      }
    }
    setEditingId(null);
    setEditForm(null);
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">スタッフ一覧</h1>
          <p className="page-subtitle">評価対象のスタッフを管理します</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} disabled={editingId !== null}>
          ＋ スタッフ追加
        </button>
      </div>

      <div className="table-container glass-panel">
        <table className="table">
          <thead>
            <tr>
              <th>氏名</th>
              <th>所属</th>
              <th>職種</th>
              <th>タイプ</th>
              <th>役割</th>
              <th>パスワード</th>
              <th>登録日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff: Staff) => (
              <tr key={staff.id}>
                {editingId === staff.id && editForm ? (
                  <>
                    <td><input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                    <td><input className="form-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} /></td>
                    <td>
                      <select className="form-select" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as Role})}>
                        <option value="WEBデザイナー">WEBデザイナー</option>
                        <option value="コーダー">コーダー</option>
                        <option value="映像">映像</option>
                        <option value="ディレクター">ディレクター</option>
                        <option value="その他">その他</option>
                      </select>
                    </td>
                    <td>
                      <select className="form-select" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as StaffType})}>
                        {availableTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <input className="form-input" value={editForm.roleTitle} onChange={e => setEditForm({...editForm, roleTitle: e.target.value})} placeholder="一般/リーダー" />
                        <label style={{fontSize: '0.75rem'}}><input type="checkbox" checked={editForm.isLeader} onChange={e => setEditForm({...editForm, isLeader: e.target.checked})} /> リーダー</label>
                        <label style={{fontSize: '0.75rem'}}><input type="checkbox" checked={editForm.isSubLeader} onChange={e => setEditForm({...editForm, isSubLeader: e.target.checked})} /> サブリーダー</label>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editForm.password || ''} 
                        onChange={e => setEditForm({...editForm, password: e.target.value})} 
                        placeholder={staff.id.replace('staff-', '').padStart(4, '0')} 
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>{formatDate(staff.createdAt)}</td>
                    <td>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.75rem'}} onClick={handleSave}>保存</button>
                        <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.75rem'}} onClick={handleCancel}>取消</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 600 }}>{staff.name}</td>
                    <td>
                      <span className="badge">{staff.department}</span>
                    </td>
                    <td>
                      <span className={`badge ${staff.role === 'WEBデザイナー' ? 'primary' : staff.role === 'コーダー' ? 'success' : 'warning'}`}>
                        {staff.role}
                      </span>
                    </td>
                    <td>{staff.type}</td>
                    <td>
                      {staff.isLeader || staff.isSubLeader ? (
                        <span className="badge primary">{staff.roleTitle}</span>
                      ) : (
                        <span className="badge">{staff.roleTitle}</span>
                      )}
                    </td>
                    <td style={{fontFamily: 'monospace', color: 'var(--text-secondary)'}}>
                      {staff.password || <span style={{opacity: 0.5}}>{staff.id.replace('staff-', '').padStart(4, '0')} (初期)</span>}
                    </td>
                    <td style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>{formatDate(staff.createdAt)}</td>
                    <td>
                      <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.75rem'}} onClick={() => handleEdit(staff)}>編集</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {editingId === 'NEW' && editForm && (
              <tr>
                <td><input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="名前を入力" /></td>
                <td><input className="form-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} /></td>
                <td>
                  <select className="form-select" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as Role})}>
                    <option value="WEBデザイナー">WEBデザイナー</option>
                    <option value="コーダー">コーダー</option>
                    <option value="映像">映像</option>
                    <option value="ディレクター">ディレクター</option>
                    <option value="その他">その他</option>
                  </select>
                </td>
                <td>
                  <select className="form-select" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as StaffType})}>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <input className="form-input" value={editForm.roleTitle} onChange={e => setEditForm({...editForm, roleTitle: e.target.value})} placeholder="一般/リーダー" />
                    <label style={{fontSize: '0.75rem'}}><input type="checkbox" checked={editForm.isLeader} onChange={e => setEditForm({...editForm, isLeader: e.target.checked})} /> リーダー</label>
                    <label style={{fontSize: '0.75rem'}}><input type="checkbox" checked={editForm.isSubLeader} onChange={e => setEditForm({...editForm, isSubLeader: e.target.checked})} /> サブリーダー</label>
                  </div>
                </td>
                <td style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>{formatDate(editForm.createdAt)}</td>
                <td>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.75rem'}} onClick={handleSave}>追加</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.75rem'}} onClick={handleCancel}>取消</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
