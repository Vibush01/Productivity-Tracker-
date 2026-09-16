import { create } from 'zustand';
import api from '../services/api';
import type { Program, ProgramParticipant, LeaderboardEntry } from '../types';

interface ProgramState {
  programs: Program[];
  myPrograms: ProgramParticipant[];
  currentProgram: { program: Program; myParticipation: ProgramParticipant | null; leaderboard: LeaderboardEntry[] } | null;
  isLoading: boolean;
  error: string | null;
  fetchPrograms: () => Promise<void>;
  fetchMyPrograms: () => Promise<void>;
  fetchProgramDetail: (id: string) => Promise<void>;
  joinProgram: (id: string, linkedHabitId?: string) => Promise<void>;
  leaveProgram: (id: string) => Promise<void>;
  // Admin
  createProgram: (data: any) => Promise<void>;
  updateProgram: (id: string, data: any) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  fetchAdminPrograms: () => Promise<void>;
  clearError: () => void;
}

export const useProgramStore = create<ProgramState>((set) => ({
  programs: [],
  myPrograms: [],
  currentProgram: null,
  isLoading: false,
  error: null,

  fetchPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/programs');
      if (data.success) set({ programs: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch programs' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyPrograms: async () => {
    try {
      const { data } = await api.get('/programs/my');
      if (data.success) set({ myPrograms: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch my programs' });
    }
  },

  fetchProgramDetail: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/programs/${id}`);
      if (data.success) set({ currentProgram: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch program detail' });
    } finally {
      set({ isLoading: false });
    }
  },

  joinProgram: async (id, linkedHabitId) => {
    const { data } = await api.post(`/programs/${id}/join`, { linkedHabitId });
    if (data.success) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p._id === id ? { ...p, isJoined: true, participantCount: (p.participantCount || 0) + 1 } : p
        ),
      }));
    }
  },

  leaveProgram: async (id) => {
    const { data } = await api.post(`/programs/${id}/leave`);
    if (data.success) {
      set((state) => ({
        programs: state.programs.map((p) =>
          p._id === id ? { ...p, isJoined: false, participantCount: Math.max((p.participantCount || 1) - 1, 0) } : p
        ),
        myPrograms: state.myPrograms.filter((mp) => {
          const progId = typeof mp.programId === 'string' ? mp.programId : mp.programId._id;
          return progId !== id;
        }),
      }));
    }
  },

  createProgram: async (programData) => {
    const { data } = await api.post('/programs', programData);
    if (data.success) set((state) => ({ programs: [data.data, ...state.programs] }));
  },

  updateProgram: async (id, programData) => {
    const { data } = await api.put(`/programs/${id}`, programData);
    if (data.success) {
      set((state) => ({ programs: state.programs.map((p) => (p._id === id ? { ...data.data, participantCount: p.participantCount } : p)) }));
    }
  },

  deleteProgram: async (id) => {
    const { data } = await api.delete(`/programs/${id}`);
    if (data.success) set((state) => ({ programs: state.programs.filter((p) => p._id !== id) }));
  },

  fetchAdminPrograms: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/programs/admin/all');
      if (data.success) set({ programs: data.data });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch admin programs' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
