import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Staff, EvaluationItem, EvaluationForm, AuthUser } from '../types';
import { INITIAL_STAFF, EVALUATION_MASTER } from './initialData';

interface AppState {
  currentUser: AuthUser | null;
  staffList: Staff[];
  masterItems: EvaluationItem[];
  evaluations: EvaluationForm[];
  
  saveEvaluation: (evalForm: EvaluationForm) => void;
  deleteEvaluation: (id: string) => void;
  getEvaluation: (staffId: string, period: string, year: number) => EvaluationForm | undefined;
  
  login: (user: AuthUser) => void;
  logout: () => void;
  
  updateStaff: (staff: Staff) => void;
  addStaff: (staff: Staff) => void;
  addMasterItem: (item: EvaluationItem) => void;
  updateMasterItem: (item: EvaluationItem) => void;
  deleteMasterItem: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      staffList: INITIAL_STAFF,
      masterItems: EVALUATION_MASTER,
      evaluations: [],
      
      saveEvaluation: (evalForm) => set((state) => {
        const existingIndex = state.evaluations.findIndex(
          (e) => e.staffId === evalForm.staffId && e.period === evalForm.period && e.year === evalForm.year
        );
        
        if (existingIndex >= 0) {
          const newEvals = [...state.evaluations];
          newEvals[existingIndex] = evalForm;
          return { evaluations: newEvals };
        } else {
          return { evaluations: [...state.evaluations, evalForm] };
        }
      }),
      
      deleteEvaluation: (id) => set((state) => ({
        evaluations: state.evaluations.filter(e => e.id !== id)
      })),
      
      getEvaluation: (staffId, period, year) => {
        return get().evaluations.find(
          e => e.staffId === staffId && e.period === period && e.year === year
        );
      },
      
      login: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
      
      updateStaff: (staff) => set((state) => ({
        staffList: state.staffList.map(s => s.id === staff.id ? staff : s)
      })),

      addStaff: (staff) => set((state) => ({
        staffList: [...state.staffList, staff]
      })),

      addMasterItem: (item) => set((state) => ({
        masterItems: [...state.masterItems, item]
      })),

      updateMasterItem: (item) => set((state) => ({
        masterItems: state.masterItems.map(m => m.id === item.id ? item : m)
      })),

      deleteMasterItem: (id) => set((state) => ({
        masterItems: state.masterItems.filter(m => m.id !== id)
      }))
    }),
    {
      name: 'eval-app-storage',
    }
  )
);
