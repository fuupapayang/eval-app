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
import { GripVertical, Edit2 } from 'lucide-react';

const SortableCard = ({ staff, isEditing, editForm, setEditForm, onSave, onCancel, onEdit, availableTypes }: { 
  staff: Staff, 
  isEditing: boolean, 
  editForm: Staff | null,
  setEditForm: (s: Staff) => void,
  onSave: () => void,
  onCancel: () => void,
  onEdit: () => void,
  availableTypes: string[]
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: staff.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 10 : 1
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    // If editing, keep open. Otherwise toggle.
    if (!isEditing) setIsOpen(!isOpen);
  };

  return (
    <div ref={setNodeRef} className={`neu-card ${isDragging ? 'dragging' : ''}`} style={{ ...style, marginBottom: 'var(--spacing-4)', padding: 0, overflow: 'hidden' }}>
      {/* Card Header (Summary) */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: 'var(--spacing-4) var(--spacing-5)', 
          cursor: isEditing ? 'default' : 'pointer',
          background: (isOpen || isEditing) ? 'var(--bg-surface-hover)' : 'transparent',
          transition: 'background var(--transition-fast)'
        }}
        onClick={toggleAccordion}
      >
        <div {...attributes} {...listeners} className="drag-handle" style={{ marginRight: 'var(--spacing-4)' }} onClick={(e) => e.stopPropagation()}>
          <GripVertical size={20} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
          <div style={{ minWidth: '150px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{staff.name}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{staff.department}</span>
          </div>
          
          <div style={{ flex: 1, display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
            <span className="badge">{staff.role}</span>
            <span className="badge" style={{ opacity: 0.8 }}>{staff.type}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{staff.roleTitle || '一般'}</span>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }} onClick={e => e.stopPropagation()}>
            <button className="btn btn-outline" style={{ padding: '6px' }} onClick={onEdit}>
              <Edit2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body (Expanded / Edit Form) */}
      {(isOpen || isEditing) && (
        <div style={{ padding: 'var(--spacing-5)', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.2)' }}>
          {isEditing && editForm ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
              <div className="form-group">
                <label className="form-label">氏名</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">所属 (部署)</label>
                <input className="form-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">職種</label>
                <select className="form-select" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as Role})}>
                  <option value="WEBデザイナー">WEBデザイナー</option>
                  <option value="コーダー">コーダー</option>
                  <option value="映像">映像</option>
                  <option value="ディレクター">ディレクター</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">タイプ</label>
                <select className="form-select" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as StaffType})}>
                  {availableTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">役割 (役職)</label>
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
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '1.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={!!editForm.canEditTeamGoals} 
                    onChange={e => setEditForm({...editForm, canEditTeamGoals: e.target.checked})} 
                    style={{ transform: 'scale(1.2)' }}
                  />
                  チーム目標入力権限を付与する
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">入社日</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={editForm.joinedAt || ''} 
                  onChange={e => setEditForm({...editForm, joinedAt: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">パスワード (空欄で初期値)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editForm.password || ''} 
                  onChange={e => setEditForm({...editForm, password: e.target.value})} 
                  placeholder={staff.id.replace('staff-', '').padStart(4, '0')} 
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}>
                <button className="btn btn-outline" onClick={onCancel}>キャンセル</button>
                <button className="btn btn-primary" onClick={() => { onSave(); setIsOpen(false); }}>保存する</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>入社日</p>
                <p>{staff.joinedAt ? new Date(staff.joinedAt).toLocaleDateString() : '未設定'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>チーム目標権限</p>
                <p>{staff.canEditTeamGoals ? 'あり' : 'なし'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>パスワード</p>
                <p>{staff.password || staff.id.replace('staff-', '').padStart(4, '0')}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-4)' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-8)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>スタッフ一覧</h1>
          <p className="page-subtitle" style={{ fontSize: '1rem' }}>評価対象のスタッフを管理します</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd} disabled={editingId !== null}>
          ＋ スタッフ追加
        </button>
      </div>

      {editingId === 'NEW' && editForm && (
        <div className="neu-panel" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)', border: '2px solid var(--accent-primary)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-6)' }}>新規スタッフ追加</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
            <div className="form-group">
              <label className="form-label">氏名</label>
              <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">所属</label>
              <input className="form-input" value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">職種</label>
              <select className="form-select" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as Role})}>
                <option value="WEBデザイナー">WEBデザイナー</option>
                <option value="コーダー">コーダー</option>
                <option value="映像">映像</option>
                <option value="ディレクター">ディレクター</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">タイプ</label>
              <select className="form-select" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value as StaffType})}>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)' }}>
              <button className="btn btn-outline" onClick={handleCancel}>キャンセル</button>
              <button className="btn btn-primary" onClick={handleSave}>登録する</button>
            </div>
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="neu-card-list">
          <SortableContext items={staffList.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {staffList.map((staff: Staff) => (
              <SortableCard 
                key={staff.id} 
                staff={staff} 
                isEditing={editingId === staff.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleSave}
                onCancel={handleCancel}
                onEdit={() => handleEdit(staff)}
                availableTypes={availableTypes}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};
