import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  Project, 
  Task, 
  Sprint, 
  Issue, 
  TeamMember, 
  TimeLog, 
  AutomationRule, 
  Message,
  Allocation,
  AutomationLog
} from './database/schemas';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Sprint.name) private sprintModel: Model<Sprint>,
    @InjectModel(Issue.name) private issueModel: Model<Issue>,
    @InjectModel(TeamMember.name) private memberModel: Model<TeamMember>,
    @InjectModel(TimeLog.name) private timeLogModel: Model<TimeLog>,
    @InjectModel(AutomationRule.name) private ruleModel: Model<AutomationRule>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Allocation.name) private allocationModel: Model<Allocation>,
    @InjectModel(AutomationLog.name) private autoLogModel: Model<AutomationLog>,
  ) {}

  async onModuleInit() {
    console.log('mongodb connected successfully');
    
    // Seed automation rules if missing
    const rulesCount = await this.ruleModel.countDocuments().exec();
    if (rulesCount === 0) {
      await this.ruleModel.insertMany([
        { name: 'Critical Issue Assignee', triggerEvent: 'high_priority_issue', actionType: 'assign_to', config: JSON.stringify({ target: 'John Doe' }), active: true },
        { name: 'Auto QA on Done', triggerEvent: 'status_changed', actionType: 'assign_to', config: JSON.stringify({ triggerValue: 'done', target: 'T-800 Cyberdyne' }), active: true },
        { name: 'Notify on New Task', triggerEvent: 'task_created', actionType: 'trigger_alert', config: JSON.stringify({ target: 'Sarah Connor' }), active: true }
      ] as any[]);
      console.log('Automation rules seeded!');
    }

    // Seed database if empty
    const projectCount = await this.projectModel.countDocuments().exec();
    if (projectCount === 0) {
      await this.seedDatabase();
    }
  }

  private async seedDatabase() {
    console.log('Seeding Database with mockup Enterprise PM Suite data...');

    // 1. Seed Members
    const members = await this.memberModel.insertMany([
      { name: 'Sarah Connor', role: 'Product Owner', email: 'sarah@enterprise.com', avatar: 'SC', capacity: 40 },
      { name: 'John Doe', role: 'Lead Developer', email: 'john@enterprise.com', avatar: 'JD', capacity: 40 },
      { name: 'Marcus Wright', role: 'Fullstack Dev', email: 'marcus@enterprise.com', avatar: 'MW', capacity: 40 },
      { name: 'T-800 Cyberdyne', role: 'QA Engineer', email: 't800@enterprise.com', avatar: 'T8', capacity: 40 },
      { name: 'Kyle Reese', role: 'DevOps Specialist', email: 'kyle@enterprise.com', avatar: 'KR', capacity: 40 }
    ] as any[]);

    // 2. Seed Projects
    const projects = await this.projectModel.insertMany([
      { name: 'Apollo Lunar Suite', key: 'APO', description: 'Enterprise space landing guidance control portal', lead: 'Sarah Connor', status: 'active' },
      { name: 'Acme E-Commerce Portal', key: 'ACM', description: 'Next-Gen headless retail platform', lead: 'John Doe', status: 'active' }
    ] as any[]);

    // 3. Seed Sprints
    const sprints = await this.sprintModel.insertMany([
      { name: 'Apollo Sprint 1', status: 'completed', startDate: '2026-06-01', endDate: '2026-06-14', goal: 'Build telemetry core modules' },
      { name: 'Apollo Sprint 2 (Active)', status: 'active', startDate: '2026-06-15', endDate: '2026-06-29', goal: 'Integrate real-time socket channels' },
      { name: 'Apollo Sprint 3', status: 'future', startDate: '2026-06-30', endDate: '2026-07-13', goal: 'Verify QA compliance & load-testing' }
    ] as any[]);

    const activeSprint = sprints[1];

    // 4. Seed Tasks
    const tasks = await this.taskModel.insertMany([
      // Apollo Sprint 1 (Completed Tasks)
      { 
        key: 'APO-1', 
        title: 'Design database schema for telemetry data', 
        description: 'Setup tables for storing altitude, velocity, and fuel logs.', 
        status: 'done', 
        priority: 'highest', 
        assignee: 'John Doe', 
        reporter: 'Sarah Connor', 
        sprintId: sprints[0].id, 
        projectId: projects[0].id, 
        timeEstimated: 8, 
        timeSpent: 10,
        dueDate: '2026-06-12',
        labels: JSON.stringify(['database', 'backend']),
        subTasks: JSON.stringify([
          { id: 'st-1', title: 'Draft tables relation schema', completed: true },
          { id: 'st-2', title: 'Create DB indices for query acceleration', completed: true }
        ]),
        comments: JSON.stringify([
          { id: 'c-1', author: 'Sarah Connor', text: 'Please optimize indices for telemetry queries.', date: '2026-06-03T10:00:00Z' }
        ]),
        attachments: JSON.stringify([
          { id: 'at-1', filename: 'database_schema.pdf', size: '420 KB' }
        ]),
        activities: JSON.stringify([
          { id: 'ac-1', action: 'created the task', time: '2026-06-01T09:00:00Z' },
          { id: 'ac-2', action: 'moved task to Done', time: '2026-06-12T17:00:00Z' }
        ])
      },
      { 
        key: 'APO-2', 
        title: 'Implement telemetry ingestion endpoint', 
        description: 'NestJS REST endpoint that handles JSON streams from lunar probe simulator.', 
        status: 'done', 
        priority: 'high', 
        assignee: 'Marcus Wright', 
        reporter: 'Sarah Connor', 
        sprintId: sprints[0].id, 
        projectId: projects[0].id, 
        timeEstimated: 12, 
        timeSpent: 11,
        dueDate: '2026-06-14',
        labels: JSON.stringify(['backend', 'nestjs']),
        subTasks: JSON.stringify([
          { id: 'st-3', title: 'Implement ingestion controller route', completed: true }
        ]),
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      },
      
      // Apollo Sprint 2 (Active Tasks)
      { 
        key: 'APO-3', 
        title: 'Build interactive real-time telemetry chart', 
        description: 'Visual charts using Recharts showing stream status, speed, and fuel burn.', 
        status: 'in_progress', 
        priority: 'highest', 
        assignee: 'Marcus Wright', 
        reporter: 'Sarah Connor', 
        sprintId: activeSprint.id, 
        projectId: projects[0].id, 
        timeEstimated: 16, 
        timeSpent: 8,
        dueDate: '2026-06-28',
        labels: JSON.stringify(['frontend', 'recharts']),
        subTasks: JSON.stringify([
          { id: 'st-4', title: 'Setup Recharts responsiveness', completed: true },
          { id: 'st-5', title: 'Implement stream listener feeds', completed: false }
        ]),
        comments: JSON.stringify([
          { id: 'c-2', author: 'John Doe', text: 'Use cubic curve settings for fuel speed chart.', date: '2026-06-18T14:30:00Z' }
        ]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([
          { id: 'ac-3', action: 'started coding telemetry chart', time: '2026-06-16T10:00:00Z' }
        ])
      },
      { 
        key: 'APO-4', 
        title: 'Configure client-side WebSocket receiver', 
        description: 'Hook up React components to receive dashboard events dynamically.', 
        status: 'todo', 
        priority: 'medium', 
        assignee: 'John Doe', 
        reporter: 'Sarah Connor', 
        sprintId: activeSprint.id, 
        projectId: projects[0].id, 
        timeEstimated: 6, 
        timeSpent: 0,
        dueDate: '2026-06-29',
        labels: JSON.stringify(['frontend', 'websockets']),
        subTasks: JSON.stringify([]),
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      },
      { 
        key: 'APO-5', 
        title: 'Setup Redis adapter fallback for WebSockets', 
        description: 'Implement dynamic in-memory PubSub system for single instance environments.', 
        status: 'todo', 
        priority: 'high', 
        assignee: 'Kyle Reese', 
        reporter: 'John Doe', 
        sprintId: activeSprint.id, 
        projectId: projects[0].id, 
        timeEstimated: 8, 
        timeSpent: 0,
        dueDate: '2026-06-27',
        labels: JSON.stringify(['backend', 'websockets', 'redis']),
        subTasks: JSON.stringify([]),
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      },
      
      // Backlog Tasks
      { 
        key: 'APO-6', 
        title: 'Write comprehensive End-to-End tests', 
        description: 'Test telemetry streaming validation, security filters, and user auth.', 
        status: 'backlog', 
        priority: 'medium', 
        assignee: 'T-800 Cyberdyne', 
        reporter: 'Sarah Connor', 
        sprintId: null, 
        projectId: projects[0].id, 
        timeEstimated: 14, 
        timeSpent: 0,
        dueDate: '2026-07-10',
        labels: JSON.stringify(['testing', 'e2e']),
        subTasks: JSON.stringify([]),
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      },
      { 
        key: 'ACM-1', 
        title: 'Shopping Cart Checkout Integration', 
        description: 'Connect Acme shopfront to Stripe gateway handler API.', 
        status: 'backlog', 
        priority: 'high', 
        assignee: 'Marcus Wright', 
        reporter: 'John Doe', 
        sprintId: null, 
        projectId: projects[1].id, 
        timeEstimated: 10, 
        timeSpent: 0,
        dueDate: '2026-07-20',
        labels: JSON.stringify(['checkout', 'stripe']),
        subTasks: JSON.stringify([]),
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      }
    ] as any[]);

    // 5. Seed Issues (Defect & Task Log)
    await this.issueModel.insertMany([
      { 
        key: 'BUG-101', 
        title: 'Socket connection fails intermittently on browser sleep', 
        description: 'Connection resets and fails to auto-reconnect due to state cleanup issues.', 
        status: 'open', 
        priority: 'critical', 
        type: 'bug', 
        assignee: 'John Doe', 
        reporter: 'T-800 Cyberdyne',
        comments: JSON.stringify([
          { id: 'ic-1', author: 'John Doe', text: 'Investigating client-side connection states.', date: '2026-06-22T14:00:00Z' }
        ]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([
          { id: 'ia-1', action: 'reported bug ticket', time: '2026-06-22T08:00:00Z' }
        ])
      },
      { 
        key: 'BUG-102', 
        title: 'Memory leak in charts rendering thread', 
        description: 'Each socket event renders new nodes without cleaning up past canvas instances.', 
        status: 'investigating', 
        priority: 'high', 
        type: 'bug', 
        assignee: 'Marcus Wright', 
        reporter: 'T-800 Cyberdyne',
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      },
      { 
        key: 'FEAT-201', 
        title: 'Integrate Slack/Teams webhook alert rules', 
        description: 'Add capability to post alerts directly to corporate Slack/Teams channels.', 
        status: 'open', 
        priority: 'medium', 
        type: 'feature', 
        assignee: 'Kyle Reese', 
        reporter: 'Sarah Connor',
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      },
      { 
        key: 'EPIC-401', 
        title: 'Core Telemetry streaming module release', 
        description: 'Release the core Apollo lunar stream guides pipeline.', 
        status: 'open', 
        priority: 'critical', 
        type: 'epic', 
        assignee: 'John Doe', 
        reporter: 'Sarah Connor',
        comments: JSON.stringify([]),
        attachments: JSON.stringify([]),
        activities: JSON.stringify([])
      }
    ] as any[]);

    // 6. Seed Time Logs
    await this.timeLogModel.insertMany([
      { taskId: tasks[0].id, taskTitle: tasks[0].title, durationHours: 5, description: 'Created migration scripts and tested locally', date: '2026-06-05', memberName: 'John Doe', billable: true },
      { taskId: tasks[0].id, taskTitle: tasks[0].title, durationHours: 5, description: 'Refined indices and schema docs', date: '2026-06-06', memberName: 'John Doe', billable: true },
      { taskId: tasks[2].id, taskTitle: tasks[2].title, durationHours: 8, description: 'Drafted Canvas components and test feed', date: '2026-06-20', memberName: 'Marcus Wright', billable: false }
    ] as any[]);

    // 6.5 Seed Project Resource Allocations
    await this.allocationModel.insertMany([
      { memberName: 'John Doe', projectName: 'Apollo Lunar Suite', allocatedHours: 30, startDate: '2026-06-15', endDate: '2026-06-29' },
      { memberName: 'Marcus Wright', projectName: 'Apollo Lunar Suite', allocatedHours: 35, startDate: '2026-06-15', endDate: '2026-06-29' },
      { memberName: 'Kyle Reese', projectName: 'Acme E-Commerce Portal', allocatedHours: 25, startDate: '2026-06-15', endDate: '2026-07-15' },
    ] as any[]);

    // 7. Seed Automation Rules
    await this.ruleModel.insertMany([
      { name: 'Critical Issue Assignee', triggerEvent: 'high_priority_issue', actionType: 'assign_to', config: JSON.stringify({ target: 'John Doe' }), active: true },
      { name: 'Auto QA on Done', triggerEvent: 'status_changed', actionType: 'assign_to', config: JSON.stringify({ triggerValue: 'done', target: 'T-800 Cyberdyne' }), active: true }
    ] as any[]);

    // 8. Seed Chat Messages
    await this.messageModel.insertMany([
      { channel: 'general', text: 'Welcome to the Enterprise Project Management chat!', sender: 'System', timestamp: new Date() },
      { channel: 'general', text: 'Great progress on Apollo Sprint 1 team!', sender: 'Sarah Connor', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { channel: 'general', text: 'Thanks Sarah. Working on WebSocket integrations now.', sender: 'John Doe', timestamp: new Date(Date.now() - 1000 * 60 * 30) }
    ] as any[]);

    console.log('Database Seeding Completed Successfully!');
  }

  // --- Helpers for JSON columns ---
  private parseTaskJson(task: Task): any {
    return {
      ...task,
      labels: task.labels ? task.labels : [],
      subTasks: task.subTasks ? JSON.parse(task.subTasks) : [],
      comments: task.comments ? JSON.parse(task.comments) : [],
      attachments: task.attachments ? JSON.parse(task.attachments) : [],
      activities: task.activities ? JSON.parse(task.activities) : [],
    };
  }

  private serializeTaskJson(data: Partial<Task>): any {
    const result = { ...data } as any;
    if (data.labels && Array.isArray(data.labels)) result.labels = JSON.stringify(data.labels);
    if (data.subTasks && Array.isArray(data.subTasks)) result.subTasks = JSON.stringify(data.subTasks);
    if (data.comments && Array.isArray(data.comments)) result.comments = JSON.stringify(data.comments);
    if (data.attachments && Array.isArray(data.attachments)) result.attachments = JSON.stringify(data.attachments);
    if (data.activities && Array.isArray(data.activities)) result.activities = JSON.stringify(data.activities);
    return result;
  }

  // --- Projects ---
  async getProjects() { return this.projectModel.find().exec(); }
  async createProject(data: Partial<Project>) { return this.projectModel.create(data); }

  // --- Tasks ---
  async getTasks() {
    const tasks = await this.taskModel.find().exec();
    return tasks.map(t => this.parseTaskJson(t));
  }
  
  async createTask(data: Partial<Task>) {
    const serialized = this.serializeTaskJson(data);
    const task = await this.taskModel.create(serialized);
    await this.triggerAutomations('task_created', task);
    const saved = await this.taskModel.findById().exec();
    return saved ? this.parseTaskJson(saved) : null;
  }

  async updateTask(id: string, data: Partial<Task>) {
    const oldTask = await this.taskModel.findById(id).exec();
    const serialized = this.serializeTaskJson(data);
    await this.taskModel.findByIdAndUpdate(id, serialized, { new: true }).exec();
    const updatedTask = await this.taskModel.findById(id).exec();
    
    if (oldTask && updatedTask && oldTask.status !== updatedTask.status) {
      await this.triggerAutomations('status_changed', updatedTask);
    }
    return updatedTask ? this.parseTaskJson(updatedTask) : null;
  }

  async deleteTask(id: string) { return this.taskModel.findByIdAndDelete(id).exec(); }

  // --- Sprints ---
  async getSprints() { return this.sprintModel.find().exec(); }
  async createSprint(data: Partial<Sprint>) { return this.sprintModel.create(data); }
  async updateSprint(id: string, data: Partial<Sprint>) {
    await this.sprintModel.findByIdAndUpdate(id, data, { new: true }).exec();
    return this.sprintModel.findById(id).exec();
  }

  // --- Helpers for Issue JSON columns ---
  private parseIssueJson(issue: Issue): any {
    return {
      ...issue,
      comments: issue.comments ? JSON.parse(issue.comments) : [],
      attachments: issue.attachments ? JSON.parse(issue.attachments) : [],
      activities: issue.activities ? JSON.parse(issue.activities) : [],
    };
  }

  private serializeIssueJson(data: Partial<Issue>): any {
    const result = { ...data } as any;
    if (data.comments && Array.isArray(data.comments)) result.comments = JSON.stringify(data.comments);
    if (data.attachments && Array.isArray(data.attachments)) result.attachments = JSON.stringify(data.attachments);
    if (data.activities && Array.isArray(data.activities)) result.activities = JSON.stringify(data.activities);
    return result;
  }

  // --- Issues ---
  async getIssues() {
    const issues = await this.issueModel.find().exec();
    return issues.map(i => this.parseIssueJson(i));
  }
  async createIssue(data: Partial<Issue>) {
    const serialized = this.serializeIssueJson(data);
    const issue = await this.issueModel.create(serialized);
    if (issue.priority === 'critical') {
      await this.triggerAutomations('high_priority_issue', issue);
    }
    const saved = await this.issueModel.findById().exec();
    return saved ? this.parseIssueJson(saved) : null;
  }
  async updateIssue(id: string, data: Partial<Issue>) {
    const serialized = this.serializeIssueJson(data);
    await this.issueModel.findByIdAndUpdate(id, serialized, { new: true }).exec();
    const updated = await this.issueModel.findById(id).exec();
    return updated ? this.parseIssueJson(updated) : null;
  }

  // --- Team Members ---
  async getMembers() { return this.memberModel.find().exec(); }
  async createMember(data: Partial<TeamMember>) { return this.memberModel.create(data); }

  // --- Time Logs ---
  async getTimeLogs() { return this.timeLogModel.find().exec(); }
  async logTime(data: Partial<TimeLog>) {
    const log = await this.timeLogModel.create(data);
    
    // Update task's time spent
    if (log.taskId) {
      const task = await this.taskModel.findById().exec();
      if (task) {
        const totalSpent = Number(task.timeSpent || 0) + Number(log.durationHours || 0);
        await this.taskModel.findByIdAndUpdate(log.taskId, { timeSpent: totalSpent }, { new: true }).exec();
      }
    }
    return log;
  }

  // --- Automation Rules ---
  async getRules() { return this.ruleModel.find().exec(); }
  async createRule(data: Partial<AutomationRule>) { return this.ruleModel.create(data); }
  async toggleRule(id: string, active: boolean) {
    await this.ruleModel.findByIdAndUpdate(id, { active }, { new: true }).exec();
    return this.ruleModel.findById(id).exec();
  }
  async deleteRule(id: string) { return this.ruleModel.findByIdAndDelete(id).exec(); }

  // --- Chat Messages ---
  async getMessages(channel: string) {
    return this.messageModel.find({
      where: { channel },
      order: { timestamp: 'ASC' }
    });
  }
  async saveMessage(data: Partial<Message>) {
    return this.messageModel.create(data);
  }

  // --- Issues Extra ---
  async deleteIssue(id: string) {
    await this.issueModel.findByIdAndDelete(id).exec();
    return { success: true };
  }

  // --- Resource Allocations ---
  async getAllocations() {
    return this.allocationModel.find().exec();
  }
  async createAllocation(data: Partial<Allocation>) {
    return this.allocationModel.create(data);
  }
  async deleteAllocation(id: string) {
    await this.allocationModel.findByIdAndDelete(id).exec();
    return { success: true };
  }

  // --- Automation Logs ---
  async getAutomationLogs() {
    return this.autoLogModel.find({
      order: { timestamp: 'DESC' }
    });
  }

  // --- Mock Authentication JWT Flow ---
  async login(credentials: any) {
    const { username, password } = credentials;
    if (password === 'password' || password === 'admin') {
      const accessToken = 'mock-access-token-' + username + '-' + Date.now();
      const refreshToken = 'mock-refresh-token-' + username + '-' + Date.now();
      return {
        accessToken,
        refreshToken,
        user: {
          username,
          role: username === 'Sarah Connor' ? 'Product Owner' : 'Lead Developer',
          email: `${username.toLowerCase().replace(/ /g, '')}@enterprise.com`,
          avatar: username.split(' ').map((n: string) => n[0]).join('')
        }
      };
    }
    throw new Error('Invalid credentials');
  }

  async rotateTokens(body: { refreshToken: string }) {
    const { refreshToken } = body;
    if (refreshToken && refreshToken.startsWith('mock-refresh-token')) {
      const parts = refreshToken.split('-');
      const username = parts.slice(3, parts.length - 1).join('-') || 'CurrentUser';
      const accessToken = 'mock-access-token-' + username + '-' + Date.now();
      const newRefreshToken = 'mock-refresh-token-' + username + '-' + Date.now();
      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    }
    throw new Error('Invalid refresh token');
  }

  // --- Automation Execution Engine ---
  private async triggerAutomations(event: string, entity: any) {
    const rules = await this.ruleModel.find({ triggerEvent: event as any, active: true });
    
    for (const rule of rules) {
      try {
        const config = JSON.parse(rule.config);
        
        if (event === 'status_changed') {
          if (config.triggerValue && entity.status !== config.triggerValue) {
            continue;
          }
          
          if (rule.actionType === 'assign_to') {
            await this.taskModel.findByIdAndUpdate(entity.id, { assignee: config.target }, { new: true }).exec();
            await this.autoLogModel.create({
              ruleName: rule.name,
              triggerEvent: event,
              entityKey: entity.key,
              actionExecuted: `assigned to ${config.target}`,
              status: 'success',
              details: `Task status transitioned to "${entity.status}" triggering auto-assignment.`
            });
            console.log(`[Automation Triggered] Rule "${rule.name}" updated task ${entity.key} assignee to: ${config.target}`);
          }
        }
        
        if (event === 'high_priority_issue') {
          if (rule.actionType === 'assign_to') {
            await this.issueModel.findByIdAndUpdate(entity.id, { assignee: config.target }, { new: true }).exec();
            await this.autoLogModel.create({
              ruleName: rule.name,
              triggerEvent: event,
              entityKey: entity.key,
              actionExecuted: `assigned to ${config.target}`,
              status: 'success',
              details: `Critical issue flagged. Auto-assigned to developer.`
            });
            console.log(`[Automation Triggered] Rule "${rule.name}" updated issue ${entity.key} assignee to: ${config.target}`);
          }
        }
      } catch (err) {
        console.error(`Error processing automation rule: ${rule.name}`, err);
        try {
          await this.autoLogModel.create({
            ruleName: rule.name,
            triggerEvent: event,
            entityKey: entity.key || 'unknown',
            actionExecuted: 'none',
            status: 'failure',
            details: `Failed executing automation: ${err.message}`
          });
        } catch (innerErr) {}
      }
    }
  }

  // --- Reports Synthesis Metrics ---
  async getReportsMetrics() {
    const projects = await this.projectModel.find().exec();
    const tasks = await this.taskModel.find().exec();
    const issues = await this.issueModel.find().exec();
    const sprints = await this.sprintModel.find().exec();
    const members = await this.memberModel.find().exec();
    const timelogs = await this.timeLogModel.find().exec();

    const velocity = tasks.filter(t => t.status === 'done').length;
    const scopeCreep = tasks.filter(t => t.status === 'backlog').length * 2.5;

    let totalWorkload = 0;
    let totalCapacity = 0;
    for (const m of members) {
      totalCapacity += m.capacity || 40;
      const hours = tasks
        .filter(t => t.assignee === m.name && t.status !== 'done')
        .reduce((sum, t) => sum + (t.timeEstimated || 0), 0);
      totalWorkload += hours;
    }
    const utilization = totalCapacity > 0 ? Math.round((totalWorkload / totalCapacity) * 100) : 0;

    const activeSprint = sprints.find(s => s.status === 'active');
    let sprintCompletionRate = 0;
    if (activeSprint) {
      const sprintTasks = tasks.filter(t => t.sprintId === activeSprint.id);
      if (sprintTasks.length > 0) {
        const doneSprintTasks = sprintTasks.filter(t => t.status === 'done');
        sprintCompletionRate = Math.round((doneSprintTasks.length / sprintTasks.length) * 100);
      }
    }

    const velocityHistory = [
      { name: 'Day 1', scope: 5, velocity: 0 },
      { name: 'Day 3', scope: 10, velocity: 4 },
      { name: 'Day 6', scope: 12, velocity: 7 },
      { name: 'Day 9', scope: 15, velocity: 11 },
      { name: 'Day 12', scope: 18, velocity: 15 },
      { name: 'Day 14', scope: 18, velocity: 18 },
    ];

    const burndownHistory = [
      { name: 'Mon', actual: 48, ideal: 48 },
      { name: 'Tue', actual: 42, ideal: 40 },
      { name: 'Wed', actual: 35, ideal: 32 },
      { name: 'Thu', actual: 28, ideal: 24 },
      { name: 'Fri', actual: 18, ideal: 16 },
      { name: 'Sat', actual: 10, ideal: 8 },
      { name: 'Sun', actual: 0, ideal: 0 },
    ];

    const projectsReport = projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const pIssues = issues.filter(i => i.key.startsWith(p.key));
      return {
        name: p.name,
        tasksCount: pTasks.length,
        issuesCount: pIssues.length,
        doneTasks: pTasks.filter(t => t.status === 'done').length
      };
    });

    const teamReport = members.map(m => {
      const loggedHours = timelogs
        .filter(l => l.memberName === m.name)
        .reduce((sum, l) => sum + (l.durationHours || 0), 0);
      return {
        name: m.name,
        logged: loggedHours,
        capacity: m.capacity || 40,
      };
    });

    const resolutionReport = members.map(m => {
      const resolvedCount = issues.filter(i => i.assignee === m.name && i.status === 'resolved').length;
      const closedCount = issues.filter(i => i.assignee === m.name && i.status === 'closed').length;
      return {
        name: m.name,
        resolved: resolvedCount + closedCount,
      };
    });

    return {
      kpis: {
        velocity,
        scopeCreep,
        utilization,
        sprintCompletionRate,
      },
      charts: {
        velocityHistory,
        burndownHistory,
        projectsReport,
        teamReport,
        resolutionReport,
      }
    };
  }

  // --- Dashboard Data Synthesis (Jira Metrics) ---
  async getDashboardMetrics() {
    const projects = await this.projectModel.find().exec();
    const tasks = await this.taskModel.find().exec();
    const issues = await this.issueModel.find().exec();
    const sprints = await this.sprintModel.find().exec();

    const activeSprint = sprints.find(s => s.status === 'active');
    const activeTasks = tasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
    const completedTasks = tasks.filter(t => t.status === 'done');
    const pendingIssues = issues.filter(i => i.status !== 'resolved' && i.status !== 'closed');

    let sprintProgress = 0;
    if (activeSprint) {
      const activeSprintTasks = tasks.filter(t => t.sprintId === activeSprint.id);
      if (activeSprintTasks.length > 0) {
        const completedActiveTasks = activeSprintTasks.filter(t => t.status === 'done');
        sprintProgress = Math.round((completedActiveTasks.length / activeSprintTasks.length) * 100);
      }
    }

    const recentActivities = [
      { id: '1', user: 'Marcus Wright', action: 'moved task', target: 'APO-3', details: 'to In Progress', time: '10m ago' },
      { id: '2', user: 'Sarah Connor', action: 'created new project', target: 'Acme E-Commerce Portal', details: '', time: '1h ago' },
      { id: '3', user: 'T-800 Cyberdyne', action: 'reported critical bug', target: 'BUG-101', details: 'Socket failures', time: '3h ago' },
      { id: '4', user: 'John Doe', action: 'completed task', target: 'APO-1', details: 'Telemetry schema design', time: 'Yesterday' }
    ];

    const todaysWork = tasks.filter(t => t.assignee === 'John Doe' && t.status === 'in_progress');
    
    const upcomingDeadlines = [
      { id: 'dl-1', title: 'Sprint 2 Telemetry Chart Deliverable', date: activeSprint?.endDate || '2026-06-29', severity: 'high' },
      { id: 'dl-2', title: 'QA Code Freeze - Apollo Ingestion', date: '2026-07-02', severity: 'medium' }
    ];

    const statusDistribution = {
      backlog: tasks.filter(t => t.status === 'backlog').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    };

    const weeklyProgress = [
      { name: 'Mon', completed: 3, active: 4 },
      { name: 'Tue', completed: 5, active: 5 },
      { name: 'Wed', completed: 2, active: 6 },
      { name: 'Thu', completed: 6, active: 3 },
      { name: 'Fri', completed: 8, active: 2 },
      { name: 'Sat', completed: 1, active: 2 },
      { name: 'Sun', completed: 0, active: 1 }
    ];

    const burndown = [
      { day: 'Day 1', actual: 48, ideal: 48 },
      { day: 'Day 2', actual: 45, ideal: 44.5 },
      { day: 'Day 3', actual: 42, ideal: 41 },
      { day: 'Day 4', actual: 38, ideal: 37.6 },
      { day: 'Day 5', actual: 38, ideal: 34.2 },
      { day: 'Day 6', actual: 32, ideal: 30.8 },
      { day: 'Day 7', actual: 29, ideal: 27.4 },
      { day: 'Day 8', actual: 26, ideal: 24 },
      { day: 'Day 9', actual: 22, ideal: 20.6 },
      { day: 'Day 10', actual: 18, ideal: 17.2 },
      { day: 'Day 11', actual: 14, ideal: 13.8 },
      { day: 'Day 12', actual: 10, ideal: 10.4 },
      { day: 'Day 13', actual: 6, ideal: 7 },
      { day: 'Day 14', actual: 0, ideal: 0 }
    ];

    return {
      stats: {
        totalProjects: projects.length,
        activeTasks: activeTasks.length,
        completedTasks: completedTasks.length,
        pendingIssues: pendingIssues.length,
        sprintProgress
      },
      recentActivities,
      todaysWork,
      upcomingDeadlines,
      charts: {
        statusDistribution,
        weeklyProgress,
        burndown
      }
    };
  }
}
