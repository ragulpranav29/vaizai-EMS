import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Plus, Calendar } from 'lucide-react';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSprints, createSprint, updateSprint } from '../store/slices/sprintsSlice';
import { fetchTasks } from '../store/slices/tasksSlice';
import { KeyBadge, TaskPriorityBadge, SprintStatusBadge } from '../components/ui';

interface SprintModuleProps {
  serverOnline: boolean;
}

export const SprintModule: React.FC<SprintModuleProps> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  const sprints = useAppSelector(state => state.sprints.sprints);
  const sprintsLoading = useAppSelector(state => state.sprints.loading);
  const tasks = useAppSelector(state => state.tasks.tasks);
  const tasksLoading = useAppSelector(state => state.tasks.loading);

  const loading = (sprintsLoading && sprints.length === 0) || (tasksLoading && tasks.length === 0);

  // Form
  // const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = (force = false) => {
    dispatch(fetchSprints({ serverOnline, forceRefresh: force }));
    dispatch(fetchTasks({ serverOnline, forceRefresh: force }));
  };

  useEffect(() => {
    fetchData();
  }, [serverOnline]);

  const activeSprint = sprints.find(s => s.status === 'active');
  const futureSprints = sprints.filter(s => s.status === 'future');
  const completedSprints = sprints.filter(s => s.status === 'completed');

  // Backlog represent tasks that don't belong to any sprint or belong to a future sprint
  const backlogTasks = tasks.filter(t => !t.sprintId || sprints.find(s => s.id === t.sprintId)?.status === 'future');

  const handleStartSprint = async (sprintId: string) => {
    try {
      // Auto-complete current active sprint
      if (activeSprint) {
        await dispatch(updateSprint({ id: activeSprint.id, updates: { status: 'completed' }, serverOnline })).unwrap();
      }
      // Start target
      await dispatch(updateSprint({ id: sprintId, updates: { status: 'active' }, serverOnline })).unwrap();
      
      addToast('Sprint Started', `Sprint has been successfully activated.`, 'success');
      fetchData(true);
    } catch (err) {
      addToast('Error starting sprint', 'Unable to start sprint at this time.', 'error');
      console.error(err);
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      await dispatch(updateSprint({ id: sprintId, updates: { status: 'completed' }, serverOnline })).unwrap();
      addToast('Sprint Completed', `Sprint has been marked as completed.`, 'success');
      fetchData(true);
    } catch (err) {
      addToast('Error completing sprint', 'Unable to complete sprint at this time.', 'error');
      console.error(err);
    }
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintName) return;

    try {
      const payload = {
        name: sprintName,
        goal: sprintGoal,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
        status: 'future' as const
      };

      await dispatch(createSprint({ sprint: payload, serverOnline })).unwrap();

      addToast('Sprint Created', `New sprint "${sprintName}" has been created in backlog planning.`, 'success');
      setSprintName(''); setSprintGoal(''); setStartDate(''); setEndDate('');
      fetchData(true);
    } catch (err) {
      addToast('Error creating sprint', 'Failed to save sprint.', 'error');
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading planning board...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px' }}>
      
      {/* Column 1: Active Sprint & Backlog */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Active Sprint Panel */}
        <div className="card">
          <div className="card-title">
            <span>Active Sprint</span>
            <SprintStatusBadge status="active" />
          </div>

          {activeSprint ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{activeSprint.name}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Goal: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activeSprint.goal || 'No goal set'}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={13} /> {activeSprint.startDate} to {activeSprint.endDate}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => handleCompleteSprint(activeSprint.id)}
                  icon={<CheckCircle size={14} color="var(--success)" />}
                >
                  Complete Sprint
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', padding: '24px 0' }}>
              No active sprint cycle is currently running. Select a sprint from the schedule list to start.
            </div>
          )}
        </div>

        {/* Product Backlog List */}
        <div className="card">
          <h3 className="card-title">Product Backlog ({backlogTasks.length} Issues)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {backlogTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                Backlog is clear! All tasks are scheduled in active/historical iterations.
              </div>
            ) : (
              backlogTasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <KeyBadge value={task.key} style={{ fontSize: '10px' }} />
                    <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#fff' }}>{task.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TaskPriorityBadge priority={task.priority as any} style={{ fontSize: '10px' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{task.assignee || 'Unassigned'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Column 2: Sprint scheduler */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-title">
            <span>Planned & Past Cycles</span>
          </div>

          {/* Sprints listing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            
            {/* Future Sprints */}
            {futureSprints.map(s => (
              <div key={s.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#fff' }}>{s.name}</div>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => handleStartSprint(s.id)}
                    icon={<Play size={10} />}
                  >
                    Start
                  </Button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Goal: {s.goal || 'No goal set'}</div>
              </div>
            ))}

            {futureSprints.length === 0 && completedSprints.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No planned or past sprints available.
              </div>
            )}

            {/* Completed Sprints */}
            {completedSprints.map(s => (
              <div key={s.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', opacity: 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-secondary)' }}>{s.name}</div>
                  <SprintStatusBadge status="completed" style={{ fontSize: '9px' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Goal: {s.goal}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3: New Sprint Planning */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            <span>New Sprint Planning</span>
          </div>

          <form onSubmit={handleCreateSprint} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <Input
              label="Sprint Name"
              type="text"
              placeholder="e.g. Apollo Sprint 4"
              value={sprintName}
              onChange={e => setSprintName(e.target.value)}
              required
            />
            <Input
              label="Sprint Goal"
              type="text"
              placeholder="e.g. Finalize load tests"
              value={sprintGoal}
              onChange={e => setSprintGoal(e.target.value)}
            />
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            
            <div style={{ marginTop: '12px' }}>
              <Button type="submit" variant="primary" style={{ width: '100%' }}>
                Save Sprint
              </Button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};
