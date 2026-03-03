import { create } from 'zustand';
import { projectService } from '@/services';
import type { Project } from '@/services/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface ProjectActions {
  fetchProjects: (page?: number, pageSize?: number) => Promise<void>;
  fetchProject: (id: number) => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'createTime' | 'userId'>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState & ProjectActions>((set) => ({
  // State
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },

  // Actions
  fetchProjects: async (page = 1, pageSize = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjects({ page, pageSize });
      set({
        projects: response.items,
        pagination: {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  fetchProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectService.getProject(id);
      set({
        currentProject: project,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const project = await projectService.createProject(data);
      set((state) => ({
        projects: [project, ...state.projects],
        isLoading: false,
      }));
      return project;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (id: number, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await projectService.updateProject(id, data);
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updated : p)),
        currentProject: state.currentProject?.id === id ? updated : state.currentProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update project',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProject: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete project',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  clearError: () => set({ error: null }),
}));
