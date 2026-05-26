import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { Period } from '../types';
import { COMMON_EVALUATION } from '../store/initialData';

export const EvaluationForm: React.FC = () => {
  const staffList = useStore(state => state.staffList);
  const masterItems = useStore(state => state.masterItems);
  const saveEvaluation = useStore(state => state.saveEvaluation);
  
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [period, setPeriod] = useState<Period>('上期');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [evaluationDate, setEvaluationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reviewer, setReviewer] = useState<string>('');

  const selectedStaff = useMemo(() => staffList.find(s => s.id === selectedStaffId), [staffList, selectedStaffId]);

  const [performanceDetails, setPerformanceDetails] = useState<[number, number, number]>([0, 0, 0]);
  const [themeDetails, setThemeDetails] = useState<[number, number, number]>([0, 0, 0]);
  const [themeTexts, setThemeTexts] = useState<[string, string, string]>(['', '', '']);
  const [teamDetails, setTeamDetails] = useState<[number, number, number]>([0, 0, 0]);
  const [teamTexts, setTeamTexts] = useState<[string, string, string]>(['', '', '']);
  const [selfComment, setSelfComment] = useState<string>('');
  const [commonScores, setCommonScores] = useState<Record<string, number>>({});
  const [typeScores, setTypeScores] = useState<Record<string, number>>({});
  const [leaderScore, setLeaderScore] = useState<number>(0);
  const [leaderComment, setLeaderComment] = useState<string>('');
  const [bonusScore, setBonusScore] = useState<number>(0);
  const [bonusComment, setBonusComment] = useState<string>('');
  const [generalComment, setGeneralComment] = useState<string>('');

  const performanceScore = performanceDetails.reduce((a, b) => a + b, 0);
  const themeScore = themeDetails.reduce((a, b) => a + b, 0);
  const teamScore = teamDetails.reduce((a, b) => a + b, 0);

  const getEvaluation = useStore(state => state.getEvaluation);

  React.useEffect(() => {
    if (selectedStaffId && period && year) {
      const existing = getEvaluation(selectedStaffId, period, year);
      if (existing) {
        setPerformanceDetails(existing.performanceDetails || [0, 0, 0]);
        setThemeDetails(existing.themeDetails || [0, 0, 0]);
        setThemeTexts(existing.themeTexts || ['', '', '']);
        setTeamDetails(existing.teamDetails || [0, 0, 0]);
        setTeamTexts(existing.teamTexts || ['', '', '']);
        setSelfComment(existing.selfComment || '');
        // Also might want to set old totals if details aren't present (backward compatibility)
        // For simplicity, we just use the new arrays.
        setLeaderScore(existing.leaderScore || 0);
        setLeaderComment(existing.leaderComment || '');
        setBonusScore(existing.bonusScore || 0);
        setBonusComment(existing.bonusComment || '');
        setGeneralComment(existing.generalComment || '');
        setEvaluationDate(existing.evaluationDate || new Date().toISOString().split('T')[0]);
        setReviewer(existing.reviewer || '');
        
        if (existing.entries && existing.entries.length > 0) {
          const loadedTypeScores: Record<string, number> = {};
          existing.entries.forEach(entry => {
            loadedTypeScores[entry.itemId] = entry.finalScore;
          });
          setTypeScores(loadedTypeScores);
        } else {
          setTypeScores({});
        }

        if (existing.commonDetails) {
          const loadedCommonScores: Record<number, number> = {};
          existing.commonDetails.forEach((score, index) => {
            loadedCommonScores[index + 1] = score;
          });
          setCommonScores(loadedCommonScores);
        } else {
          setCommonScores({});
        }
      } else {
        setPerformanceDetails([0, 0, 0]);
        setThemeDetails([0, 0, 0]);
        setThemeTexts(['', '', '']);
        setTeamDetails([0, 0, 0]);
        setTeamTexts(['', '', '']);
        setSelfComment('');
        setLeaderScore(0);
        setLeaderComment('');
        setBonusScore(0);
        setBonusComment('');
        setGeneralComment('');
        setCommonScores({});
        setTypeScores({});
        setEvaluationDate(new Date().toISOString().split('T')[0]);
        setReviewer('');
      }
    }
  }, [selectedStaffId, period, year, getEvaluation]);

  const typeItems = useMemo(() => {
    if (!selectedStaff) return [];
    return masterItems.filter(item => item.type === selectedStaff.type);
  }, [selectedStaff, masterItems]);

  const totalScore = useMemo(() => {
    const commonSum = Object.values(commonScores).reduce((a, b) => a + b, 0);
    const typeSum = Object.values(typeScores).reduce((a, b) => a + b, 0);
    return performanceScore + themeScore + teamScore + commonSum + typeSum + leaderScore + bonusScore;
  }, [performanceScore, themeScore, teamScore, commonScores, typeScores, leaderScore, bonusScore]);

  const handleSave = () => {
    if (!selectedStaffId) return;
    
    saveEvaluation({
      id: `${selectedStaffId}-${year}-${period}`,
      staffId: selectedStaffId,
      period,
      year,
      evaluationDate,
      reviewer,
      performanceScore,
      performanceDetails,
      themeScore,
      themeDetails,
      themeTexts,
      teamScore,
      teamDetails,
      teamTexts,
      selfComment,
      commonScore: Object.values(commonScores).reduce((a, b) => a + b, 0),
      commonDetails: [
        commonScores[1] || 0,
        commonScores[2] || 0,
        commonScores[3] || 0,
        commonScores[4] || 0,
        commonScores[5] || 0
      ],
      typeScore: Object.values(typeScores).reduce((a, b) => a + b, 0),
      leaderScore,
      leaderComment,
      bonusScore,
      bonusComment,
      totalScore,
      entries: typeItems.map(item => ({
        itemId: item.id,
        selfScore: 0,
        primaryScore: typeScores[item.id] || 0,
        secondaryScore: 0,
        finalScore: typeScores[item.id] || 0,
        comment: ''
      })),
      generalComment,
      updatedAt: new Date().toISOString()
    });
    alert('評価を保存しました。');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">評価入力</h1>
        <p className="page-subtitle">スタッフの半期評価を入力します</p>
      </div>

      <div className="glass-panel" style={{ padding: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ marginBottom: 'var(--spacing-4)' }}>基本情報選択</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div className="form-group">
            <label className="form-label">対象スタッフ</label>
            <select className="form-select" value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)}>
              <option value="">-- 選択してください --</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">対象年度</label>
            <input type="number" className="form-input" value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">評価期</label>
            <select className="form-select" value={period} onChange={e => setPeriod(e.target.value as Period)}>
              <option value="上期">上期</option>
              <option value="下期">下期</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">評価日</label>
            <input type="date" className="form-input" value={evaluationDate} onChange={e => setEvaluationDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">面談対応者</label>
            <input type="text" className="form-input" value={reviewer} onChange={e => setReviewer(e.target.value)} placeholder="対応者の名前" />
          </div>
        </div>
        
        {selectedStaff && (
          <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
            <p><strong>属性:</strong> {selectedStaff.department} / {selectedStaff.role} / {selectedStaff.type} / {selectedStaff.roleTitle}</p>
          </div>
        )}
      </div>

      {selectedStaff && (
        <div className="glass-panel" style={{ padding: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--spacing-4)' }}>
            <h2>評価シート入力</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              合計点数: <span className="gradient-text">{totalScore}</span> / 120 点
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-8)' }}>
            {/* Left Column */}
            <div>
              {selfComment && (
                <div style={{ marginBottom: 'var(--spacing-6)' }}>
                  <h3 style={{ marginBottom: 'var(--spacing-3)' }}>スタッフからの自己評価コメント</h3>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--accent-primary)' }}>
                    <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap', margin: 0 }}>{selfComment}</p>
                  </div>
                </div>
              )}

              <h3 style={{ marginBottom: 'var(--spacing-3)' }}>① 業績・案件貢献（最大30点）</h3>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                <div className="form-group">
                  <label className="form-label">1. 案件貢献</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '-4px' }}>担当案件の売上・利益・継続受注への貢献</p>
                  <select className="form-select" value={performanceDetails[0]} onChange={e => setPerformanceDetails([Number(e.target.value), performanceDetails[1], performanceDetails[2]])}>
                    <option value={10}>10: 大きく貢献した</option>
                    <option value={8}>8: 十分に貢献した</option>
                    <option value={6}>6: 標準的に貢献した</option>
                    <option value={4}>4: 貢献は限定的だった</option>
                    <option value={2}>2: 貢献が不足していた</option>
                    <option value={0}>0: 該当なし／評価対象外</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">2. 品質・納期</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '-4px' }}>納期遵守、手戻りの少なさ、クライアントに迷惑をかけない進行</p>
                  <select className="form-select" value={performanceDetails[1]} onChange={e => setPerformanceDetails([performanceDetails[0], Number(e.target.value), performanceDetails[2]])}>
                    <option value={10}>10: 非常に安心して任せられた</option>
                    <option value={8}>8: 安心して任せられた</option>
                    <option value={6}>6: 概ね問題なく進行できた</option>
                    <option value={4}>4: 一部フォローが必要だった</option>
                    <option value={2}>2: 継続的なフォローが必要だった</option>
                    <option value={0}>0: 該当なし／評価対象外</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">3. 顧客・社内貢献</label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '-4px' }}>営業・ディレクター・クライアントの期待に応えた貢献</p>
                  <select className="form-select" value={performanceDetails[2]} onChange={e => setPerformanceDetails([performanceDetails[0], performanceDetails[1], Number(e.target.value)])}>
                    <option value={10}>10: 期待を大きく上回る</option>
                    <option value={8}>8: 期待を上回る</option>
                    <option value={6}>6: 期待どおり</option>
                    <option value={4}>4: 一部期待を下回る</option>
                    <option value={2}>2: 期待を下回る</option>
                    <option value={0}>0: 該当なし</option>
                  </select>
                </div>
                <div style={{textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '8px'}}>小計: {performanceScore} 点</div>
              </div>

              <h3 style={{ marginBottom: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>② 個人テーマ評価（最大15点）</h3>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                {[0, 1, 2].map(i => (
                  <div key={`theme-${i}`} className="form-group">
                    <label className="form-label">{i + 1}. 個人テーマ{i + 1}</label>
                    {themeTexts[i] ? (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        {themeTexts[i]}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>（未設定）</p>
                    )}
                    <select className="form-select" value={themeDetails[i]} onChange={e => {
                      const newDetails = [...themeDetails] as [number, number, number];
                      newDetails[i] = Number(e.target.value);
                      setThemeDetails(newDetails);
                    }}>
                      <option value={5}>5: 目標を大きく上回る成果を出した</option>
                      <option value={4}>4: 目標を上回る成果を出した</option>
                      <option value={3}>3: 目標どおり達成した</option>
                      <option value={2}>2: 一部達成にとどまった</option>
                      <option value={1}>1: 取り組み・成果が不足していた</option>
                      <option value={0}>0: 未実施／評価対象外</option>
                    </select>
                  </div>
                ))}
                <div style={{textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '8px'}}>小計: {themeScore} 点</div>
              </div>

              {(selectedStaff.isLeader || selectedStaff.isSubLeader || selectedStaff.canEditTeamGoals) && (
                <>
                  <h3 style={{ marginBottom: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>③ チーム目標達成度（最大15点）</h3>
                  <div style={{ background: 'rgba(0,0,0,0.1)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                {[0, 1, 2].map(i => (
                  <div key={`team-${i}`} className="form-group">
                    <label className="form-label">{i + 1}. チーム目標{i + 1}</label>
                    {teamTexts[i] ? (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        {teamTexts[i]}
                      </p>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>（未設定）</p>
                    )}
                    <select className="form-select" value={teamDetails[i]} onChange={e => {
                      const newDetails = [...teamDetails] as [number, number, number];
                      newDetails[i] = Number(e.target.value);
                      setTeamDetails(newDetails);
                    }}>
                      <option value={5}>5: 目標を大きく上回る成果を出した</option>
                      <option value={4}>4: 目標を上回る成果を出した</option>
                      <option value={3}>3: 目標どおり達成した</option>
                      <option value={2}>2: 一部達成にとどまった</option>
                      <option value={1}>1: 取り組み・成果が不足していた</option>
                      <option value={0}>0: 未実施／評価対象外</option>
                    </select>
                  </div>
                ))}
                <div style={{textAlign: 'right', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '8px'}}>小計: {teamScore} 点</div>
              </div>
                </>
              )}
            </div>

            {/* Right Column */}
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-3)' }}>④ 職種・タイプ別評価（最大 {typeItems.length * 5} 点）</h3>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                {typeItems.map(item => (
                  <div key={item.id} className="form-group">
                    <label className="form-label">{item.no}. {item.name}</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.description}</p>
                    <select className="form-select" value={typeScores[item.id] || 0} onChange={e => setTypeScores({...typeScores, [item.id]: Number(e.target.value)})}>
                      <option value={0}>0: 該当なし</option>
                      <option value={1}>1: 大きな改善が必要</option>
                      <option value={2}>2: 一部改善が必要</option>
                      <option value={3}>3: 期待どおり</option>
                      <option value={4}>4: 期待を上回る</option>
                      <option value={5}>5: 期待を大きく上回る</option>
                    </select>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>⑤ 共通評価（最大 25 点）</h3>
              <div style={{ background: 'rgba(0,0,0,0.1)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-md)' }}>
                {COMMON_EVALUATION.map(item => (
                  <div key={item.no} className="form-group">
                    <label className="form-label">{item.no}. {item.name}</label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.description}</p>
                    <select className="form-select" value={commonScores[item.no] || 0} onChange={e => setCommonScores({...commonScores, [item.no]: Number(e.target.value)})}>
                      <option value={0}>0: 該当なし</option>
                      <option value={1}>1: 大きな改善が必要</option>
                      <option value={2}>2: 一部改善が必要</option>
                      <option value={3}>3: 期待どおり</option>
                      <option value={4}>4: 期待を上回る</option>
                      <option value={5}>5: 期待を大きく上回る</option>
                    </select>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom: 'var(--spacing-3)', marginTop: 'var(--spacing-6)' }}>⑥ その他評価（最大20点）</h3>
              <div className="form-group">
                <label className="form-label">リーダー評価（最大10点）</label>
                <input type="number" max="10" min="0" className="form-input" value={leaderScore || ''} onChange={e => setLeaderScore(Number(e.target.value))} />
                <textarea className="form-textarea" rows={2} placeholder="評価点の理由" value={leaderComment} onChange={e => setLeaderComment(e.target.value)} style={{ marginTop: 'var(--spacing-2)' }}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">加点評価（最大10点）</label>
                <input type="number" max="10" min="0" className="form-input" value={bonusScore || ''} onChange={e => setBonusScore(Number(e.target.value))} />
                <textarea className="form-textarea" rows={2} placeholder="評価点の理由" value={bonusComment} onChange={e => setBonusComment(e.target.value)} style={{ marginTop: 'var(--spacing-2)' }}></textarea>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--spacing-8)' }}>
            <label className="form-label">総合コメント</label>
            <textarea className="form-textarea" rows={4} placeholder="評価に対するフィードバックやコメントを記入" value={generalComment} onChange={e => setGeneralComment(e.target.value)}></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-6)' }}>
            <button className="btn btn-primary" onClick={handleSave}>評価を保存する</button>
          </div>
        </div>
      )}
    </div>
  );
};
