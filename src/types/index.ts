export type Role = 'WEBデザイナー' | 'コーダー' | '映像' | 'ディレクター' | 'その他' | string;
export type StaffType = string;
export type Period = '上期' | '下期' | '通期';

export type AuthUser = { type: 'MASTER' } | { type: 'STAFF'; staff: Staff };

export interface Staff {
  id: string;
  name: string;
  department: string;
  role: Role;
  type: StaffType;
  isLeader: boolean;
  isSubLeader: boolean;
  canEditTeamGoals?: boolean;
  roleTitle: string;
  joinedAt?: string;
  monthlySalary?: number; // 月額給与額 (Deprecated)
  annualSalary?: number;  // 年収（インセンティブを含まない）
  nextAnnualSalary?: number; // 来期年収予定
  incentive?: number;     // インセンティブ
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

export interface RoleRequirement {
  id: string;
  name: string;      // 表示名（例：品質管理）
  targetScore: number; // 目標スコア（星の数 1〜5、業績は10〜30など）
  type: 'common' | 'type_average' | 'performance' | 'theme' | 'checkbox';
  commonIndex?: number; // common_evaluationのインデックス (1〜5)
  description?: string;
}

export interface RoleStage {
  id: string;
  title: string;          // 例：一般、中堅
  yearsRequired: number;  // 必要（目安）勤続年数
  salaryRange: string;    // 例：300〜400万円
  requirements: RoleRequirement[];
}

export interface ScoreEntry {
  itemId: string;
  selfScore: number;
  primaryScore: number;
  secondaryScore: number;
  finalScore: number;
  comment: string;
}

export interface ThemeHistoryItem {
  text: string;
  status: string;
  reflection: string;
  updatedAt: string;
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
  themeStatuses?: [string, string, string]; // 個人テーマの状態（達成、未達、継続中）
  themeReflections?: [string, string, string]; // 振り返り・未達理由など
  themeHistory?: Record<string, ThemeHistoryItem[]>; // 過去の履歴リスト (key is '0', '1', '2')
  themeScore: number;       // 個人テーマ評価 (Max 15)
  themeDetails: [number, number, number];
  
  teamTexts?: [string, string, string];     // チーム目標の内容
  teamStatuses?: [string, string, string]; // チーム目標の状態
  teamReflections?: [string, string, string]; // チーム目標の振り返り
  teamHistory?: Record<string, ThemeHistoryItem[]>; // チーム目標の過去の履歴
  teamScore: number;        // チーム目標達成度 (Max 15)
  teamDetails: [number, number, number];
  
  selfComment?: string;     // スタッフ本人の自己評価コメント
  
  commonScore: number;      // 共通評価 (Max 20 or 25)
  commonDetails?: number[]; // [1, 2, 3, 4, 5] point for each common item
  typeScore: number;        // 職種・タイプ別評価 (Max 20 or 30)
  leaderScore: number;      // リーダー評価 (Max 10)
  leaderComment?: string;
  bonusScore: number;       // 加点評価 (Max 5)
  bonusComment?: string;
  
  totalScore: number; // Max 100
  
  // Custom Role Requirements Checkboxes
  customChecks?: Record<string, boolean>;
  
  // Detailed Entries
  entries: ScoreEntry[];
  
  generalComment: string;
  updatedAt: string;
}
