import { create } from 'zustand';
import type { Staff, EvaluationItem, EvaluationForm, AuthUser, RoleStage } from '../types';
import { INITIAL_STAFF, EVALUATION_MASTER } from './initialData';
import { ROLE_STAGES as INITIAL_ROLE_STAGES } from '../lib/roleModelData';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs, writeBatch } from 'firebase/firestore';

interface AppState {
  currentUser: AuthUser | null;
  staffList: Staff[];
  masterItems: EvaluationItem[];
  roleStages: RoleStage[];
  evaluations: EvaluationForm[];
  isSyncing: boolean;
  
  initSync: () => void;
  saveEvaluation: (evalForm: EvaluationForm) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;
  getEvaluation: (staffId: string, period: string, year: number) => EvaluationForm | undefined;
  
  login: (user: AuthUser) => void;
  logout: () => void;
  
  updateStaff: (staff: Staff) => Promise<void>;
  addStaff: (staff: Staff) => Promise<void>;
  addMasterItem: (item: EvaluationItem) => Promise<void>;
  updateMasterItem: (item: EvaluationItem) => Promise<void>;
  deleteMasterItem: (id: string) => Promise<void>;
  reorderStaff: (newStaffList: Staff[]) => Promise<void>;
  
  addRoleStage: (stage: RoleStage) => Promise<void>;
  updateRoleStage: (stage: RoleStage) => Promise<void>;
  deleteRoleStage: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()((set, get) => ({
  currentUser: null,
  staffList: [],
  masterItems: [],
  roleStages: [],
  evaluations: [],
  isSyncing: false,

  initSync: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });

    // Seed data if collections are empty
    const staffDocs = await getDocs(collection(db, 'staff'));
    if (staffDocs.empty) {
      console.log('Seeding initial data...');
      const batch = writeBatch(db);
      INITIAL_STAFF.forEach(staff => {
        batch.set(doc(db, 'staff', staff.id), staff);
      });
      EVALUATION_MASTER.forEach(item => {
        batch.set(doc(db, 'masterItems', item.id), item);
      });
      INITIAL_ROLE_STAGES.forEach(stage => {
        batch.set(doc(db, 'roleStages', stage.id), stage);
      });
      await batch.commit();
    }

    // Set up real-time listeners
    onSnapshot(collection(db, 'staff'), (snapshot) => {
      const staffList = snapshot.docs.map(doc => doc.data() as Staff);
      // Sort by order field, fallback to putting those without order at the end
      staffList.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 9999;
        const orderB = b.order !== undefined ? b.order : 9999;
        return orderA - orderB;
      });
      set({ staffList });
    });

    onSnapshot(collection(db, 'masterItems'), (snapshot) => {
      const masterItems = snapshot.docs.map(doc => doc.data() as EvaluationItem);
      set({ masterItems });
    });

    onSnapshot(collection(db, 'roleStages'), (snapshot) => {
      const roleStages = snapshot.docs.map(doc => doc.data() as RoleStage);
      roleStages.sort((a, b) => a.yearsRequired - b.yearsRequired);
      set({ roleStages });
    });

    onSnapshot(collection(db, 'evaluations'), (snapshot) => {
      const evaluations = snapshot.docs.map(doc => doc.data() as EvaluationForm);
      set({ evaluations });
    });
  },

  saveEvaluation: async (evalForm) => {
    await setDoc(doc(db, 'evaluations', evalForm.id), evalForm);
  },
  
  deleteEvaluation: async (id) => {
    await deleteDoc(doc(db, 'evaluations', id));
  },
  
  getEvaluation: (staffId, period, year) => {
    return get().evaluations.find(
      e => e.staffId === staffId && e.period === period && e.year === year
    );
  },
  
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  
  updateStaff: async (staff) => {
    await setDoc(doc(db, 'staff', staff.id), staff);
  },

  addStaff: async (staff) => {
    await setDoc(doc(db, 'staff', staff.id), staff);
  },

  addMasterItem: async (item) => {
    await setDoc(doc(db, 'masterItems', item.id), item);
  },

  updateMasterItem: async (item) => {
    await setDoc(doc(db, 'masterItems', item.id), item);
  },

  deleteMasterItem: async (id) => {
    await deleteDoc(doc(db, 'masterItems', id));
  },

  addRoleStage: async (stage) => {
    await setDoc(doc(db, 'roleStages', stage.id), stage);
  },
  
  updateRoleStage: async (stage) => {
    await setDoc(doc(db, 'roleStages', stage.id), stage);
  },
  
  deleteRoleStage: async (id) => {
    await deleteDoc(doc(db, 'roleStages', id));
  },

  reorderStaff: async (newStaffList) => {
    // Update local state immediately for snappy UI
    set({ staffList: newStaffList });
    
    // Batch update Firestore with new order values
    const batch = writeBatch(db);
    newStaffList.forEach((staff, index) => {
      const updatedStaff = { ...staff, order: index };
      batch.set(doc(db, 'staff', staff.id), updatedStaff);
    });
    await batch.commit();
  }
}));
