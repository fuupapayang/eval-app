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
  specialistStage: RoleStage | null;
  specialistProgress: QuestProgress[];
}

export const useRoleQuest = (
  staff: Staff | undefined,
  currentEval: EvaluationForm | undefined,
  masterItems: EvaluationItem[],
  roleStages: RoleStage[]
): QuestStatus => {
  return useMemo(() => {
    // 勤続年数の計算
    let yearsOfService = 0;
    if (staff && staff.joinedAt) {
      const joinedDate = new Date(staff.joinedAt);
      const today = new Date();
      yearsOfService = today.getFullYear() - joinedDate.getFullYear();
      const m = today.getMonth() - joinedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < joinedDate.getDate())) {
        yearsOfService--;
      }
      yearsOfService = Math.max(0, yearsOfService);
    }

    const sortedStagesRaw = [...roleStages].sort((a, b) => a.yearsRequired - b.yearsRequired);
    const specialistStage = sortedStagesRaw.find(s => s.id === 'specialist') || null;
    const sortedStages = sortedStagesRaw.filter(s => s.id !== 'specialist');
    
    // Determine the highest stage the staff can reach.
    // They must meet the years of service AND all checkbox requirements for the stages they pass through.
    let currentStageIndex = 0;
    if (sortedStages.length > 0) {
      for (let i = 1; i < sortedStages.length; i++) {
        const stage = sortedStages[i];
        if (yearsOfService < stage.yearsRequired) {
          break; // Not enough years
        }

        // Check if this stage has checkbox requirements
        const checkboxReqs = stage.requirements.filter(r => r.type === 'checkbox');
        if (checkboxReqs.length > 0) {
          // All checkboxes for this stage MUST be checked in currentEval to be IN this stage
          const allChecked = checkboxReqs.every(req => currentEval && currentEval.customChecks && currentEval.customChecks[req.id]);
          if (!allChecked) {
            break; // Blocked from advancing to this stage
          }
        }
        
        currentStageIndex = i;
      }
    }
    
    let currentStage = sortedStages.length > 0 ? sortedStages[currentStageIndex] : {
      id: 'default', title: '未設定', yearsRequired: 0, salaryRange: '-', requirements: []
    };

    // Next stage is simply the stage after the current one, assuming there is one.
    // This correctly handles cases where yearsOfService is high but checkboxes blocked advancement.
    const nextStage = currentStageIndex + 1 < sortedStages.length ? sortedStages[currentStageIndex + 1] : null;

    let specialistProgress: QuestProgress[] = [];
    if (specialistStage && yearsOfService >= 8) {
      specialistProgress = specialistStage.requirements.map(req => {
        let currentScore = 0;
        if (currentEval) {
          switch (req.type) {
            case 'common':
              if (req.commonIndex !== undefined && currentEval.commonDetails && currentEval.commonDetails[req.commonIndex - 1] !== undefined) {
                currentScore = currentEval.commonDetails[req.commonIndex - 1];
              }
              break;
            case 'type_average':
              // We need to calculate typeAverage if we need it here
              // But wait, typeAverage is calculated later. Let's just calculate it now.
              break;
            case 'performance':
              currentScore = currentEval.performanceScore;
              break;
            case 'checkbox':
              if (currentEval.customChecks && currentEval.customChecks[req.id]) {
                currentScore = 1;
              }
              break;
            default:
              currentScore = 0;
          }
        }
        return {
          requirement: req,
          currentScore,
          isCleared: currentScore >= req.targetScore
        };
      });
    }

    // Type evaluation average calculation (moved up)
    const typeItems = masterItems.filter(m => m.category === '職種・タイプ別評価' && staff && m.type === staff.type);
    let typeAverage = 0;
    if (typeItems.length > 0 && currentEval) {
      let typeSum = 0;
      typeItems.forEach(item => {
        const entry = currentEval.entries.find(en => en.itemId === item.id);
        if (entry) {
          typeSum += entry.finalScore;
        }
      });
      typeAverage = typeSum / typeItems.length;
    }

    // Update specialistProgress type_average if needed
    if (specialistProgress.length > 0) {
      specialistProgress = specialistProgress.map(p => {
        if (p.requirement.type === 'type_average') {
          p.currentScore = typeAverage;
          p.isCleared = p.currentScore >= p.requirement.targetScore;
        }
        return p;
      });
    }

    // If there is no next stage, return empty progress
    if (!nextStage) {
      return {
        currentStage,
        nextStage,
        progressList: [],
        isAllCleared: false,
        completionPercentage: 100,
        specialistStage: (specialistStage && yearsOfService >= 8) ? specialistStage : null,
        specialistProgress
      };
    }


    const progressList: QuestProgress[] = nextStage.requirements.map(req => {
      let currentScore = 0;

      if (currentEval) {
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
          case 'checkbox':
            if (currentEval.customChecks && currentEval.customChecks[req.id]) {
              currentScore = 1;
            }
            break;
          default:
            currentScore = 0;
        }
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
      completionPercentage,
      specialistStage: (specialistStage && yearsOfService >= 8) ? specialistStage : null,
      specialistProgress
    };
  }, [staff, currentEval, masterItems, roleStages]);
};
