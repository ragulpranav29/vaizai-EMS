import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import projectsReducer from './slices/projectsSlice';
import tasksReducer from './slices/tasksSlice';
import sprintsReducer from './slices/sprintsSlice';
import issuesReducer from './slices/issuesSlice';
import teamsReducer from './slices/teamsSlice';
import resourcesReducer from './slices/resourcesSlice';
import timeTrackingReducer from './slices/timeTrackingSlice';
import reportsReducer from './slices/reportsSlice';
import notificationsReducer from './slices/notificationsSlice';
import settingsReducer from './slices/settingsSlice';
import automationReducer from './slices/automationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    sprints: sprintsReducer,
    issues: issuesReducer,
    teams: teamsReducer,
    resources: resourcesReducer,
    timeTracking: timeTrackingReducer,
    reports: reportsReducer,
    notifications: notificationsReducer,
    settings: settingsReducer,
    automation: automationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
