import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, TrendingUp, Layers, AlertTriangle } from 'lucide-react';
import type { Issue } from '../types';
import { Button } from '../components/Button';
import { Input, Select, Textarea } from '../components/Input';
import { DataTable } from '../components/Table';
import { Modal } from '../components/Modal';
import { Card, ConfirmationDialog } from '../components/Common';
import { useToast } from '../components/Toast';
import {
  KeyBadge,
  IssueStatusBadge,
  IssuePriorityBadge,
  KpiCard,
  PageHeader,
  FilterPanel,
  ViewToggle,
  CommentsSection,
  AttachmentsSection,
  ActivityTimeline,
  ModalFooter,
} from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchIssues as fetchIssuesThunk, createIssue, updateIssue, deleteIssue } from '../store/slices/issuesSlice';
import { fetchMembers } from '../store/slices/teamsSlice';

interface IssueTrackerModuleProps {
  serverOnline: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'bug': return <AlertTriangle size={13} color="var(--danger)" />;
    case 'feature': return <Sparkles size={13} color="var(--success)" />;
    case 'improvement': return <TrendingUp size={13} color="var(--info)" />;
    default: return <Layers size={13} color="var(--primary)" />;
  }
};

export const IssueTrackerModule: React.FC<IssueTrackerModuleProps> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const issues = useAppSelector(state => state.issues.issues);
  const issuesLoading = useAppSelector(state => state.issues.loading);
  const members = useAppSelector(state => state.teams.members);
  const membersLoading = useAppSelector(state => state.teams.loading);

  const loading = (issuesLoading && issues.length === 0) || (membersLoading && members.length === 0);

  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newType, setNewType] = useState<'bug' | 'feature' | 'improvement' | 'epic'>('bug');
  const [newAssignee, setNewAssignee] = useState('');

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailDesc, setDetailDesc] = useState('');
  const [detailStatus, setDetailStatus] = useState<'open' | 'investigating' | 'resolved' | 'closed'>('open');
  const [detailPriority, setDetailPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [detailType, setDetailType] = useState<'bug' | 'feature' | 'improvement' | 'epic'>('bug');
  const [detailAssignee, setDetailAssignee] = useState('');
  const [detailReporter, setDetailReporter] = useState('');

  const [newComment, setNewComment] = useState('');
  const [newAttachment, setNewAttachment] = useState('');

  const loadData = (force = false) => {
    dispatch(fetchIssuesThunk({ serverOnline, forceRefresh: force }));
    dispatch(fetchMembers({ serverOnline, forceRefresh: force }));
  };

  useEffect(() => { loadData(); }, [serverOnline]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const payload = {
      key: `${newType.toUpperCase().substring(0, 3)}-${100 + issues.length + 1}`,
      title: newTitle, description: newDesc, priority: newPriority, type: newType,
      status: 'open' as const,
      assignee: newAssignee || 'Unassigned',
      reporter: localStorage.getItem('emp_username') || 'Sarah Connor',
      comments: [], attachments: [],
      activities: [{ id: `act-${Date.now()}`, action: 'created the issue', time: new Date().toISOString() }]
    };
    try {
      await dispatch(createIssue({ issue: payload, serverOnline })).unwrap();
      addToast('Issue Logged', `Created ${payload.key}`, 'success');
      setNewTitle(''); setNewDesc(''); setNewAssignee('');
      setShowCreateModal(false);
      loadData(true);
    } catch { addToast('Creation Failed', 'Failed to submit issue.', 'error'); }
  };

  const handleOpenDetails = (issue: Issue) => {
    setSelectedIssue(issue);
    setDetailTitle(issue.title);
    setDetailDesc(issue.description || '');
    setDetailStatus(issue.status);
    setDetailPriority(issue.priority);
    setDetailType(issue.type);
    setDetailAssignee(issue.assignee || 'Unassigned');
    setDetailReporter(issue.reporter || 'Sarah Connor');
  };

  const handleSaveDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedIssue) return;
    const activities = [...(selectedIssue.activities || [])];
    if (selectedIssue.status !== detailStatus) {
      activities.unshift({ id: `act-${Date.now()}`, action: `updated status to [${detailStatus.toUpperCase()}]`, time: new Date().toISOString() });
    }
    try {
      await dispatch(updateIssue({ id: selectedIssue.id, updates: { title: detailTitle, description: detailDesc, status: detailStatus, priority: detailPriority, type: detailType, assignee: detailAssignee, reporter: detailReporter, activities }, serverOnline })).unwrap();
      addToast('Saved', `${selectedIssue.key} updated.`, 'success');
      setSelectedIssue(null);
      loadData(true);
    } catch { addToast('Save Failed', 'Could not update issue.', 'error'); }
  };

  const handleTransitionStatus = async (targetStatus: 'open' | 'investigating' | 'resolved' | 'closed') => {
    if (!selectedIssue) return;
    setDetailStatus(targetStatus);
    const activities = [{ id: `act-${Date.now()}`, action: `transitioned to [${targetStatus.toUpperCase()}]`, time: new Date().toISOString() }, ...(selectedIssue.activities || [])];
    try {
      await dispatch(updateIssue({ id: selectedIssue.id, updates: { status: targetStatus, activities }, serverOnline })).unwrap();
      setSelectedIssue(prev => prev ? { ...prev, status: targetStatus, activities } : null);
      addToast('Status Updated', `→ ${targetStatus.toUpperCase()}`, 'success');
    } catch { addToast('Update Failed', 'Could not transition status.', 'error'); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedIssue) return;
    const author = localStorage.getItem('emp_username') || 'John Doe';
    const comment = { id: `icomm-${Date.now()}`, author, text: newComment, date: new Date().toISOString() };
    const comments = [...(selectedIssue.comments || []), comment];
    const activities = [{ id: `act-${Date.now()}`, action: `commented: "${newComment.substring(0, 20)}..."`, time: new Date().toISOString() }, ...(selectedIssue.activities || [])];
    try {
      await dispatch(updateIssue({ id: selectedIssue.id, updates: { comments, activities }, serverOnline })).unwrap();
      setSelectedIssue(prev => prev ? { ...prev, comments, activities } : null);
      setNewComment('');
      addToast('Comment Posted', '', 'success');
    } catch { addToast('Post Failed', 'Could not save comment.', 'error'); }
  };

  const handleAddAttachment = async () => {
    if (!newAttachment.trim() || !selectedIssue) return;
    const attachment = { id: `att-${Date.now()}`, filename: newAttachment, size: '182 KB' };
    const attachments = [...(selectedIssue.attachments || []), attachment];
    const activities = [{ id: `act-${Date.now()}`, action: `attached: "${newAttachment}"`, time: new Date().toISOString() }, ...(selectedIssue.activities || [])];
    try {
      await dispatch(updateIssue({ id: selectedIssue.id, updates: { attachments, activities }, serverOnline })).unwrap();
      setSelectedIssue(prev => prev ? { ...prev, attachments, activities } : null);
      setNewAttachment('');
      addToast('Attached', newAttachment, 'success');
    } catch { addToast('Failed', 'Could not attach file.', 'error'); }
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete) return;
    try {
      await dispatch(deleteIssue({ id: issueToDelete, serverOnline })).unwrap();
      addToast('Deleted', 'Issue permanently removed.', 'success');
      setSelectedIssue(null); setShowDeleteConfirm(false); setIssueToDelete(null);
      loadData(true);
    } catch { addToast('Delete Failed', 'Failed to delete issue.', 'error'); }
  };

  // KPI calculations
  const totalCount = issues.length;
  const openCount = issues.filter(i => i.status === 'open').length;
  const investigatingCount = issues.filter(i => i.status === 'investigating').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const criticalCount = issues.filter(i => i.priority === 'critical').length;

  const filteredIssues = issues.filter(i => {
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || i.priority === priorityFilter;
    const matchType = typeFilter === 'all' || i.type === typeFilter;
    const matchSearch = !searchQuery || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchType && matchSearch;
  });

  const columns = [
    { key: 'key', header: 'Key', sortable: true, render: (row: Issue) => <KeyBadge value={row.key} /> },
    { key: 'title', header: 'Summary', sortable: true, render: (row: Issue) => (
      <span onClick={() => handleOpenDetails(row)} style={{ fontWeight: 600, color: '#fff', cursor: 'pointer' }} className="table-link">{row.title}</span>
    )},
    { key: 'type', header: 'Type', sortable: true, render: (row: Issue) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', textTransform: 'capitalize' }}>
        {getTypeIcon(row.type)} {row.type}
      </span>
    )},
    { key: 'priority', header: 'Severity', sortable: true, render: (row: Issue) => <IssuePriorityBadge priority={row.priority} /> },
    { key: 'status', header: 'Status', sortable: true, render: (row: Issue) => <IssueStatusBadge status={row.status} /> },
    { key: 'assignee', header: 'Assignee', sortable: true },
    { key: 'actions', header: '', render: (row: Issue) => (
      <Button iconOnly variant="ghost" onClick={(e) => { e.stopPropagation(); setIssueToDelete(row.id); setShowDeleteConfirm(true); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </Button>
    )}
  ];

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading incident log index...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <PageHeader
        title="Incident & Issue Tracker"
        breadcrumbs={[{ label: 'Home' }, { label: 'Incident Tracker' }]}
        actions={
          <>
            <ViewToggle
              options={[{ id: 'table', label: 'Table' }, { id: 'cards', label: 'Cards' }]}
              active={viewType}
              onChange={(id) => setViewType(id as any)}
            />
            <Button variant="primary" onClick={() => setShowCreateModal(true)} icon={<Plus size={15} />}>
              Log Defect
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        <KpiCard label="Total Tickets" value={totalCount} />
        <KpiCard label="Open Incidents" value={openCount} accent="danger" />
        <KpiCard label="Investigating" value={investigatingCount} accent="warning" />
        <KpiCard label="Resolved / Closed" value={resolvedCount} accent="success" />
        <KpiCard label="Critical Blockers" value={criticalCount} accent="#f43f5e" />
      </div>

      {/* Filter Panel */}
      <FilterPanel
        search={{ value: searchQuery, onChange: setSearchQuery, placeholder: 'Search key or summary...' }}
        filters={[
          { key: 'status', value: statusFilter, onChange: setStatusFilter, options: [{ value: 'all', label: 'All Statuses' }, { value: 'open', label: 'Open' }, { value: 'investigating', label: 'Investigating' }, { value: 'resolved', label: 'Resolved' }, { value: 'closed', label: 'Closed' }] },
          { key: 'priority', value: priorityFilter, onChange: setPriorityFilter, options: [{ value: 'all', label: 'All Severities' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }] },
          { key: 'type', value: typeFilter, onChange: setTypeFilter, options: [{ value: 'all', label: 'All Types' }, { value: 'bug', label: 'Bug' }, { value: 'feature', label: 'Feature' }, { value: 'improvement', label: 'Improvement' }, { value: 'epic', label: 'Epic' }] },
        ]}
      />

      {/* Table View */}
      {viewType === 'table' && (
        <DataTable
          columns={columns}
          data={filteredIssues}
          emptyMessage="No incident tickets recorded."
        />
      )}

      {/* Cards View */}
      {viewType === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredIssues.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No issues match the current filters.</div>
          ) : (
            filteredIssues.map(issue => (
              <Card key={issue.id} hoverable onClick={() => handleOpenDetails(issue)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <KeyBadge value={issue.key} />
                  <IssueStatusBadge status={issue.status} />
                </div>
                <h3 style={{ fontSize: '14.5px', color: '#fff', fontWeight: 600, margin: 0 }}>{issue.title}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                  {issue.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', fontSize: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{getTypeIcon(issue.type)} <span style={{ textTransform: 'capitalize' }}>{issue.type}</span></span>
                  <IssuePriorityBadge priority={issue.priority} />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Log Incident / Request Ticket">
        <form onSubmit={handleCreateIssue} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Title Summary" placeholder="e.g. Ingestion channel times out on float bounds" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
          <Textarea label="Details & Steps to Reproduce" placeholder="Specify diagnostic parameters..." rows={3} value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Select label="Issue Type" value={newType} onChange={e => setNewType(e.target.value as any)} options={[{ value: 'bug', label: 'Bug' }, { value: 'feature', label: 'Feature' }, { value: 'improvement', label: 'Improvement' }, { value: 'epic', label: 'Epic' }]} />
            <Select label="Severity" value={newPriority} onChange={e => setNewPriority(e.target.value as any)} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
            <Select label="Assignee" value={newAssignee} onChange={e => setNewAssignee(e.target.value)} options={[{ value: '', label: '-- Unassigned --' }, ...members.map(m => ({ value: m.name, label: m.name }))]} />
          </div>
          <ModalFooter onCancel={() => setShowCreateModal(false)} submitLabel="File Ticket" />
        </form>
      </Modal>

      {/* DETAILS MODAL */}
      {selectedIssue && (
        <Modal isOpen={!!selectedIssue} onClose={() => setSelectedIssue(null)} title={`${selectedIssue.key} — Issue Details`}>
          <form onSubmit={handleSaveDetails} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input label="Summary" value={detailTitle} onChange={e => setDetailTitle(e.target.value)} required style={{ fontSize: '15px', fontWeight: 600 }} />
              <Textarea label="Description" value={detailDesc} onChange={e => setDetailDesc(e.target.value)} rows={3} />

              {/* Status Stepper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Pipeline</label>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                  {(['open', 'investigating', 'resolved', 'closed'] as const).map((step, i) => {
                    const isActive = detailStatus === step;
                    return (
                      <React.Fragment key={step}>
                        {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>→</span>}
                        <button type="button" onClick={() => handleTransitionStatus(step)}
                          style={{ background: isActive ? 'var(--primary-glow)' : 'none', border: isActive ? '1px solid var(--primary)' : '1px solid transparent', color: isActive ? '#fff' : 'var(--text-secondary)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: isActive ? 600 : 400, textTransform: 'uppercase', cursor: 'pointer' }}>
                          {step}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <AttachmentsSection attachments={selectedIssue.attachments || []} newValue={newAttachment} onChange={setNewAttachment} onAdd={handleAddAttachment} />
              <CommentsSection comments={selectedIssue.comments || []} newValue={newComment} onChange={setNewComment} onAdd={handleAddComment} />
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '1px solid var(--border-color)', paddingLeft: '24px' }}>
              <Select label="Status" value={detailStatus} onChange={e => setDetailStatus(e.target.value as any)} options={[{ value: 'open', label: 'Open' }, { value: 'investigating', label: 'Investigating' }, { value: 'resolved', label: 'Resolved' }, { value: 'closed', label: 'Closed' }]} />
              <Select label="Severity" value={detailPriority} onChange={e => setDetailPriority(e.target.value as any)} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }]} />
              <Select label="Issue Type" value={detailType} onChange={e => setDetailType(e.target.value as any)} options={[{ value: 'bug', label: 'Bug' }, { value: 'feature', label: 'Feature' }, { value: 'improvement', label: 'Improvement' }, { value: 'epic', label: 'Epic' }]} />
              <Select label="Assignee" value={detailAssignee} onChange={e => setDetailAssignee(e.target.value)} options={[{ value: 'Unassigned', label: '-- Unassigned --' }, ...members.map(m => ({ value: m.name, label: m.name }))]} />
              <Input label="Reporter" value={detailReporter} onChange={e => setDetailReporter(e.target.value)} />
              <ActivityTimeline activities={selectedIssue.activities || []} maxHeight="150px" />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <ModalFooter
                onCancel={() => setSelectedIssue(null)}
                submitLabel="Save Changes"
                leftAction={
                  <Button variant="danger" type="button" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
                    onClick={() => { setIssueToDelete(selectedIssue.id); setShowDeleteConfirm(true); setSelectedIssue(null); }}>
                    Delete Issue
                  </Button>
                }
              />
            </div>
          </form>
        </Modal>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setIssueToDelete(null); }}
        onConfirm={handleDeleteIssue}
        title="Delete Issue"
        message="Are you sure you want to permanently erase this incident? This cannot be undone."
      />
    </div>
  );
};
