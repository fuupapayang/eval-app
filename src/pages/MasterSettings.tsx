import React, { useState } from 'react';
import { useStore } from '../store';
import type { EvaluationItem } from '../types';

export const MasterSettings: React.FC = () => {
  const masterItems = useStore(state => state.masterItems);
  const addMasterItem = useStore(state => state.addMasterItem);
  const updateMasterItem = useStore(state => state.updateMasterItem);
  const deleteMasterItem = useStore(state => state.deleteMasterItem);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EvaluationItem | null>(null);

  const handleEdit = (item: EvaluationItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleAdd = (type: string) => {
    setEditingId(`NEW_${type}`);
    const itemsOfType = masterItems.filter(i => i.type === type);
    const nextNo = itemsOfType.length > 0 ? Math.max(...itemsOfType.map(i => i.no)) + 1 : 1;
    setEditForm({
      id: Date.now().toString(),
      no: nextNo,
      type,
      category: '職種・タイプ別評価',
      name: '',
      description: '',
      achievementLevel: ''
    });
  };

  const handleAddNewType = () => {
    const newType = prompt('新しいタイプ名を入力してください');
    if (newType && newType.trim() !== '') {
      handleAdd(newType.trim());
    }
  };

  const handleSave = () => {
    if (editForm) {
      if (editingId && editingId.startsWith('NEW_')) {
        addMasterItem(editForm);
      } else {
        updateMasterItem(editForm);
      }
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('本当に削除しますか？')) {
      deleteMasterItem(id);
    }
  };

  // Group by type
  const groupedItems = masterItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof masterItems>);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">評価マスタ</h1>
        <p className="page-subtitle">評価項目や評価基準の確認・管理を行います</p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>評価基準マスタ</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>選択肢</th>
                <th>点数</th>
                <th>説明</th>
                <th>評価ランク</th>
                <th>点数基準</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>5：期待を大きく上回る</td><td>5</td><td>成果・品質・貢献が明確に期待を大きく上回った</td><td><span className="badge primary">S</span></td><td>90点以上</td></tr>
              <tr><td>4：期待を上回る</td><td>4</td><td>期待を上回る成果や改善が見られた</td><td><span className="badge success">A</span></td><td>80〜89点</td></tr>
              <tr><td>3：期待どおり</td><td>3</td><td>求められる水準をおおむね満たした</td><td><span className="badge warning">B</span></td><td>70〜79点</td></tr>
              <tr><td>2：一部改善が必要</td><td>2</td><td>一部達成したが、改善余地が大きい</td><td><span className="badge">C</span></td><td>60〜69点</td></tr>
              <tr><td>1：大きな改善が必要</td><td>1</td><td>取り組み・成果ともに不足している</td><td><span className="badge" style={{ color: 'var(--danger)' }}>D</span></td><td>59点以下</td></tr>
              <tr><td>0：該当なし／未実施</td><td>0</td><td>評価対象外、または取り組みなし</td><td>-</td><td>-</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 'var(--spacing-4)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <p><strong>※ 評価ランクの細分化について</strong></p>
          <p>各ランク（S〜D）は、合計点数に応じてさらに5段階（--, -, 無印, +, ++）に細分化されます。</p>
          <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
            <li><strong>A・B・Cランク</strong>：2点刻みで変動します。（例：A--は80〜81点、Aは84〜85点、A++は88〜89点）</li>
            <li><strong>Sランク</strong>：90点から2点刻みで変動し、100点の場合のみ幅が広くなります。（例：S--は90〜91点、S++は98〜100点）</li>
            <li><strong>Dランク</strong>：12点刻みで変動します。（例：D--は0〜11点、D++は48〜59点）</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <h2>職種・タイプ別評価項目</h2>
          <button className="btn btn-primary" onClick={handleAddNewType} disabled={editingId !== null}>
            ＋ 新しいタイプを追加
          </button>
        </div>
        {Object.entries(groupedItems).map(([type, items]) => (
          <div key={type} style={{ marginBottom: 'var(--spacing-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
              <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>{type}</h3>
              <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => handleAdd(type)} disabled={editingId !== null}>
                ＋ 項目追加
              </button>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>No</th>
                    <th style={{ width: '200px' }}>評価項目</th>
                    <th>評価内容</th>
                    <th>達成水準</th>
                    <th style={{ width: '120px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      {editingId === item.id && editForm ? (
                        <>
                          <td><input type="number" className="form-input" value={editForm.no} onChange={e => setEditForm({...editForm, no: Number(e.target.value)})} style={{width: '60px'}} /></td>
                          <td><input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="項目名" /></td>
                          <td><textarea className="form-input" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} /></td>
                          <td><textarea className="form-input" value={editForm.achievementLevel} onChange={e => setEditForm({...editForm, achievementLevel: e.target.value})} rows={2} /></td>
                          <td>
                            <div style={{display: 'flex', gap: '4px', flexDirection: 'column'}}>
                              <button className="btn btn-primary" style={{padding: '4px', fontSize: '0.75rem'}} onClick={handleSave}>保存</button>
                              <button className="btn btn-outline" style={{padding: '4px', fontSize: '0.75rem'}} onClick={handleCancel}>取消</button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{item.no}</td>
                          <td style={{ fontWeight: 600 }}>{item.name}</td>
                          <td>{item.description}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{item.achievementLevel}</td>
                          <td>
                            <div style={{display: 'flex', gap: '4px'}}>
                              <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.75rem'}} onClick={() => handleEdit(item)}>編集</button>
                              <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.75rem', borderColor: 'var(--danger)', color: 'var(--danger)'}} onClick={() => handleDelete(item.id)}>削除</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {editingId === `NEW_${type}` && editForm && (
                    <tr>
                      <td><input type="number" className="form-input" value={editForm.no} onChange={e => setEditForm({...editForm, no: Number(e.target.value)})} style={{width: '60px'}} /></td>
                      <td><input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="項目名" /></td>
                      <td><textarea className="form-input" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={2} /></td>
                      <td><textarea className="form-input" value={editForm.achievementLevel} onChange={e => setEditForm({...editForm, achievementLevel: e.target.value})} rows={2} /></td>
                      <td>
                        <div style={{display: 'flex', gap: '4px', flexDirection: 'column'}}>
                          <button className="btn btn-primary" style={{padding: '4px', fontSize: '0.75rem'}} onClick={handleSave}>追加</button>
                          <button className="btn btn-outline" style={{padding: '4px', fontSize: '0.75rem'}} onClick={handleCancel}>取消</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
