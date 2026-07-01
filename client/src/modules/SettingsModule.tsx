import React, { useState } from 'react';
import { User, Shield, Bell, Palette, Globe, Link2, Upload, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Input, Textarea, Checkbox, Select } from '../components/Input';
import { Card } from '../components/Common';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  updateProfileSettings,
  updateAvatar,
  updateThemeAccent,
  updateNotificationChecks,
  updateAccountSettings,
  updateIntegrationToggles
} from '../store/slices/settingsSlice';

export const SettingsModule: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'security' | 'appearance' | 'integrations'>('profile');

  // Load profile state
  const [profileName, setProfileName] = useState(settings.profileName);
  const [profileRole, setProfileRole] = useState(settings.profileRole);
  const [profileEmail, setProfileEmail] = useState(settings.profileEmail);
  const [profileBio, setProfileBio] = useState(settings.profileBio);
  const avatarPreview = settings.avatarPreview;

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FaEnabled, setIs2FaEnabled] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateAvatar(reader.result as string));
        addToast('Avatar Selected', 'Avatar preview updated successfully.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfileSettings({
      name: profileName,
      role: profileRole,
      email: profileEmail,
      bio: profileBio
    }));
    addToast('Profile Updated', 'Your profile details have been saved to local storage.', 'success');
    window.dispatchEvent(new Event('storage')); // Trigger update across other panels
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Validation Error', 'Confirm password does not match new password.', 'error');
      return;
    }
    addToast('Password Changed', 'Security credentials updated successfully.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAccentChange = (accent: 'purple' | 'green' | 'cyan') => {
    dispatch(updateThemeAccent(accent));
    addToast('Theme Adjusted', `Appearance color palette shifted to ${accent.toUpperCase()}.`, 'success');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', minHeight: 'calc(100vh - 160px)' }}>
      
      {/* Left Settings Navigation Pane */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
          style={{ background: activeTab === 'profile' ? 'var(--primary-glow)' : 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} /> <span style={{ fontSize: '13px' }}>Profile Settings</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
          style={{ background: activeTab === 'account' ? 'var(--primary-glow)' : 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={() => setActiveTab('account')}
        >
          <Globe size={16} /> <span style={{ fontSize: '13px' }}>Account Settings</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
          style={{ background: activeTab === 'notifications' ? 'var(--primary-glow)' : 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} /> <span style={{ fontSize: '13px' }}>Notifications</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
          style={{ background: activeTab === 'security' ? 'var(--primary-glow)' : 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={() => setActiveTab('security')}
        >
          <Shield size={16} /> <span style={{ fontSize: '13px' }}>Security</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'appearance' ? 'active' : ''}`}
          style={{ background: activeTab === 'appearance' ? 'var(--primary-glow)' : 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={() => setActiveTab('appearance')}
        >
          <Palette size={16} /> <span style={{ fontSize: '13px' }}>Appearance</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'integrations' ? 'active' : ''}`}
          style={{ background: activeTab === 'integrations' ? 'var(--primary-glow)' : 'none', border: 'none', width: '100%', textAlign: 'left' }}
          onClick={() => setActiveTab('integrations')}
        >
          <Link2 size={16} /> <span style={{ fontSize: '13px' }}>Integrations</span>
        </button>
      </div>

      {/* Right Details Panel */}
      <Card style={{ padding: '28px' }}>
        
        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Public Profile</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Configure your identities, role listings, and profile bio descriptions.</p>
            </div>

            {/* Avatar Section */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: avatarPreview ? `url(${avatarPreview}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', color: '#fff',
                border: '1px solid var(--border-color)', flexShrink: 0
              }}>
                {!avatarPreview && profileName.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Change Profile Avatar</span>
                <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}>
                  <Upload size={13} /> Select File
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <Input label="Full Name" value={profileName} onChange={e => setProfileName(e.target.value)} required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Company Email" type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} required />
              <Input label="Work Role Title" value={profileRole} onChange={e => setProfileRole(e.target.value)} required />
            </div>

            <Textarea label="Biography / Skills Bio" rows={3} value={profileBio} onChange={e => setProfileBio(e.target.value)} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Account Settings</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Manage language configurations, timezones, and account states.</p>
            </div>

            <Select
              label="System Language"
              value={settings.lang}
              onChange={e => {
                dispatch(updateAccountSettings({ lang: e.target.value, timezone: settings.timezone }));
                addToast('Language Changed', 'System language preference updated.', 'success');
              }}
              options={[
                { value: 'en', label: 'English (US)' },
                { value: 'es', label: 'Español' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fr', label: 'Français' }
              ]}
            />

            <Select
              label="Standard Timezone"
              value={settings.timezone}
              onChange={e => {
                dispatch(updateAccountSettings({ lang: settings.lang, timezone: e.target.value }));
                addToast('Timezone Changed', 'Standard timezone preference updated.', 'success');
              }}
              options={[
                { value: 'UTC-5:00', label: 'Eastern Standard Time (EST)' },
                { value: 'UTC+0:00', label: 'Coordinated Universal Time (UTC)' },
                { value: 'UTC+1:00', label: 'Central European Time (CET)' },
                { value: 'UTC+5:30', label: 'India Standard Time (IST)' }
              ]}
            />

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
              <h4 style={{ fontSize: '14.5px', color: 'var(--danger)', fontWeight: 600 }}>Deactivate Account</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '14px' }}>Permanently erase your credentials and task logs history from the SQLite database.</p>
              <Button variant="danger" size="sm" onClick={() => addToast('Not Available', 'Mock account deactivation triggered.', 'warning')}>Deactivate Account...</Button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Notification Preferences</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Select channels through which you wish to receive system alert updates.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Checkbox label="Send email digest sheets on weekly project velocity reports" checked={settings.notifyEmail} onChange={e => {
                dispatch(updateNotificationChecks({ notifyEmail: e.target.checked }));
              }} />
              <Checkbox label="Trigger desktop browser push notifications on active task updates" checked={settings.notifySockets} onChange={e => {
                dispatch(updateNotificationChecks({ notifySockets: e.target.checked }));
              }} />
              <Checkbox label="Stream automation rule triggers alerts directly into channel chat feeds" checked={settings.notifyAutomations} onChange={e => {
                dispatch(updateNotificationChecks({ notifyAutomations: e.target.checked }));
              }} />
              <Checkbox label="Forward critical incident tracker bugs to corporate Slack channels" checked={settings.notifySlack} onChange={e => {
                dispatch(updateNotificationChecks({ notifySlack: e.target.checked }));
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
              <Button onClick={() => addToast('Preferences Saved', 'Notification checklists stored successfully.', 'success')}>Save Preferences</Button>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Security Configuration</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Rotate authentication credentials and configure multi-factor parameters.</p>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={14} /> Change Account Password</h4>
              <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
              <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              <Button type="submit" size="sm" style={{ alignSelf: 'flex-start' }}>Update Password</Button>
            </form>

            {/* 2FA Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '14px', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={15} /> Two-Factor Authentication (2FA)</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>Add an extra layer of protection by requiring a verification code on login.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <Checkbox label="Enable authentication code security layer" checked={is2FaEnabled} onChange={e => {
                  setIs2FaEnabled(e.target.checked);
                  addToast('2FA Configured', `2FA security parameters configured to: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'warning');
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Theme & Appearance</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Shift interface colors, accent selections, and contrast gradients.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Accent Colors</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                
                <div 
                  onClick={() => handleAccentChange('purple')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    background: 'rgba(168, 85, 247, 0.05)', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#a855f7' }}></div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>Classic Purple</span>
                </div>

                <div 
                  onClick={() => handleAccentChange('green')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    background: 'rgba(16, 185, 129, 0.05)', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>Emerald Green</span>
                </div>

                <div 
                  onClick={() => handleAccentChange('cyan')}
                  style={{
                    flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    background: 'rgba(6, 182, 212, 0.05)', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#06b6d4' }}></div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#fff' }}>Cyberpunk Cyan</span>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>Connected Integrations</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>Connect the EPMS platform to corporate channels, repositories, and chats.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#fff', display: 'block' }}>Slack Webhooks API</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Send instant messaging alerts to Slack workspace on critical bug events.</span>
                </div>
                <Checkbox label="" checked={settings.isSlackConnected} onChange={e => {
                  dispatch(updateIntegrationToggles({ isSlackConnected: e.target.checked }));
                  addToast('Integration Updated', `Slack channel connection status toggled.`, 'info');
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#fff', display: 'block' }}>Microsoft Teams Alerts</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Publish notifications inside Microsoft Teams developer tabs.</span>
                </div>
                <Checkbox label="" checked={settings.isTeamsConnected} onChange={e => {
                  dispatch(updateIntegrationToggles({ isTeamsConnected: e.target.checked }));
                  addToast('Integration Updated', `Microsoft Teams integration status toggled.`, 'info');
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#fff', display: 'block' }}>GitHub Repos Sync</span>
                  <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Link commits directly to Task Keys (e.g. `APO-1`) automatically.</span>
                </div>
                <Checkbox label="" checked={settings.isGithubConnected} onChange={e => {
                  dispatch(updateIntegrationToggles({ isGithubConnected: e.target.checked }));
                  addToast('Integration Updated', `GitHub sync integration status toggled.`, 'info');
                }} />
              </div>

            </div>
          </div>
        )}

      </Card>
    </div>
  );
};
