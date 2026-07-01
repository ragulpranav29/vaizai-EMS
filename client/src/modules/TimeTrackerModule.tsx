import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, Plus, Download, Calendar, BarChart2 } from 'lucide-react';

import { Button } from '../components/Button';
import { Input, Select, Textarea, Checkbox } from '../components/Input';
import { Card, Tabs } from '../components/Common';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTimeLogs, logTime as logTimeThunk } from '../store/slices/timeTrackingSlice';
import { fetchTasks } from '../store/slices/tasksSlice';
import { PageHeader } from '../components/ui';

export const TimeTrackerModule: React.FC<{ serverOnline: boolean }> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'timer' | 'timesheet' | 'reports'>('timer');

  const logs = useAppSelector(state => state.timeTracking.logs);
  const logsLoading = useAppSelector(state => state.timeTracking.loading);
  const tasks = useAppSelector(state => state.tasks.tasks);
  const tasksLoading = useAppSelector(state => state.tasks.loading);

  const loading = (logsLoading && logs.length === 0) || (tasksLoading && tasks.length === 0);

  // Active Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTaskId, setTimerTaskId] = useState('');
  
  // Modal log states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logTaskId, setLogTaskId] = useState('');
  const [logHours, setLogHours] = useState<number>(0);
  const [logDesc, setLogDesc] = useState('');
  const [logMember, setLogMember] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Search/Filters
  const [searchMember, setSearchMember] = useState('all');

  const fetchData = (force = false) => {
    dispatch(fetchTimeLogs({ serverOnline, forceRefresh: force }));
    dispatch(fetchTasks({ serverOnline, forceRefresh: force }));
  };

  useEffect(() => {
    fetchData();
  }, [serverOnline]);

  // Timer Tick Hook
  useEffect(() => {
    let intervalId: any;
    if (isTimerRunning && !isTimerPaused) {
      intervalId = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isTimerRunning, isTimerPaused]);

  const formatTimerDigits = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleStartTimer = () => {
    if (!timerTaskId) {
      addToast('Validation Error', 'Please select a task to track time!', 'warning');
      return;
    }
    setIsTimerRunning(true);
    setIsTimerPaused(false);
    addToast('Timer Started', 'Stopwatch live tracker activated.', 'success');
  };

  const handlePauseTimer = () => {
    setIsTimerPaused(true);
    addToast('Timer Paused', 'Stopwatch tracker paused.', 'info');
  };

  const handleResumeTimer = () => {
    setIsTimerPaused(false);
    addToast('Timer Resumed', 'Stopwatch tracker resumed.', 'success');
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(false);
    
    const computedHours = Number((timerSeconds / 3600).toFixed(2));
    setLogTaskId(timerTaskId);
    setLogHours(computedHours > 0 ? computedHours : 0.25); // Min 15 mins (0.25h) fallback
    setLogMember(localStorage.getItem('emp_username') || 'Sarah Connor');
    setIsBillable(true);
    
    setIsLogModalOpen(true);
    setTimerSeconds(0);
  };

  const handleSaveTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTaskId || logHours <= 0) return;

    const selTask = tasks.find(t => t.id === logTaskId || t.key === logTaskId);
    const payload = {
      taskId: logTaskId,
      taskTitle: selTask?.title || 'Unknown Task',
      durationHours: Number(logHours),
      description: logDesc,
      date: new Date().toISOString().split('T')[0],
      memberName: logMember || 'Anonymous',
      billable: isBillable
    };

    try {
      await dispatch(logTimeThunk({ log: payload, serverOnline })).unwrap();
      addToast('Time Logged', 'Time entry saved successfully.', 'success');
      setIsLogModalOpen(false);
      setLogDesc('');
      fetchData(true);
    } catch (err) {
      addToast('Failed to Log', 'Could not record time log entry.', 'error');
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Member', 'Task Title', 'Duration (Hours)', 'Billable', 'Description'];
    const rows = logs.map(l => [l.date, l.memberName, l.taskTitle, l.durationHours, (l as any).billable ? 'YES' : 'NO', l.description]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `emp_timesheet_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Exported', 'Downloaded emp_timesheet_export.csv', 'success');
  };

  // Filter logs by member
  const filteredLogs = logs.filter(l => 
    searchMember === 'all' ? true : l.memberName === searchMember
  );

  const getWeeklyMatrix = () => {
    // Group logs by employee name
    const employeeLogs: { [key: string]: { [dayIdx: number]: number } } = {};
    
    logs.forEach(log => {
      const date = new Date(log.date);
      // Map date to day index (0 for Mon, 6 for Sun)
      let dayIdx = date.getDay() - 1; 
      if (dayIdx === -1) dayIdx = 6; // Sunday fix
      
      if (!employeeLogs[log.memberName]) {
        employeeLogs[log.memberName] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      }
      
      if (dayIdx >= 0 && dayIdx <= 6) {
        employeeLogs[log.memberName][dayIdx] += log.durationHours;
      }
    });

    return Object.keys(employeeLogs).map(name => {
      const dayHours = employeeLogs[name];
      const total = Object.values(dayHours).reduce((sum, h) => sum + h, 0);
      return {
        name,
        mon: Number(dayHours[0].toFixed(1)),
        tue: Number(dayHours[1].toFixed(1)),
        wed: Number(dayHours[2].toFixed(1)),
        thu: Number(dayHours[3].toFixed(1)),
        fri: Number(dayHours[4].toFixed(1)),
        sat: Number(dayHours[5].toFixed(1)),
        sun: Number(dayHours[6].toFixed(1)),
        total: Number(total.toFixed(1))
      };
    });
  };

  const timesheetRows = getWeeklyMatrix();

  // CHARTS DATA PREPARATION
  const chartDataMap = logs.reduce((acc: { [key: string]: { name: string; billable: number; nonBillable: number } }, current) => {
    const name = current.memberName.split(' ')[0];
    if (!acc[name]) {
      acc[name] = { name, billable: 0, nonBillable: 0 };
    }
    if ((current as any).billable || (current as any).billable === undefined) {
      acc[name].billable += current.durationHours;
    } else {
      acc[name].nonBillable += current.durationHours;
    }
    return acc;
  }, {});

  const reportsChartData = Object.values(chartDataMap);

  const getUniqueMembers = () => {
    const list = new Set(logs.map(l => l.memberName));
    return Array.from(list);
  };

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)' }}>Loading timesheets...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <PageHeader
        title="Stopwatch & Timesheets"
        subtitle="Track task effort hours, view weekly timesheet cells, and export compliance reports."
        actions={
          <Tabs 
            tabs={[
              { id: 'timer', label: 'Timer & Entries', icon: <Clock size={13} /> },
              { id: 'timesheet', label: 'Weekly Timesheet', icon: <Calendar size={13} /> },
              { id: 'reports', label: 'Time Reports', icon: <BarChart2 size={13} /> }
            ]} 
            activeTab={activeTab} 
            onChange={(id) => setActiveTab(id as any)} 
          />
        }
      />

      {/* TIMER & ENTRIES TAB */}
      {activeTab === 'timer' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Left Column: Timer Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Live stopwatch */}
            <Card style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Stopwatch Tracker</span>
                <Clock size={16} color="var(--primary)" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', margin: '12px 0' }}>
                <div style={{ fontSize: '38px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--primary-hover)' }}>
                  {formatTimerDigits(timerSeconds)}
                </div>

                <Select
                  label="Select Active Task"
                  value={timerTaskId}
                  onChange={e => setTimerTaskId(e.target.value)}
                  disabled={isTimerRunning}
                  options={[
                    { value: '', label: '-- Choose Task --' },
                    ...tasks.map(t => ({ value: t.id, label: `${t.key} - ${t.title}` }))
                  ]}
                />

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  {!isTimerRunning ? (
                    <Button style={{ flex: 1 }} onClick={handleStartTimer} icon={<Play size={13} />}>
                      Start Timer
                    </Button>
                  ) : (
                    <>
                      {isTimerPaused ? (
                        <Button variant="success" style={{ flex: 1 }} onClick={handleResumeTimer} icon={<Play size={13} />}>
                          Resume
                        </Button>
                      ) : (
                        <Button variant="secondary" style={{ flex: 1 }} onClick={handlePauseTimer} icon={<Pause size={13} />}>
                          Pause
                        </Button>
                      )}
                      <Button variant="danger" style={{ flex: 1 }} onClick={handleStopTimer} icon={<Square size={13} />}>
                        Stop & Log
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Manual log trigger */}
            <Card style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>Log Work Hours Manually</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', marginTop: '4px' }}>Log hours directly without using stopwatch timer.</p>
              <Button variant="secondary" style={{ width: '100%' }} onClick={() => {
                setLogTaskId(''); setLogHours(0); setLogMember(localStorage.getItem('emp_username') || 'Sarah Connor');
                setIsBillable(true);
                setIsLogModalOpen(true);
              }} icon={<Plus size={14} />}>
                Add Log Entry
              </Button>
            </Card>

          </div>

          {/* Right Column: Time logs listing */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#fff' }}>Timesheet Ledger</span>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Select
                  label=""
                  value={searchMember}
                  onChange={e => setSearchMember(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Members' },
                    ...getUniqueMembers().map(name => ({ value: name, label: name }))
                  ]}
                  style={{ marginBottom: 0, height: '32px', padding: '2px 6px', fontSize: '12px' }}
                />
                <Button variant="secondary" onClick={exportCSV} icon={<Download size={13} />}>
                  Export
                </Button>
              </div>
            </div>

            <div style={{ flex: 1, overflowX: 'auto' }}>
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Member</th>
                    <th>Task Title</th>
                    <th>Hours</th>
                    <th>Billable</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                        No recorded time entries.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id}>
                        <td>{log.date}</td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{log.memberName}</td>
                        <td>{log.taskTitle}</td>
                        <td style={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}>{log.durationHours} hrs</td>
                        <td>
                          <span className={`badge ${(log as any).billable ? 'badge-green' : 'badge-cyan'}`}>
                            {(log as any).billable ? 'BILLABLE' : 'NON-BILLABLE'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.description}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}

      {/* WEEKLY TIMESHEET TAB */}
      {activeTab === 'timesheet' && (
        <Card style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>Weekly Team Timesheet Matrix</h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Track employee hour logs aggregations mapped across Mon-Sun weekly cells.</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="app-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Employee / Member</th>
                  <th style={{ textAlign: 'center' }}>Mon</th>
                  <th style={{ textAlign: 'center' }}>Tue</th>
                  <th style={{ textAlign: 'center' }}>Wed</th>
                  <th style={{ textAlign: 'center' }}>Thu</th>
                  <th style={{ textAlign: 'center' }}>Fri</th>
                  <th style={{ textAlign: 'center' }}>Sat</th>
                  <th style={{ textAlign: 'center' }}>Sun</th>
                  <th style={{ textAlign: 'center', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {timesheetRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No timesheet hours logged.
                    </td>
                  </tr>
                ) : (
                  timesheetRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td style={{ fontWeight: 600, color: '#fff' }}>{row.name}</td>
                      <td style={{ textAlign: 'center' }}>{row.mon > 0 ? `${row.mon}h` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{row.tue > 0 ? `${row.tue}h` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{row.wed > 0 ? `${row.wed}h` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{row.thu > 0 ? `${row.thu}h` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{row.fri > 0 ? `${row.fri}h` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{row.sat > 0 ? `${row.sat}h` : '-'}</td>
                      <td style={{ textAlign: 'center' }}>{row.sun > 0 ? `${row.sun}h` : '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-hover)' }}>{row.total} hrs</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* REPORTS GRAPH TAB */}
      {activeTab === 'reports' && (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 600, marginBottom: '20px' }}>Billable vs Non-Billable Logged Hours per Developer</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {reportsChartData.length === 0 ? (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No hours logged to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#12141e', border: '1px solid var(--border-color)', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="billable" fill="var(--success)" name="Billable Hours" stackId="a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="nonBillable" fill="var(--cyan)" name="Non-Billable Hours" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      )}

      {/* LOG TIME DIALOG MODAL */}
      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="Log Work Hours Entry">
        <form onSubmit={handleSaveTimeLog} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <Select
            label="Select Associated Task"
            value={logTaskId}
            onChange={e => setLogTaskId(e.target.value)}
            required
            options={[
              { value: '', label: '-- Choose Task --' },
              ...tasks.map(t => ({ value: t.id, label: `${t.key} - ${t.title}` }))
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Logged Hours</label>
              <input type="number" step="0.25" min="0.1" value={logHours} onChange={e => setLogHours(Number(e.target.value))} required />
            </div>
            <Input label="Log Submitter" value={logMember} onChange={e => setLogMember(e.target.value)} required />
          </div>

          <Checkbox label="This time entry is billable to the client project" checked={isBillable} onChange={e => setIsBillable(e.target.checked)} />

          <Textarea label="Description / Activity details" placeholder="Specify what work was accomplished..." rows={3} value={logDesc} onChange={e => setLogDesc(e.target.value)} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsLogModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
