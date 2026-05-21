import React, { useState, useEffect } from 'react';
import type { Staff, EvaluationForm } from '../types';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell 
} from 'recharts';

interface Props {
  staff: Staff;
  evaluations: EvaluationForm[];
  initialPeriod: '上期' | '下期';
  onClose: () => void;
}

export const EvaluationDetailModal: React.FC<Props> = ({ staff, evaluations, initialPeriod, onClose }) => {
  const [detailPeriod, setDetailPeriod] = useState<'上期' | '下期'>(initialPeriod);
  const masterItems = useStore(state => state.masterItems);

  // Sync state if props change
  useEffect(() => {
    setDetailPeriod(initialPeriod);
  }, [initialPeriod]);

  const getDetailEval = (staffId: string, period: string) => {
    return evaluations.find(e => e.staffId === staffId && e.period === period);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%', maxWidth: '900px', maxHeight: '90vh', 
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

          // Prepare Chart Data
          const performanceData = [
            { name: '案件貢献', score: ev.performanceDetails[0] },
            { name: '品質・納期', score: ev.performanceDetails[1] },
            { name: '顧客・社内貢献', score: ev.performanceDetails[2] },
          ];

          const themeData = ev.themeTexts?.map((text, i) => ({
            name: `テーマ${i+1}`,
            score: ev.themeDetails[i],
            text: text || '未設定'
          })).filter(d => d.text !== '未設定') || [];

          const typeEntries = ev.entries.filter(en => {
            const item = masterItems.find(m => m.id === en.itemId);
            return item && item.category === '職種・タイプ別評価' && item.type === staff.type;
          });

          const radarData = typeEntries.map(en => {
            const item = masterItems.find(m => m.id === en.itemId);
            return {
              subject: item ? item.name : en.itemId,
              score: en.finalScore,
              fullMark: 5
            };
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                <div className="stat-card" style={{ flex: 1, padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>総合点数</p>
                  <h3 style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>{ev.totalScore > 0 ? `${ev.totalScore} 点` : '評価未確定'}</h3>
                </div>
              </div>

              {/* Charts Section - 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                
                {/* Type/Role Radar Chart */}
                {radarData.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>職種・タイプ別 バランス</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.2)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--text-muted)' }} />
                          <Radar name={staff.name} dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Performance Bar Chart */}
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>業績・案件貢献（{ev.performanceScore}点）</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={performanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                        <YAxis domain={[0, 5]} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
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

                {/* Theme Bar Chart */}
                {themeData.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>個人テーマ（{ev.themeScore}点）</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={themeData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                          <YAxis domain={[0, 5]} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey="score" name="獲得点数" radius={[4, 4, 0, 0]} fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Text Details Section */}
              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>2. 個人テーマ 詳細</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '16px', fontSize: '0.875rem' }}>
                  {ev.themeTexts?.map((t, i) => t ? <li key={i}>{t}</li> : null)}
                </ul>
              </div>

              {(staff.isLeader || staff.isSubLeader || staff.canEditTeamGoals) && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>3. チーム目標達成度（{ev.teamScore}点）</h3>
                  <ul style={{ paddingLeft: '20px', marginBottom: '16px', fontSize: '0.875rem' }}>
                    {ev.teamTexts?.map((t, i) => t ? <li key={i}>
                      {t} <span style={{fontWeight: 'bold', color: 'var(--accent-primary)', marginLeft: '8px'}}>[ {ev.teamDetails[i]}点 ]</span>
                    </li> : null)}
                  </ul>
                </div>
              )}

              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                  4. 詳細項目一覧（共通: {ev.commonScore}点, 職種/タイプ: {ev.typeScore}点, リーダー: {ev.leaderScore}点）
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
                      {ev.entries.filter(en => en.finalScore > 0 || en.comment).map((en) => {
                        const item = masterItems.find(m => m.id === en.itemId);
                        return (
                          <tr key={en.itemId}>
                            <td>{item ? item.name : (en.itemId.split('|')[1] || en.itemId)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{en.finalScore}</td>
                            <td>{en.comment || '-'}</td>
                          </tr>
                        );
                      })}
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
