import { forwardRef } from 'react';
import type { Staff, EvaluationForm } from '../types';
import { getRankData } from '../lib/rankUtils';

interface PdfReportProps {
  staffList: Staff[];
  evaluations: EvaluationForm[];
  getAutoNextSalary: (s: Staff) => number | undefined;
  getAutoIncentive: (s: Staff) => number;
}

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

const PdfReport = forwardRef<HTMLDivElement, PdfReportProps>(
  ({ staffList, evaluations, getAutoNextSalary, getAutoIncentive }, ref) => {
    
    // A4 Portrait dimensions in mm: 210 x 297.
    // We can set a fixed width in px, e.g. 794px, which roughly corresponds to A4 width at 96 DPI.
    return (
      <div 
        ref={ref} 
        style={{
          width: '794px',
          padding: '40px',
          backgroundColor: '#fff',
          color: '#333',
          fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
          position: 'absolute',
          left: '-9999px',
          top: 0,
          zIndex: -1,
        }}
      >
        <h1 style={{ textAlign: 'center', fontSize: '24px', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          スタッフ評価・年収レポート
        </h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>名前</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>役職</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>勤続年数</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>評価点</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>ランク</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>現在の年収</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>来期予測</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>ｲﾝｾﾝﾃｨﾌﾞ</th>
              <th style={{ padding: '8px', border: '1px solid #ddd' }}>市場平均(参考)</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => {
              // 勤続年数
              const joinedDate = new Date(staff.joinedAt || new Date().toISOString());
              const today = new Date();
              let years = today.getFullYear() - joinedDate.getFullYear();
              const m = today.getMonth() - joinedDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < joinedDate.getDate())) {
                years--;
              }
              const serviceYears = Math.max(0, years);

              // 評価
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

              const rankData = annualScore !== null ? getRankData(annualScore) : null;
              const rankStr = rankData ? `${rankData.baseRank}${rankData.subRank}` : '-';

              const currentSalary = staff.annualSalary 
                ? `${(staff.annualSalary / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                : '-';
              
              const nextSalaryVal = staff.nextAnnualSalary !== undefined ? staff.nextAnnualSalary : getAutoNextSalary(staff);
              const nextSalaryStr = nextSalaryVal 
                ? `${(nextSalaryVal / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                : '-';

              const incentiveVal = staff.incentive ? staff.incentive : getAutoIncentive(staff);
              const incentiveStr = incentiveVal > 0 
                ? `${(incentiveVal / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                : '0万円';

              // 市場平均
              const marketRef = getMarketSalary(staff);
              const marketStr = marketRef 
                ? `${marketRef.amount.toLocaleString(undefined, { maximumFractionDigits: 1 })}万円 (${marketRef.title})`
                : '-';

              return (
                <tr key={staff.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{staff.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{staff.role} / {staff.roleTitle || '一般'}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{serviceYears}年</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {annualScore !== null ? `${annualScore.toFixed(1)}点` : '-'}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{rankStr}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{currentSalary}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: '#0066cc' }}>{nextSalaryStr}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right', color: '#cc3300' }}>{incentiveStr}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontSize: '9px', textAlign: 'right' }}>{marketStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

export default PdfReport;
