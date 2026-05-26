import React, { useState } from 'react';
import { useStore } from '../store';
import type { RoleStage, RoleRequirement } from '../types';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';

export const RoleStagesEditor: React.FC = () => {
  const roleStages = useStore(state => state.roleStages);
  const addRoleStage = useStore(state => state.addRoleStage);
  const updateRoleStage = useStore(state => state.updateRoleStage);
  const deleteRoleStage = useStore(state => state.deleteRoleStage);

  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageForm, setStageForm] = useState<RoleStage | null>(null);

  const handleEditStage = (stage: RoleStage) => {
    setEditingStageId(stage.id);
    setStageForm(JSON.parse(JSON.stringify(stage)));
  };

  const handleAddStage = () => {
    setEditingStageId('NEW');
    setStageForm({
      id: `stage_${Date.now()}`,
      title: '',
      yearsRequired: 0,
      salaryRange: '',
      requirements: []
    });
  };

  const handleSaveStage = () => {
    if (stageForm) {
      if (editingStageId === 'NEW') {
        addRoleStage(stageForm);
      } else {
        updateRoleStage(stageForm);
      }
    }
    setEditingStageId(null);
    setStageForm(null);
  };

  const handleDeleteStage = (id: string) => {
    if (confirm('このステージを削除してよろしいですか？')) {
      deleteRoleStage(id);
    }
  };

  const handleAddRequirement = () => {
    if (stageForm) {
      setStageForm({
        ...stageForm,
        requirements: [
          ...stageForm.requirements,
          {
            id: `req_${Date.now()}`,
            name: '',
            targetScore: 0,
            type: 'common'
          }
        ]
      });
    }
  };

  const updateRequirement = (index: number, field: keyof RoleRequirement, value: any) => {
    if (stageForm) {
      const newReqs = [...stageForm.requirements];
      newReqs[index] = { ...newReqs[index], [field]: value };
      setStageForm({ ...stageForm, requirements: newReqs });
    }
  };

  const deleteRequirement = (index: number) => {
    if (stageForm) {
      const newReqs = [...stageForm.requirements];
      newReqs.splice(index, 1);
      setStageForm({ ...stageForm, requirements: newReqs });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>給与レンジ・昇格条件（ロールモデル）設定</h2>
        <button className="btn primary" onClick={handleAddStage}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          新規ステージ追加
        </button>
      </div>
      
      {roleStages.length === 0 && (
        <div style={{ padding: 'var(--spacing-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
          ステージが設定されていません。
        </div>
      )}

      {roleStages.map(stage => (
        <div key={stage.id} style={{ 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)', 
          background: 'var(--bg-surface)',
          overflow: 'hidden'
        }}>
          {editingStageId === stage.id && stageForm ? (
            <div style={{ padding: 'var(--spacing-6)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                <div className="form-group">
                  <label className="form-label">ステージ名 (必須)</label>
                  <input className="form-input" value={stageForm.title} onChange={e => setStageForm({...stageForm, title: e.target.value})} placeholder="例: 中堅" />
                </div>
                <div className="form-group">
                  <label className="form-label">目安勤続年数 (必須)</label>
                  <input type="number" className="form-input" value={stageForm.yearsRequired} onChange={e => setStageForm({...stageForm, yearsRequired: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">給与レンジ</label>
                  <input className="form-input" value={stageForm.salaryRange} onChange={e => setStageForm({...stageForm, salaryRange: e.target.value})} placeholder="例: 400〜500万円" />
                </div>
              </div>

              <h4 style={{ marginBottom: 'var(--spacing-4)', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>達成条件（クエスト）</h4>
              
              {stageForm.requirements.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-4)' }}>条件が設定されていません。</p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
                {stageForm.requirements.map((req, i) => (
                  <div key={req.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">評価種別</label>
                        <select className="form-select" value={req.type} onChange={e => updateRequirement(i, 'type', e.target.value)}>
                          <option value="common">共通評価（個別の項目）</option>
                          <option value="type_average">タイプ別評価（平均点）</option>
                          <option value="performance">業績評価（合計点）</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">目標点数</label>
                        <input type="number" className="form-input" value={req.targetScore} onChange={e => updateRequirement(i, 'targetScore', Number(e.target.value))} />
                      </div>
                      
                      {req.type === 'common' && (
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">対象の共通評価</label>
                          <select className="form-select" value={req.commonIndex || 1} onChange={e => updateRequirement(i, 'commonIndex', Number(e.target.value))}>
                            <option value={1}>1. 目的理解</option>
                            <option value={2}>2. 納期・責任感</option>
                            <option value={3}>3. 品質意識</option>
                            <option value={4}>4. 改善提案・連携</option>
                            <option value={5}>5. 学習・成長</option>
                          </select>
                        </div>
                      )}
                      
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">表示名 (UIに表示される名前)</label>
                        <input className="form-input" value={req.name} onChange={e => updateRequirement(i, 'name', e.target.value)} placeholder="例: 品質意識 4.0以上" />
                      </div>
                    </div>
                    <button className="btn outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '8px' }} onClick={() => deleteRequirement(i)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <button className="btn outline" onClick={handleAddRequirement} style={{ marginBottom: 'var(--spacing-6)' }}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                条件を追加
              </button>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn outline" onClick={() => setEditingStageId(null)}>キャンセル</button>
                <button className="btn primary" onClick={handleSaveStage}>
                  <Save size={16} style={{ marginRight: '8px' }} />
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{stage.title}</h3>
                    <span className="badge" style={{ background: 'var(--accent-primary)', color: 'white' }}>{stage.yearsRequired}年以上</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    目標レンジ: <strong>{stage.salaryRange}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn outline" onClick={() => handleEditStage(stage)}>
                    <Edit2 size={16} style={{ marginRight: '8px' }} />
                    編集
                  </button>
                  <button className="btn outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDeleteStage(stage.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {stage.requirements.length > 0 && (
                <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <h5 style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>達成条件：</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {stage.requirements.map(req => (
                      <div key={req.id} style={{ 
                        background: 'rgba(0,0,0,0.03)', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>{req.name}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                          (目標: {req.targetScore})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      
      {/* NEW STAGE FORM */}
      {editingStageId === 'NEW' && stageForm && (
        <div style={{ 
          border: '1px solid var(--accent-primary)', 
          borderRadius: 'var(--radius-lg)', 
          background: 'var(--bg-surface)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: 'var(--spacing-6)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--accent-primary)', marginBottom: 'var(--spacing-6)' }}>新規ステージの追加</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
              <div className="form-group">
                <label className="form-label">ステージ名 (必須)</label>
                <input className="form-input" value={stageForm.title} onChange={e => setStageForm({...stageForm, title: e.target.value})} placeholder="例: 中堅" />
              </div>
              <div className="form-group">
                <label className="form-label">目安勤続年数 (必須)</label>
                <input type="number" className="form-input" value={stageForm.yearsRequired} onChange={e => setStageForm({...stageForm, yearsRequired: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">給与レンジ</label>
                <input className="form-input" value={stageForm.salaryRange} onChange={e => setStageForm({...stageForm, salaryRange: e.target.value})} placeholder="例: 400〜500万円" />
              </div>
            </div>

            <h4 style={{ marginBottom: 'var(--spacing-4)', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>達成条件（クエスト）</h4>
            
            {stageForm.requirements.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-4)' }}>条件が設定されていません。</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
              {stageForm.requirements.map((req, i) => (
                <div key={req.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">評価種別</label>
                      <select className="form-select" value={req.type} onChange={e => updateRequirement(i, 'type', e.target.value)}>
                        <option value="common">共通評価（個別の項目）</option>
                        <option value="type_average">タイプ別評価（平均点）</option>
                        <option value="performance">業績評価（合計点）</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">目標点数</label>
                      <input type="number" className="form-input" value={req.targetScore} onChange={e => updateRequirement(i, 'targetScore', Number(e.target.value))} />
                    </div>
                    
                    {req.type === 'common' && (
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">対象の共通評価</label>
                        <select className="form-select" value={req.commonIndex || 1} onChange={e => updateRequirement(i, 'commonIndex', Number(e.target.value))}>
                          <option value={1}>1. 目的理解</option>
                          <option value={2}>2. 納期・責任感</option>
                          <option value={3}>3. 品質意識</option>
                          <option value={4}>4. 改善提案・連携</option>
                          <option value={5}>5. 学習・成長</option>
                        </select>
                      </div>
                    )}
                    
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">表示名 (UIに表示される名前)</label>
                      <input className="form-input" value={req.name} onChange={e => updateRequirement(i, 'name', e.target.value)} placeholder="例: 品質意識 4.0以上" />
                    </div>
                  </div>
                  <button className="btn outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '8px' }} onClick={() => deleteRequirement(i)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <button className="btn outline" onClick={handleAddRequirement} style={{ marginBottom: 'var(--spacing-6)' }}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              条件を追加
            </button>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn outline" onClick={() => setEditingStageId(null)}>キャンセル</button>
              <button className="btn primary" onClick={handleSaveStage}>
                <Save size={16} style={{ marginRight: '8px' }} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
