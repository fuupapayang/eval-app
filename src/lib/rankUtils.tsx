

export const getRankData = (score: number | null) => {
  if (score === null || score === undefined) return null;
  
  let baseRank = '';
  let subRank = '';
  let colorClass = '';
  let colorStyle = '';

  if (score >= 90) { baseRank = 'S'; colorClass = 'primary'; colorStyle = 'var(--accent-primary)'; }
  else if (score >= 80) { baseRank = 'A'; colorClass = 'success'; colorStyle = 'var(--success)'; }
  else if (score >= 70) { baseRank = 'B'; colorClass = 'warning'; colorStyle = 'var(--warning)'; }
  else if (score >= 60) { baseRank = 'C'; colorClass = ''; colorStyle = 'var(--text-primary)'; }
  else { baseRank = 'D'; colorClass = 'danger'; colorStyle = 'var(--danger)'; }

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
  
  return { baseRank, subRank, colorClass, colorStyle };
};

export const renderRankBadge = (score: number | null) => {
  const data = getRankData(score);
  if (!data) return <span>-</span>;

  const { baseRank, subRank, colorClass } = data;

  const isMinus = subRank.startsWith('-');
  const isPlus = subRank.startsWith('+');

  const subRankNode = subRank ? (
    <span style={{ fontSize: '0.65em', verticalAlign: isPlus ? 'super' : 'baseline', margin: '0 1px' }}>
      {subRank}
    </span>
  ) : null;

  return (
    <span 
      className={`badge ${colorClass === 'danger' ? '' : colorClass}`} 
      style={colorClass === 'danger' ? { color: 'var(--danger)' } : {}}
    >
      {isMinus && subRankNode}
      <span style={{ fontSize: '1em' }}>{baseRank}</span>
      {isPlus && subRankNode}
    </span>
  );
};
