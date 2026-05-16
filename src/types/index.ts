export type Role = 'WEBデザイナー' | 'コーダー' | '映像' | 'ディレクター' | 'その他' | string;
export type StaffType = string;
export type Period = '上期' | '下期';

export type AuthUser = { type: 'MASTER' } | { type: 'STAFF'; staff: Staff };

export interface Staff {
  id: string;
  name: string;
  department: string;
  role: Role;
  type: StaffType;
  isLeader: boolean;
  isSubLeader: boolean;
  roleTitle: string;
  createdAt: string;
  password?: string;
  order?: number;
}

export interface EvaluationItem {
  id: string; // e.g. "クリエイティブタイプ|1"
  no: number;
  type: StaffType;
  category: '職種・タイプ別評価'; // The master only contains type-specific ones. Others are fixed.
  name: string;
  description: string;
  achievementLevel: string;
}

export interface ScoreEntry {
  itemId: string;
  selfScore: number;
  primaryScore: number;
  secondaryScore: number;
  finalScore: number;
  comment: string;
}

export interface EvaluationForm {
  id: string; // Unique ID for this evaluation log
  staffId: string;
  period: Period;
  year: number;
  evaluationDate?: string;
  reviewer?: string;
  
  // Section Scores (Final confirmed points)
  performanceScore: number; // 業績・案件貢献 (Max 15)
  performanceDetails: [number, number, number];
  
  themeTexts?: [string, string, string];    // 個人テーマの内容（目標）
  themeScore: number;       // 個人テーマ評価 (Max 15)
  themeDetails: [number, number, number];
  
  teamTexts?: [string, string, string];     // チーム目標の内容
  teamScore: number;        // チーム目標達成度 (Max 15)
  teamDetails: [number, number, number];
  
  selfComment?: string;     // スタッフ本人の自己評価コメント
  
  commonScore: number;      // 共通評価 (Max 20)
  typeScore: number;        // 職種・タイプ別評価 (Max 20 or 30)
  leaderScore: number;      // リーダー評価 (Max 10)
  leaderComment?: string;
  bonusScore: number;       // 加点評価 (Max 5)
  bonusComment?: string;
  
  totalScore: number; // Max 100
  
  // Detailed Entries
  entries: ScoreEntry[];
  
  generalComment: string;
  updatedAt: string;
}
