import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';
import type { Sprint } from '../../types';
import { socketService } from '../../api/socketService';

interface SprintsState {
  sprints: Sprint[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

const fallbackSprints: Sprint[] = [
  { id: '1', name: 'Apollo Sprint 1', status: 'completed', startDate: '2026-06-01', endDate: '2026-06-14', goal: 'Build telemetry core modules' },
  { id: '2', name: 'Apollo Sprint 2 (Active)', status: 'active', startDate: '2026-06-15', endDate: '2026-06-29', goal: 'Integrate real-time socket channels' },
  { id: '3', name: 'Apollo Sprint 3', status: 'future', startDate: '2026-06-30', endDate: '2026-07-13', goal: 'Verify QA compliance & load-testing' }
];

const initialState: SprintsState = {
  sprints: [],
  loading: false,
  error: null,
  lastFetched: 0
};

export const fetchSprints = createAsyncThunk(
  'sprints/fetchSprints',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.sprints.getSprints();
        return data;
      } else {
        return fallbackSprints;
      }
    } catch {
      return fallbackSprints;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { sprints } = getState() as { sprints: SprintsState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - sprints.lastFetched < 30000;
      if (isCacheValid && sprints.sprints.length > 0) {
        return false;
      }
    }
  }
);

export const createSprint = createAsyncThunk(
  'sprints/createSprint',
  async (payload: { sprint: Partial<Sprint>; serverOnline: boolean }, { rejectWithValue }) => {
    const { sprint, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.sprints.createSprint(sprint);
        socketService.emit('sprint_changed', data);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          name: sprint.name || 'Mock Sprint',
          goal: sprint.goal || '',
          startDate: sprint.startDate || '',
          endDate: sprint.endDate || '',
          status: 'future' as const
        } as Sprint;
      }
    } catch {
      return rejectWithValue('Failed to create sprint');
    }
  }
);

export const updateSprint = createAsyncThunk(
  'sprints/updateSprint',
  async (payload: { id: string; updates: Partial<Sprint>; serverOnline: boolean }, { rejectWithValue }) => {
    const { id, updates, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.sprints.updateSprint(id, updates);
        socketService.emit('sprint_changed', data);
        return data;
      } else {
        return { id, ...updates } as any;
      }
    } catch {
      return rejectWithValue('Failed to update sprint');
    }
  }
);

const sprintsSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchSprints
      .addCase(fetchSprints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading sprints';
      })
      // createSprint
      .addCase(createSprint.fulfilled, (state, action) => {
        state.sprints.push(action.payload);
      })
      // updateSprint
      .addCase(updateSprint.fulfilled, (state, action) => {
        const idx = state.sprints.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          state.sprints[idx] = { ...state.sprints[idx], ...action.payload };
        }
      });
  }
});

export default sprintsSlice.reducer;
