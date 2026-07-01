export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  lead?: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'highest';

export interface Task {
  id: string;
  key: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  reporter: string;
  sprintId: string | null;
  projectId: string;
  timeEstimated: number; // in hours
  timeSpent: number; // in hours
  dueDate?: string;
  labels?: string[];
  subTasks?: { id: string; title: string; completed: boolean }[];
  comments?: { id: string; author: string; text: string; date: string }[];
  attachments?: { id: string; filename: string; size: string }[];
  activities?: { id: string; action: string; time: string }[];
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  status: 'future' | 'active' | 'completed';
  startDate?: string;
  endDate?: string;
  goal?: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'improvement' | 'epic';
  assignee: string;
  reporter: string;
  comments?: { id: string; author: string; text: string; date: string }[];
  attachments?: { id: string; filename: string; size: string }[];
  activities?: { id: string; action: string; time: string }[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  capacity: number; // Max hours per week
  workload: number;  // Current hours assigned
}

export interface TimeLog {
  id: string;
  taskId: string;
  taskKey?: string;
  taskTitle: string;
  durationHours: number;
  description: string;
  date: string;
  memberName: string;
  billable?: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: 'task_created' | 'status_changed' | 'high_priority_issue';
  actionType: 'assign_to' | 'change_status' | 'trigger_alert';
  config: string; // e.g. json string with specific configuration
  active: boolean;
}

export interface Message {
  id: string;
  channel: string;
  text: string;
  sender: string;
  timestamp: string;
}
