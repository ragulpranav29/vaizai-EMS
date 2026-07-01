import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/services';
import type { TeamMember } from '../../types';

interface TeamsState {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  lastFetched: number;
}

const fallbackMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Connor', role: 'Product Owner', email: 'sarah@enterprise.com', avatar: 'SC', capacity: 40, workload: 18 },
  { id: '2', name: 'John Doe', role: 'Lead Developer', email: 'john@enterprise.com', avatar: 'JD', capacity: 40, workload: 34 },
  { id: '3', name: 'Marcus Wright', role: 'Developer', email: 'marcus@enterprise.com', avatar: 'MW', capacity: 40, workload: 40 },
  { id: '4', name: 'T-800 Cyberdyne', role: 'QA Engineer', email: 't800@enterprise.com', avatar: 'TC', capacity: 40, workload: 14 }
];

const initialState: TeamsState = {
  members: [],
  loading: false,
  error: null,
  lastFetched: 0
};

export const fetchMembers = createAsyncThunk(
  'teams/fetchMembers',
  async (payload: { serverOnline: boolean; forceRefresh?: boolean }) => {
    const { serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.members.getMembers();
        return data;
      } else {
        return fallbackMembers;
      }
    } catch {
      return fallbackMembers;
    }
  },
  {
    condition: (payload, { getState }) => {
      const { teams } = getState() as { teams: TeamsState };
      if (payload.forceRefresh) return true;
      const isCacheValid = Date.now() - teams.lastFetched < 30000;
      if (isCacheValid && teams.members.length > 0) {
        return false;
      }
    }
  }
);

export const createMember = createAsyncThunk(
  'teams/createMember',
  async (payload: { member: Partial<TeamMember>; serverOnline: boolean }, { rejectWithValue }) => {
    const { member, serverOnline } = payload;
    try {
      if (serverOnline) {
        const data = await api.members.createMember(member);
        return data;
      } else {
        return {
          id: Date.now().toString(),
          name: member.name || 'Mock Developer',
          role: member.role || 'Developer',
          email: member.email || 'mock@enterprise.com',
          capacity: member.capacity || 40
        } as TeamMember;
      }
    } catch {
      return rejectWithValue('Failed to invite member');
    }
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchMembers
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed loading team members';
      })
      // createMember
      .addCase(createMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      });
  }
});

export default teamsSlice.reducer;
