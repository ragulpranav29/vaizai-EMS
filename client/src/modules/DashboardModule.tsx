import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckSquare, 
  AlertCircle, 
  Activity, 
  Calendar, 
  Clock, 
  Plus, 
  UserPlus, 
  Bell 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { Modal } from '../components/Modal';
import { DashboardSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { socketService } from '../api/socketService';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchDashboardMetrics } from '../store/slices/dashboardSlice';
import { fetchProjects, createProject } from '../store/slices/projectsSlice';
import { fetchMembers, createMember } from '../store/slices/teamsSlice';
import { createTask } from '../store/slices/tasksSlice';
import { resetUnreadCount } from '../store/slices/notificationsSlice';
import { KpiCard, KeyBadge, TaskStatusBadge, PageHeader } from '../components/ui';

interface DashboardModuleProps {
  serverOnline: boolean;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  // Redux Selectors
  const metrics = useAppSelector((state) => state.dashboard.metrics);
  const dashboardLoading = useAppSelector((state) => state.dashboard.loading);

  const projectsList = useAppSelector((state) => state.projects.projects);
  const projectsLoading = useAppSelector((state) => state.projects.loading);

  const membersList = useAppSelector((state) => state.teams.members);
  const membersLoading = useAppSelector((state) => state.teams.loading);

  const notifications = useAppSelector((state) => state.notifications.notifications);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  const loading = (dashboardLoading || projectsLoading || membersLoading) && !metrics;

  const [showNotifications, setShowNotifications] = useState(false);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Form states
  const [projName, setProjName] = useState('');
  const [projKey, setProjKey] = useState('');
  const [projLead, setProjLead] = useState('');
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'highest'>('medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskProject, setTaskProject] = useState('');

  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const fetchDashboardData = (force = false) => {
    dispatch(fetchDashboardMetrics({ serverOnline, forceRefresh: force }));
    dispatch(fetchProjects({ serverOnline, forceRefresh: force }));
    dispatch(fetchMembers({ serverOnline, forceRefresh: force }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [serverOnline]);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      dispatch(resetUnreadCount());
    }
  };

  // Form submit handles
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projKey) return;
    try {
      const payload = { name: projName, key: projKey.toUpperCase(), lead: projLead || 'Unassigned', status: 'active' as const };
      await dispatch(createProject({ project: payload, serverOnline })).unwrap();
      
      if (serverOnline) {
        socketService.emit('send_message', {
          channel: 'general',
          sender: 'System',
          text: `🚀 Project "${projName}" [${projKey.toUpperCase()}] was created by the system.`
        });
      }
      addToast("Project Created", `Project "${projName}" initialized.`, "success");
      setIsProjectModalOpen(false);
      setProjName(''); setProjKey(''); setProjLead('');
      fetchDashboardData(true);
    } catch (err) {
      addToast("Error", "Could not create project", "error");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskProject) return;
    try {
      const selProj = projectsList.find(p => p.id === taskProject || p.name === taskProject);
      const keySuffix = Math.floor(Math.random() * 100) + 1;
      const payload = {
        key: `${selProj?.key || 'TASK'}-${keySuffix}`,
        title: taskTitle,
        description: taskDesc,
        status: 'todo' as const,
        priority: taskPriority,
        assignee: taskAssignee || 'Unassigned',
        reporter: localStorage.getItem('emp_username') || 'Sarah Connor',
        projectId: selProj?.id || '1',
        timeEstimated: 4,
        timeSpent: 0
      };

      await dispatch(createTask({ task: payload, serverOnline })).unwrap();
      
      if (serverOnline) {
        socketService.emit('send_message', {
          channel: 'general',
          sender: 'System',
          text: `📋 New Task "${taskTitle}" [${payload.key}] was created.`
        });
      }
      addToast("Task Created", `Task "${taskTitle}" created.`, "success");
      setIsTaskModalOpen(false);
      setTaskTitle(''); setTaskDesc(''); setTaskAssignee('');
      fetchDashboardData(true);
    } catch (err) {
      addToast("Error", "Could not create task", "error");
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberEmail) return;
    try {
      const payload = { name: memberName, role: memberRole || 'Developer', email: memberEmail, capacity: 40 };
      await dispatch(createMember({ member: payload, serverOnline })).unwrap();
      addToast("Member Added", `Invited ${memberName} to the workspace.`, "success");
      setIsMemberModalOpen(false);
      setMemberName(''); setMemberRole(''); setMemberEmail('');
      fetchDashboardData(true);
    } catch (err) {
      addToast("Error", "Could not add member", "error");
    }
  };

  if (loading || !metrics) {
    return <DashboardSkeleton />;
  }

  // Prepping chart elements
  const pieData = [
    { name: 'Backlog', value: metrics.charts.statusDistribution.backlog },
    { name: 'To Do', value: metrics.charts.statusDistribution.todo },
    { name: 'In Progress', value: metrics.charts.statusDistribution.in_progress },
    { name: 'Done', value: metrics.charts.statusDistribution.done },
  ].filter(d => d.value > 0);

  const COLORS = ['#6b7280', '#06b6d4', '#f59e0b', '#10b981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <PageHeader
        title="Workspace Dashboard"
        subtitle="Real-time project health metrics, sprint logs, and activities."
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-secondary" onClick={() => setIsProjectModalOpen(true)}>
              <Briefcase size={15} /> Create Project
            </button>
            <button className="btn btn-primary" onClick={() => setIsTaskModalOpen(true)}>
              <Plus size={15} /> Create Task
            </button>
            <button className="btn btn-secondary" onClick={() => setIsMemberModalOpen(true)}>
              <UserPlus size={15} /> Invite Member
            </button>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-secondary" style={{ padding: '10px' }} onClick={handleToggleNotifications}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="card" style={{ position: 'absolute', top: '46px', right: 0, width: '320px', zIndex: 1000, padding: '16px', background: '#11131e', maxHeight: '300px', overflowY: 'auto' }}>
                  <h4 style={{ marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Recent Logs</h4>
                  {notifications.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>No notifications received.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} style={{ fontSize: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <div style={{ fontWeight: 'bold', color: '#fff' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <KpiCard label="Total Projects" value={metrics.stats.totalProjects} icon={<Briefcase size={14} />} accent="info" />
        <KpiCard label="Active Tasks" value={metrics.stats.activeTasks} icon={<Clock size={14} />} accent="warning" />
        <KpiCard label="Completed Tasks" value={metrics.stats.completedTasks} icon={<CheckSquare size={14} />} accent="success" />
        <KpiCard label="Pending Issues" value={metrics.stats.pendingIssues} icon={<AlertCircle size={14} />} accent="danger" />
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Sprint</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-hover)' }}>{metrics.stats.sprintProgress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.stats.sprintProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', boxShadow: 'var(--glow-shadow)' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={10} /> Goal: Ingestion system
          </div>
        </div>
      </div>

      {/* Middle Layout: Upcoming Deadlines, Today's Work, Recent Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Widget 6: Today's Work & Upcoming Deadlines */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <span>Today's Work & Deadlines</span>
            <Calendar size={18} color="var(--primary-hover)" />
          </h3>
          
          <div>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Your Assigned Tasks</h4>
            {metrics.todaysWork.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                No active work items assigned to you.
              </div>
            ) : (
              metrics.todaysWork.map((t: any) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyBadge value={t.key} />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{t.title}</span>
                  </div>
                  <TaskStatusBadge status="in_progress" />
                </div>
              ))
            )}
          </div>

          <div>
            <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Critical Deadlines</h4>
            {metrics.upcomingDeadlines.map((dl: any) => (
              <div key={dl.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '8px 0' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{dl.title}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: dl.severity === 'high' ? 'var(--danger)' : 'var(--warning)' }}>
                  {dl.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Widget 7: Recent Activities */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">
            <span>Recent Activities</span>
            <Activity size={18} color="var(--success)" />
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {metrics.recentActivities.map((act: any) => (
              <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {act.user[0]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    <span style={{ fontWeight: 600 }}>{act.user}</span> {act.action} <span style={{ color: 'var(--primary-hover)', fontWeight: 500 }}>{act.target}</span> {act.details}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Charts Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Chart 1: Status Distribution Pie */}
        <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">Task Distribution</h3>
          {pieData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No tasks found in repository.
            </div>
          ) : (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#11131e', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Weekly Progress Bar */}
        <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">Weekly Productivity</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.charts.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={{ background: '#11131e', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="completed" fill="var(--success)" name="Tasks Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" fill="var(--primary)" name="Active Tasks" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Sprint Burndown Line */}
        <div className="card" style={{ height: '340px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="card-title">Sprint 2 Burn Down</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.charts.burndown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip contentStyle={{ background: '#11131e', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Line type="monotone" dataKey="ideal" stroke="var(--primary)" name="Ideal Remaining" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="actual" stroke="var(--danger)" name="Actual Remaining" dot={{ r: 3 }} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* QUICK ACTION MODALS */}
      
      {/* 1. Create Project */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Project Name</label>
            <input type="text" placeholder="e.g. Apollo Telemetry Engine" value={projName} onChange={e => setProjName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Key Code (3 letter abbreviation)</label>
            <input type="text" placeholder="e.g. APO" maxLength={4} value={projKey} onChange={e => setProjKey(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Project Lead</label>
            <input type="text" placeholder="e.g. Sarah Connor" value={projLead} onChange={e => setProjLead(e.target.value)} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsProjectModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      {/* 2. Create Task */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Project Destination</label>
            <select value={taskProject} onChange={e => setTaskProject(e.target.value)} required>
              <option value="">-- Choose Project --</option>
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Task Title</label>
            <input type="text" placeholder="e.g. Secure core token auth routes" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Provide detailed steps..." rows={3} value={taskDesc} onChange={e => setTaskDesc(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Priority</label>
              <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="highest">Highest</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assignee</label>
              <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {membersList.map((m, idx) => (
                  <option key={idx} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>

      {/* 3. Invite Member */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInviteMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="e.g. Sarah Connor" value={memberName} onChange={e => setMemberName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Work Role</label>
            <input type="text" placeholder="e.g. Lead QA Engineer" value={memberRole} onChange={e => setMemberRole(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="e.g. sarah@cyberdyne.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Invite Member</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
