import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { Staff } from '../types';
import { renderRankBadge, getRankData } from '../lib/rankUtils';
import { Download, Printer } from 'lucide-react';
import { EvaluationDetailModal } from '../components/EvaluationDetailModal';

export const Dashboard: React.FC = () => {
  const staffList = useStore(state => state.staffList);
  const evaluations = useStore(state => state.evaluations);
  
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailPeriod, setDetailPeriod] = useState<'上期' | '下期'>('上期');

  // Year filter state
  const availableYears = useMemo(() => {
    const years = new Set(evaluations.map(ev => ev.year));
    // If no evaluations, add current year
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [evaluations]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);

  const annualScores = useMemo(() => {
    const scores: Record<string, { staff: Staff; upper: number | null; lower: number | null; total: number | null }> = {};
    
    staffList.forEach(staff => {
      scores[staff.id] = { staff, upper: null, lower: null, total: null };
    });

    evaluations.forEach(ev => {
      if (ev.year === selectedYear && scores[ev.staffId]) {
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
  }, [staffList, evaluations, selectedYear]);

  const getRank = (score: number | null) => renderRankBadge(score);

  const handleDownloadCSV = () => {
    const headers = ['氏名', '所属', '職種', 'タイプ', '役割', '上期点数', '下期点数', '年間通期点', '評価ランク'];
    const rows = annualScores.map(row => {
      // ランクのプレーンテキスト化
      let rankText = '-';
      if (row.total !== null) {
        const data = getRankData(row.total);
        if (data) {
          rankText = data.subRank.startsWith('-') ? `${data.subRank}${data.baseRank}` : `${data.baseRank}${data.subRank}`;
        }
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

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">評価集計・ログ</h1>
          <p className="page-subtitle">保存された評価ログと年間集計を確認します</p>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            className="form-select" 
            style={{ width: '120px' }}
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}年度</option>
            ))}
          </select>
          <button className="btn btn-outline" onClick={handleDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> CSV出力
          </button>
          <button className="btn btn-outline" onClick={handlePrintPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={16} /> PDF出力(印刷)
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>{selectedYear}年度 評価一覧</h2>
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
        <EvaluationDetailModal
          staff={selectedStaff}
          evaluations={evaluations.filter(e => e.year === selectedYear)}
          initialPeriod={detailPeriod}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </div>
  );
};
