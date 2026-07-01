import React from 'react';

// ─────────────────────────────────────────
// Task Status Badge
// ─────────────────────────────────────────
type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high' | 'highest';
type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
type IssueStatus = 'open' | 'investigating' | 'resolved' | 'closed';
type IssueType = 'bug' | 'feature' | 'improvement' | 'epic';
type SprintStatus = 'future' | 'active' | 'completed';
type ProjectStatus = 'active' | 'archived' | 'completed';
type LogStatus = 'success' | 'failure';

const TASK_STATUS_CLASS: Record<TaskStatus, string> = {
  done: 'badge-green',
  in_progress: 'badge-amber',
  todo: 'badge-cyan',
  backlog: 'badge-purple',
};

const TASK_PRIORITY_CLASS: Record<TaskPriority, string> = {
  highest: 'badge-red',
  high: 'badge-amber',
  medium: 'badge-purple',
  low: 'badge-cyan',
};

const ISSUE_STATUS_CLASS: Record<IssueStatus, string> = {
  resolved: 'badge-green',
  closed: 'badge-purple',
  investigating: 'badge-amber',
  open: 'badge-red',
};

const ISSUE_PRIORITY_CLASS: Record<IssuePriority, string> = {
  critical: 'badge-red',
  high: 'badge-amber',
  medium: 'badge-purple',
  low: 'badge-cyan',
};

const ISSUE_TYPE_CLASS: Record<IssueType, string> = {
  bug: 'badge-red',
  feature: 'badge-green',
  improvement: 'badge-cyan',
  epic: 'badge-purple',
};

const SPRINT_STATUS_CLASS: Record<SprintStatus, string> = {
  active: 'badge-green',
  future: 'badge-cyan',
  completed: 'badge-purple',
};

const PROJECT_STATUS_CLASS: Record<ProjectStatus, string> = {
  active: 'badge-green',
  completed: 'badge-purple',
  archived: 'badge-amber',
};

const LOG_STATUS_CLASS: Record<LogStatus, string> = {
  success: 'badge-green',
  failure: 'badge-red',
};

// ─────────────────────────────────────────
// Badge Props
// ─────────────────────────────────────────
interface BadgeProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/** Raw badge — use when you have a pre-computed class or custom content. */
export const Badge: React.FC<BadgeProps> = ({ className = '', style, children }) => (
  <span className={`badge ${className}`} style={style}>{children}</span>
);

// ─────────────────────────────────────────
// Typed Badge Helpers
// ─────────────────────────────────────────

/** Shows a task status badge (backlog / todo / in_progress / done). */
export const TaskStatusBadge: React.FC<{ status: TaskStatus; style?: React.CSSProperties }> = ({ status, style }) => (
  <Badge className={TASK_STATUS_CLASS[status]} style={style}>
    {status.replace('_', ' ').toUpperCase()}
  </Badge>
);

/** Shows a task priority badge (low / medium / high / highest). */
export const TaskPriorityBadge: React.FC<{ priority: TaskPriority; style?: React.CSSProperties }> = ({ priority, style }) => (
  <Badge className={TASK_PRIORITY_CLASS[priority]} style={style}>
    {priority.toUpperCase()}
  </Badge>
);

/** Shows an issue status badge (open / investigating / resolved / closed). */
export const IssueStatusBadge: React.FC<{ status: IssueStatus; style?: React.CSSProperties }> = ({ status, style }) => (
  <Badge className={ISSUE_STATUS_CLASS[status]} style={style}>
    {status.toUpperCase()}
  </Badge>
);

/** Shows an issue priority / severity badge. */
export const IssuePriorityBadge: React.FC<{ priority: IssuePriority; style?: React.CSSProperties }> = ({ priority, style }) => (
  <Badge className={ISSUE_PRIORITY_CLASS[priority]} style={style}>
    {priority.toUpperCase()}
  </Badge>
);

/** Shows an issue type badge (bug / feature / improvement / epic). */
export const IssueTypeBadge: React.FC<{ type: IssueType; style?: React.CSSProperties }> = ({ type, style }) => (
  <Badge className={ISSUE_TYPE_CLASS[type]} style={style}>
    {type.toUpperCase()}
  </Badge>
);

/** Shows a sprint status badge. */
export const SprintStatusBadge: React.FC<{ status: SprintStatus; style?: React.CSSProperties }> = ({ status, style }) => (
  <Badge className={SPRINT_STATUS_CLASS[status]} style={style}>
    {status.toUpperCase()}
  </Badge>
);

/** Shows a project status badge. */
export const ProjectStatusBadge: React.FC<{ status: ProjectStatus; style?: React.CSSProperties }> = ({ status, style }) => (
  <Badge className={PROJECT_STATUS_CLASS[status]} style={style}>
    {status.toUpperCase()}
  </Badge>
);

/** Shows an automation log status badge. */
export const LogStatusBadge: React.FC<{ status: LogStatus; style?: React.CSSProperties }> = ({ status, style }) => (
  <Badge className={LOG_STATUS_CLASS[status]} style={style}>
    {status.toUpperCase()}
  </Badge>
);

/** A simple key/identifier badge (cyan pill). */
export const KeyBadge: React.FC<{ value: string; style?: React.CSSProperties }> = ({ value, style }) => (
  <Badge className="badge-cyan" style={style}>{value}</Badge>
);
