import fs from 'fs';

const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
const staffList = data.staffList;
const evaluations = data.evaluations;

const contextList = [];

staffList.forEach(staff => {
  const upperEval = evaluations.find(e => e.staffId === staff.id && e.period === '上期');
  if (upperEval) {
    contextList.push({
      staffId: staff.id,
      name: staff.name,
      role: staff.roleTitle,
      type: staff.type,
      themes: upperEval.themeTexts || [],
      statuses: upperEval.themeStatuses || [],
      totalScore: upperEval.totalScore
    });
  }
});

fs.writeFileSync('staff_context.json', JSON.stringify(contextList, null, 2));
console.log(`Generated context for ${contextList.length} staff.`);
