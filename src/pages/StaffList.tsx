import React, { useState } from 'react';
import { useStore } from '../store';
import type { Staff, Role, StaffType, EvaluationItem, EvaluationForm } from '../types';
import { getRankData, renderRankBadge } from '../lib/rankUtils';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, Legend 
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PdfReport from '../components/PdfReport';
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
import { GripVertical, Edit2, Download } from 'lucide-react';

const SortableCard = ({ 
  staff, isEditing, editForm, setEditForm, onSave, onCancel, onEdit, 
  availableTypes, getAutoNextSalary, getAutoIncentive, annualScore, evaluations, masterItems 
}: { 
  staff: Staff, 
  isEditing: boolean, 
  editForm: Staff | null,
  setEditForm: (s: Staff) => void,
  onSave: () => void,
  onCancel: () => void,
  onEdit: () => void,
  availableTypes: string[],
  getAutoNextSalary: (s: Staff) => number | undefined,
  getAutoIncentive: (s: Staff) => number,
  annualScore: number | null,
  evaluations: EvaluationForm[],
  masterItems: EvaluationItem[]
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

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  const getYearsOfService = (joinedAt?: string) => {
    if (!joinedAt) return 0;
    const joinedDate = new Date(joinedAt);
    const today = new Date();
    let years = today.getFullYear() - joinedDate.getFullYear();
    const m = today.getMonth() - joinedDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < joinedDate.getDate())) {
      years--;
    }
    return Math.max(0, years);
  };

  // Find the latest full year data
  const year = 2026;
  const upperEval = evaluations.find(e => e.staffId === staff.id && e.period === '上期' && e.year === year);
  const lowerEval = evaluations.find(e => e.staffId === staff.id && e.period === '下期' && e.year === year);
  // Default to lower term if available, otherwise upper term
  const currentEval = lowerEval || upperEval;

  let performanceData: any[] = [];
  let themeData: any[] = [];
  let radarData: any[] = [];

  if (currentEval) {
    performanceData = [
      { name: '案件貢献', score: currentEval.performanceDetails?.[0] || 0 },
      { name: '品質・納期', score: currentEval.performanceDetails?.[1] || 0 },
      { name: '顧客・社内貢献', score: currentEval.performanceDetails?.[2] || 0 },
    ];

    themeData = currentEval.themeTexts?.map((text: string, i: number) => ({
      name: `テーマ${i+1}`,
      score: currentEval?.themeDetails?.[i] || 0,
      text: text || '未設定'
    })) || [];
  }

  const typeItems = masterItems.filter(m => m.category === '職種・タイプ別評価' && m.type === staff.type);
  radarData = typeItems.map(item => {
    let scoreUpper = 0;
    let scoreLower = 0;
    
    if (upperEval) {
      const entry = upperEval.entries?.find(en => en.itemId === item.id);
      if (entry) scoreUpper = entry.finalScore;
    }
    if (lowerEval) {
      const entry = lowerEval.entries?.find(en => en.itemId === item.id);
      if (entry) scoreLower = entry.finalScore;
    }
    
    return {
      subject: item.name,
      上期: scoreUpper,
      下期: scoreLower,
      fullMark: 5
    };
  });

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
                <label className="form-label">年収（インセンティブを含まない）</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editForm.annualSalary || ''} 
                  onChange={e => setEditForm({...editForm, annualSalary: Number(e.target.value) || undefined})} 
                  placeholder="例: 4800000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">役職手当（リーダー・マネジメント）</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editForm.roleAllowance || ''} 
                  onChange={e => setEditForm({...editForm, roleAllowance: Number(e.target.value) || undefined})} 
                  placeholder="例: 360000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">来期年収予定</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editForm.nextAnnualSalary || ''} 
                  onChange={e => setEditForm({...editForm, nextAnnualSalary: Number(e.target.value) || undefined})} 
                  placeholder="例: 5160000"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>※自動計算（S/A:+36万, B:+24万, C:+12万）より手動入力が優先されます</p>
              </div>
              <div className="form-group">
                <label className="form-label">インセンティブ（円）</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={editForm.incentive || ''} 
                  onChange={e => setEditForm({...editForm, incentive: Number(e.target.value) || undefined})} 
                  placeholder="例: 200000"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              {/* パネル表示エリア */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                {/* 現在の評価状況（総合点） */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>現在の評価状況 (総合点)</p>
                    <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>{annualScore !== null ? `${annualScore.toFixed(1)}点` : '未確定'}</h3>
                  </div>
                </div>

                {/* 総合評価ランク */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>総合評価ランク</p>
                    <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {annualScore !== null ? renderRankBadge(annualScore) : '未確定'}
                    </h3>
                  </div>
                </div>

                {/* 継続年数 */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>継続年数</p>
                    <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>{getYearsOfService(staff.joinedAt)}年</h3>
                  </div>
                </div>

                {/* 現在の年収 */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>現在の年収（月額）</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.annualSalary 
                        ? `${(staff.annualSalary / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : '未設定'}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {staff.annualSalary ? `(月額: ${Math.floor(staff.annualSalary / 12).toLocaleString()}円)` : '-'}
                    </p>
                  </div>
                </div>

                {/* 役職手当（リーダー手当 / マネジメント手当） */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>役職手当（リーダー / マネジメント）</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.roleAllowance 
                        ? `${(staff.roleAllowance / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : '未設定'}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {staff.roleAllowance ? `(月額: ${Math.floor(staff.roleAllowance / 12).toLocaleString()}円)` : '-'}
                    </p>
                  </div>
                </div>

                {/* 市場平均年収（マス媒体レポート2025） - 現在の年収と比較 */}
                {(() => {
                  const getMarketSalary = (s: Staff) => {
                    const isL = s.roleTitle === 'リーダー';
                    const isSub = s.roleTitle === 'サブリーダー';
                    switch(s.role) {
                      case 'WEBデザイナー': 
                        if (isL) return { title: 'アートディレクター', amount: 575.4 };
                        return { title: 'デザイナー', amount: 394.0 };
                      case 'コーダー':
                        if (isL) return { title: 'アートディレクター', amount: 575.4 };
                        return { title: 'コーダー(推定)', amount: 450.0 };
                      case 'ディレクター': 
                        if (isL) return { title: 'クリエイティブD', amount: 692.1 };
                        return { title: '制作ディレクター', amount: 507.2 };
                      case '映像': 
                        if (isL) return { title: '映像プロデューサー', amount: 586.8 };
                        if (isSub) return { title: '映像ディレクター', amount: 494.4 };
                        return { title: '映像編集', amount: 382.6 };
                      default: 
                        return { title: 'アシスタント', amount: 380.2 };
                    }
                  };
                  const market = getMarketSalary(staff);
                  const diff = staff.annualSalary ? (staff.annualSalary / 10000) - market.amount : 0;
                  return (
                    <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                      <div className="stat-content">
                        <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          市場平均年収<br/>
                          <span style={{ fontSize: '0.7rem' }}>({market.title} / 現在と比較)</span>
                        </p>
                        <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>
                          {market.amount.toFixed(1)}万円
                        </h3>
                        {staff.annualSalary && (
                          <p style={{ fontSize: '0.75rem', color: diff >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}万円
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 来期年収予測予定 */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>来期年収予測予定</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.nextAnnualSalary 
                        ? `${(staff.nextAnnualSalary / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : (getAutoNextSalary(staff) 
                            ? `${(getAutoNextSalary(staff)! / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                            : '未確定'
                          )
                      }
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {staff.nextAnnualSalary 
                        ? `(月額: ${Math.floor(staff.nextAnnualSalary / 12).toLocaleString()}円)`
                        : (getAutoNextSalary(staff) 
                            ? `(月額: ${Math.floor(getAutoNextSalary(staff)! / 12).toLocaleString()}円) [自動]` 
                            : '-'
                          )
                      }
                    </p>
                  </div>
                </div>

                {/* 市場平均年収（マス媒体レポート2025） - 来期予測と比較 */}
                {(() => {
                  const getMarketSalary = (s: Staff) => {
                    const isL = s.roleTitle === 'リーダー';
                    const isSub = s.roleTitle === 'サブリーダー';
                    switch(s.role) {
                      case 'WEBデザイナー': 
                        if (isL) return { title: 'アートディレクター', amount: 575.4 };
                        return { title: 'デザイナー', amount: 394.0 };
                      case 'コーダー':
                        if (isL) return { title: 'アートディレクター', amount: 575.4 };
                        return { title: 'コーダー(推定)', amount: 450.0 };
                      case 'ディレクター': 
                        if (isL) return { title: 'クリエイティブD', amount: 692.1 };
                        return { title: '制作ディレクター', amount: 507.2 };
                      case '映像': 
                        if (isL) return { title: '映像プロデューサー', amount: 586.8 };
                        if (isSub) return { title: '映像ディレクター', amount: 494.4 };
                        return { title: '映像編集', amount: 382.6 };
                      default: 
                        return { title: 'アシスタント', amount: 380.2 };
                    }
                  };
                  const market = getMarketSalary(staff);
                  const nextSalaryVal = staff.nextAnnualSalary ? staff.nextAnnualSalary : getAutoNextSalary(staff);
                  const diff = nextSalaryVal ? (nextSalaryVal / 10000) - market.amount : null;
                  return (
                    <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                      <div className="stat-content">
                        <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          市場平均年収<br/>
                          <span style={{ fontSize: '0.7rem' }}>({market.title} / 来期予測と比較)</span>
                        </p>
                        <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>
                          {market.amount.toFixed(1)}万円
                        </h3>
                        {diff !== null && (
                          <p style={{ fontSize: '0.75rem', color: diff >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}万円
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* インセンティブ */}
                <div className="stat-panel" style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>インセンティブ</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.incentive 
                        ? `${(staff.incentive / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : (getAutoIncentive(staff) > 0 
                            ? `${(getAutoIncentive(staff) / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                            : '0万円'
                          )
                      }
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {!staff.incentive && getAutoIncentive(staff) > 0 ? '[自動目安]' : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* チャート表示エリア */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* 職種・タイプ別評価 */}
                {radarData.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>職種・タイプ別評価（通期比較）</h4>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="rgba(0,0,0,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                          <Radar name="上期" dataKey="上期" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                          <Radar name="下期" dataKey="下期" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 業績・案件貢献 */}
                {performanceData.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>業績・案件貢献（{currentEval?.performanceScore || 0}点）</h4>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 10}} />
                          <YAxis domain={[0, 10]} stroke="var(--text-secondary)" tick={{fontSize: 10}} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="score" name="獲得点数" radius={[4, 4, 0, 0]}>
                            {performanceData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 個人テーマ */}
                {themeData.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>個人テーマ（{currentEval?.themeScore || 0}点）</h4>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <BarChart data={themeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 10}} />
                          <YAxis domain={[0, 5]} stroke="var(--text-secondary)" tick={{fontSize: 10}} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="score" name="獲得点数" radius={[4, 4, 0, 0]} fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* その他詳細情報 */}
              <div style={{ display: 'flex', gap: 'var(--spacing-8)', padding: 'var(--spacing-4)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
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
  const evaluations = useStore((state) => state.evaluations);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Staff | null>(null);
  
  const pdfRef = React.useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    
    setIsPdfGenerating(true);
    element.style.left = '0';
    element.style.zIndex = '9999';
    
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save('staff_list_report.pdf');
    } catch (error) {
      console.error('PDF generation failed', error);
      alert('PDFの生成に失敗しました');
    } finally {
      element.style.left = '-9999px';
      element.style.zIndex = '-1';
      setIsPdfGenerating(false);
    }
  };

  const availableTypes = React.useMemo(() => {
    const types = new Set(masterItems.map(item => item.type));
    return Array.from(types);
  }, [masterItems]);

  const getAutoNextSalary = (staff: Staff) => {
    if (!staff.annualSalary) return undefined;
    
    // Find rank for 2026 (or latest year)
    const year = 2026;
    const evals = evaluations.filter(e => e.staffId === staff.id && e.year === year);
    const upper = evals.find(e => e.period === '上期');
    const lower = evals.find(e => e.period === '下期');
    const upperScore = upper ? upper.totalScore : null;
    const lowerScore = lower ? lower.totalScore : null;
    let annualScore = null;
    if (upperScore !== null && lowerScore !== null) {
      annualScore = (upperScore + lowerScore) / 2;
    } else if (upperScore !== null) {
      annualScore = upperScore;
    } else if (lowerScore !== null) {
      annualScore = lowerScore;
    }
    
    if (annualScore === null) return staff.annualSalary;
    
    const rank = getRankData(annualScore)?.baseRank;
    if (rank === 'S' || rank === 'A') {
      return staff.annualSalary + 360000; // 3万円 * 12ヶ月
    } else if (rank === 'B') {
      return staff.annualSalary + 240000; // 2万円 * 12ヶ月
    } else if (rank === 'C') {
      return staff.annualSalary + 120000; // 1万円 * 12ヶ月
    }

    return staff.annualSalary;
  };

  const getAutoIncentive = (staff: Staff) => {
    const year = 2026;
    const evals = evaluations.filter(e => e.staffId === staff.id && e.year === year);
    const upper = evals.find(e => e.period === '上期');
    const lower = evals.find(e => e.period === '下期');
    const upperScore = upper ? upper.totalScore : null;
    const lowerScore = lower ? lower.totalScore : null;
    let annualScore = null;
    if (upperScore !== null && lowerScore !== null) {
      annualScore = (upperScore + lowerScore) / 2;
    } else if (upperScore !== null) {
      annualScore = upperScore;
    } else if (lowerScore !== null) {
      annualScore = lowerScore;
    }
    if (annualScore === null) return 0;
    
    const rankData = getRankData(annualScore);
    if (!rankData) return 0;
    let incentive = 0;
    const { baseRank, subRank } = rankData;
    const fullRank = `${baseRank}${subRank}`;
    
    switch (fullRank) {
      case 'S++': incentive = 1200000; break;
      case 'S+':  incentive = 1100000; break;
      case 'S':   incentive = 1000000; break;
      case 'S-':  incentive = 900000; break;
      case 'S--': incentive = 800000; break;
      case 'A++': incentive = 750000; break;
      case 'A+':  incentive = 700000; break;
      case 'A':   incentive = 650000; break;
      case 'A-':  incentive = 600000; break;
      case 'A--': incentive = 550000; break;
      case 'B++': incentive = 500000; break;
      case 'B+':  incentive = 450000; break;
      case 'B':   incentive = 400000; break;
      case 'B-':  incentive = 350000; break;
      case 'B--': incentive = 300000; break;
      case 'C++': incentive = 250000; break;
      case 'C+':  incentive = 200000; break;
      default: incentive = 0;
    }
    return incentive;
  };

  const handleEdit = (staff: Staff) => {
    setEditingId(staff.id);
    setEditForm({ 
      ...staff,
      nextAnnualSalary: staff.nextAnnualSalary !== undefined ? staff.nextAnnualSalary : getAutoNextSalary(staff)
    });
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
        <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleDownloadPDF} 
            disabled={isPdfGenerating}
            style={{ 
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={16} />
            {isPdfGenerating ? '生成中...' : 'PDFを出力'}
          </button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={editingId !== null}>
            ＋ スタッフ追加
          </button>
        </div>
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
            {staffList.map((staff: Staff) => {
              const year = 2026;
              const evals = evaluations.filter(e => e.staffId === staff.id && e.year === year);
              const upper = evals.find(e => e.period === '上期');
              const lower = evals.find(e => e.period === '下期');
              const upperScore = upper ? upper.totalScore : null;
              const lowerScore = lower ? lower.totalScore : null;
              let annualScore = null;
              if (upperScore !== null && lowerScore !== null) {
                annualScore = (upperScore + lowerScore) / 2;
              } else if (upperScore !== null) {
                annualScore = upperScore;
              } else if (lowerScore !== null) {
                annualScore = lowerScore;
              }

              return (
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
                  getAutoNextSalary={getAutoNextSalary}
                  getAutoIncentive={getAutoIncentive}
                  annualScore={annualScore}
                  evaluations={evaluations}
                  masterItems={masterItems}
                />
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
      <PdfReport 
        ref={pdfRef} 
        staffList={staffList} 
        evaluations={evaluations} 
        getAutoNextSalary={getAutoNextSalary} 
        getAutoIncentive={getAutoIncentive} 
      />
    </div>
  );
};
