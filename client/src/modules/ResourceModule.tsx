import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BarChart2, Briefcase, Trash2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

import { Button } from '../components/Button';
import { Select } from '../components/Input';
import { Card, Tabs } from '../components/Common';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchMembers } from '../store/slices/teamsSlice';
import { fetchProjects } from '../store/slices/projectsSlice';
import { fetchTasks } from '../store/slices/tasksSlice';
import { fetchAllocations, createAllocation as createAllocationThunk, deleteAllocation as deleteAllocationThunk } from '../store/slices/resourcesSlice';
import { Badge, KeyBadge, PageHeader, FilterPanel, ModalFooter } from '../components/ui';

const COLORS = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export const ResourceModule: React.FC<{ serverOnline: boolean }> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'resources' | 'allocations' | 'charts'>('resources');

  const rawMembers = useAppSelector(state => state.teams.members);
  const projects = useAppSelector(state => state.projects.projects);
  const allocations = useAppSelector(state => state.resources.allocations);
  const tasks = useAppSelector(state => state.tasks.tasks);

  const teamsLoading = useAppSelector(state => state.teams.loading);
  const projectsLoading = useAppSelector(state => state.projects.loading);
  const resourcesLoading = useAppSelector(state => state.resources.loading);
  const tasksLoading = useAppSelector(state => state.tasks.loading);

  const loading = (teamsLoading && rawMembers.length === 0) || 
                  (projectsLoading && projects.length === 0) || 
                  (resourcesLoading && allocations.length === 0) || 
                  (tasksLoading && tasks.length === 0);

  // Compute dynamic workloads: sum estimated hours of non-done tasks assigned to developer
  const members = React.useMemo(() => {
    return rawMembers.map((m: any) => {
      const assignedHours = tasks
        .filter((t: any) => t.assignee === m.name && t.status !== 'done')
        .reduce((acc: number, t: any) => acc + (t.timeEstimated || 0), 0);
      
      return {
        ...m,
        workload: assignedHours
      };
    });
  }, [rawMembers, tasks]);

  // Allocation forms
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selMember, setSelMember] = useState('');
  const [selProject, setSelProject] = useState('');
  const [allocHours, setAllocHours] = useState<number>(20);
  const [startDate, setStartDate] = useState('2026-06-15');
  const [endDate, setEndDate] = useState('2026-06-29');

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchData = (force = false) => {
    dispatch(fetchMembers({ serverOnline, forceRefresh: force }));
    dispatch(fetchProjects({ serverOnline, forceRefresh: force }));
    dispatch(fetchAllocations({ serverOnline, forceRefresh: force }));
    dispatch(fetchTasks({ serverOnline, forceRefresh: force }));
  };

  useEffect(() => {
    fetchData();
  }, [serverOnline]);

  const handleAssignResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selMember || !selProject || allocHours <= 0) return;

    const payload = {
      memberName: selMember,
      projectName: selProject,
      allocatedHours: Number(allocHours),
      startDate,
      endDate
    };

    try {
      await dispatch(createAllocationThunk({ allocation: payload, serverOnline })).unwrap();
      addToast('Resource Assigned', `Successfully allocated ${selMember} to ${selProject}`, 'success');
      setShowAssignModal(false);
      fetchData(true);
    } catch (err) {
      addToast('Assignment Failed', 'Could not save resource allocation.', 'error');
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    if (!confirm("Remove this project resource allocation?")) return;
    try {
      await dispatch(deleteAllocationThunk({ id, serverOnline })).unwrap();
      addToast('Allocation Erased', 'Successfully removed resource project mapping.', 'success');
      fetchData(true);
    } catch (err) {
      addToast('Deletion Failed', 'Failed to erase project allocation.', 'error');
    }
  };

  const getAvailabilityBadge = (workload: number, capacity: number) => {
    if (workload > capacity) return <Badge className="badge-red">OVERALLOCATED</Badge>;
    if (workload === capacity) return <Badge className="badge-purple">FULLY BOOKED</Badge>;
    if (workload > 0) return <Badge className="badge-amber">PARTIAL AVAILABLE</Badge>;
    return <Badge className="badge-green">AVAILABLE</Badge>;
  };

  const filteredMembers = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'all' ? true : m.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchSearch && matchRole;
  });

  // Recharts payload structure
  const workloadChartData = members.map(m => ({
    name: m.name.split(' ')[0],
    load: m.workload,
    capacity: m.capacity || 40
  }));

  // Pie chart project load summary
  const projectChartData = allocations.reduce((acc: any[], current) => {
    const match = acc.find(item => item.name === current.projectName);
    if (match) {
      match.value += current.allocatedHours;
    } else {
      acc.push({ name: current.projectName, value: current.allocatedHours });
    }
    return acc;
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Analyzing resource loads...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <PageHeader
        title="Resource Allocation"
        subtitle="Monitor workload capacity thresholds, project timelines, and allocations."
        actions={
          <>
            <Tabs 
              tabs={[
                { id: 'resources', label: 'Resources Board', icon: <Briefcase size={13} /> },
                { id: 'allocations', label: 'Allocation Board', icon: <Calendar size={13} /> },
                { id: 'charts', label: 'Workload Charts', icon: <BarChart2 size={13} /> }
              ]} 
              activeTab={activeTab} 
              onChange={(id) => setActiveTab(id as any)} 
            />
            <Button variant="primary" onClick={() => {
              setSelMember(members[0]?.name || '');
              setSelProject(projects[0]?.name || '');
              setShowAssignModal(true);
            }} icon={<Plus size={15} />}>
              Assign Resource
            </Button>
          </>
        }
      />

      {/* RESOURCES DIRECTORY VIEW */}
      {activeTab === 'resources' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <FilterPanel
            search={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search name or role...' }}
            filters={[
              { key: 'role', value: roleFilter, onChange: setRoleFilter, options: [
                { value: 'all', label: 'All Roles' },
                { value: 'developer', label: 'Developers' },
                { value: 'owner', label: 'Product Owners' },
                { value: 'engineer', label: 'QA / Testing' },
                { value: 'devops', label: 'DevOps' }
              ]}
            ]}
          />

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {filteredMembers.map(member => {
              const usagePercent = Math.round((member.workload / member.capacity) * 100);
              const isOverloaded = member.workload > member.capacity;
              
              return (
                <Card 
                  key={member.id} 
                  hoverable 
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', borderLeft: isOverloaded ? '3px solid var(--danger)' : 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff'
                      }}>
                        {member.avatar || member.name[0]}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>{member.name}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{member.role}</p>
                      </div>
                    </div>

                    {getAvailabilityBadge(member.workload, member.capacity)}
                  </div>

                  {/* Progress workload bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Allocated Active tasks: {member.workload} hrs</span>
                      <span style={{ fontWeight: 'bold', color: isOverloaded ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {usagePercent}% Capacity
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(usagePercent, 100)}%`, 
                        height: '100%', 
                        background: isOverloaded ? 'var(--danger)' : 'var(--primary)',
                        borderRadius: '4px' 
                      }}></div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max Capacity: {member.capacity} hrs/week</div>
                  </div>

                  {/* Skill tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px' }}>
                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>TypeScript</span>
                    <span className="badge badge-cyan" style={{ fontSize: '10px' }}>React</span>
                    {member.role.toLowerCase().includes('lead') && <span className="badge badge-amber" style={{ fontSize: '10px' }}>Architecture</span>}
                    {member.role.toLowerCase().includes('qa') && <span className="badge badge-green" style={{ fontSize: '10px' }}>Testing</span>}
                  </div>
                </Card>
              );
            })}
          </div>

        </div>
      )}

      {/* ALLOCATIONS BOARD TIMELINE */}
      {activeTab === 'allocations' && (
        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', margin: 0 }}>Project Resource Allocations Board</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Monitor resource assignment blocks, timelines, and logged work commitments.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Employee Member</th>
                  <th>Assigned Project</th>
                  <th>Commitment hours/wk</th>
                  <th>Timeline Range</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No project allocations currently scheduled.
                    </td>
                  </tr>
                ) : (
                  allocations.map(alloc => (
                    <tr key={alloc.id}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{alloc.memberName}</td>
                      <td>
                      <KeyBadge value={alloc.projectName} />
                      </td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-hover)' }}>{alloc.allocatedHours} hrs/week</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        📅 {alloc.startDate} to {alloc.endDate}
                      </td>
                      <td>
                        <Button iconOnly variant="ghost" onClick={() => handleDeleteAllocation(alloc.id)}>
                          <Trash2 size={13} color="var(--danger)" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* WORKLOAD CHARTS */}
      {activeTab === 'charts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
          
          <Card style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '16px' }}>Worked task allocation hours vs capacity limit</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="load" fill="var(--primary)" name="Tracked Load (Hrs)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="capacity" fill="rgba(255,255,255,0.04)" name="Standard Threshold Limit" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600, alignSelf: 'flex-start', marginBottom: '16px' }}>Project hour allocations distribution</h3>
            <div style={{ width: '100%', height: '280px' }}>
              {projectChartData.length === 0 ? (
                <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No allocations logs to chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {projectChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

        </div>
      )}

      {/* ASSIGN RESOURCE MODAL */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Project Resource Allocation">
        <form onSubmit={handleAssignResource} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <Select 
            label="Select Team Member"
            value={selMember}
            onChange={e => setSelMember(e.target.value)}
            options={members.map(m => ({ value: m.name, label: m.name }))}
            required
          />

          <Select 
            label="Select Associated Project"
            value={selProject}
            onChange={e => setSelProject(e.target.value)}
            options={projects.map(p => ({ value: p.name, label: p.name }))}
            required
          />

          <div className="form-group">
            <label>Allocated Hours per Week</label>
            <input 
              type="number" 
              min={1} 
              max={60} 
              value={allocHours} 
              onChange={e => setAllocHours(Number(e.target.value))} 
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Allocation Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Allocation End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>

          <ModalFooter onCancel={() => setShowAssignModal(false)} submitLabel="Confirm Allocation" />

        </form>
      </Modal>

    </div>
  );
};
