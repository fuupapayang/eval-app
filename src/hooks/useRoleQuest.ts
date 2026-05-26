import { useMemo } from 'react';
import type { EvaluationForm, EvaluationItem, Staff, RoleStage, RoleRequirement } from '../types';

export interface QuestProgress {
  requirement: RoleRequirement;
  currentScore: number;
  isCleared: boolean;
}

export interface QuestStatus {
  currentStage: RoleStage;
  nextStage: RoleStage | null;
  progressList: QuestProgress[];
  isAllCleared: boolean;
  completionPercentage: number;
}

export const useRoleQuest = (
  staff: Staff,
  currentEval: EvaluationForm | undefined,
  masterItems: EvaluationItem[],
  roleStages: RoleStage[]
): QuestStatus => {
  return useMemo(() => {
    // 勤続年数の計算
    let yearsOfService = 0;
    if (staff.joinedAt) {
      const joinedDate = new Date(staff.joinedAt);
      const today = new Date();
      yearsOfService = today.getFullYear() - joinedDate.getFullYear();
      const m = today.getMonth() - joinedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < joinedDate.getDate())) {
        yearsOfService--;
      }
      yearsOfService = Math.max(0, yearsOfService);
    }

    const sortedStages = [...roleStages].sort((a, b) => a.yearsRequired - b.yearsRequired);
    
    // Default to a dummy current stage if none are loaded
    let currentStage = sortedStages.length > 0 ? sortedStages[0] : {
      id: 'default', title: '未設定', yearsRequired: 0, salaryRange: '-', requirements: []
    };
    
    // Find the highest stage where yearsRequired <= yearsOfService
    for (let i = sortedStages.length - 1; i >= 0; i--) {
      if (yearsOfService >= sortedStages[i].yearsRequired) {
        currentStage = sortedStages[i];
        break;
      }
    }

    // Find the lowest stage where yearsRequired > yearsOfService
    const nextStage = sortedStages.find(s => s.yearsRequired > yearsOfService) || null;

    // If there is no evaluation or next stage, return empty progress
    if (!currentEval || !nextStage) {
      return {
        currentStage,
        nextStage,
        progressList: [],
        isAllCleared: false,
        completionPercentage: 0
      };
    }

    // Type evaluation average calculation
    const typeItems = masterItems.filter(m => m.category === '職種・タイプ別評価' && m.type === staff.type);
    let typeAverage = 0;
    if (typeItems.length > 0) {
      let typeSum = 0;
      typeItems.forEach(item => {
        const entry = currentEval.entries.find(en => en.itemId === item.id);
        if (entry) {
          typeSum += entry.finalScore;
        }
      });
      typeAverage = typeSum / typeItems.length;
    }

    const progressList: QuestProgress[] = nextStage.requirements.map(req => {
      let currentScore = 0;

      switch (req.type) {
        case 'common':
          if (req.commonIndex !== undefined && currentEval.commonDetails && currentEval.commonDetails[req.commonIndex - 1] !== undefined) {
            currentScore = currentEval.commonDetails[req.commonIndex - 1];
          }
          break;
        case 'type_average':
          currentScore = typeAverage;
          break;
        case 'performance':
          currentScore = currentEval.performanceScore;
          break;
        default:
          currentScore = 0;
      }

      return {
        requirement: req,
        currentScore,
        isCleared: currentScore >= req.targetScore
      };
    });

    const clearedCount = progressList.filter(p => p.isCleared).length;
    const isAllCleared = progressList.length > 0 && clearedCount === progressList.length;
    const completionPercentage = progressList.length > 0 ? Math.round((clearedCount / progressList.length) * 100) : 0;

    return {
      currentStage,
      nextStage,
      progressList,
      isAllCleared,
      completionPercentage
    };
  }, [staff, currentEval, masterItems, roleStages]);
};
