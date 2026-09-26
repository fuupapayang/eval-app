const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const staffList = data.staffList;
const evaluations = data.evaluations;

const updates = [];

staffList.forEach(staff => {
  const upperEval = evaluations.find(e => e.staffId === staff.id && e.period === '上期');
  const lowerEval = evaluations.find(e => e.staffId === staff.id && e.period === '下期');
  
  if (upperEval && lowerEval) {
    let comment = ``;
    const scoreDiff = lowerEval.totalScore - upperEval.totalScore;
    
    comment += `上期の総合点${upperEval.totalScore}点から、下期は${lowerEval.totalScore}点へと`;
    if (scoreDiff > 0) {
      comment += `大きく向上（+${scoreDiff}点）しました。素晴らしい成長です！\n`;
    } else if (scoreDiff < 0) {
      comment += `少し下がって（${scoreDiff}点）しまいましたが、多くの強みが見られました。\n`;
    } else {
      comment += `同等のスコアを維持し、安定した成果を出しています。\n`;
    }

    // Compare performance
    const perfDiff = lowerEval.performanceScore - upperEval.performanceScore;
    if (perfDiff > 0) {
      comment += `特に業績・案件貢献において、納期遵守や顧客貢献の面で努力が実を結び、点数が上がりました。`;
    } else if (perfDiff < 0) {
      comment += `一方で、業績・案件貢献のスコアが少し落ちており、納期管理やクライアント対応において一部フォローが必要な場面があったかもしれません。今後は先回りした対応を意識してください。`;
    }

    // Compare theme
    const themeDiff = lowerEval.themeScore - upperEval.themeScore;
    if (themeDiff > 0) {
      comment += `また、個人テーマの達成度も向上しており、自ら設定した目標にしっかりと向き合えた証拠です。`;
    } else if (themeDiff < 0) {
      comment += `個人テーマの達成度については、目標に対して少し取り組みが不足していたようです。未達となった理由を振り返り、次期の目標設定に活かしましょう。`;
    }

    // Common/Type score advice
    const commonDiff = lowerEval.commonScore - upperEval.commonScore;
    if (commonDiff < 0) {
      comment += `共通評価項目で一部点数が下がった点については、日々の基本動作やチーム連携を見直すことで容易に改善可能です。`;
    } else {
      comment += `共通評価や職種別評価でも安定した点数を獲得できており、日々の業務における基本動作やチームへの貢献姿勢が評価されています。`;
    }
    
    comment += `\n来期もさらなる飛躍を期待しています！`;

    // Overwrite the teamTexts from upper to lower if we need to? The user said "個人目標の設定を下期にも表示させてください".
    // "個人目標" = themeTexts
    let newThemeTexts = lowerEval.themeTexts;
    let newThemeStatuses = lowerEval.themeStatuses;
    
    // If lowerEval themeTexts are empty (no goals carried over)
    if (!newThemeTexts || newThemeTexts.every(t => !t)) {
       newThemeTexts = upperEval.themeTexts;
       newThemeStatuses = ['', '', '']; // Reset status
    }

    updates.push({
      id: lowerEval.id,
      generalComment: comment,
      themeTexts: newThemeTexts,
      themeStatuses: newThemeStatuses
    });
  }
});

fs.writeFileSync('updates.json', JSON.stringify(updates, null, 2));
console.log(`Prepared updates for ${updates.length} evaluations.`);
