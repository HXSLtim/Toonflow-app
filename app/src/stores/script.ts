import { create } from 'zustand';
import { scriptService } from '@/services';
import type { Script, Outline, Novel, Storyline } from '@/services/types';

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

interface ScriptState {
  scripts: Script[];
  currentScript: Script | null;
  outlines: Outline[];
  novels: Novel[];
  storylines: Storyline[];
  isLoading: boolean;
  error: string | null;
}

interface ScriptActions {
  // Scripts
  fetchScripts: (projectId: number) => Promise<void>;
  fetchScript: (id: number) => Promise<void>;
  createScript: (data: Omit<Script, 'id'>) => Promise<Script>;
  updateScript: (id: number, data: Partial<Script>) => Promise<void>;
  deleteScript: (id: number) => Promise<void>;
  setCurrentScript: (script: Script | null) => void;

  // Outlines
  fetchOutlines: (projectId: number) => Promise<void>;
  createOutline: (data: Omit<Outline, 'id'>) => Promise<Outline>;
  updateOutline: (id: number, data: Partial<Outline>) => Promise<void>;
  deleteOutline: (id: number) => Promise<void>;

  // Novels
  fetchNovels: (projectId: number) => Promise<void>;
  createNovel: (data: Omit<Novel, 'id' | 'createTime'>) => Promise<Novel>;
  updateNovel: (id: number, data: Partial<Novel>) => Promise<void>;
  deleteNovel: (id: number) => Promise<void>;

  // Storylines
  fetchStorylines: (projectId: number) => Promise<void>;
  createStoryline: (data: Omit<Storyline, 'id'>) => Promise<Storyline>;
  updateStoryline: (id: number, data: Partial<Storyline>) => Promise<void>;
  deleteStoryline: (id: number) => Promise<void>;

  clearError: () => void;
}

export const useScriptStore = create<ScriptState & ScriptActions>((set) => ({
  // State
  scripts: [],
  currentScript: null,
  outlines: [],
  novels: [],
  storylines: [],
  isLoading: false,
  error: null,

  // Script Actions
  fetchScripts: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const scripts = await scriptService.getScripts(projectId);
      set({ scripts, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch scripts'), isLoading: false });
    }
  },

  fetchScript: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const script = await scriptService.getScript(id);
      set({ currentScript: script, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch script'), isLoading: false });
    }
  },

  createScript: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const script = await scriptService.createScript(data);
      set((state) => ({
        scripts: [script, ...state.scripts],
        isLoading: false,
      }));
      return script;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to create script'), isLoading: false });
      throw error;
    }
  },

  updateScript: async (id: number, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await scriptService.updateScript(id, data);
      set((state) => ({
        scripts: state.scripts.map((s) => (s.id === id ? updated : s)),
        currentScript: state.currentScript?.id === id ? updated : state.currentScript,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to update script'), isLoading: false });
      throw error;
    }
  },

  deleteScript: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await scriptService.deleteScript(id);
      set((state) => ({
        scripts: state.scripts.filter((s) => s.id !== id),
        currentScript: state.currentScript?.id === id ? null : state.currentScript,
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to delete script'), isLoading: false });
      throw error;
    }
  },

  setCurrentScript: (script) => set({ currentScript: script }),

  // Outline Actions
  fetchOutlines: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const outlines = await scriptService.getOutlines(projectId);
      set({ outlines, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch outlines'), isLoading: false });
    }
  },

  createOutline: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const outline = await scriptService.createOutline(data);
      set((state) => ({
        outlines: [outline, ...state.outlines],
        isLoading: false,
      }));
      return outline;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to create outline'), isLoading: false });
      throw error;
    }
  },

  updateOutline: async (id: number, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await scriptService.updateOutline(id, data);
      set((state) => ({
        outlines: state.outlines.map((o) => (o.id === id ? updated : o)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to update outline'), isLoading: false });
      throw error;
    }
  },

  deleteOutline: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await scriptService.deleteOutline(id);
      set((state) => ({
        outlines: state.outlines.filter((o) => o.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to delete outline'), isLoading: false });
      throw error;
    }
  },

  // Novel Actions
  fetchNovels: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const novels = await scriptService.getNovels(projectId);
      set({ novels, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch novels'), isLoading: false });
    }
  },

  createNovel: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const novel = await scriptService.createNovel(data);
      set((state) => ({
        novels: [novel, ...state.novels],
        isLoading: false,
      }));
      return novel;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to create novel'), isLoading: false });
      throw error;
    }
  },

  updateNovel: async (id: number, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await scriptService.updateNovel(id, data);
      set((state) => ({
        novels: state.novels.map((n) => (n.id === id ? updated : n)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to update novel'), isLoading: false });
      throw error;
    }
  },

  deleteNovel: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await scriptService.deleteNovel(id);
      set((state) => ({
        novels: state.novels.filter((n) => n.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to delete novel'), isLoading: false });
      throw error;
    }
  },

  // Storyline Actions
  fetchStorylines: async (projectId: number) => {
    set({ isLoading: true, error: null });
    try {
      const storylines = await scriptService.getStorylines(projectId);
      set({ storylines, isLoading: false });
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to fetch storylines'), isLoading: false });
    }
  },

  createStoryline: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const storyline = await scriptService.createStoryline(data);
      set((state) => ({
        storylines: [storyline, ...state.storylines],
        isLoading: false,
      }));
      return storyline;
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to create storyline'), isLoading: false });
      throw error;
    }
  },

  updateStoryline: async (id: number, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await scriptService.updateStoryline(id, data);
      set((state) => ({
        storylines: state.storylines.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to update storyline'), isLoading: false });
      throw error;
    }
  },

  deleteStoryline: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await scriptService.deleteStoryline(id);
      set((state) => ({
        storylines: state.storylines.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      set({ error: getErrorMessage(error, 'Failed to delete storyline'), isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
