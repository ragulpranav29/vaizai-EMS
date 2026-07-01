import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';
import type { Project } from '../../types';

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

const fallbackProjects: Project[] = [
  { id: '1', name: 'Apollo Lunar Suite', key: 'APO', lead: 'Sarah Connor', status: 'active', createdAt: '' },
  { id: '2', name: 'Acme E-Commerce Portal', key: 'ACM', lead: 'John Doe', status: 'active', createdAt: '' }
];

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  lastFetched: 0
};

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.projects.getProjects();
        return data;
      } else {
        return fallbackProjects;
      }
    } catch {
      return fallbackProjects;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { projects } = getState() as { projects: ProjectsState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - projects.lastFetched < 30000;
      if (isCacheValid && projects.projects.length > 0) {
        return false;
      }
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (payload: { project: Partial<Project>; serverOnline: boolean }, { rejectWithValue }) => {
    const { project, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.projects.createProject(project);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          name: project.name || 'Mock Project',
          key: project.key || 'MOCK',
          lead: project.lead || 'Unassigned',
          status: 'active' as const
        } as Project;
      }
    } catch {
      return rejectWithValue('Failed to create project');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading projects';
      })
      // createProject
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload);
      });
  }
});

export default projectsSlice.reducer;
