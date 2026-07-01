import React, { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Trash2, Plus, Zap, Play, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Card, Tabs } from '../components/Common';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchRules,
  fetchLogs,
  createRule,
  toggleRule,
  deleteRule,
  optimisticToggle,
} from '../store/slices/automationSlice';
import { PageHeader } from '../components/ui';

export const AutomationModule: React.FC<{ serverOnline: boolean }> = ({ serverOnline }) => {
  const { addToast } = useToast();
  const dispatch = useAppDispatch();
  const { rules, logs, loading } = useAppSelector(state => state.automation);

  const [activeTab, setActiveTab] = useState<'rules' | 'builder' | 'logs'>('rules');

  // Builder node configurations (local form state — not global data)
  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<'task_created' | 'status_changed' | 'high_priority_issue'>('status_changed');
  const [actionType, setActionType] = useState<'assign_to' | 'change_status' | 'trigger_alert'>('assign_to');
  const [triggerValue, setTriggerValue] = useState('done');
  const [actionTarget, setActionTarget] = useState('T-800 Cyberdyne');

  useEffect(() => {
    dispatch(fetchRules());
    dispatch(fetchLogs());
  }, [dispatch, serverOnline]);

  const handleToggle = async (id: string, currentActive: boolean) => {
    const targetState = !currentActive;
    // Optimistic update
    dispatch(optimisticToggle({ id, active: targetState }));
    const result = await dispatch(toggleRule({ id, active: targetState }));
    if (toggleRule.fulfilled.match(result)) {
      addToast('Rule Updated', `Rule status toggled to: ${targetState ? 'ACTIVE' : 'INACTIVE'}`, 'success');
    } else {
      // Revert optimistic update on failure
      dispatch(optimisticToggle({ id, active: currentActive }));
      addToast('Toggle Failed', 'Could not toggle rule state.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this automation rule?')) return;
    const result = await dispatch(deleteRule(id));
    if (deleteRule.fulfilled.match(result)) {
      addToast('Rule Erased', 'Successfully deleted workflow automation rule.', 'success');
    } else {
      addToast('Delete Failed', 'Failed to erase automation rule.', 'error');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) {
      addToast('Validation Error', 'Please enter a name for the rule!', 'warning');
      return;
    }

    const configPayload = {
      triggerValue: triggerEvent === 'status_changed' ? triggerValue : undefined,
      target: actionTarget,
    };

    const payload = {
      name: ruleName,
      triggerEvent,
      actionType,
      config: JSON.stringify(configPayload),
      active: true,
    };

    const result = await dispatch(createRule(payload));
    if (createRule.fulfilled.match(result)) {
      addToast('Rule Registered', `Workflow rule "${ruleName}" successfully created.`, 'success');
      setRuleName('');
      setActiveTab('rules');
    } else {
      addToast('Save Failed', 'Could not register automation rule.', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Syncing automation configurations...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <PageHeader
        title="Workflow Automation"
        subtitle="Automate task lifecycles, assignments, and notifications via simple rules."
        actions={
          <Tabs 
            tabs={[
              { id: 'rules', label: 'Active Rules', icon: <Zap size={13} /> },
              { id: 'builder', label: 'Workflow Builder', icon: <Plus size={13} /> },
              { id: 'logs', label: 'Execution Logs', icon: <Play size={13} /> }
            ]} 
            activeTab={activeTab} 
            onChange={(id) => setActiveTab(id as any)} 
          />
        }
      />

      {/* ACTIVE RULES VIEW */}
      {activeTab === 'rules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {rules.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No active workflow automation rules configured.
            </div>
          ) : (
            rules.map(rule => {
              const config = JSON.parse(rule.config);
              return (
                <Card 
                  key={rule.id} 
                  hoverable
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderLeft: `3px solid ${rule.active ? 'var(--primary)' : 'var(--text-muted)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, margin: 0 }}>{rule.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        Trigger: <code style={{ color: 'var(--primary-hover)' }}>{rule.triggerEvent}</code>
                        {config.triggerValue && ` (${config.triggerValue})`}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Action: <code style={{ color: 'var(--info)' }}>{rule.actionType}</code> to <span style={{ fontWeight: 600 }}>{config.target}</span>
                      </p>
                    </div>

                    <button 
                      onClick={() => handleToggle(rule.id, rule.active)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {rule.active ? (
                        <ToggleRight size={28} color="var(--primary)" />
                      ) : (
                        <ToggleLeft size={28} color="var(--text-muted)" />
                      )}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '12px', marginTop: '12px' }}>
                    <Button iconOnly variant="ghost" onClick={() => handleDelete(rule.id)}>
                      <Trash2 size={13} color="var(--danger)" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* VISUAL WORKFLOW BUILDER TAB */}
      {activeTab === 'builder' && (
        <form onSubmit={handleCreateRule} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Node Canvas Flowchart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Interactive Workflow Node Canvas</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rules flow sequentially from Trigger ➔ Condition ➔ Action</span>
            </div>

            {/* Canvas Block */}
            <div style={{
              background: 'rgba(5,5,8,0.4)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              alignItems: 'center',
              position: 'relative'
            }}>
              
              {/* Node 1: Trigger */}
              <div style={{ width: '100%', maxWidth: '320px', background: 'rgba(168,85,247,0.05)', border: '1px dashed var(--primary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary-hover)', textTransform: 'uppercase', marginBottom: '8px' }}>⚡ Trigger Node</div>
                <Select
                  label="When this event happens:"
                  value={triggerEvent}
                  onChange={e => setTriggerEvent(e.target.value as any)}
                  options={[
                    { value: 'status_changed', label: 'Task status changes' },
                    { value: 'task_created', label: 'Task is created' },
                    { value: 'high_priority_issue', label: 'Critical issue is raised' }
                  ]}
                  style={{ marginBottom: 0 }}
                />
              </div>

              <ArrowRight size={20} color="var(--text-muted)" style={{ transform: 'rotate(90deg)', margin: '-6px 0' }} />

              {/* Node 2: Condition */}
              <div style={{ width: '100%', maxWidth: '320px', background: 'rgba(245,158,11,0.05)', border: '1px dashed var(--warning)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning-hover)', textTransform: 'uppercase', marginBottom: '8px' }}>⚙️ Condition Node</div>
                
                {triggerEvent === 'status_changed' ? (
                  <Select
                    label="And status transitions specifically to:"
                    value={triggerValue}
                    onChange={e => setTriggerValue(e.target.value)}
                    options={[
                      { value: 'backlog', label: 'Backlog' },
                      { value: 'todo', label: 'Todo' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'done', label: 'Done' }
                    ]}
                    style={{ marginBottom: 0 }}
                  />
                ) : (
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', padding: '8px 0' }}>
                    No conditions required for this trigger type.
                  </div>
                )}
              </div>

              <ArrowRight size={20} color="var(--text-muted)" style={{ transform: 'rotate(90deg)', margin: '-6px 0' }} />

              {/* Node 3: Action */}
              <div style={{ width: '100%', maxWidth: '320px', background: 'rgba(6,182,212,0.05)', border: '1px dashed var(--info)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--info-hover)', textTransform: 'uppercase', marginBottom: '8px' }}>🎯 Action Node</div>
                <Select
                  label="Then execute this action:"
                  value={actionType}
                  onChange={e => setActionType(e.target.value as any)}
                  options={[
                    { value: 'assign_to', label: 'Assign task/issue to team member' },
                    { value: 'change_status', label: 'Transition task status' },
                    { value: 'trigger_alert', label: 'Dispatch WebSocket channel notification' }
                  ]}
                />

                <Select
                  label="Target recipient:"
                  value={actionTarget}
                  onChange={e => setActionTarget(e.target.value)}
                  options={[
                    { value: 'John Doe', label: 'John Doe (Lead Developer)' },
                    { value: 'Marcus Wright', label: 'Marcus Wright (Fullstack Dev)' },
                    { value: 'T-800 Cyberdyne', label: 'T-800 Cyberdyne (QA Engineer)' },
                    { value: 'Kyle Reese', label: 'Kyle Reese (DevOps)' }
                  ]}
                  style={{ marginBottom: 0 }}
                />
              </div>

            </div>
          </div>

          {/* Configuration Parameters Panel */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600, margin: 0 }}>Workflow Properties</h3>
            
            <Input
              label="Rule Name Identifier"
              placeholder="e.g. Set QA on Done tasks"
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              required
            />

            <Button type="submit" style={{ marginTop: '12px' }}>
              Compile &amp; Save Rule
            </Button>
          </Card>

        </form>
      )}

      {/* EXECUTION AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>Execution Logs</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Chronological register of automated trigger events, status resolutions, and outputs.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Automation Rule</th>
                  <th>Trigger Event</th>
                  <th>Target Entity</th>
                  <th>Action Output</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No automation rules have executed yet.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{log.ruleName}</td>
                      <td>
                        <code style={{ fontSize: '11px', color: 'var(--primary-hover)' }}>{log.triggerEvent}</code>
                      </td>
                      <td>
                        <span className="badge badge-cyan">{log.entityKey}</span>
                      </td>
                      <td style={{ fontSize: '12.5px' }}>{log.actionExecuted}</td>
                      <td>
                        <span className={`badge ${log.status === 'success' ? 'badge-green' : 'badge-red'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
};
