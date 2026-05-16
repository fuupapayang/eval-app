import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { Period } from '../types';

export const MyPage: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const evaluations = useStore(state => state.evaluations);
  const saveEvaluation = useStore(state => state.saveEvaluation);
  const getEvaluation = useStore(state => state.getEvaluation);

  const [period, setPeriod] = useState<Period>('上期');
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const [themeTexts, setThemeTexts] = useState<[string, string, string]>(['', '', '']);
  const [teamTexts, setTeamTexts] = useState<[string, string, string]>(['', '', '']);

  if (!currentUser || currentUser.type !== 'STAFF') {
    return <div>権限がありません</div>;
  }

  const staff = currentUser.staff;
  const isLeader = staff.isLeader || staff.isSubLeader;

  // Load goals when period/year changes
  React.useEffect(() => {
    const existing = getEvaluation(staff.id, period, year);
    if (existing) {
      setThemeTexts(existing.themeTexts || ['', '', '']);
      setTeamTexts(existing.teamTexts || ['', '', '']);
    } else {
      setThemeTexts(['', '', '']);
      setTeamTexts(['', '', '']);
    }
  }, [staff.id, period, year, getEvaluation]);

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
      teamTexts: isLeader ? teamTexts : evalData.teamTexts,
      updatedAt: new Date().toISOString()
    });

    alert('目標を保存しました。');
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
                  disabled={!isLeader}
                />
              </div>
            ))}
            {!isLeader && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>※チーム目標の入力はリーダーのみ可能です</p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)' }}>
          <button className="btn btn-primary" onClick={handleSaveGoals}>目標を保存</button>
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
                </tr>
              </thead>
              <tbody>
                {myEvaluations.map(ev => (
                  <tr key={ev.id}>
                    <td>{ev.year}年 {ev.period}</td>
                    <td style={{ fontWeight: 'bold' }}>{ev.totalScore > 0 ? `${ev.totalScore} 点` : '-'}</td>
                    <td>{ev.totalScore > 0 ? getRank(ev.totalScore) : '-'}</td>
                    <td>{ev.generalComment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
