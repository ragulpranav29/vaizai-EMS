import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';
import type { TimeLog } from '../../types';

interface TimeTrackingState {
  logs: TimeLog[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

const fallbackLogs: TimeLog[] = [
  { id: '1', taskId: '1', taskKey: 'APO-1', taskTitle: 'Telemetry database schema', memberName: 'John Doe', durationHours: 8, date: '2026-06-12', description: 'Designed initial DB schemas', billable: true },
  { id: '2', taskId: '3', taskKey: 'APO-3', taskTitle: 'Build telemetry chart widget', memberName: 'Marcus Wright', durationHours: 8, date: '2026-06-18', description: 'Configured Recharts line overlays', billable: true },
  { id: '3', taskId: '2', taskKey: 'APO-2', taskTitle: 'Implement Ingestion endpoints', memberName: 'John Doe', durationHours: 6, date: '2026-06-20', description: 'Wrote controllers and routes tests', billable: false }
];

const initialState: TimeTrackingState = {
  logs: [],
  loading: false,
  error: null,
  lastFetched: 0
};

export const fetchTimeLogs = createAsyncThunk(
  'timeTracking/fetchTimeLogs',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.timelogs.getTimeLogs();
        return data;
      } else {
        return fallbackLogs;
      }
    } catch {
      return fallbackLogs;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { timeTracking } = getState() as { timeTracking: TimeTrackingState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - timeTracking.lastFetched < 30000;
      if (isCacheValid && timeTracking.logs.length > 0) {
        return false;
      }
    }
  }
);

export const logTime = createAsyncThunk(
  'timeTracking/logTime',
  async (payload: { log: Partial<TimeLog>; serverOnline: boolean }, { rejectWithValue }) => {
    const { log, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.timelogs.logTime(log);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          date: log.date || new Date().toISOString().split('T')[0],
          memberName: log.memberName || 'John Doe',
          durationHours: Number(log.durationHours) || 1,
          description: log.description || '',
          billable: log.billable !== undefined ? log.billable : true,
          taskId: log.taskId || '',
          taskKey: log.taskKey || '',
          taskTitle: log.taskTitle || ''
        } as TimeLog;
      }
    } catch {
      return rejectWithValue('Failed to log time entry');
    }
  }
);

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTimeLogs
      .addCase(fetchTimeLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTimeLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading time logs';
      })
      // logTime
      .addCase(logTime.fulfilled, (state, action) => {
        state.logs.push(action.payload);
      });
  }
});

export default timeTrackingSlice.reducer;
