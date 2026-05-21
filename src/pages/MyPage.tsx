import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { Period } from '../types';
import { EvaluationDetailModal } from '../components/EvaluationDetailModal';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell 
} from 'recharts';

export const MyPage: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const evaluations = useStore(state => state.evaluations);
  const saveEvaluation = useStore(state => state.saveEvaluation);
  const getEvaluation = useStore(state => state.getEvaluation);

  const [period, setPeriod] = useState<Period>('上期');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [themeTexts, setThemeTexts] = useState<[string, string, string]>(['', '', '']);
  const [teamTexts, setTeamTexts] = useState<[string, string, string]>(['', '', '']);
  const [selfComment, setSelfComment] = useState<string>('');
  
  const [detailPeriodInfo, setDetailPeriodInfo] = useState<{year: number, period: '上期'|'下期'} | null>(null);
  
  // Password state
  const updateStaff = useStore(state => state.updateStaff);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  if (!currentUser || currentUser.type !== 'STAFF') {
    return <div>権限がありません</div>;
  }

  const staff = currentUser.staff;


  // Load goals when period/year changes
  React.useEffect(() => {
    const existing = getEvaluation(staff.id, period, year);
    if (existing) {
      setThemeTexts(existing.themeTexts || ['', '', '']);
      setTeamTexts(existing.teamTexts || ['', '', '']);
      setSelfComment(existing.selfComment || '');
    } else {
      setThemeTexts(['', '', '']);
      setTeamTexts(['', '', '']);
      setSelfComment('');
    }
  }, [staff.id, period, year, getEvaluation]);

  const canEditTeam = staff.isLeader || staff.isSubLeader || staff.canEditTeamGoals;

  const handleSaveGoals = () => {
    const existing = getEvaluation(staff.id, period, year);
    const evalData = existing || {
      id: `${staff.id}-${year}-${period}`,
      staffId: staff.id,
      period,
      year,
      performanceScore: 0,
      performanceDetails: [0, 0, 0],
      themeScore: 0,
      themeDetails: [0, 0, 0],
      teamScore: 0,
      teamDetails: [0, 0, 0],
      commonScore: 0,
      typeScore: 0,
      leaderScore: 0,
      bonusScore: 0,
      totalScore: 0,
      entries: [],
      generalComment: '',
      updatedAt: new Date().toISOString()
    };

    saveEvaluation({
      ...evalData,
      themeTexts,
      teamTexts: canEditTeam ? teamTexts : evalData.teamTexts,
      selfComment,
      updatedAt: new Date().toISOString()
    });

    alert('目標を保存しました。');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Check current password
    const defaultPassword = staff.id.replace('staff-', '').padStart(4, '0');
    const expectedCurrent = staff.password || defaultPassword;
    
    if (currentPassword !== expectedCurrent) {
      setPasswordError('現在のパスワードが間違っています。');
      return;
    }
    
    if (newPassword.length < 4) {
      setPasswordError('新しいパスワードは4文字以上で設定してください。');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('新しいパスワード（確認用）が一致しません。');
      return;
    }
    
    try {
      await updateStaff({
        ...staff,
        password: newPassword
      });
      setPasswordSuccess('パスワードを変更しました。');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError('エラーが発生しました。');
    }
  };

  const myEvaluations = useMemo(() => {
    return evaluations.filter(e => e.staffId === staff.id).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.period === '下期' ? -1 : 1;
    });
  }, [evaluations, staff.id]);

  const getRank = (score: number) => {
    if (score >= 90) return <span className="badge primary">S</span>;
    if (score >= 80) return <span className="badge success">A</span>;
    if (score >= 70) return <span className="badge warning">B</span>;
    if (score >= 60) return <span className="badge">C</span>;
    return <span className="badge" style={{ color: 'var(--danger)' }}>D</span>;
  };

  const masterItems = useStore(state => state.masterItems);
  const currentEval = getEvaluation(staff.id, period, year);

  // Prepare Chart Data for current evaluation
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
  
  let performanceData: any[] = [];
  let themeData: any[] = [];
  let radarData: any[] = [];

  if (currentEval) {
    performanceData = [
      { name: '案件貢献', score: currentEval.performanceDetails[0] },
      { name: '品質・納期', score: currentEval.performanceDetails[1] },
      { name: '顧客・社内貢献', score: currentEval.performanceDetails[2] },
    ];

    themeData = currentEval.themeTexts?.map((text, i) => ({
      name: `テーマ${i+1}`,
      score: currentEval.themeDetails[i],
      text: text || '未設定'
    })).filter(d => d.text !== '未設定') || [];
  }

  // Always build radar data for the staff's type, even if not yet evaluated
  const typeItems = masterItems.filter(m => m.category === '職種・タイプ別評価' && m.type === staff.type);
  radarData = typeItems.map(item => {
    let score = 0;
    if (currentEval) {
      const entry = currentEval.entries.find(en => en.itemId === item.id);
      if (entry) score = entry.finalScore;
    }
    return {
      subject: item.name,
      score: score,
      fullMark: 5
    };
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">マイページ</h1>
        <p className="page-subtitle">{staff.name} さんの目標設定・評価履歴</p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>目標設定</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
          <div className="form-group" style={{ width: '150px' }}>
            <label className="form-label">対象年度</label>
            <input type="number" className="form-input" value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ width: '150px' }}>
            <label className="form-label">評価期</label>
            <select className="form-select" value={period} onChange={e => setPeriod(e.target.value as Period)}>
              <option value="上期">上期</option>
              <option value="下期">下期</option>
            </select>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ marginTop: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-4)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            現在の評価状況（{year}年度 {period}）{currentEval && currentEval.totalScore > 0 ? `- 総合: ${currentEval.totalScore}点` : '- 評価未確定'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Type/Role Radar Chart (Always show based on master items) */}
            {radarData.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-secondary)' }}>職種・タイプ別評価（最大 25 点）</h4>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--text-muted)' }} />
                        <Radar name={staff.name} dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
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
              {performanceData.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-secondary)' }}>業績・案件貢献（{currentEval?.performanceScore || 0}点）</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={performanceData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 11}} />
                        <YAxis domain={[0, 10]} stroke="var(--text-secondary)" tick={{fontSize: 11}} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
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

              {/* Theme Bar Chart */}
              {themeData.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: 'var(--radius-xl)' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--text-secondary)' }}>個人テーマ（{currentEval?.themeScore || 0}点）</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={themeData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 11}} />
                        <YAxis domain={[0, 5]} stroke="var(--text-secondary)" tick={{fontSize: 11}} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        />
                        <Bar dataKey="score" name="獲得点数" radius={[4, 4, 0, 0]} fill="#ec4899" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
          <div>
            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>個人テーマ</h3>
            {[0, 1, 2].map(i => (
              <div key={`theme-${i}`} className="form-group">
                <label className="form-label">個人テーマ {i + 1}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={themeTexts[i]} 
                  onChange={e => {
                    const newTexts = [...themeTexts] as [string, string, string];
                    newTexts[i] = e.target.value;
                    setThemeTexts(newTexts);
                  }}
                  placeholder="達成したい目標を入力"
                />
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ marginBottom: 'var(--spacing-3)' }}>チーム目標</h3>
            {[0, 1, 2].map(i => (
              <div key={`team-${i}`} className="form-group">
                <label className="form-label">チーム目標 {i + 1}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={teamTexts[i]} 
                  onChange={e => {
                    const newTexts = [...teamTexts] as [string, string, string];
                    newTexts[i] = e.target.value;
                    setTeamTexts(newTexts);
                  }}
                  placeholder="チームとして達成したい目標"
                  disabled={!canEditTeam}
                />
              </div>
            ))}
            {!canEditTeam && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>※チーム目標の入力権限がありません</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: 'var(--spacing-6)' }}>
          <h3 style={{ marginBottom: 'var(--spacing-3)' }}>自己評価（期末振り返り用）</h3>
          <div className="form-group">
            <textarea 
              className="form-input" 
              value={selfComment} 
              onChange={e => setSelfComment(e.target.value)}
              placeholder="今期の目標に対する振り返りや、アピールポイントなどを入力してください"
              rows={4}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
          <button className="btn btn-primary" onClick={handleSaveGoals}>目標・自己評価を保存</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>パスワード設定</h2>
        {passwordError && <div style={{ color: 'var(--danger)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>{passwordError}</div>}
        {passwordSuccess && <div style={{ color: 'var(--success)', marginBottom: 'var(--spacing-4)', fontSize: '0.875rem' }}>{passwordSuccess}</div>}
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">現在のパスワード</label>
            <input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">新しいパスワード</label>
            <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="form-label">新しいパスワード（確認）</label>
            <input type="password" className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
          <button className="btn btn-outline" onClick={handleChangePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>パスワードを変更</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>過去の評価履歴</h2>
        {myEvaluations.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>評価履歴がありません</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>対象期</th>
                  <th>総合点数</th>
                  <th>評価ランク</th>
                  <th>総合コメント</th>
                  <th>詳細</th>
                </tr>
              </thead>
              <tbody>
                {myEvaluations.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.year}年 {ev.period}</td>
                    <td style={{ fontWeight: 'bold' }}>{ev.totalScore > 0 ? `${ev.totalScore} 点` : '-'}</td>
                    <td>{ev.totalScore > 0 ? getRank(ev.totalScore) : '-'}</td>
                    <td>{ev.generalComment || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                        onClick={() => setDetailPeriodInfo({ year: ev.year, period: ev.period })}
                      >
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {detailPeriodInfo && (
        <EvaluationDetailModal
          staff={staff}
          evaluations={myEvaluations.filter(e => e.year === detailPeriodInfo.year)}
          initialPeriod={detailPeriodInfo.period}
          onClose={() => setDetailPeriodInfo(null)}
        />
      )}
    </div>
  );
};
