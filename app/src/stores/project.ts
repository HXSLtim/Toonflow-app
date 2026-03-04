import { create } from 'zustand';
import { projectService } from '@/services';
import type { Project } from '@/services/types';

const PROJECT_CACHE_TTL_MS = 30_000;
const inFlightProjectRequests = new Map<number, Promise<Project>>();
let latestProjectFetchToken = 0;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectFetchedAt: number | null;
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
  currentProjectFetchedAt: null,
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
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Failed to fetch projects'),
        isLoading: false,
      });
    }
  },

  fetchProject: async (id: number) => {
    const state = useProjectStore.getState();
    if (
      state.currentProject?.id === id &&
      state.currentProjectFetchedAt !== null &&
      Date.now() - state.currentProjectFetchedAt < PROJECT_CACHE_TTL_MS
    ) {
      return;
    }

    const fetchToken = ++latestProjectFetchToken;
    set({ isLoading: true, error: null });

    try {
      let request = inFlightProjectRequests.get(id);
      if (!request) {
        request = projectService.getProject(id);
        inFlightProjectRequests.set(id, request);
        void request.finally(() => {
          if (inFlightProjectRequests.get(id) === request) {
            inFlightProjectRequests.delete(id);
          }
        });
      }

      const project = await request;
      if (fetchToken !== latestProjectFetchToken) {
        return;
      }

      set({
        currentProject: project,
        currentProjectFetchedAt: Date.now(),
        isLoading: false,
      });
    } catch (error: unknown) {
      if (fetchToken !== latestProjectFetchToken) {
        return;
      }

      set({
        error: getErrorMessage(error, 'Failed to fetch project'),
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
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Failed to create project'),
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
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Failed to update project'),
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
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error, 'Failed to delete project'),
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentProject: (project) =>
    set({
      currentProject: project,
      currentProjectFetchedAt: project ? Date.now() : null,
    }),

  clearError: () => set({ error: null }),
}));
