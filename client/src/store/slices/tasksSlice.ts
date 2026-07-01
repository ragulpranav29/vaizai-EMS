import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';
import type { Task } from '../../types';
import { socketService } from '../../api/socketService';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
  // Optimistic rollback stores
  rollbackTasks: Record<string, Task>;
  rollbackDeletedTasks: Record<string, { task: Task; index: number }>;
}

const fallbackTasks: Task[] = [
  { id: '1', key: 'APO-1', title: 'Telemetry database schema', description: 'Setup tables for storing altitude, velocity, and fuel logs.', status: 'done', priority: 'high', assignee: 'John Doe', reporter: 'Sarah Connor', sprintId: '1', projectId: '1', timeEstimated: 8, timeSpent: 8, createdAt: '' },
  { id: '2', key: 'APO-2', title: 'Implement Ingestion endpoints', description: 'HTTP endpoints for ingesting metrics metrics.', status: 'done', priority: 'high', assignee: 'John Doe', reporter: 'Sarah Connor', sprintId: '1', projectId: '1', timeEstimated: 8, timeSpent: 8, createdAt: '' },
  { id: '3', key: 'APO-3', title: 'Build telemetry chart widget', description: 'Visual charts using Recharts showing stream status.', status: 'in_progress', priority: 'highest', assignee: 'Marcus Wright', reporter: 'Sarah Connor', sprintId: '2', projectId: '1', timeEstimated: 16, timeSpent: 8, createdAt: '' },
  { id: '6', key: 'APO-6', title: 'Write comprehensive End-to-End tests', description: 'QA verification tests.', status: 'backlog', priority: 'medium', assignee: 'T-800 Cyberdyne', reporter: 'Sarah Connor', sprintId: null, projectId: '1', timeEstimated: 14, timeSpent: 0, createdAt: '' }
];

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  lastFetched: 0,
  rollbackTasks: {},
  rollbackDeletedTasks: {}
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.tasks.getTasks();
        return data;
      } else {
        return fallbackTasks;
      }
    } catch {
      return fallbackTasks;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { tasks } = getState() as { tasks: TasksState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - tasks.lastFetched < 30000;
      if (isCacheValid && tasks.tasks.length > 0) {
        return false;
      }
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (payload: { task: Partial<Task>; serverOnline: boolean }, { rejectWithValue }) => {
    const { task, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.tasks.createTask(task);
        socketService.emit('task_changed', data);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          subTasks: [],
          comments: [],
          attachments: [],
          activities: [],
          ...task
        } as Task;
      }
    } catch {
      return rejectWithValue('Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (payload: { id: string; updates: Partial<Task>; serverOnline: boolean }, { rejectWithValue }) => {
    const { id, updates, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.tasks.updateTask(id, updates);
        socketService.emit('task_changed', data);
        return data;
      } else {
        // Return updates matching payload format
        return { id, ...updates } as any;
      }
    } catch {
      return rejectWithValue({ id, message: 'Failed to update task' });
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (payload: { id: string; serverOnline: boolean }, { rejectWithValue }) => {
    const { id, serverOnline } = payload;
    try {
      if (serverOnline) {
        await api.tasks.deleteTask(id);
        socketService.emit('task_changed', { id, deleted: true });
      }
      return id;
    } catch {
      return rejectWithValue({ id, message: 'Failed to delete task' });
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading tasks';
      })
      // createTask
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // updateTask (Optimistic Update)
      .addCase(updateTask.pending, (state, action) => {
        const { id, updates } = action.meta.arg;
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          // Backup task for rollback
          state.rollbackTasks[id] = JSON.parse(JSON.stringify(task));
          // Apply updates optimistically
          Object.assign(task, updates);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        delete state.rollbackTasks[id];
        // Ensure state is perfectly synced with actual payload return
        const idx = state.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          state.tasks[idx] = { ...state.tasks[idx], ...action.payload };
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const original = state.rollbackTasks[id];
        if (original) {
          const task = state.tasks.find(t => t.id === id);
          if (task) {
            // Rollback to original task state
            Object.assign(task, original);
          }
          delete state.rollbackTasks[id];
        }
        state.error = 'Failed to save changes. Restored original state.';
      })
      // deleteTask (Optimistic Update)
      .addCase(deleteTask.pending, (state, action) => {
        const { id } = action.meta.arg;
        const index = state.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          // Backup deleted task
          state.rollbackDeletedTasks[id] = {
            task: state.tasks[index],
            index
          };
          // Remove optimistically
          state.tasks.splice(index, 1);
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { id } = action.meta.arg;
        delete state.rollbackDeletedTasks[id];
      })
      .addCase(deleteTask.rejected, (state, action) => {
        const { id } = action.meta.arg;
        const backup = state.rollbackDeletedTasks[id];
        if (backup) {
          // Restore task back to its original index position
          state.tasks.splice(backup.index, 0, backup.task);
          delete state.rollbackDeletedTasks[id];
        }
        state.error = 'Failed to delete task. Restored task to board.';
      });
  }
});

export default tasksSlice.reducer;
