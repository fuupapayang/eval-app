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
      { id: 'mentoring', name: '部下への技術指導・連携', targetScore: 3, type: 'common', commonIndex: 3 },
      { id: 'performance', name: '目標達成・案件完遂', targetScore: 20, type: 'performance', description: '業績・案件貢献スコア(30点満点)' },
      { id: 'mid_check_1', name: '自ら提案ができ、かつ、業務が遂行できる', targetScore: 1, type: 'checkbox' },
      { id: 'mid_check_2', name: '生産高：年間1200万円以上～', targetScore: 1, type: 'checkbox' },
      { id: 'mid_check_3', name: '技術、経験を部下に教育できる', targetScore: 1, type: 'checkbox' },
      { id: 'mid_check_4', name: 'クライアントからリピートがある', targetScore: 1, type: 'checkbox' },
      { id: 'mid_check_5', name: 'チームの運営に寄与し模範となる行動がとれる', targetScore: 1, type: 'checkbox' }
    ]
  },
  {
    id: 'specialist',
    title: 'スペシャリスト',
    yearsRequired: 8,
    salaryRange: '500〜800万円',
    requirements: [
      { id: 'quality', name: '品質意識 (ミスがない)', targetScore: 4, type: 'common', commonIndex: 2 },
      { id: 'schedule', name: '納期・責任感 (スケジュール管理)', targetScore: 4, type: 'common', commonIndex: 1 },
      { id: 'learning', name: '学習・成長 (自己学習)', targetScore: 4, type: 'common', commonIndex: 4 },
      { id: 'tech', name: '技術力／デザイン力', targetScore: 4.8, type: 'type_average', description: '職種別評価の平均' },
      { id: 'performance', name: '目標達成・案件完遂', targetScore: 25, type: 'performance', description: '業績・案件貢献スコア(30点満点)' },
      { id: 'spec_check_1', name: '習得技術を他のメンバーに共有できる', targetScore: 1, type: 'checkbox' },
      { id: 'spec_check_2', name: '他のメンバーにはできない技術を持っている', targetScore: 1, type: 'checkbox' },
      { id: 'spec_check_3', name: '新たな技術の発見', targetScore: 1, type: 'checkbox' },
      { id: 'spec_check_4', name: '技術面での相談役', targetScore: 1, type: 'checkbox' }
    ]
  },
  {
    id: 'leader',
    title: 'チームリーダー',
    yearsRequired: 9,
    salaryRange: '500〜600万円',
    requirements: [
      { id: 'quality', name: '品質意識 (ミスがない)', targetScore: 4, type: 'common', commonIndex: 2 },
      { id: 'schedule', name: '納期・責任感 (スケジュール管理)', targetScore: 4, type: 'common', commonIndex: 1 },
      { id: 'learning', name: '学習・成長 (自己学習)', targetScore: 4, type: 'common', commonIndex: 4 },
      { id: 'tech', name: '技術力／デザイン力', targetScore: 4.5, type: 'type_average', description: '職種別評価の平均' },
      { id: 'mentoring', name: 'チーム牽引・部下指導', targetScore: 4, type: 'common', commonIndex: 3 },
      { id: 'performance', name: 'チーム目標達成・マネジメント', targetScore: 25, type: 'performance', description: '業績・案件貢献スコア(30点満点)' },
      { id: 'leader_check_1', name: 'メンバーからの信任が得られる', targetScore: 1, type: 'checkbox' },
      { id: 'leader_check_2', name: 'メンバーを統括し、目標に向けてチームを牽引できる', targetScore: 1, type: 'checkbox' },
      { id: 'leader_check_3', name: 'メンバーの目標設定ができる（数値目標、状態目標）', targetScore: 1, type: 'checkbox' },
      { id: 'leader_check_4', name: 'メンバーの面談・評価ができる（半年に1回、期末評価）', targetScore: 1, type: 'checkbox' },
      { id: 'leader_check_5', name: '品質管理を行う', targetScore: 1, type: 'checkbox' },
      { id: 'leader_check_6', name: '会社の方針をメンバーに浸透できる', targetScore: 1, type: 'checkbox' },
      { id: 'leader_check_7', name: '採用について最終面談まで進行できる', targetScore: 1, type: 'checkbox' }
    ]
  },
  {
    id: 'manager',
    title: '部長',
    yearsRequired: 15,
    salaryRange: '600〜800万円',
    requirements: [
      { id: 'tech', name: '技術力／マネジメント力', targetScore: 4.8, type: 'type_average' },
      { id: 'mentoring', name: '組織全体牽引・方針浸透', targetScore: 5, type: 'common', commonIndex: 3 },
      { id: 'performance', name: '事業部計画立案・外注利益管理', targetScore: 28, type: 'performance' },
      { id: 'mgr_check_1', name: '事業部のリーダーからの信任が得られる', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_2', name: '事業部計画が立案できる', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_3', name: '事業部の目標に向けてそれぞれのチームを牽引できる', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_4', name: '事業部の外注、利益管理ができる', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_5', name: '各チームリーダーの評価ができる（半年に1回、期末評価）', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_6', name: '会社の方針をメンバーに浸透できる', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_7', name: '事業部の採用計画を立案できる', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_8', name: 'リーダー会議の実施', targetScore: 1, type: 'checkbox' },
      { id: 'mgr_check_9', name: '社外との繋がりを持ち社内に供与できる', targetScore: 1, type: 'checkbox' }
    ]
  },
  {
    id: 'executive',
    title: '役員',
    yearsRequired: 20,
    salaryRange: '800万円〜',
    requirements: [
      { id: 'performance', name: '全社業績達成', targetScore: 30, type: 'performance' },
      { id: 'exec_check_1', name: '全事業部のリーダー・部長からの信任が得られる', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_2', name: '会社方針、計画を遂行できる', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_3', name: '各事業部の目標設定ができる', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_4', name: '会社全体の数値状況の把握と改善ができる', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_5', name: '各部長の評価ができる（半年に1回、期末評価）', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_6', name: '各事業部の採用計画の決定', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_7', name: '評価制度の立案・改善ができる', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_8', name: '給与の判断', targetScore: 1, type: 'checkbox' },
      { id: 'exec_check_9', name: 'インセンティブの判断', targetScore: 1, type: 'checkbox' }
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
