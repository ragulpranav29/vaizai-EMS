import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Users, MessageSquare, Search, Shield, Clock, Megaphone, Smile, AtSign } from 'lucide-react';
import type { Message, TeamMember } from '../types';
import { api } from '../api/services';
import { Button } from '../components/Button';
import { Drawer } from '../components/Drawer';
import { Card, Tabs } from '../components/Common';
import { useToast } from '../components/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchMembers } from '../store/slices/teamsSlice';
import { PageHeader } from '../components/ui';
import { socketService } from '../api/socketService';

interface CollaborationModuleProps {
  serverOnline: boolean;
}

export const CollaborationModule: React.FC<CollaborationModuleProps> = ({ serverOnline }) => {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'chat' | 'directory'>('chat');
  const [channel, setChannel] = useState('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const members = useAppSelector(state => state.teams.members);
  const [username, setUsername] = useState<string>('');
  
  // Custom states
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  
  // Search state
  const [searchMember, setSearchMember] = useState('');
  
  // Selected profile drawer
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Check login
  useEffect(() => {
    const saved = localStorage.getItem('emp_username');
    if (saved) {
      setUsername(saved);
    } else {
      const prompted = prompt("Please enter your name for team collaboration:");
      if (prompted) {
        localStorage.setItem('emp_username', prompted);
        setUsername(prompted);
      } else {
        const fallbackUser = `User-${Math.floor(Math.random() * 1000)}`;
        localStorage.setItem('emp_username', fallbackUser);
        setUsername(fallbackUser);
      }
    }
    dispatch(fetchMembers({ serverOnline }));
  }, [serverOnline]);

  // Sync WebSocket events
  useEffect(() => {
    if (socketService.getSocket() && username) {
      socketService.emit('join', { username });

      const handleMessage = (msg: Message) => {
        if (msg.channel === channel) {
          setMessages(prev => [...prev, msg]);
        } else {
          // Increment unread count
          setUnreadCounts(prev => ({
            ...prev,
            [msg.channel]: (prev[msg.channel] || 0) + 1
          }));
        }
      };

      const handleUsers = (users: string[]) => {
        setOnlineUsers(users);
      };

      const handleTypingStatus = (data: { username: string; isTyping: boolean; channel: string }) => {
        if (data.channel === channel && data.username !== username) {
          setTypingUsers(prev => {
            if (data.isTyping) {
              return prev.includes(data.username) ? prev : [...prev, data.username];
            } else {
              return prev.filter(u => u !== data.username);
            }
          });
        }
      };

      socketService.on('message_received', handleMessage);
      socketService.on('online_users_updated', handleUsers);
      socketService.on('typing_status_updated', handleTypingStatus);

      return () => {
        socketService.off('message_received', handleMessage);
        socketService.off('online_users_updated', handleUsers);
        socketService.off('typing_status_updated', handleTypingStatus);
      };
    }
  }, [username, channel]);

  // Load message logs
  const loadLogs = async () => {
    try {
      const data = await api.messages.getMessages(channel);
      setMessages(data);
      
      // Clear unread count for current channel
      setUnreadCounts(prev => ({
        ...prev,
        [channel]: 0
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
    setTypingUsers([]);
  }, [channel, serverOnline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Typing socket notification emission
    if (socketService.getSocket()) {
      socketService.emit('typing', { username, isTyping: true, channel });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit('typing', { username, isTyping: false, channel });
      }, 2000);
    }

    // Check for mentions triggers
    const words = val.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.substring(1));
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (memberName: string) => {
    const words = inputText.split(' ');
    words[words.length - 1] = `@${memberName} `;
    setInputText(words.join(' '));
    setShowMentions(false);
  };

  const insertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload = {
      channel,
      text: inputText,
      sender: username
    };

    if (serverOnline && socketService.getSocket()) {
      socketService.emit('send_message', payload);
      socketService.emit('typing', { username, isTyping: false, channel });
    } else {
      // Local Sandbox mockup append
      const mockMsg: Message = {
        id: `m-mock-${Date.now()}`,
        channel,
        text: inputText,
        sender: username,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, mockMsg]);
    }
    
    setInputText('');
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.role.toLowerCase().includes(searchMember.toLowerCase())
  );

  const isAnnouncements = channel === 'announcements';
  const isSarah = username === 'Sarah Connor';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <PageHeader
        title="Team Collaboration"
        subtitle="Chat rooms, announcements boards, and online member directory."
        actions={
          <Tabs 
            tabs={[
              { id: 'chat', label: 'Chat & Feed', icon: <MessageSquare size={14} /> },
              { id: 'directory', label: 'Team Directory', icon: <Users size={14} /> }
            ]} 
            activeTab={activeTab} 
            onChange={(id) => setActiveTab(id as any)} 
          />
        }
      />

      {/* CHAT TAB VIEW */}
      {activeTab === 'chat' && (
        <div className="chat-container">
          
          {/* Chat sidebar (channels) */}
          <div className="chat-sidebar">
            <div style={{ padding: '16px', fontWeight: 600, fontSize: '14px', borderBottom: '1px solid var(--border-color)', color: '#fff' }}>Channels</div>
            <div className="chat-channels">
              
              <div className={`chat-channel-item ${channel === 'general' ? 'active' : ''}`} onClick={() => setChannel('general')}>
                <Hash size={14} /> general
                {unreadCounts['general'] > 0 && <span className="badge badge-purple" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '10px' }}>{unreadCounts['general']}</span>}
              </div>
              
              <div className={`chat-channel-item ${channel === 'development' ? 'active' : ''}`} onClick={() => setChannel('development')}>
                <Hash size={14} /> dev-team
                {unreadCounts['development'] > 0 && <span className="badge badge-purple" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '10px' }}>{unreadCounts['development']}</span>}
              </div>

              <div className={`chat-channel-item ${channel === 'incidents' ? 'active' : ''}`} onClick={() => setChannel('incidents')}>
                <Hash size={14} /> site-reliability
                {unreadCounts['incidents'] > 0 && <span className="badge badge-purple" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '10px' }}>{unreadCounts['incidents']}</span>}
              </div>

              <div className={`chat-channel-item ${channel === 'announcements' ? 'active' : ''}`} onClick={() => setChannel('announcements')} style={{ color: 'var(--warning-hover)' }}>
                <Megaphone size={14} /> announcements
                {unreadCounts['announcements'] > 0 && <span className="badge badge-amber" style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: '10px' }}>{unreadCounts['announcements']}</span>}
              </div>

            </div>

            <div className="chat-users-title">Online Team ({onlineUsers.length})</div>
            <div className="chat-user-list">
              {onlineUsers.map((user, idx) => (
                <div key={idx} className="chat-user-item" style={{ cursor: 'pointer' }} onClick={() => {
                  const match = members.find(m => m.name === user);
                  if (match) setSelectedMember(match);
                }}>
                  <span className="user-status-dot online"></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{user}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat window */}
          <div className="chat-main">
            
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                {isAnnouncements ? <Megaphone size={18} color="var(--warning)" /> : <Hash size={18} />}
                <span style={{ fontWeight: 600 }}>{channel}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Collaborator: <span style={{ fontWeight: 'bold', color: 'var(--primary-hover)' }}>{username}</span>
              </div>
            </div>

            {/* Announcements Locked warning */}
            {isAnnouncements && !isSarah && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px 16px', margin: '12px', borderRadius: 'var(--radius-sm)' }}>
                <Shield size={14} color="var(--warning)" />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>This channel is locked. Only Product Owners (Sarah Connor) can post announcements here.</span>
              </div>
            )}

            {/* Messages body */}
            <div className="chat-messages">
              {messages.map(msg => {
                const isMe = msg.sender === username;
                const isAnnouncementMsg = msg.channel === 'announcements';
                
                // Mentions check regex
                const formattedText = msg.text.split(' ').map((word, wIdx) => {
                  if (word.startsWith('@')) {
                    return <span key={wIdx} className="badge badge-purple" style={{ margin: '0 2px' }}>{word}</span>;
                  }
                  return word + ' ';
                });

                return (
                  <div key={msg.id} className={`chat-message-bubble ${isMe ? 'me' : ''}`} style={{
                    border: isAnnouncementMsg ? '1px solid rgba(245,158,11,0.15)' : 'none',
                    background: isAnnouncementMsg ? 'rgba(245,158,11,0.02)' : undefined,
                  }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', background: isMe ? 'var(--primary-glow)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#fff',
                      border: '1px solid var(--border-color)', alignSelf: 'flex-end', flexShrink: 0
                    }}>
                      {msg.sender[0]}
                    </div>
                    
                    <div className="message-text-wrapper">
                      <div className="message-sender" style={{ textAlign: isMe ? 'right' : 'left' }}>
                        {msg.sender} 
                        {isAnnouncementMsg && <span className="badge badge-amber" style={{ fontSize: '9px', marginLeft: '6px' }}>ANNOUNCEMENT</span>}
                        <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="message-text">{formattedText}</div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicators bubble */}
              {typingUsers.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', padding: '10px 16px', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  <div className="btn-spinner" style={{ width: '8px', height: '8px', borderWidth: '1px' }}></div>
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Text Input area */}
            {(!isAnnouncements || isSarah) && (
              <form onSubmit={handleSend} className="chat-input-area" style={{ position: 'relative' }}>
                
                {/* Mentions popup overlay */}
                {showMentions && (
                  <div style={{
                    position: 'absolute', bottom: '100%', left: '16px', background: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '6px 0',
                    boxShadow: '0 -8px 24px rgba(0,0,0,0.5)', zIndex: 99, minWidth: '180px'
                  }}>
                    <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AtSign size={10} /> Mention Team Member
                    </div>
                    {members
                      .filter(m => m.name.toLowerCase().includes(mentionQuery.toLowerCase()))
                      .map(m => (
                        <div
                          key={m.id}
                          onClick={() => insertMention(m.name)}
                          style={{ padding: '8px 12px', fontSize: '12.5px', cursor: 'pointer', color: '#fff' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {m.name}
                        </div>
                      ))}
                  </div>
                )}

                {/* Emoji popover */}
                {showEmojiPicker && (
                  <div style={{
                    position: 'absolute', bottom: '100%', right: '16px', background: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px',
                    boxShadow: '0 -8px 24px rgba(0,0,0,0.5)', zIndex: 99, display: 'flex', gap: '8px'
                  }}>
                    {['😀', '👍', '🎉', '🔥', '🚀', '👀'].map(emo => (
                      <span 
                        key={emo} 
                        onClick={() => insertEmoji(emo)}
                        style={{ fontSize: '18px', cursor: 'pointer' }}
                      >
                        {emo}
                      </span>
                    ))}
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Smile size={16} />
                </button>

                <input 
                  type="text" 
                  placeholder={`Message #${channel}... (use @ to mention)`} 
                  value={inputText}
                  onChange={handleInputChange}
                />
                
                <Button type="submit" icon={<Send size={13} />}>
                  Send
                </Button>
              </form>
            )}

          </div>

        </div>
      )}

      {/* DIRECTORY TAB VIEW */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search bar */}
          <div className="card" style={{ display: 'flex', gap: '10px', padding: '12px 16px', maxWidth: '360px', alignItems: 'center' }}>
            <Search size={14} color="var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search directory by name or role..."
              value={searchMember}
              onChange={e => setSearchMember(e.target.value)}
              style={{ background: 'none', border: 'none', padding: 0, outline: 'none', fontSize: '13px', width: '100%', color: '#fff' }}
            />
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {filteredMembers.map(m => {
              const isOnline = onlineUsers.includes(m.name);
              return (
                <Card 
                  key={m.id} 
                  hoverable 
                  onClick={() => setSelectedMember(m)}
                  style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '15px'
                    }}>
                      {m.avatar || m.name[0]}
                    </div>
                    <span className={`badge ${isOnline ? 'badge-green' : 'badge-cyan'}`}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', margin: 0 }}>{m.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{m.role}</p>
                  </div>

                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.email}</span>
                </Card>
              );
            })}
          </div>

        </div>
      )}

      {/* MEMBER PROFILE DETAILS DRAWER */}
      {selectedMember && (
        <Drawer
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`Team Member Profile`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '28px',
              border: '2px solid var(--border-color)'
            }}>
              {selectedMember.avatar || selectedMember.name[0]}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>{selectedMember.name}</h3>
              <span className="badge badge-purple" style={{ fontSize: '10px', marginTop: '6px' }}>{selectedMember.role.toUpperCase()}</span>
            </div>
          </div>

          {/* Details list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{selectedMember.email}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Weekly Target Capacity:</span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{selectedMember.capacity} hrs/week</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                <Clock size={12} /> Local Time:
              </span>
              <span style={{ color: '#fff' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (GMT+5:30)
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button 
              variant="secondary" 
              style={{ flex: 1 }}
              onClick={() => {
                setSelectedMember(null);
                setChannel('general');
                setActiveTab('chat');
                setInputText(`@${selectedMember.name} `);
                addToast('Mention Direct', `Replying direct thread message for ${selectedMember.name}.`, 'info');
              }}
            >
              Message Direct
            </Button>
          </div>
        </Drawer>
      )}

    </div>
  );
};
