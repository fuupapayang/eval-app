import React, { useState, useEffect } from 'react';
import type { Staff, EvaluationForm } from '../types';
import { X } from 'lucide-react';
import { useStore } from '../store';
import { getRankData, renderRankBadge } from '../lib/rankUtils';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, Legend 
} from 'recharts';

interface Props {
  staff: Staff;
  evaluations: EvaluationForm[];
  initialPeriod: import('../types').Period;
  onClose: () => void;
}

export const EvaluationDetailModal: React.FC<Props> = ({ staff, evaluations, initialPeriod, onClose }) => {
  const [detailPeriod, setDetailPeriod] = useState<import('../types').Period>(initialPeriod);
  const masterItems = useStore(state => state.masterItems);

  // Sync state if props change
  useEffect(() => {
    setDetailPeriod(initialPeriod);
  }, [initialPeriod]);

  const getDetailEval = (staffId: string, period: string) => {
    if (period === '通期') {
      const upper = evaluations.find(e => e.staffId === staffId && e.period === '上期');
      const lower = evaluations.find(e => e.staffId === staffId && e.period === '下期');
      
      if (!upper && !lower) return undefined;
      
      const calcAvg = (u: number, l: number) => Math.round((u + l) / 2 * 10) / 10;
      const calcAvgArray = (u: number[], l: number[]) => u.map((v, i) => calcAvg(v, l[i] || 0));
      
      const u = upper || lower!;
      const l = lower || upper!;
      
      const mergeTexts = (uTexts?: string[], lTexts?: string[]) => {
        return [0, 1, 2].map(i => {
          const ut = uTexts?.[i] || '';
          const lt = lTexts?.[i] || '';
          if (ut === lt) return ut;
          if (ut && lt) return `上期: ${ut} / 下期: ${lt}`;
          return ut || lt || '';
        }) as [string, string, string];
      };

      return {
        ...u,
        period: '通期',
        totalScore: calcAvg(u.totalScore, l.totalScore),
        performanceScore: calcAvg(u.performanceScore, l.performanceScore),
        performanceDetails: calcAvgArray(u.performanceDetails, l.performanceDetails) as [number, number, number],
        themeScore: calcAvg(u.themeScore, l.themeScore),
        themeDetails: calcAvgArray(u.themeDetails, l.themeDetails) as [number, number, number],
        teamScore: calcAvg(u.teamScore, l.teamScore),
        teamDetails: calcAvgArray(u.teamDetails, l.teamDetails) as [number, number, number],
        commonScore: calcAvg(u.commonScore, l.commonScore),
        typeScore: calcAvg(u.typeScore, l.typeScore),
        leaderScore: calcAvg(u.leaderScore, l.leaderScore),
        themeTexts: mergeTexts(u.themeTexts, l.themeTexts),
        teamTexts: mergeTexts(u.teamTexts, l.teamTexts),
        selfComment: `【上期】\n${u.selfComment || '-'}\n\n【下期】\n${l.selfComment || '-'}`,
        generalComment: `【上期】\n${u.generalComment || '-'}\n\n【下期】\n${l.generalComment || '-'}`,
        leaderComment: `【上期】\n${u.leaderComment || '-'}\n\n【下期】\n${l.leaderComment || '-'}`,
        bonusComment: `【上期】\n${u.bonusComment || '-'}\n\n【下期】\n${l.bonusComment || '-'}`,
      } as EvaluationForm;
    }
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
        background: 'var(--bg-surface)'
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
          <button 
            className={`btn ${detailPeriod === '通期' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setDetailPeriod('通期')}
          >
            通期
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
          })) || [];

          const teamData = ev.teamTexts?.map((text, i) => ({
            name: `チーム目標${i+1}`,
            score: ev.teamDetails[i],
            text: text || '未設定'
          })) || [];

          const CustomTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
              return (
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', maxWidth: '300px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{label}</p>
                  <p style={{ fontSize: '0.875rem', marginBottom: '8px' }}>獲得点数: <span style={{ color: payload[0].color, fontWeight: 'bold' }}>{payload[0].value}</span> 点</p>
                  {payload[0].payload.text && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {payload[0].payload.text}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          };

          const typeItems = masterItems.filter(m => m.category === '職種・タイプ別評価' && m.type === staff.type);
          
          const upperEval = evaluations.find(e => e.period === '上期');
          const lowerEval = evaluations.find(e => e.period === '下期');

          const radarData = typeItems.map(item => {
            let scoreUpper = 0;
            let scoreLower = 0;
            if (upperEval) {
              const en = upperEval.entries?.find(e => e.itemId === item.id);
              if (en) scoreUpper = en.finalScore;
            }
            if (lowerEval) {
              const en = lowerEval.entries?.find(e => e.itemId === item.id);
              if (en) scoreLower = en.finalScore;
            }
            return {
              subject: item.name,
              上期: scoreUpper,
              下期: scoreLower,
              fullMark: 5
            };
          });

          const getYearsOfService = (joinedAt?: string) => {
            if (!joinedAt) return 0;
            const joinedDate = new Date(joinedAt);
            const today = new Date();
            let years = today.getFullYear() - joinedDate.getFullYear();
            const m = today.getMonth() - joinedDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < joinedDate.getDate())) {
              years--;
            }
            return Math.max(0, years);
          };

          const fullEval = getDetailEval(staff.id, '通期');
          const annualScore = fullEval && fullEval.totalScore > 0 ? fullEval.totalScore : null;

          const getAutoNextSalary = (s: Staff) => {
            if (!s.annualSalary) return undefined;
            if (annualScore === null) return s.annualSalary;
            
            const rank = getRankData(annualScore)?.baseRank;
            if (rank === 'S' || rank === 'A') {
              return s.annualSalary + 360000;
            } else if (rank === 'B') {
              return s.annualSalary + 240000;
            } else if (rank === 'C') {
              return s.annualSalary + 120000;
            }
            return s.annualSalary;
          };

          const getAutoIncentive = (_s: Staff) => {
            if (annualScore === null) return 0;
            
            const rankData = getRankData(annualScore);
            if (!rankData) return 0;
            let incentive = 0;
            const { baseRank, subRank } = rankData;
            const fullRank = `${baseRank}${subRank}`;
            
            switch (fullRank) {
              case 'S++': incentive = 1000000; break;
              case 'S+':  incentive = 900000; break;
              case 'S':   incentive = 800000; break;
              case 'S-':  incentive = 700000; break;
              case 'S--': incentive = 650000; break;
              case 'A++': incentive = 600000; break;
              case 'A+':  incentive = 550000; break;
              case 'A':   incentive = 500000; break;
              case 'A-':  incentive = 450000; break;
              case 'A--': incentive = 400000; break;
              case 'B++': incentive = 350000; break;
              case 'B+':  incentive = 300000; break;
              case 'B':   incentive = 250000; break;
              case 'B-':  incentive = 200000; break;
              case 'B--': incentive = 150000; break;
              case 'C++': incentive = 100000; break;
              case 'C+':  incentive = 50000; break;
              default: incentive = 0;
            }
            return incentive;
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
              
              {/* 6つのパネル表示エリア */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                {/* 現在の評価状況（総合点） */}
                <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px' }}>現在の評価状況 (総合点)</p>
                    <h3 className="stat-value" style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>{ev.totalScore > 0 ? `${ev.totalScore.toFixed(1)}点` : '未確定'}</h3>
                  </div>
                </div>

                {/* 総合評価ランク */}
                <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px' }}>総合評価ランク</p>
                    <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>
                      {annualScore !== null ? renderRankBadge(annualScore) : '未確定'}
                    </h3>
                  </div>
                </div>
                
                {/* 継続年数 */}
                <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px' }}>継続年数</p>
                    <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>{getYearsOfService(staff.joinedAt)}年</h3>
                  </div>
                </div>

                {/* 現在の年収 */}
                <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px' }}>現在の年収（月額）</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.annualSalary 
                        ? `${(staff.annualSalary / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : '未設定'}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {staff.annualSalary ? `(月額: ${Math.floor(staff.annualSalary / 12).toLocaleString()}円)` : '-'}
                    </p>
                  </div>
                </div>

                {/* 市場平均年収（マス媒体レポート2025） - 現在の年収と比較 */}
                {(() => {
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
                  const market = getMarketSalary(staff);
                  const diff = staff.annualSalary ? (staff.annualSalary / 10000) - market.amount : 0;
                  return (
                    <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                      <div className="stat-content">
                        <p className="stat-label" style={{ marginBottom: '4px' }}>
                          市場平均年収<br/>
                          <span style={{ fontSize: '0.7rem' }}>({market.title} / 現在と比較)</span>
                        </p>
                        <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>
                          {market.amount.toFixed(1)}万円
                        </h3>
                        {staff.annualSalary && (
                          <p style={{ fontSize: '0.75rem', color: diff >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}万円
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* 来期年収予測予定 */}
                <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px' }}>来期年収予測予定</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.nextAnnualSalary 
                        ? `${(staff.nextAnnualSalary / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : (getAutoNextSalary(staff) 
                            ? `${(getAutoNextSalary(staff)! / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                            : '未確定'
                          )
                      }
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {staff.nextAnnualSalary 
                        ? `(月額: ${Math.floor(staff.nextAnnualSalary / 12).toLocaleString()}円)`
                        : (getAutoNextSalary(staff) 
                            ? `(月額: ${Math.floor(getAutoNextSalary(staff)! / 12).toLocaleString()}円) [自動]` 
                            : '-'
                          )
                      }
                    </p>
                  </div>
                </div>

                {/* 市場平均年収（マス媒体レポート2025） - 来期予測と比較 */}
                {(() => {
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
                  const market = getMarketSalary(staff);
                  const nextSalaryVal = staff.nextAnnualSalary ? staff.nextAnnualSalary : getAutoNextSalary(staff);
                  const diff = nextSalaryVal ? (nextSalaryVal / 10000) - market.amount : null;
                  return (
                    <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                      <div className="stat-content">
                        <p className="stat-label" style={{ marginBottom: '4px' }}>
                          市場平均年収<br/>
                          <span style={{ fontSize: '0.7rem' }}>({market.title} / 来期予測と比較)</span>
                        </p>
                        <h3 className="stat-value" style={{ fontSize: '1.2rem' }}>
                          {market.amount.toFixed(1)}万円
                        </h3>
                        {diff !== null && (
                          <p style={{ fontSize: '0.75rem', color: diff >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '4px', fontWeight: 'bold' }}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}万円
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* インセンティブ */}
                <div className="stat-panel" style={{ padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
                  <div className="stat-content">
                    <p className="stat-label" style={{ marginBottom: '4px' }}>インセンティブ</p>
                    <h3 className="stat-value" style={{ fontSize: '1.6rem', color: 'var(--accent-primary)' }}>
                      {staff.incentive 
                        ? `${(staff.incentive / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                        : (getAutoIncentive(staff) > 0 
                            ? `${(getAutoIncentive(staff) / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}万円` 
                            : '0万円'
                          )
                      }
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {!staff.incentive && getAutoIncentive(staff) > 0 ? '[自動目安]' : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts Section - 2 Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                
                {/* Type/Role Radar Chart */}
                {radarData.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>職種・タイプ別 バランス（通期比較）</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.2)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'var(--text-muted)' }} />
                          <Radar name="上期" dataKey="上期" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                          <Radar name="下期" dataKey="下期" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
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
                        <YAxis domain={[0, 10]} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
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
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey="score" name="獲得点数" radius={[4, 4, 0, 0]} fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Team Bar Chart */}
                {teamData.length > 0 && (staff.isLeader || staff.canEditTeamGoals) && (
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '8px' }}>チーム目標（{ev.teamScore}点）</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={teamData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                          <YAxis domain={[0, 5]} stroke="var(--text-secondary)" tick={{fontSize: 12}} />
                          <RechartsTooltip 
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          />
                          <Bar dataKey="score" name="獲得点数" radius={[4, 4, 0, 0]} fill="#f59e0b" />
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
                  {ev.themeTexts?.map((t, i) => (
                    <li key={i} style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: '500' }}>
                        テーマ{i + 1}: {t || '（未設定）'}
                        {ev.themeStatuses?.[i] && (
                          <span style={{ 
                            marginLeft: '8px', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem',
                            background: ev.themeStatuses[i] === '達成' ? 'rgba(16, 185, 129, 0.2)' : 
                                       ev.themeStatuses[i] === '未達' ? 'rgba(239, 68, 68, 0.2)' : 
                                       'rgba(245, 158, 11, 0.2)',
                            color: ev.themeStatuses[i] === '達成' ? '#10b981' : 
                                   ev.themeStatuses[i] === '未達' ? '#ef4444' : 
                                   '#f59e0b',
                            border: `1px solid ${
                              ev.themeStatuses[i] === '達成' ? '#10b981' : 
                              ev.themeStatuses[i] === '未達' ? '#ef4444' : 
                              '#f59e0b'
                            }`
                          }}>
                            {ev.themeStatuses[i]}
                          </span>
                        )}
                      </div>
                      
                      {ev.themeReflections?.[i] && (
                        <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <span style={{ fontWeight: 'bold' }}>振り返り・理由:</span> {ev.themeReflections[i]}
                        </div>
                      )}
                      
                      {ev.themeHistory?.[String(i)] && ev.themeHistory[String(i)].length > 0 && (
                        <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>【過去の未達履歴】</div>
                          <ul style={{ paddingLeft: '16px', margin: 0 }}>
                            {ev.themeHistory[String(i)].map((h, hi) => (
                              <li key={hi} style={{ marginBottom: '4px' }}>
                                <span style={{ color: '#ef4444', marginRight: '4px' }}>[未達]</span>
                                {h.text}
                                {h.reflection && <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>理由: {h.reflection}</div>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {(staff.isLeader || staff.canEditTeamGoals) && (
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>3. チーム目標達成度（{ev.teamScore}点）</h3>
                  <ul style={{ paddingLeft: '20px', marginBottom: '16px', fontSize: '0.875rem' }}>
                    {ev.teamTexts?.map((t, i) => (
                      <li key={i} style={{ marginBottom: '16px' }}>
                        <div style={{ fontWeight: '500' }}>
                          チーム目標{i + 1}: {t || '（未設定）'}
                          <span style={{fontWeight: 'bold', color: 'var(--accent-primary)', marginLeft: '8px'}}>[ {ev.teamDetails?.[i] || 0}点 ]</span>
                          {ev.teamStatuses?.[i] && (
                            <span style={{ 
                              marginLeft: '8px', 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontSize: '0.75rem',
                              background: ev.teamStatuses[i] === '達成' ? 'rgba(16, 185, 129, 0.2)' : 
                                         ev.teamStatuses[i] === '未達' ? 'rgba(239, 68, 68, 0.2)' : 
                                         'rgba(245, 158, 11, 0.2)',
                              color: ev.teamStatuses[i] === '達成' ? '#10b981' : 
                                     ev.teamStatuses[i] === '未達' ? '#ef4444' : 
                                     '#f59e0b',
                              border: `1px solid ${
                                ev.teamStatuses[i] === '達成' ? '#10b981' : 
                                ev.teamStatuses[i] === '未達' ? '#ef4444' : 
                                '#f59e0b'
                              }`
                            }}>
                              {ev.teamStatuses[i]}
                            </span>
                          )}
                        </div>
                        
                        {ev.teamReflections?.[i] && (
                          <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <span style={{ fontWeight: 'bold' }}>振り返り・理由:</span> {ev.teamReflections[i]}
                          </div>
                        )}
                        
                        {ev.teamHistory?.[String(i)] && ev.teamHistory[String(i)].length > 0 && (
                          <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>【過去の未達履歴】</div>
                            <ul style={{ paddingLeft: '16px', margin: 0 }}>
                              {ev.teamHistory[String(i)].map((h, hi) => (
                                <li key={hi} style={{ marginBottom: '4px' }}>
                                  <span style={{ color: '#ef4444', marginRight: '4px' }}>[未達]</span>
                                  {h.text}
                                  {h.reflection && <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>理由: {h.reflection}</div>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                  4. 詳細項目一覧（共通: {ev.commonScore}点, 職種/タイプ: {ev.typeScore}点, リーダー: {ev.leaderScore}点）
                </h3>
                {ev.entries?.filter(en => en.finalScore > 0 || en.comment).length === 0 ? (
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
                      {ev.entries?.filter(en => en.finalScore > 0 || en.comment).map((en) => {
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
