import React, { useState } from 'react';
import { useStore } from '../store';
import type { Staff, Role, StaffType } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SortableRow = ({ staff, children }: { staff: Staff, children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: staff.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 1,
    background: isDragging ? 'var(--bg-surface-hover)' : undefined
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ width: '40px', textAlign: 'center' }}>
        <button 
          {...attributes} 
          {...listeners} 
          style={{ 
            cursor: 'grab', 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}
        >
          <GripVertical size={16} />
        </button>
      </td>
      {children}
    </tr>
  );
};

export const StaffList: React.FC = () => {
  const staffList = useStore((state) => state.staffList);
  const updateStaff = useStore((state) => state.updateStaff);
  const addStaff = useStore((state) => state.addStaff);
  const reorderStaff = useStore((state) => state.reorderStaff);
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
        // New staff gets added to the bottom
        addStaff({ ...editForm, order: staffList.length });
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = staffList.findIndex(s => s.id === active.id);
      const newIndex = staffList.findIndex(s => s.id === over.id);
      const newStaffList = arrayMove(staffList, oldIndex, newIndex);
      reorderStaff(newStaffList);
    }
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="table-container glass-panel">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
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
            <SortableContext items={staffList.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {staffList.map((staff: Staff) => (
                  <SortableRow key={staff.id} staff={staff}>
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
                          <select 
                            className="form-select" 
                            value={editForm.roleTitle || '一般'} 
                            onChange={e => {
                              const newRoleTitle = e.target.value;
                              setEditForm({
                                ...editForm, 
                                roleTitle: newRoleTitle,
                                isLeader: newRoleTitle === 'リーダー',
                                isSubLeader: newRoleTitle === 'サブリーダー'
                              });
                            }}
                          >
                            <option value="リーダー">リーダー</option>
                            <option value="サブリーダー">サブリーダー</option>
                            <option value="一般">一般</option>
                            <option value="新人">新人</option>
                          </select>
                          <label style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input 
                              type="checkbox" 
                              checked={!!editForm.canEditTeamGoals} 
                              onChange={e => setEditForm({...editForm, canEditTeamGoals: e.target.checked})} 
                            />
                            チーム目標入力権限
                          </label>
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
                  </SortableRow>
                ))}
                {editingId === 'NEW' && editForm && (
                  <tr>
                    <td></td>
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
                      <select 
                        className="form-select" 
                        value={editForm.roleTitle || '一般'} 
                        onChange={e => {
                          const newRoleTitle = e.target.value;
                          setEditForm({
                            ...editForm, 
                            roleTitle: newRoleTitle,
                            isLeader: newRoleTitle === 'リーダー',
                            isSubLeader: newRoleTitle === 'サブリーダー'
                          });
                        }}
                      >
                        <option value="リーダー">リーダー</option>
                        <option value="サブリーダー">サブリーダー</option>
                        <option value="一般">一般</option>
                        <option value="新人">新人</option>
                      </select>
                      <label style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                          type="checkbox" 
                          checked={!!editForm.canEditTeamGoals} 
                          onChange={e => setEditForm({...editForm, canEditTeamGoals: e.target.checked})} 
                        />
                        チーム目標入力権限
                      </label>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={editForm.password || ''} 
                        onChange={e => setEditForm({...editForm, password: e.target.value})} 
                        placeholder="初期パスワード" 
                        style={{ width: '80px' }}
                      />
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
            </SortableContext>
          </table>
        </div>
      </DndContext>
    </div>
  );
};
