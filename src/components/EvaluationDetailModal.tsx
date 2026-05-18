import React, { useState, useEffect } from 'react';
import type { Staff, EvaluationForm } from '../types';
import { X } from 'lucide-react';

interface Props {
  staff: Staff;
  evaluations: EvaluationForm[];
  initialPeriod: '上期' | '下期';
  onClose: () => void;
}

export const EvaluationDetailModal: React.FC<Props> = ({ staff, evaluations, initialPeriod, onClose }) => {
  const [detailPeriod, setDetailPeriod] = useState<'上期' | '下期'>(initialPeriod);

  // Sync state if props change
  useEffect(() => {
    setDetailPeriod(initialPeriod);
  }, [initialPeriod]);

  const getDetailEval = (staffId: string, period: string) => {
    return evaluations.find(e => e.staffId === staffId && e.period === period);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '800px', maxHeight: '90vh', 
        overflowY: 'auto', padding: 'var(--spacing-6)', position: 'relative',
        background: 'var(--bg-card)'
      }}>
        <button 
          className="btn" 
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
          onClick={onClose}
        >
          <X size={24} />
        </button>
        
        <h2 style={{ marginBottom: '8px' }}>{staff.name} の評価詳細</h2>
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-6)' }}>
          <span className="badge">{staff.role}</span>
          <span className="badge">{staff.type}</span>
          <span className="badge primary">{staff.roleTitle}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-6)' }}>
          <button 
            className={`btn ${detailPeriod === '上期' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setDetailPeriod('上期')}
          >
            上期
          </button>
          <button 
            className={`btn ${detailPeriod === '下期' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setDetailPeriod('下期')}
          >
            下期
          </button>
        </div>

        {(() => {
          const ev = getDetailEval(staff.id, detailPeriod);
          if (!ev) return <p style={{ color: 'var(--text-secondary)' }}>この期の評価データはありません。</p>;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                <div className="stat-card" style={{ flex: 1, padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>総合点数</p>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>{ev.totalScore > 0 ? `${ev.totalScore} 点` : '評価未確定'}</h3>
                </div>
              </div>

              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>1. 業績・案件貢献（{ev.performanceScore}点）</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
                  <div>自己評価: {ev.performanceDetails[0]}</div>
                  <div>1次評価: {ev.performanceDetails[1]}</div>
                  <div style={{ fontWeight: 'bold' }}>最終確定: {ev.performanceDetails[2]}</div>
                </div>
              </div>

              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>2. 個人テーマ（{ev.themeScore}点）</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px', fontSize: '0.875rem' }}>
                  {ev.themeTexts?.map((t, i) => t ? <li key={i}>{t}</li> : null)}
                </ul>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
                  <div>自己評価: {ev.themeDetails[0]}</div>
                  <div>1次評価: {ev.themeDetails[1]}</div>
                  <div style={{ fontWeight: 'bold' }}>最終確定: {ev.themeDetails[2]}</div>
                </div>
              </div>

              {(staff.isLeader || staff.isSubLeader || staff.canEditTeamGoals) && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>3. チーム目標達成度（{ev.teamScore}点）</h3>
                  <ul style={{ paddingLeft: '20px', marginBottom: '16px', fontSize: '0.875rem' }}>
                    {ev.teamTexts?.map((t, i) => t ? <li key={i}>{t}</li> : null)}
                  </ul>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.875rem' }}>
                    <div>自己評価: {ev.teamDetails[0]}</div>
                    <div>1次評価: {ev.teamDetails[1]}</div>
                    <div style={{ fontWeight: 'bold' }}>最終確定: {ev.teamDetails[2]}</div>
                  </div>
                </div>
              )}

              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                  4. 詳細項目（共通: {ev.commonScore}点, 職種/タイプ: {ev.typeScore}点, リーダー: {ev.leaderScore}点）
                </h3>
                {ev.entries.filter(en => en.finalScore > 0 || en.comment).length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>詳細項目の入力はありません</p>
                ) : (
                  <table className="table" style={{ fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th>項目名</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>最終点</th>
                        <th>コメント</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ev.entries.filter(en => en.finalScore > 0 || en.comment).map((en) => (
                        <tr key={en.itemId}>
                          <td>{en.itemId.split('|')[1] || en.itemId}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{en.finalScore}</td>
                          <td>{en.comment || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {(ev.bonusScore > 0 || ev.bonusComment) && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>加点評価（{ev.bonusScore}点）</h3>
                  <p style={{ fontSize: '0.875rem' }}>{ev.bonusComment || '-'}</p>
                </div>
              )}

              {ev.selfComment && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>自己評価コメント（期末振り返り用）</h3>
                  <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
                    {ev.selfComment}
                  </p>
                </div>
              )}

              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>Masterからの総合コメント</h3>
                <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px' }}>
                  {ev.generalComment || 'コメントなし'}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
