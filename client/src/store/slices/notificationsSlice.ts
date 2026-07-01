import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<NotificationItem, 'id' | 'timestamp'>>) => {
      const newItem: NotificationItem = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...action.payload
      };
      state.notifications.unshift(newItem);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    }
  }
});

export const { addNotification, clearNotifications, resetUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
