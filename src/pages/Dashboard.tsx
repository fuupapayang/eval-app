import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { Staff } from '../types';
import { Download, Printer, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const staffList = useStore(state => state.staffList);
  const evaluations = useStore(state => state.evaluations);
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<'上期' | '下期'>('上期');

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

    return Object.values(scores).sort((a, b) => {
       const orderA = a.staff.order !== undefined ? a.staff.order : 9999;
       const orderB = b.staff.order !== undefined ? b.staff.order : 9999;
       return orderA - orderB;
    });
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

  const handleDownloadCSV = () => {
    const headers = ['氏名', '所属', '職種', 'タイプ', '役割', '上期点数', '下期点数', '年間通期点', '評価ランク'];
    const rows = annualScores.map(row => {
      // ランクのプレーンテキスト化
      let rankText = '-';
      if (row.total !== null) {
        // extract base rank roughly
        if (row.total >= 90) rankText = 'S';
        else if (row.total >= 80) rankText = 'A';
        else if (row.total >= 70) rankText = 'B';
        else if (row.total >= 60) rankText = 'C';
        else rankText = 'D';
      }

      return [
        row.staff.name,
        row.staff.department,
        row.staff.role,
        row.staff.type,
        row.staff.roleTitle,
        row.upper !== null ? row.upper : '',
        row.lower !== null ? row.lower : '',
        row.total !== null ? row.total : '',
        rankText
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM for Excel
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evaluation_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const getDetailEval = (staffId: string, period: string) => {
    return evaluations.find(e => e.staffId === staffId && e.period === period);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">評価集計・ログ</h1>
          <p className="page-subtitle">保存された評価ログと年間集計を確認します</p>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> CSV出力
          </button>
          <button className="btn btn-outline" onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> PDF出力(印刷)
          </button>
        </div>
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
                <th className="no-print">詳細ログ</th>
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
                  <td className="no-print">
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                      onClick={() => {
                        setSelectedStaff(row.staff);
                        setDetailPeriod(row.upper !== null && row.lower === null ? '上期' : '下期');
                      }}
                    >
                      詳細
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal */}
      {selectedStaff && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '800px', maxHeight: '90vh', 
            overflowY: 'auto', padding: 'var(--spacing-6)', position: 'relative',
            background: 'var(--bg-card)'
          }}>
            <button 
              className="btn" 
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
              onClick={() => setSelectedStaff(null)}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '8px' }}>{selectedStaff.name} の評価詳細</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-6)' }}>
              <span className="badge">{selectedStaff.role}</span>
              <span className="badge">{selectedStaff.type}</span>
              <span className="badge primary">{selectedStaff.roleTitle}</span>
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
              const ev = getDetailEval(selectedStaff.id, detailPeriod);
              if (!ev) return <p style={{ color: 'var(--text-secondary)' }}>この期の評価データはありません。</p>;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                    <div className="stat-card" style={{ flex: 1, padding: '16px', background: 'var(--bg-surface)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>総合点数</p>
                      <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>{ev.totalScore} 点</h3>
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

                  {(selectedStaff.isLeader || selectedStaff.isSubLeader) && (
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
                  </div>

                  {(ev.bonusScore > 0 || ev.bonusComment) && (
                    <div>
                      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>加点評価（{ev.bonusScore}点）</h3>
                      <p style={{ fontSize: '0.875rem' }}>{ev.bonusComment || '-'}</p>
                    </div>
                  )}

                  <div>
                    <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>総合コメント</h3>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px' }}>
                      {ev.generalComment || 'コメントなし'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
