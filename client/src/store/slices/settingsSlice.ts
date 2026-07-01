import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  profileName: string;
  profileRole: string;
  profileEmail: string;
  profileBio: string;
  avatarPreview: string | null;
  themeAccent: 'purple' | 'green' | 'cyan';
  notifyEmail: boolean;
  notifySockets: boolean;
  notifyAutomations: boolean;
  notifySlack: boolean;
  lang: string;
  timezone: string;
  isSlackConnected: boolean;
  isTeamsConnected: boolean;
  isGithubConnected: boolean;
}

const initialState: SettingsState = {
  profileName: localStorage.getItem('emp_username') || 'John Doe',
  profileRole: localStorage.getItem('emp_role') || 'Lead Developer',
  profileEmail: localStorage.getItem('emp_email') || 'john@enterprise.com',
  profileBio: 'Senior Fullstack Engineer focused on Lunar flight telemetry pipelines and real-time visualization frameworks.',
  avatarPreview: null,
  themeAccent: (localStorage.getItem('theme_accent') as 'purple' | 'green' | 'cyan') || 'purple',
  notifyEmail: true,
  notifySockets: true,
  notifyAutomations: false,
  notifySlack: true,
  lang: 'en',
  timezone: 'UTC+5:30',
  isSlackConnected: true,
  isTeamsConnected: false,
  isGithubConnected: false
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateProfileSettings: (state, action: PayloadAction<{ name: string; role: string; email: string; bio: string }>) => {
      state.profileName = action.payload.name;
      state.profileRole = action.payload.role;
      state.profileEmail = action.payload.email;
      state.profileBio = action.payload.bio;
      
      localStorage.setItem('emp_username', action.payload.name);
      localStorage.setItem('emp_role', action.payload.role);
      localStorage.setItem('emp_email', action.payload.email);
    },
    updateAvatar: (state, action: PayloadAction<string | null>) => {
      state.avatarPreview = action.payload;
    },
    updateThemeAccent: (state, action: PayloadAction<'purple' | 'green' | 'cyan'>) => {
      state.themeAccent = action.payload;
      localStorage.setItem('theme_accent', action.payload);
      
      const root = document.documentElement;
      if (action.payload === 'purple') {
        root.style.setProperty('--primary', '#a855f7');
        root.style.setProperty('--primary-hover', '#c084fc');
        root.style.setProperty('--primary-glow', 'rgba(168, 85, 247, 0.15)');
        root.style.setProperty('--border-color-glow', 'rgba(168, 85, 247, 0.3)');
      } else if (action.payload === 'green') {
        root.style.setProperty('--primary', '#10b981');
        root.style.setProperty('--primary-hover', '#34d399');
        root.style.setProperty('--primary-glow', 'rgba(16, 185, 129, 0.15)');
        root.style.setProperty('--border-color-glow', 'rgba(16, 185, 129, 0.3)');
      } else if (action.payload === 'cyan') {
        root.style.setProperty('--primary', '#06b6d4');
        root.style.setProperty('--primary-hover', '#22d3ee');
        root.style.setProperty('--primary-glow', 'rgba(6, 182, 212, 0.15)');
        root.style.setProperty('--border-color-glow', 'rgba(6, 182, 212, 0.3)');
      }
    },
    updateNotificationChecks: (state, action: PayloadAction<Partial<Pick<SettingsState, 'notifyEmail' | 'notifySockets' | 'notifyAutomations' | 'notifySlack'>>>) => {
      Object.assign(state, action.payload);
    },
    updateAccountSettings: (state, action: PayloadAction<{ lang: string; timezone: string }>) => {
      state.lang = action.payload.lang;
      state.timezone = action.payload.timezone;
    },
    updateIntegrationToggles: (state, action: PayloadAction<Partial<Pick<SettingsState, 'isSlackConnected' | 'isTeamsConnected' | 'isGithubConnected'>>>) => {
      Object.assign(state, action.payload);
    }
  }
});

export const {
  updateProfileSettings,
  updateAvatar,
  updateThemeAccent,
  updateNotificationChecks,
  updateAccountSettings,
  updateIntegrationToggles
} = settingsSlice.actions;

export default settingsSlice.reducer;
