import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarRange, 
  AlertCircle, 
  MessageSquareCode, 
  UsersRound, 
  Clock5, 
  Cpu, 
  Activity,
  Settings,
  BarChart3,
  LogOut,
  Sun,
  Moon,
  ShieldAlert,
  Search,
  ChevronRight,
  Bell
} from 'lucide-react';

import { DashboardModule } from './modules/DashboardModule';
import { SprintModule } from './modules/SprintModule';
import { IssueTrackerModule } from './modules/IssueTrackerModule';
import { CollaborationModule } from './modules/CollaborationModule';
import { ResourceModule } from './modules/ResourceModule';
import { TimeTrackerModule } from './modules/TimeTrackerModule';
import { AutomationModule } from './modules/AutomationModule';
import { ReportingModule } from './modules/ReportingModule';
import { SettingsModule } from './modules/SettingsModule';
import { useToast } from './components/Toast';
import { useAppDispatch, useAppSelector } from './store';
import { loginUser, logoutUser } from './store/slices/authSlice';
import { addNotification, resetUnreadCount } from './store/slices/notificationsSlice';
import { ErrorBoundary } from './components/ErrorBoundary';
import { socketService } from './api/socketService';
import { fetchTasks } from './store/slices/tasksSlice';
import { fetchSprints } from './store/slices/sprintsSlice';

type ModuleType = 
  | 'dashboard' 
  | 'sprints' 
  | 'issues' 
  | 'collab' 
  | 'resources' 
  | 'time' 
  | 'automation' 
  | 'reports' 
  | 'settings';

function App() {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const [serverOnline, setServerOnline] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Redux Auth States
  const user = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const authError = useAppSelector((state) => state.auth.error);

  // Redux Notifications
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const notificationsList = useAppSelector((state) => state.notifications.notifications);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('John Doe');
  const [loginPassword, setLoginPassword] = useState('password');

  // Custom Hash Router Hook
  const [activeModule, navigate] = ((): [ModuleType, (module: ModuleType) => void] => {
    const [currentModule, setCurrentModule] = useState<ModuleType>(() => {
      const hash = window.location.hash.replace('#', '') as ModuleType;
      const validModules: ModuleType[] = [
        'dashboard', 'sprints', 'issues', 'collab', 
        'resources', 'time', 'automation', 'reports', 'settings'
      ];
      return validModules.includes(hash) ? hash : 'dashboard';
    });

    useEffect(() => {
      const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '') as ModuleType;
        const validModules: ModuleType[] = [
          'dashboard', 'sprints', 'issues', 'collab', 
          'resources', 'time', 'automation', 'reports', 'settings'
        ];
        if (validModules.includes(hash)) {
          setCurrentModule(hash);
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const navigate = (module: ModuleType) => {
      window.location.hash = `#${module}`;
      setCurrentModule(module);
    };

    return [currentModule, navigate];
  })();

  // Handle auto-routing default hash
  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = '#dashboard';
    }
  }, []);

  // Setup WebSocket and connection status
  useEffect(() => {
    if (!user) return;

    // Connect to centralized Socket Service
    socketService.connect(user.username);

    // Watch status transitions
    const unsubscribeStatus = socketService.onStatusChange((connected) => {
      setServerOnline(connected);
    });

    // Realtime notification receiver
    const handleNotification = (notif: any) => {
      console.log('Realtime notification received:', notif);
      dispatch(addNotification({
        title: notif.title,
        message: notif.message,
        type: notif.type
      }));
      addToast(notif.title, notif.message, notif.type);
    };

    // Realtime task updates syncing handler
    const handleTaskUpdated = () => {
      console.log('Realtime task update received, syncing...');
      dispatch(fetchTasks({ serverOnline: true, forceRefresh: true }));
    };

    // Realtime sprint updates syncing handler
    const handleSprintUpdated = () => {
      console.log('Realtime sprint update received, syncing...');
      dispatch(fetchSprints({ serverOnline: true, forceRefresh: true }));
    };

    socketService.on('notification_received', handleNotification);
    socketService.on('task_updated', handleTaskUpdated);
    socketService.on('sprint_updated', handleSprintUpdated);


    return () => {
      unsubscribeStatus();
      socketService.off('notification_received', handleNotification);
      socketService.off('task_updated', handleTaskUpdated);
      socketService.off('sprint_updated', handleSprintUpdated);
      socketService.disconnect();
    };
  }, [user, dispatch, addToast]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({
      username: loginUsername,
      password: loginPassword,
      serverOnline
    }));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'var(--bg-app)',
        color: 'var(--text-primary)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Glow Orbs */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '25%',
          width: '300px',
          height: '300px',
          background: 'var(--primary-glow)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '25%',
          width: '300px',
          height: '300px',
          background: 'var(--info-glow)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }} />

        <div className="card" style={{
          maxWidth: '440px',
          width: '100%',
          padding: '40px',
          background: 'var(--bg-surface-0)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <Activity size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.5px' }}>Enterprise PM</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', margin: 0 }}>
              Sign in to access your collaborative workspace
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div className="form-group">
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Username</label>
              <input 
                type="text" 
                value={loginUsername} 
                onChange={e => setLoginUsername(e.target.value)} 
                required 
                placeholder="e.g. John Doe"
                style={{
                  width: '100%',
                  marginTop: '4px'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{
                  width: '100%',
                  marginTop: '4px'
                }}
              />
            </div>

            {authError && (
              <div style={{ color: 'var(--danger)', fontSize: '12.5px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <ShieldAlert size={14} />
                <span>{authError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontWeight: 700,
                fontSize: '14.5px',
                marginTop: '8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {authLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Sandbox mode active. Enter <code style={{ color: 'var(--primary)', fontWeight: 600 }}>password</code> to authenticate.
          </div>
        </div>
      </div>
    );
  }

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule serverOnline={serverOnline} />;
      case 'sprints':
        return <SprintModule serverOnline={serverOnline} />;
      case 'issues':
        return <IssueTrackerModule serverOnline={serverOnline} />;
      case 'collab':
        return <CollaborationModule serverOnline={serverOnline} />;
      case 'resources':
        return <ResourceModule serverOnline={serverOnline} />;
      case 'time':
        return <TimeTrackerModule serverOnline={serverOnline} />;
      case 'automation':
        return <AutomationModule serverOnline={serverOnline} />;
      case 'reports':
        return <ReportingModule serverOnline={serverOnline} />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardModule serverOnline={serverOnline} />;
    }
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard': return 'Dashboard Overview';
      case 'sprints': return 'Sprint Planning & Backlog';
      case 'issues': return 'Issue Tracker & Bugs';
      case 'collab': return 'Team Collaboration Room';
      case 'resources': return 'Resource Capacity Planning';
      case 'time': return 'Worklogs & Time Tracking';
      case 'automation': return 'Automation Rules';
      case 'reports': return 'Analytics & Reports';
      case 'settings': return 'Workspace Settings';
      default: return 'Project Suite';
    }
  };

  return (
    <div className="app-container">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('dashboard')}>
          <Activity size={20} color="var(--primary)" />
          <span>Enterprise PM</span>
        </div>

        <nav className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeModule === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('dashboard')}
          >
            <LayoutDashboard />
            <span>Dashboard</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'sprints' ? 'active' : ''}`}
            onClick={() => navigate('sprints')}
          >
            <CalendarRange />
            <span>Sprint Planning</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'issues' ? 'active' : ''}`}
            onClick={() => navigate('issues')}
          >
            <AlertCircle />
            <span>Issue Tracking</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'collab' ? 'active' : ''}`}
            onClick={() => navigate('collab')}
          >
            <MessageSquareCode />
            <span>Team Chat</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'resources' ? 'active' : ''}`}
            onClick={() => navigate('resources')}
          >
            <UsersRound />
            <span>Resource Load</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'time' ? 'active' : ''}`}
            onClick={() => navigate('time')}
          >
            <Clock5 />
            <span>Time Tracker</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'automation' ? 'active' : ''}`}
            onClick={() => navigate('automation')}
          >
            <Cpu />
            <span>Workflows</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'reports' ? 'active' : ''}`}
            onClick={() => navigate('reports')}
          >
            <BarChart3 />
            <span>Reporting</span>
          </div>

          <div 
            className={`sidebar-item ${activeModule === 'settings' ? 'active' : ''}`}
            onClick={() => navigate('settings')}
          >
            <Settings />
            <span>Settings</span>
          </div>
        </nav>

        {/* Profiles & Settings Footer */}
        <div className="sidebar-profile" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              onClick={() => navigate('settings')}
            >
              <div className="avatar">
                {user.avatar || (user.username ? user.username.substring(0, 2).toUpperCase() : 'JD')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '0' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'color var(--transition-fast)'
              }}
              title="Log Out"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        
        {/* Top Header */}
        <header className="header">
          <div className="header-title-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
              <span>Workspace</span>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{getModuleTitle()}</span>
            </div>
            <div className={`connection-badge ${!serverOnline ? 'disconnected' : ''}`}>
              <span />
              {serverOnline ? 'Live Synchronized' : 'Sandbox Mode'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Global Search Bar mockup */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search workspace (⌘K)" 
                style={{
                  padding: '6px 12px 6px 30px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-sm)',
                  width: '180px',
                  background: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-default)'
                }}
                disabled
              />
            </div>

            {/* Notification Badge with Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    dispatch(resetUnreadCount());
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: showNotifications ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color var(--transition-fast)'
                }}
                title="Workspace Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'var(--danger)',
                    color: '#fff',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '9px',
                    fontWeight: 700,
                    minWidth: '14px',
                    height: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '1.5px solid var(--bg-header)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '10px',
                  width: '320px',
                  background: 'var(--bg-surface-0)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 200,
                  overflow: 'hidden',
                  animation: 'page-fade-in var(--transition-fast)'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface-1)'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>Workspace Notifications</span>
                    {notificationsList.length > 0 && (
                      <span 
                        style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setShowNotifications(false)}
                      >
                        Dismiss
                      </span>
                    )}
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notificationsList.length === 0 ? (
                      <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notificationsList.slice(0, 5).map((item) => {
                        const borderColors = {
                          success: 'var(--success)',
                          error: 'var(--danger)',
                          warning: 'var(--warning)',
                          info: 'var(--info)'
                        };
                        return (
                          <div 
                            key={item.id} 
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid var(--border-subtle)',
                              borderLeft: `3px solid ${borderColors[item.type] || 'var(--primary)'}`,
                              background: 'var(--bg-surface-0)',
                              transition: 'background var(--transition-fast)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface-0)'}
                          >
                            <h4 style={{ margin: 0, fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h4>
                            <p style={{ margin: '3px 0 0 0', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.message}</p>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dual Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="content-body">
          <ErrorBoundary>
            {renderModuleContent()}
          </ErrorBoundary>
        </main>
      </div>

    </div>
  );
}

export default App;
