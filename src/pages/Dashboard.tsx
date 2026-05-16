import React, { useMemo } from 'react';
import { useStore } from '../store';
import type { Staff } from '../types';

export const Dashboard: React.FC = () => {
  const staffList = useStore(state => state.staffList);
  const evaluations = useStore(state => state.evaluations);

  const annualScores = useMemo(() => {
    const scores: Record<string, { staff: Staff; upper: number | null; lower: number | null; total: number | null }> = {};
    
    staffList.forEach(staff => {
      scores[staff.id] = { staff, upper: null, lower: null, total: null };
    });

    evaluations.forEach(ev => {
      if (scores[ev.staffId]) {
        if (ev.period === '上期') scores[ev.staffId].upper = ev.totalScore;
        if (ev.period === '下期') scores[ev.staffId].lower = ev.totalScore;
      }
    });

    Object.keys(scores).forEach(id => {
      const { upper, lower } = scores[id];
      if (upper !== null && lower !== null) {
        scores[id].total = (upper + lower) / 2; // Simple average for now
      } else if (upper !== null) {
        scores[id].total = upper;
      } else if (lower !== null) {
        scores[id].total = lower;
      }
    });

    return Object.values(scores);
  }, [staffList, evaluations]);

  const getRank = (score: number | null) => {
    if (score === null) return '-';
    
    let baseRank = '';
    let subRank = '';
    let colorClass = '';

    if (score >= 90) { baseRank = 'S'; colorClass = 'primary'; }
    else if (score >= 80) { baseRank = 'A'; colorClass = 'success'; }
    else if (score >= 70) { baseRank = 'B'; colorClass = 'warning'; }
    else if (score >= 60) { baseRank = 'C'; colorClass = ''; }
    else { baseRank = 'D'; colorClass = 'danger'; }

    if (score >= 90) {
      if (score >= 98) subRank = '++';
      else if (score >= 96) subRank = '+';
      else if (score >= 94) subRank = '';
      else if (score >= 92) subRank = '-';
      else subRank = '--';
    } else if (score >= 60) {
      const lastDigit = score % 10;
      if (lastDigit >= 8) subRank = '++';
      else if (lastDigit >= 6) subRank = '+';
      else if (lastDigit >= 4) subRank = '';
      else if (lastDigit >= 2) subRank = '-';
      else subRank = '--';
    } else {
      if (score >= 48) subRank = '++';
      else if (score >= 36) subRank = '+';
      else if (score >= 24) subRank = '';
      else if (score >= 12) subRank = '-';
      else subRank = '--';
    }
    
    return <span className={`badge ${colorClass === 'danger' ? '' : colorClass}`} style={colorClass === 'danger' ? { color: 'var(--danger)' } : {}}>{baseRank}{subRank}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">評価集計・ログ</h1>
        <p className="page-subtitle">保存された評価ログと年間集計を確認します</p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>年間評価一覧</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>氏名</th>
                <th>職種 / タイプ</th>
                <th>上期 点数</th>
                <th>下期 点数</th>
                <th>年間 通期点</th>
                <th>評価ランク</th>
              </tr>
            </thead>
            <tbody>
              {annualScores.map((row) => (
                <tr key={row.staff.id}>
                  <td style={{ fontWeight: 600 }}>{row.staff.name}</td>
                  <td>{row.staff.role} / <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{row.staff.type}</span></td>
                  <td>{row.upper !== null ? `${row.upper} 点` : '-'}</td>
                  <td>{row.lower !== null ? `${row.lower} 点` : '-'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{row.total !== null ? `${row.total} 点` : '-'}</td>
                  <td>{getRank(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
