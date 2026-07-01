import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';

interface Allocation {
  id: string;
  memberName: string;
  projectName: string;
  allocatedHours: number;
  startDate: string;
  endDate: string;
}

interface ResourcesState {
  allocations: Allocation[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  rollbackDeletedAllocations: Record<string, { allocation: Allocation; index: number }>;
}

const fallbackAllocations: Allocation[] = [
  { id: '1', memberName: 'John Doe', projectName: 'Apollo Lunar Suite', allocatedHours: 25, startDate: '2026-06-15', endDate: '2026-06-29' },
  { id: '2', memberName: 'Marcus Wright', projectName: 'Apollo Lunar Suite', allocatedHours: 40, startDate: '2026-06-15', endDate: '2026-06-29' },
  { id: '3', memberName: 'Sarah Connor', projectName: 'Acme E-Commerce Portal', allocatedHours: 15, startDate: '2026-06-15', endDate: '2026-06-29' }
];

const initialState: ResourcesState = {
  allocations: [],
  loading: false,
  error: null,
  lastFetched: 0,
  rollbackDeletedAllocations: {}
};

export const fetchAllocations = createAsyncThunk(
  'resources/fetchAllocations',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.allocations.getAllocations();
        return data;
      } else {
        return fallbackAllocations;
      }
    } catch {
      return fallbackAllocations;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { resources } = getState() as { resources: ResourcesState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - resources.lastFetched < 30000;
      if (isCacheValid && resources.allocations.length > 0) {
        return false;
      }
    }
  }
);

export const createAllocation = createAsyncThunk(
  'resources/createAllocation',
  async (payload: { allocation: Partial<Allocation>; serverOnline: boolean }, { rejectWithValue }) => {
    const { allocation, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.allocations.createAllocation(allocation);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          memberName: allocation.memberName || 'John Doe',
          projectName: allocation.projectName || 'Apollo Lunar Suite',
          allocatedHours: Number(allocation.allocatedHours) || 8,
          startDate: allocation.startDate || new Date().toISOString().split('T')[0],
          endDate: allocation.endDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0]
        } as Allocation;
      }
    } catch {
      return rejectWithValue('Failed to allocate resource');
    }
  }
);

export const deleteAllocation = createAsyncThunk(
  'resources/deleteAllocation',
  async (payload: { id: string; serverOnline: boolean }, { rejectWithValue }) => {
    const { id, serverOnline } = payload;
    try {
      if (serverOnline) {
        await api.allocations.deleteAllocation(id);
      }
      return id;
    } catch {
      return rejectWithValue({ id, message: 'Failed to delete resource allocation' });
    }
  }
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAllocations
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading resource allocations';
      })
      // createAllocation
      .addCase(createAllocation.fulfilled, (state, action) => {
        state.allocations.push(action.payload);
      })
      // deleteAllocation (Optimistic Update)
      .addCase(deleteAllocation.pending, (state, action) => {
        const { id } = action.meta.arg;
        const index = state.allocations.findIndex(a => a.id === id);
        if (index !== -1) {
          state.rollbackDeletedAllocations[id] = {
            allocation: state.allocations[index],
            index
          };
          state.allocations.splice(index, 1);
        }
      })
      .addCase(deleteAllocation.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        delete state.rollbackDeletedAllocations[id];
      })
      .addCase(deleteAllocation.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const backup = state.rollbackDeletedAllocations[id];
        if (backup) {
          state.allocations.splice(backup.index, 0, backup.allocation);
          delete state.rollbackDeletedAllocations[id];
        }
        state.error = 'Failed to delete allocation. Restored state.';
      });
  }
});

export default resourcesSlice.reducer;
