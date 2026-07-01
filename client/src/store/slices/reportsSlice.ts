import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';

const fallbackReports = {
  kpis: { velocity: 18, scopeCreep: 15, utilization: 82, sprintCompletionRate: 90 },
  charts: {
    velocityHistory: [
      { name: 'Day 1', scope: 5, velocity: 0 },
      { name: 'Day 3', scope: 10, velocity: 4 },
      { name: 'Day 6', scope: 12, velocity: 7 },
      { name: 'Day 9', scope: 15, velocity: 11 },
      { name: 'Day 12', scope: 18, velocity: 15 },
      { name: 'Day 14', scope: 18, velocity: 18 },
    ],
    burndownHistory: [
      { name: 'Mon', actual: 48, ideal: 48 },
      { name: 'Tue', actual: 42, ideal: 40 },
      { name: 'Wed', actual: 35, ideal: 32 },
      { name: 'Thu', actual: 28, ideal: 24 },
      { name: 'Fri', actual: 18, ideal: 16 },
      { name: 'Sat', actual: 10, ideal: 8 },
      { name: 'Sun', actual: 0, ideal: 0 },
    ],
    projectsReport: [
      { name: 'Apollo Lunar Suite', tasksCount: 6, issuesCount: 4, doneTasks: 3 },
      { name: 'Acme E-Commerce Portal', tasksCount: 1, issuesCount: 0, doneTasks: 0 }
    ],
    teamReport: [
      { name: 'Sarah Connor', logged: 10, capacity: 40 },
      { name: 'John Doe', logged: 34, capacity: 40 },
      { name: 'Marcus Wright', logged: 45, capacity: 40 },
      { name: 'T-800 Cyberdyne', logged: 14, capacity: 40 },
      { name: 'Kyle Reese', logged: 8, capacity: 40 }
    ],
    resolutionReport: [
      { name: 'Sarah Connor', resolved: 1 },
      { name: 'John Doe', resolved: 3 },
      { name: 'Marcus Wright', resolved: 2 },
      { name: 'T-800 Cyberdyne', resolved: 4 },
      { name: 'Kyle Reese', resolved: 1 }
    ]
  }
};

interface ReportsState {
  reportData: typeof fallbackReports | null;
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

const initialState: ReportsState = {
  reportData: null,
  loading: false,
  error: null,
  lastFetched: 0
};

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.reports.getReports();
        return data;
      } else {
        return fallbackReports;
      }
    } catch {
      return fallbackReports;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { reports } = getState() as { reports: ReportsState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - reports.lastFetched < 30000;
      if (isCacheValid && reports.reportData) {
        return false;
      }
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reportData = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading reporting metrics';
      });
  }
});

export default reportsSlice.reducer;
