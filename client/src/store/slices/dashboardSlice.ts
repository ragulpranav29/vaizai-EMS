import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';

const fallbackMetrics = {
  stats: {
    totalProjects: 2,
    activeTasks: 4,
    completedTasks: 3,
    pendingIssues: 2,
    sprintProgress: 35
  },
  recentActivities: [
    { id: '1', user: 'Marcus Wright', action: 'moved task', target: 'APO-3', details: 'to In Progress', time: '10m ago' },
    { id: '2', user: 'Sarah Connor', action: 'created new project', target: 'Apollo Lunar Suite', details: '', time: '1h ago' },
    { id: '3', user: 'T-800 Cyberdyne', action: 'reported critical bug', target: 'BUG-101', details: 'Socket failures', time: '3h ago' },
    { id: '4', user: 'John Doe', action: 'completed task', target: 'APO-1', details: 'Telemetry schema design', time: 'Yesterday' }
  ],
  todaysWork: [
    { id: 't-1', key: 'APO-3', title: 'Build interactive real-time telemetry chart', status: 'in_progress', priority: 'highest' }
  ],
  upcomingDeadlines: [
    { id: 'dl-1', title: 'Sprint 2 Telemetry Chart Deliverable', date: '2026-06-29', severity: 'high' },
    { id: 'dl-2', title: 'QA Code Freeze - Apollo Ingestion', date: '2026-07-02', severity: 'medium' }
  ],
  charts: {
    statusDistribution: { backlog: 1, todo: 2, in_progress: 1, done: 3 },
    weeklyProgress: [
      { name: 'Mon', completed: 3, active: 4 },
      { name: 'Tue', completed: 5, active: 5 },
      { name: 'Wed', completed: 2, active: 6 },
      { name: 'Thu', completed: 6, active: 3 },
      { name: 'Fri', completed: 8, active: 2 },
      { name: 'Sat', completed: 1, active: 2 },
      { name: 'Sun', completed: 0, active: 1 }
    ],
    burndown: [
      { day: 'Day 1', actual: 48, ideal: 48 },
      { day: 'Day 2', actual: 45, ideal: 44.5 },
      { day: 'Day 3', actual: 42, ideal: 41 },
      { day: 'Day 4', actual: 38, ideal: 37.6 },
      { day: 'Day 5', actual: 38, ideal: 34.2 },
      { day: 'Day 6', actual: 32, ideal: 30.8 },
      { day: 'Day 7', actual: 29, ideal: 27.4 },
      { day: 'Day 8', actual: 26, ideal: 24 },
      { day: 'Day 9', actual: 22, ideal: 20.6 },
      { day: 'Day 10', actual: 18, ideal: 17.2 },
      { day: 'Day 11', actual: 14, ideal: 13.8 },
      { day: 'Day 12', actual: 10, ideal: 10.4 },
      { day: 'Day 13', actual: 6, ideal: 7 },
      { day: 'Day 14', actual: 0, ideal: 0 }
    ]
  }
};

interface DashboardState {
  metrics: typeof fallbackMetrics | null;
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

const initialState: DashboardState = {
  metrics: null,
  loading: false,
  error: null,
  lastFetched: 0,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.dashboard.getMetrics();
        return data;
      } else {
        return fallbackMetrics;
      }
    } catch {
      // Fallback on request failure
      return fallbackMetrics;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { dashboard } = getState() as { dashboard: DashboardState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - dashboard.lastFetched < 30000; // 30s cache
      if (isCacheValid && dashboard.metrics) {
        return false; // Skip API request
      }
    },
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading dashboard metrics';
      });
  },
});

export default dashboardSlice.reducer;
