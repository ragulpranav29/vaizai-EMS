import { client } from './client';
import type { 
  Project, 
  Task, 
  Sprint, 
  Issue, 
  TeamMember, 
  TimeLog, 
  AutomationRule, 
  Message 
} from '../types';

// API Services Layer
export const api = {
  auth: {
    login: async (credentials: any) => {
      const res = await client.post('/api/auth/login', credentials);
      return res.data;
    },
    register: async (credentials: any) => {
      const res = await client.post('/api/auth/register', credentials);
      return res.data;
    },
    refresh: async (refreshToken: string) => {
      const res = await client.post('/api/auth/refresh', { refreshToken });
      return res.data;
    }
  },

  // Project Services
  projects: {
    getProjects: async (): Promise<Project[]> => {
      const res = await client.get('/api/projects');
      return res.data;
    },
    createProject: async (data: Partial<Project>): Promise<Project> => {
      const res = await client.post('/api/projects', data);
      return res.data;
    }
  },

  // Task Services
  tasks: {
    getTasks: async (): Promise<Task[]> => {
      const res = await client.get('/api/tasks');
      return res.data;
    },
    createTask: async (data: Partial<Task>): Promise<Task> => {
      const res = await client.post('/api/tasks', data);
      return res.data;
    },
    updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
      const res = await client.put(`/api/tasks/${id}`, data);
      return res.data;
    },
    deleteTask: async (id: string): Promise<{ success: boolean }> => {
      const res = await client.delete(`/api/tasks/${id}`);
      return res.data;
    }
  },

  // Sprint Services
  sprints: {
    getSprints: async (): Promise<Sprint[]> => {
      const res = await client.get('/api/sprints');
      return res.data;
    },
    createSprint: async (data: Partial<Sprint>): Promise<Sprint> => {
      const res = await client.post('/api/sprints', data);
      return res.data;
    },
    updateSprint: async (id: string, data: Partial<Sprint>): Promise<Sprint> => {
      const res = await client.put(`/api/sprints/${id}`, data);
      return res.data;
    }
  },

  // Issue Services
  issues: {
    getIssues: async (): Promise<Issue[]> => {
      const res = await client.get('/api/issues');
      return res.data;
    },
    createIssue: async (data: Partial<Issue>): Promise<Issue> => {
      const res = await client.post('/api/issues', data);
      return res.data;
    },
    updateIssue: async (id: string, data: Partial<Issue>): Promise<Issue> => {
      const res = await client.put(`/api/issues/${id}`, data);
      return res.data;
    },
    deleteIssue: async (id: string): Promise<{ success: boolean }> => {
      const res = await client.delete(`/api/issues/${id}`);
      return res.data;
    }
  },

  // Member Services
  members: {
    getMembers: async (): Promise<TeamMember[]> => {
      const res = await client.get('/api/members');
      return res.data;
    },
    createMember: async (data: Partial<TeamMember>): Promise<TeamMember> => {
      const res = await client.post('/api/members', data);
      return res.data;
    }
  },

  // Resource Allocations Services
  allocations: {
    getAllocations: async (): Promise<any[]> => {
      const res = await client.get('/api/allocations');
      return res.data;
    },
    createAllocation: async (data: any): Promise<any> => {
      const res = await client.post('/api/allocations', data);
      return res.data;
    },
    deleteAllocation: async (id: string): Promise<{ success: boolean }> => {
      const res = await client.delete(`/api/allocations/${id}`);
      return res.data;
    }
  },

  // Time Tracking Services
  timelogs: {
    getTimeLogs: async (): Promise<TimeLog[]> => {
      const res = await client.get('/api/timelogs');
      return res.data;
    },
    logTime: async (data: Partial<TimeLog>): Promise<TimeLog> => {
      const res = await client.post('/api/timelogs', data);
      return res.data;
    }
  },

  // Workflow Automation Rules & Logs Services
  rules: {
    getRules: async (): Promise<AutomationRule[]> => {
      const res = await client.get('/api/rules');
      return res.data;
    },
    createRule: async (data: Partial<AutomationRule>): Promise<AutomationRule> => {
      const res = await client.post('/api/rules', data);
      return res.data;
    },
    toggleRule: async (id: string, active: boolean): Promise<AutomationRule> => {
      const res = await client.put(`/api/rules/${id}/toggle`, { active });
      return res.data;
    },
    deleteRule: async (id: string): Promise<{ success: boolean }> => {
      const res = await client.delete(`/api/rules/${id}`);
      return res.data;
    },
    getLogs: async (): Promise<any[]> => {
      const res = await client.get('/api/rules/logs');
      return res.data;
    }
  },

  // Reporting Synthesis Metrics Services
  reports: {
    getReports: async (): Promise<any> => {
      const res = await client.get('/api/reports');
      return res.data;
    }
  },

  // Dashboard Services
  dashboard: {
    getMetrics: async (): Promise<any> => {
      const res = await client.get('/api/dashboard');
      return res.data;
    }
  },

  // Chat message retrieval
  messages: {
    getMessages: async (channel: string): Promise<Message[]> => {
      const res = await client.get(`/api/messages/${channel}`);
      return res.data;
    }
  }
};
export type ApiType = typeof api;
