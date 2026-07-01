import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AutomationRule } from '../../types';
import { api } from '../../api/services';

// ----------- Types -----------
export interface AutomationLog {
  id: string;
  ruleName: string;
  triggerEvent: string;
  entityKey: string;
  actionExecuted: string;
  status: 'success' | 'failure';
  timestamp: string;
}

interface AutomationState {
  rules: AutomationRule[];
  logs: AutomationLog[];
  loading: boolean;
  logsLoading: boolean;
  error: string | null;
}

const initialState: AutomationState = {
  rules: [],
  logs: [],
  loading: false,
  logsLoading: false,
  error: null,
};

// ----------- Async Thunks -----------

export const fetchRules = createAsyncThunk<AutomationRule[], void>(
  'automation/fetchRules',
  async (_, { rejectWithValue }) => {
    try {
      return await api.rules.getRules();
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch automation rules');
    }
  }
);

export const fetchLogs = createAsyncThunk<AutomationLog[], void>(
  'automation/fetchLogs',
  async (_, { rejectWithValue }) => {
    try {
      return await api.rules.getLogs() as AutomationLog[];
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch automation logs');
    }
  }
);

export const createRule = createAsyncThunk<AutomationRule, Partial<AutomationRule>>(
  'automation/createRule',
  async (data, { rejectWithValue }) => {
    try {
      return await api.rules.createRule(data);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to create rule');
    }
  }
);

export const toggleRule = createAsyncThunk<AutomationRule, { id: string; active: boolean }>(
  'automation/toggleRule',
  async ({ id, active }, { rejectWithValue }) => {
    try {
      return await api.rules.toggleRule(id, active);
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to toggle rule');
    }
  }
);

export const deleteRule = createAsyncThunk<string, string>(
  'automation/deleteRule',
  async (id, { rejectWithValue }) => {
    try {
      await api.rules.deleteRule(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to delete rule');
    }
  }
);

// ----------- Slice -----------

const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    // Optimistic toggle for immediate UI feedback
    optimisticToggle(state, action: PayloadAction<{ id: string; active: boolean }>) {
      const rule = state.rules.find(r => r.id === action.payload.id);
      if (rule) rule.active = action.payload.active;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // fetchRules
    builder
      .addCase(fetchRules.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(fetchRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchLogs
    builder
      .addCase(fetchLogs.pending, state => {
        state.logsLoading = true;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, state => {
        state.logsLoading = false;
      });

    // createRule
    builder
      .addCase(createRule.fulfilled, (state, action) => {
        state.rules.unshift(action.payload);
      });

    // toggleRule
    builder
      .addCase(toggleRule.fulfilled, (state, action) => {
        const idx = state.rules.findIndex(r => r.id === action.payload.id);
        if (idx !== -1) state.rules[idx] = action.payload;
      })
      .addCase(toggleRule.rejected, (state, action) => {
        // Revert optimistic update — re-fetch will fix state
        state.error = action.payload as string;
      });

    // deleteRule
    builder
      .addCase(deleteRule.fulfilled, (state, action) => {
        state.rules = state.rules.filter(r => r.id !== action.payload);
      });
  },
});

export const { optimisticToggle, clearError } = automationSlice.actions;
export default automationSlice.reducer;
