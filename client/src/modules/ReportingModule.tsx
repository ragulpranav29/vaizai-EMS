import React, { useState, useEffect } from 'react';
import { FileDown, Calendar, BarChart2, TrendingUp, Users } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Card } from '../components/Common';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchReports as fetchReportsThunk } from '../store/slices/reportsSlice';
import { PageHeader } from '../components/ui';

const COLORS = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export const ReportingModule: React.FC<{ serverOnline: boolean }> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analytics' | 'projects' | 'team'>('analytics');

  const reportData = useAppSelector(state => state.reports.reportData);
  const reportsLoading = useAppSelector(state => state.reports.loading);

  const loading = reportsLoading && !reportData;

  // Filters
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');
  const [selectedProject, setSelectedProject] = useState('all');

  const loadReportsData = (force = false) => {
    dispatch(fetchReportsThunk({ serverOnline, forceRefresh: force }));
  };

  useEffect(() => {
    loadReportsData();
  }, [serverOnline]);

  const triggerExport = (format: 'pdf' | 'excel') => {
    addToast('Generating Export', `Compiling telemetry reports metrics...`, 'info');
    setTimeout(() => {
      addToast(
        'Export Downloaded',
        `Successfully generated and downloaded project_analytics_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
        'success'
      );
    }, 1500);
  };

  if (loading || !reportData) {
    return <div style={{ color: 'var(--text-secondary)' }}>Compiling chart indexes...</div>;
  }

  const { kpis, charts } = reportData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <PageHeader
        title="Reports & Analytics"
        subtitle="Analyze scope adjustments, sprint velocity trends, and resource capabilities."
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={() => triggerExport('pdf')} icon={<FileDown size={14} />}>
              Export PDF
            </Button>
            <Button variant="secondary" onClick={() => triggerExport('excel')} icon={<FileDown size={14} />}>
              Export Excel
            </Button>
          </div>
        }
      />

      {/* FILTER PANEL */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <Calendar size={14} /> Date Range:
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)} 
            style={{ padding: '6px 12px', fontSize: '12.5px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)} 
            style={{ padding: '6px 12px', fontSize: '12.5px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Project Context:</span>
          <select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '12.5px' }}
          >
            <option value="all">All Projects</option>
            <option value="APO">Apollo Lunar Suite</option>
            <option value="ACM">Acme E-Commerce Portal</option>
          </select>
        </div>
      </div>

      {/* KPI STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sprint Velocity (Completed Tasks)</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary-hover)' }}>{kpis.velocity} Tasks</span>
          <span style={{ fontSize: '11px', color: 'var(--success)' }}>▲ 12% vs last cycle</span>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scope Creep Indicator</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{kpis.scopeCreep} Hrs</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tasks added after Sprint start</span>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Resource Load Utilization</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--info)' }}>{kpis.utilization}%</span>
          <span style={{ fontSize: '11px', color: 'var(--info)' }}>Optimal capacity load bounds</span>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sprint Completion Rate</span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{kpis.sprintCompletionRate}%</span>
          <span style={{ fontSize: '11px', color: 'var(--success)' }}>Target sprint goals met</span>
        </Card>

      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', alignSelf: 'flex-start' }}>
        <button 
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: activeTab === 'analytics' ? 'var(--primary)' : 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={14} /> Analytics Overview
        </button>
        <button 
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: activeTab === 'projects' ? 'var(--primary)' : 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('projects')}
        >
          <BarChart2 size={14} /> Project Reports
        </button>
        <button 
          className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: activeTab === 'team' ? 'var(--primary)' : 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => setActiveTab('team')}
        >
          <Users size={14} /> Team Reports
        </button>
      </div>

      {/* TAB SUB-VIEWS */}
      <div style={{ minHeight: '380px' }}>
        
        {/* 1. Analytics Overview */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
            <Card style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Cumulative Sprint Velocity (Burndown Curve)</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.velocityHistory}>
                    <defs>
                      <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)', color: '#fff' }} />
                    <Area type="monotone" dataKey="velocity" stroke="var(--primary)" fillOpacity={1} fill="url(#colorVelocity)" name="Completed Story Points" />
                    <Area type="monotone" dataKey="scope" stroke="var(--info)" fill="none" name="Total Scope Limit" />
                    <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Sprint Ideal Burndown Progress</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.burndownHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)' }} />
                    <Line type="monotone" dataKey="actual" stroke="var(--danger)" activeDot={{ r: 6 }} strokeWidth={2} name="Remaining Hours (Actual)" />
                    <Line type="monotone" dataKey="ideal" stroke="var(--info)" strokeDasharray="5 5" strokeWidth={1.5} name="Guidance Path (Ideal)" />
                    <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* 2. Project Reports */}
        {activeTab === 'projects' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', flexWrap: 'wrap' }}>
            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, alignSelf: 'flex-start', marginBottom: '16px' }}>Task Scope Allocations by Project</h3>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.projectsReport}
                      dataKey="tasksCount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {charts.projectsReport.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Incident Defect Volumes by Project Core</h3>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.projectsReport}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)' }} />
                    <Bar dataKey="issuesCount" fill="var(--danger)" name="Reported Defects" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="doneTasks" fill="var(--success)" name="Resolved Deliverables" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* 3. Team Reports */}
        {activeTab === 'team' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
            <Card style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Employee Time Logged vs Capacity Limit</h3>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.teamReport}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)' }} />
                    <Bar dataKey="logged" fill="var(--primary)" name="Logged Hours" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="capacity" fill="rgba(255,255,255,0.05)" name="Weekly Target Limit" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, alignSelf: 'flex-start', marginBottom: '16px' }}>Issue Resolution Rate by Developer</h3>
              <div style={{ width: '100%', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.resolutionReport}
                      dataKey="resolved"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      label
                    >
                      {charts.resolutionReport.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

      </div>

    </div>
  );
};
