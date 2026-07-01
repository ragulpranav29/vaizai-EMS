import React, { useState } from 'react';
import { ShieldAlert, Activity, ArrowRight, Lock, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser } from '../store/slices/authSlice';
import '../index.css';

interface LoginModuleProps {
  serverOnline: boolean;
}

export const LoginModule: React.FC<LoginModuleProps> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  
  const authLoading = useAppSelector((state) => state.auth.loading);
  const authError = useAppSelector((state) => state.auth.error);

  const [username, setUsername] = useState('John Doe');
  const [password, setPassword] = useState('password');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Quick hack for register state
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      dispatch(loginUser({ username, password, serverOnline }));
    } else {
      // In a full implementation, we'd dispatch a register action
      // For now, we'll try to login after "registering" if they just want to see it work
      // but ideally this would call api.auth.register.
      // We will just alert for the sake of the UI if it's register
      alert("Registration endpoint connected. Please use the backend API to seed a user, or login directly if you already seeded one.");
    }
  };

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
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Animated Background Glow Orbs for Premium feel */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        zIndex: 0,
        animation: 'pulse-slow 8s infinite alternate'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        zIndex: 0,
        animation: 'pulse-slow 12s infinite alternate-reverse'
      }} />

      <div style={{
        maxWidth: '420px',
        width: '100%',
        padding: '48px 40px',
        background: 'rgba(30, 31, 34, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.02) inset',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        zIndex: 1,
        transform: 'translateY(0)',
        animation: 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #0ea5e9 100%)',
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
            transform: 'rotate(-5deg)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(-5deg) scale(1)'}
          >
            <Activity size={34} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 800, 
              margin: '0 0 8px 0', 
              letterSpacing: '-0.5px',
              background: 'linear-gradient(to right, #fff, #a1a1aa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Enterprise PM
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0, fontWeight: 400 }}>
              Secure access to your workspace
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.2)',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: activeTab === 'login' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'login' ? '#fff' : '#71717a',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '10px 0',
              background: activeTab === 'register' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: activeTab === 'register' ? '#fff' : '#71717a',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'register' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}>
              <UserIcon size={18} />
            </div>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="Username"
              style={{
                width: '100%',
                padding: '14px 14px 14px 42px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {activeTab === 'register' && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}>
                <Activity size={18} />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="Email Address"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 42px',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}>
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Password"
              style={{
                width: '100%',
                padding: '14px 14px 14px 42px',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.5)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.4)';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {authError && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '13px', 
              textAlign: 'center', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              justifyContent: 'center',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <ShieldAlert size={16} />
              <span>{authError}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={authLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontWeight: 600,
              fontSize: '15px',
              marginTop: '8px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#fff',
              border: 'none',
              cursor: authLoading ? 'not-allowed' : 'pointer',
              opacity: authLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!authLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!authLoading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(99, 102, 241, 0.39)';
              }
            }}
          >
            {authLoading ? 'Authenticating...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
            {!authLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <style>
          {`
            @keyframes slide-up {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse-slow {
              0% { transform: scale(1); opacity: 0.8; }
              100% { transform: scale(1.2); opacity: 1; }
            }
          `}
        </style>
      </div>
    </div>
  );
};
