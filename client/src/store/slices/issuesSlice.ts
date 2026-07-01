import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';
import type { Issue } from '../../types';

interface IssuesState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  rollbackIssues: Record<string, Issue>;
  rollbackDeletedIssues: Record<string, { issue: Issue; index: number }>;
}

const fallbackIssues: Issue[] = [
  { id: '1', key: 'BUG-101', title: 'Socket connection fails intermittently on browser sleep', description: 'Connection resets and fails to auto-reconnect due to state cleanup issues.', status: 'open', priority: 'critical', type: 'bug', assignee: 'John Doe', reporter: 'T-800 Cyberdyne', comments: [], attachments: [], activities: [], createdAt: '' },
  { id: '2', key: 'BUG-102', title: 'Memory leak in charts rendering thread', description: 'Each socket event renders new nodes without cleaning up past canvas instances.', status: 'investigating', priority: 'high', type: 'bug', assignee: 'Marcus Wright', reporter: 'John Doe', comments: [], attachments: [], activities: [], createdAt: '' }
];

const initialState: IssuesState = {
  issues: [],
  loading: false,
  error: null,
  lastFetched: 0,
  rollbackIssues: {},
  rollbackDeletedIssues: {}
};

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.issues.getIssues();
        return data;
      } else {
        return fallbackIssues;
      }
    } catch {
      return fallbackIssues;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { issues } = getState() as { issues: IssuesState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - issues.lastFetched < 30000;
      if (isCacheValid && issues.issues.length > 0) {
        return false;
      }
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (payload: { issue: Partial<Issue>; serverOnline: boolean }, { rejectWithValue }) => {
    const { issue, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.issues.createIssue(issue);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          comments: [],
          attachments: [],
          activities: [],
          ...issue
        } as Issue;
      }
    } catch {
      return rejectWithValue('Failed to create issue');
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async (payload: { id: string; updates: Partial<Issue>; serverOnline: boolean }, { rejectWithValue }) => {
    const { id, updates, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.issues.updateIssue(id, updates);
        return data;
      } else {
        return { id, ...updates } as any;
      }
    } catch {
      return rejectWithValue({ id, message: 'Failed to update issue' });
    }
  }
);

export const deleteIssue = createAsyncThunk(
  'issues/deleteIssue',
  async (payload: { id: string; serverOnline: boolean }, { rejectWithValue }) => {
    const { id, serverOnline } = payload;
    try {
      if (serverOnline) {
        await api.issues.deleteIssue(id);
      }
      return id;
    } catch {
      return rejectWithValue({ id, message: 'Failed to delete issue' });
    }
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchIssues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading issues';
      })
      // createIssue
      .addCase(createIssue.fulfilled, (state, action) => {
        state.issues.push(action.payload);
      })
      // updateIssue (Optimistic Update)
      .addCase(updateIssue.pending, (state, action) => {
        const { id, updates } = action.meta.arg;
        const issue = state.issues.find(i => i.id === id);
        if (issue) {
          state.rollbackIssues[id] = JSON.parse(JSON.stringify(issue));
          Object.assign(issue, updates);
        }
      })
      .addCase(updateIssue.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        delete state.rollbackIssues[id];
        const idx = state.issues.findIndex(i => i.id === id);
        if (idx !== -1) {
          state.issues[idx] = { ...state.issues[idx], ...action.payload };
        }
      })
      .addCase(updateIssue.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const original = state.rollbackIssues[id];
        if (original) {
          const issue = state.issues.find(i => i.id === id);
          if (issue) {
            Object.assign(issue, original);
          }
          delete state.rollbackIssues[id];
        }
        state.error = 'Failed to update issue. Restored original state.';
      })
      // deleteIssue (Optimistic Update)
      .addCase(deleteIssue.pending, (state, action) => {
        const { id } = action.meta.arg;
        const index = state.issues.findIndex(i => i.id === id);
        if (index !== -1) {
          state.rollbackDeletedIssues[id] = {
            issue: state.issues[index],
            index
          };
          state.issues.splice(index, 1);
        }
      })
      .addCase(deleteIssue.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        delete state.rollbackDeletedIssues[id];
      })
      .addCase(deleteIssue.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const backup = state.rollbackDeletedIssues[id];
        if (backup) {
          state.issues.splice(backup.index, 0, backup.issue);
          delete state.rollbackDeletedIssues[id];
        }
        state.error = 'Failed to delete issue. Restored to issue board.';
      });
  }
});

export default issuesSlice.reducer;
