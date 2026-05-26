import type { RoleStage } from '../types';

export const ROLE_STAGES: RoleStage[] = [
  {
    id: 'rookie',
    title: '新人',
    yearsRequired: 0,
    salaryRange: '276万円',
    requirements: []
  },
  {
    id: 'general',
    title: '一般',
    yearsRequired: 3,
    salaryRange: '300〜400万円',
    requirements: [
      { id: 'quality', name: '品質意識 (ミスがない)', targetScore: 3, type: 'common', commonIndex: 2 },
      { id: 'schedule', name: '納期・責任感 (スケジュール管理)', targetScore: 3, type: 'common', commonIndex: 1 },
      { id: 'learning', name: '学習・成長 (自己学習)', targetScore: 1, type: 'common', commonIndex: 4 },
      { id: 'tech', name: '技術力／デザイン力', targetScore: 3.0, type: 'type_average', description: '職種別評価の平均' },
      { id: 'performance', name: '目標達成・案件完遂', targetScore: 15, type: 'performance', description: '業績・案件貢献スコア(30点満点)' }
    ]
  },
  {
    id: 'mid',
    title: '中堅',
    yearsRequired: 6,
    salaryRange: '400〜500万円',
    requirements: [
      { id: 'quality', name: '品質意識 (ミスがない)', targetScore: 3, type: 'common', commonIndex: 2 },
      { id: 'schedule', name: '納期・責任感 (スケジュール管理)', targetScore: 3, type: 'common', commonIndex: 1 },
      { id: 'learning', name: '学習・成長 (自己学習)', targetScore: 3, type: 'common', commonIndex: 4 },
      { id: 'tech', name: '技術力／デザイン力', targetScore: 4.0, type: 'type_average', description: '職種別評価の平均' },
      { id: 'mentoring', name: '部下への技術指導・連携', targetScore: 3, type: 'common', commonIndex: 3 }, // 改善提案・連携
      { id: 'performance', name: '目標達成・案件完遂', targetScore: 20, type: 'performance', description: '業績・案件貢献スコア(30点満点)' }
    ]
  },
  {
    id: 'leader',
    title: 'チームリーダー',
    yearsRequired: 8,
    salaryRange: '500〜600万円',
    requirements: [
      { id: 'quality', name: '品質意識 (ミスがない)', targetScore: 4, type: 'common', commonIndex: 2 },
      { id: 'schedule', name: '納期・責任感 (スケジュール管理)', targetScore: 4, type: 'common', commonIndex: 1 },
      { id: 'learning', name: '学習・成長 (自己学習)', targetScore: 4, type: 'common', commonIndex: 4 },
      { id: 'tech', name: '技術力／デザイン力', targetScore: 4.5, type: 'type_average', description: '職種別評価の平均' },
      { id: 'mentoring', name: 'チーム牽引・部下指導', targetScore: 4, type: 'common', commonIndex: 3 },
      { id: 'performance', name: 'チーム目標達成・マネジメント', targetScore: 25, type: 'performance', description: '業績・案件貢献スコア(30点満点)' }
    ]
  },
  {
    id: 'manager',
    title: 'WEB制作部長',
    yearsRequired: 15,
    salaryRange: '600〜800万円',
    requirements: [
      { id: 'tech', name: '技術力／マネジメント力', targetScore: 4.8, type: 'type_average' },
      { id: 'mentoring', name: '組織全体牽引・方針浸透', targetScore: 5, type: 'common', commonIndex: 3 },
      { id: 'performance', name: '事業部計画立案・外注利益管理', targetScore: 28, type: 'performance' }
    ]
  }
];

export const getNextStage = (yearsOfService: number): RoleStage | null => {
  // If yearsOfService is less than 3, next is general (3 years)
  // If 3 <= y < 6, next is mid (6 years)
  // If 6 <= y < 8, next is leader (8 years)
  // If 8 <= y < 15, next is manager (15 years)
  
  if (yearsOfService < 3) return ROLE_STAGES.find(s => s.id === 'general') || null;
  if (yearsOfService < 6) return ROLE_STAGES.find(s => s.id === 'mid') || null;
  if (yearsOfService < 8) return ROLE_STAGES.find(s => s.id === 'leader') || null;
  if (yearsOfService < 15) return ROLE_STAGES.find(s => s.id === 'manager') || null;
  
  return null; // Already at top or handle executive separately if needed
};

export const getCurrentStage = (yearsOfService: number): RoleStage => {
  if (yearsOfService < 3) return ROLE_STAGES[0]; // rookie
  if (yearsOfService < 6) return ROLE_STAGES[1]; // general
  if (yearsOfService < 8) return ROLE_STAGES[2]; // mid
  if (yearsOfService < 15) return ROLE_STAGES[3]; // leader
  return ROLE_STAGES[4]; // manager
};
