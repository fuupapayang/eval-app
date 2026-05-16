import type { Staff, EvaluationItem } from '../types';

export const INITIAL_STAFF: Staff[] = [
  { id: '1', name: '山田 彩', department: 'WEBチーム', role: 'WEBデザイナー', type: 'クリエイティブタイプ', isLeader: true, isSubLeader: false, roleTitle: 'リーダー', createdAt: new Date().toISOString() },
  { id: '2', name: '佐藤 美咲', department: 'WEBチーム', role: 'WEBデザイナー', type: 'デザイナータイプ', isLeader: false, isSubLeader: false, roleTitle: '一般', createdAt: new Date().toISOString() },
  { id: '3', name: '田中 健', department: 'WEBチーム', role: 'WEBデザイナー', type: 'クリエイティブタイプ', isLeader: false, isSubLeader: false, roleTitle: '一般', createdAt: new Date().toISOString() },
  { id: '4', name: '鈴木 翔', department: 'WEBチーム', role: 'コーダー', type: 'キーパータイプ', isLeader: true, isSubLeader: false, roleTitle: 'リーダー', createdAt: new Date().toISOString() },
  { id: '5', name: '高橋 直人', department: 'WEBチーム', role: 'コーダー', type: 'ゲームチェンジャータイプ', isLeader: false, isSubLeader: true, roleTitle: 'サブリーダー', createdAt: new Date().toISOString() },
  { id: '6', name: '伊藤 優', department: 'WEBチーム', role: 'コーダー', type: 'キーパータイプ', isLeader: false, isSubLeader: false, roleTitle: '一般', createdAt: new Date().toISOString() },
  { id: '7', name: '中村 蓮', department: 'WEBチーム', role: '映像', type: '監督タイプ', isLeader: false, isSubLeader: false, roleTitle: '一般', createdAt: new Date().toISOString() },
  { id: '8', name: '小林 真央', department: 'WEBチーム', role: '映像', type: '表現者タイプ', isLeader: false, isSubLeader: true, roleTitle: 'サブリーダー', createdAt: new Date().toISOString() },
  { id: '9', name: '加藤 陽菜', department: 'WEBチーム', role: '映像', type: '表現者タイプ', isLeader: false, isSubLeader: false, roleTitle: '一般', createdAt: new Date().toISOString() },
  { id: '10', name: '森 大輔', department: 'WEBチーム', role: 'コーダー', type: 'ゲームチェンジャータイプ', isLeader: false, isSubLeader: false, roleTitle: '一般', createdAt: new Date().toISOString() }
];

export const EVALUATION_MASTER: EvaluationItem[] = [
  // クリエイティブタイプ
  { id: 'クリエイティブタイプ|1', no: 1, type: 'クリエイティブタイプ', category: '職種・タイプ別評価', name: '企画発想力', description: '与件が少ない状態でも、方向性や見せ方を自ら考えられるか', achievementLevel: '案件の目的に沿った切り口・ビジュアル案を複数提示できる' },
  { id: 'クリエイティブタイプ|2', no: 2, type: 'クリエイティブタイプ', category: '職種・タイプ別評価', name: 'コンセプト設計', description: '魅力を言語化し、デザインの軸に落とし込めるか', achievementLevel: 'ターゲット・訴求・トーンが一貫した提案になっている' },
  { id: 'クリエイティブタイプ|3', no: 3, type: 'クリエイティブタイプ', category: '職種・タイプ別評価', name: '素材創出力', description: '写真・AI画像・図版・コピー要素などを自ら作れるか', achievementLevel: '不足素材を補い、提案の説得力を高められる' },
  { id: 'クリエイティブタイプ|4', no: 4, type: 'クリエイティブタイプ', category: '職種・タイプ別評価', name: '提案説明力', description: '社内外に意図を分かりやすく説明できるか', achievementLevel: 'デザインの理由と効果を言葉で伝えられる' },
  { id: 'クリエイティブタイプ|5', no: 5, type: 'クリエイティブタイプ', category: '職種・タイプ別評価', name: '完成度への責任', description: 'アイデアだけで終わらず、実制作の品質まで高められるか', achievementLevel: '納品前の細部まで責任を持って仕上げられる' },
  
  // デザイナータイプ
  { id: 'デザイナータイプ|1', no: 1, type: 'デザイナータイプ', category: '職種・タイプ別評価', name: '情報整理力', description: '既存資料・写真・コピーを分かりやすく再構成できるか', achievementLevel: '情報の優先順位が整理され、読みやすく伝わる' },
  { id: 'デザイナータイプ|2', no: 2, type: 'デザイナータイプ', category: '職種・タイプ別評価', name: '広告表現力', description: '見出し・余白・写真・色・文字組みで訴求力を高められるか', achievementLevel: '素材の魅力を広告的に引き出せている' },
  { id: 'デザイナータイプ|3', no: 3, type: 'デザイナータイプ', category: '職種・タイプ別評価', name: 'トーン調整力', description: '案件ごとの空気感を整えられるか', achievementLevel: '高級感・親しみやすさ・信頼感を目的に合わせて表現できる' },
  { id: 'デザイナータイプ|4', no: 4, type: 'デザイナータイプ', category: '職種・タイプ別評価', name: 'レイアウト品質', description: '可読性・視線誘導・バランスの取れた画面を作れるか', achievementLevel: 'PC/SPともに見やすく、破綻のない構成にできる' },
  { id: 'デザイナータイプ|5', no: 5, type: 'デザイナータイプ', category: '職種・タイプ別評価', name: '修正対応力', description: '修正意図を理解し、品質を保ったまま反映できるか', achievementLevel: '手戻りを抑え、完成度を落とさず改善できる' },

  // キーパータイプ
  { id: 'キーパータイプ|1', no: 1, type: 'キーパータイプ', category: '職種・タイプ別評価', name: '実装の正確性', description: 'デザイン通りに崩れなく実装できるか', achievementLevel: '主要ブラウザ・スマホ表示で安定している' },
  { id: 'キーパータイプ|2', no: 2, type: 'キーパータイプ', category: '職種・タイプ別評価', name: '納品品質', description: 'リンク切れ・表示崩れ・フォーム不具合などを防げるか', achievementLevel: '公開前チェックを徹底し、事故を未然に防げる' },
  { id: 'キーパータイプ|3', no: 3, type: 'キーパータイプ', category: '職種・タイプ別評価', name: '更新対応力', description: '既存サイト更新・修正を正確かつ迅速に行えるか', achievementLevel: 'クライアント運用を安心して任せられる' },
  { id: 'キーパータイプ|4', no: 4, type: 'キーパータイプ', category: '職種・タイプ別評価', name: 'クライアント対応', description: '要望を整理し、丁寧かつ的確にやり取りできるか', achievementLevel: '相手に不安を与えず、確認事項を明確にできる' },
  { id: 'キーパータイプ|5', no: 5, type: 'キーパータイプ', category: '職種・タイプ別評価', name: '保守性・運用管理', description: '後から直しやすいコード・CMS構成にできるか', achievementLevel: 'サーバー・SSL・CMS・バックアップ等を安全に扱える' },

  // ゲームチェンジャータイプ
  { id: 'ゲームチェンジャータイプ|1', no: 1, type: 'ゲームチェンジャータイプ', category: '職種・タイプ別評価', name: '技術探求力', description: '新しい技術・表現・AI・ライブラリを学んでいるか', achievementLevel: '業務に使える可能性を継続的に検証している' },
  { id: 'ゲームチェンジャータイプ|2', no: 2, type: 'ゲームチェンジャータイプ', category: '職種・タイプ別評価', name: '表現開発力', description: 'アニメーション・インタラクション等で新しい見せ方を作れるか', achievementLevel: '提案や案件の表現幅を広げる実装ができる' },
  { id: 'ゲームチェンジャータイプ|3', no: 3, type: 'ゲームチェンジャータイプ', category: '職種・タイプ別評価', name: '実装応用力', description: '新技術を実案件に使えるレベルまで落とし込めるか', achievementLevel: '実験で終わらず、納品可能な品質にできる' },
  { id: 'ゲームチェンジャータイプ|4', no: 4, type: 'ゲームチェンジャータイプ', category: '職種・タイプ別評価', name: '課題解決力', description: '技術的な難題に対して調査・検証・解決できるか', achievementLevel: '原因を切り分け、対応方針を示せる' },
  { id: 'ゲームチェンジャータイプ|5', no: 5, type: 'ゲームチェンジャータイプ', category: '職種・タイプ別評価', name: '標準化・共有', description: '作った技術をチームで再利用できる形に整理できるか', achievementLevel: 'ナレッジ化・テンプレート化に貢献している' },

  // 監督タイプ
  { id: '監督タイプ|1', no: 1, type: '監督タイプ', category: '職種・タイプ別評価', name: '企画構成力', description: '目的に合わせて映像全体の流れを設計できるか', achievementLevel: '構成案で視聴者の理解・感情の流れを作れている' },
  { id: '監督タイプ|2', no: 2, type: '監督タイプ', category: '職種・タイプ別評価', name: 'コンテ作成力', description: '画面構成・カット割り・展開を分かりやすく設計できるか', achievementLevel: '制作前に必要な画・尺・素材が明確になっている' },
  { id: '監督タイプ|3', no: 3, type: '監督タイプ', category: '職種・タイプ別評価', name: 'ストーリー設計', description: '伝える順序や見せ場を考えられるか', achievementLevel: '最後まで見たくなる展開と納得感がある' },
  { id: '監督タイプ|4', no: 4, type: '監督タイプ', category: '職種・タイプ別評価', name: '演出方針', description: '高級感・信頼感・親しみやすさ等のトーンを定められるか', achievementLevel: '案件に合った演出の軸がブレない' },
  { id: '監督タイプ|5', no: 5, type: '監督タイプ', category: '職種・タイプ別評価', name: '完成管理', description: '企画意図が最終映像まで失われないよう管理できるか', achievementLevel: '編集・音・テロップまで方向性を統一できる' },

  // 表現者タイプ
  { id: '表現者タイプ|1', no: 1, type: '表現者タイプ', category: '職種・タイプ別評価', name: '編集技術', description: 'カット・テンポ・尺・つなぎの完成度が高いか', achievementLevel: '視聴しやすく、狙いに合ったリズムを作れている' },
  { id: '表現者タイプ|2', no: 2, type: '表現者タイプ', category: '職種・タイプ別評価', name: '映像表現力', description: '色・光・動き・質感で魅力的な画づくりができるか', achievementLevel: '画面としての完成度が高く、印象に残る' },
  { id: '表現者タイプ|3', no: 3, type: '表現者タイプ', category: '職種・タイプ別評価', name: '音響・BGM設計', description: '音楽・効果音・ナレーションのバランスを整えられるか', achievementLevel: '音量・間・空気感が映像の目的と合っている' },
  { id: '表現者タイプ|4', no: 4, type: '表現者タイプ', category: '職種・タイプ別評価', name: 'テロップ表現', description: '文字の出し方・読みやすさ・デザイン性を高められるか', achievementLevel: '情報が伝わり、画面の品位も保たれている' },
  
  // センターバックタイプ
  { id: 'センターバックタイプ|1', no: 1, type: 'センターバックタイプ', category: '職種・タイプ別評価', name: 'プロジェクト把握力', description: 'WEB運用上の各プロジェクトの進行状況・課題・優先順位を正しく把握できるか', achievementLevel: '案件ごとの状態を整理し、必要な対応・リスク・次アクションを明確にできる' },
  { id: 'センターバックタイプ|2', no: 2, type: 'センターバックタイプ', category: '職種・タイプ別評価', name: '情報共有・連携力', description: 'デザイナー、コーダー、映像、営業・ディレクターなど関係者へ適時適切に情報共有できるか', achievementLevel: '関係者が迷わず動けるよう、必要な情報をタイミングよく整理して共有できる' },
  { id: 'センターバックタイプ|3', no: 3, type: 'センターバックタイプ', category: '職種・タイプ別評価', name: 'クリエイティブ提案力', description: '広告運用、LP、バナー、導線改善など、プロジェクト完遂に向けた有効なクリエイティブを提案できるか', achievementLevel: '目的・ターゲット・運用状況を踏まえ、効果につながる具体策を提案できる' },
  { id: 'センターバックタイプ|4', no: 4, type: 'センターバックタイプ', category: '職種・タイプ別評価', name: '最適解への落とし込み', description: '複数の表現・施策の中から、プロジェクトに最も効果的なクリエイティビティを選び、実行に移せるか', achievementLevel: '単なるアイデアで終わらせず、実制作・運用・改善まで落とし込める' },
  { id: 'センターバックタイプ|5', no: 5, type: 'センターバックタイプ', category: '職種・タイプ別評価', name: 'ハンズオン対応力', description: '一部のページ更新、簡易デザイン、基本的なコーディングなどを自ら対応できるか', achievementLevel: '小規模な更新・修正・素材調整を自走し、プロジェクト全体の速度と品質に貢献できる' },
];

export const COMMON_EVALUATION = [
  { no: 1, name: '目的理解', description: '案件の目的・ターゲット・クライアント意図を理解して制作できているか' },
  { no: 2, name: '納期・責任感', description: '遅延や不明点を早めに共有し、期日を守る姿勢があるか' },
  { no: 3, name: '品質意識', description: '誤字・表示崩れ・書き出しミス・確認漏れを防ぐ意識があるか' },
  { no: 4, name: '改善提案・連携', description: '指示待ちではなく改善提案を行い、営業・他メンバーと連携できるか' },
  { no: 5, name: '学習・成長', description: '新しい表現・技術・AI・ツールを学び、業務に活かしているか' },
];
