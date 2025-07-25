import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/Layout';
import io from 'socket.io-client'; // ✨ Socket.IO client eklendi

// API fonksiyonları
const API_BASE_URL = 'http://localhost:3000/api';
const api = {
  getAppointments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Backend connection error:', error);
      return [];
    }
  },
  createAppointment: async (appointmentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Appointment saving error:', error);
      throw error;
    }
  },
  // User messaging API functions
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Users loading error:', error);
      return [];
    }
  },
  getMessages: async (userId: string, contactId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${userId}/${contactId}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Messages loading error:', error);
      return [];
    }
  },
  sendMessage: async (messageData: {
    senderId: string;
    receiverId: string;
    content: string;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Message sending error:', error);
      throw error;
    }
  },
  getConversations: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${userId}`);
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Conversations loading error:', error);
      return [];
    }
  }
};

// Dark Mode Toggle Component
const DarkModeToggle = ({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean; toggleDarkMode: () => void }) => (
  <button
    onClick={toggleDarkMode}
    style={{
      position: 'fixed',
      top: '12px',
      right: '130px',
      zIndex: 1000,
      background: isDarkMode
        ? 'linear-gradient(135deg, #4338ca, #3730a3)'
        : 'linear-gradient(135deg, #1f2937, #111827)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '56px',
      height: '56px',
      fontSize: '20px',
      cursor: 'pointer',
      boxShadow: isDarkMode
        ? '0 10px 25px rgba(67, 56, 202, 0.3)'
        : '0 10px 25px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {isDarkMode ? '☀️' : '🌙'}
  </button>
);

interface CaseWorker {
  id: string;
  name: string;
  country: string;
  flag: string;
  languages: string[];
  specialties: string[];
  availability: string;
  isOnline: boolean;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: 'in-person' | 'phone' | 'video';
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  caseWorker: string;
  country: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  isFromCaseWorker: boolean;
}

interface Contact {
  id: string;
  name: string;
  type: 'user' | 'caseworker';
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  country?: string;
  flag?: string;
}

// Current user ID - Bu gerçek uygulamada authentication'dan gelecek
const CURRENT_USER_ID = '1'; // 🔧 Gerçek sayısal ID kullanın (string olarak)

const CaseWorkerPage: React.FC = () => {
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  const [selectedCaseWorker, setSelectedCaseWorker] = useState<CaseWorker | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: '2024-01-20',
      time: '14:00',
      type: 'video',
      status: 'scheduled',
      caseWorker: 'Maria Papadopoulos',
      country: 'Greece'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '10:00',
      type: 'phone',
      status: 'completed',
      caseWorker: 'Emma Wilson',
      country: 'UK'
    }
  ]);
  
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: 'video' as 'in-person' | 'phone' | 'video',
    reason: ''
  });

  // Messaging states
  const [activeTab, setActiveTab] = useState<'caseworkers' | 'messages'>('caseworkers');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [realUsers, setRealUsers] = useState<any[]>([]);

  // Mock Case Workers (unchanged)
  const caseWorkers: CaseWorker[] = [
    {
      id: 'cw1',
      name: 'Maria Papadopoulos',
      country: 'Greece',
      flag: '🇬🇷',
      languages: ['Greek', 'English'],
      specialties: ['Housing', 'Healthcare'],
      availability: 'Mon-Fri 9:00-17:00 EET',
      isOnline: true
    },
    {
      id: 'cw2',
      name: 'Hans Mueller',
      country: 'Germany',
      flag: '🇩🇪',
      languages: ['German', 'English', 'Turkish'],
      specialties: ['Employment', 'Legal Aid'],
      availability: 'Mon-Fri 8:00-16:00 CET',
      isOnline: false
    },
    {
      id: 'cw3',
      name: 'Sarah Johnson',
      country: 'USA',
      flag: '🇺🇸',
      languages: ['English', 'Spanish'],
      specialties: ['Mental Health', 'Education'],
      availability: 'Mon-Fri 9:00-17:00 EST',
      isOnline: true
    },
    {
      id: 'cw4',
      name: 'Yiannis Christou',
      country: 'Cyprus',
      flag: '🇨🇾',
      languages: ['Greek', 'English', 'Turkish'],
      specialties: ['Social Services', 'Documentation'],
      availability: 'Mon-Fri 8:00-16:00 EET',
      isOnline: true
    },
    {
      id: 'cw5',
      name: 'Ayşe Yılmaz',
      country: 'Turkey',
      flag: '🇹🇷',
      languages: ['Turkish', 'English', 'Arabic'],
      specialties: ['Family Support', 'Healthcare'],
      availability: 'Mon-Fri 9:00-18:00 TRT',
      isOnline: false
    },
    {
      id: 'cw6',
      name: 'Emma Wilson',
      country: 'UK',
      flag: '🇬🇧',
      languages: ['English', 'French'],
      specialties: ['Benefits', 'Housing'],
      availability: 'Mon-Fri 9:00-17:00 GMT',
      isOnline: true
    }
  ];

  // Load appointments from backend
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const backendAppointments = await api.getAppointments();
        if (backendAppointments.length > 0) {
          const formattedAppointments = backendAppointments.map((apt: any) => ({
            id: apt.id.toString(),
            date: apt.date,
            time: apt.time,
            type: apt.type,
            status: apt.status,
            location: apt.location,
            caseWorker: apt.caseWorkerName || 'Unknown',
            country: 'Unknown'
          }));
          setAppointments(formattedAppointments);
        }
      } catch (error) {
        // Keep default appointments on error
      }
    };
    loadAppointments();
  }, []);

  // Load users and conversations
  useEffect(() => {
    const loadUsersAndConversations = async () => {
      try {
        // Load real users
        const users = await api.getUsers();
        setRealUsers(users);

        // Load conversations
        const conversations = await api.getConversations(CURRENT_USER_ID);
        
        // Create contacts from real users and conversations
        const userContacts: Contact[] = users
          .filter((user: any) => user.id !== CURRENT_USER_ID)
          .map((user: any) => {
            const conversation = conversations.find((conv: any) => 
              conv.participant1Id === user.id || conv.participant2Id === user.id
            );
            
            return {
              id: user.id,
              name: user.name || user.username,
              type: 'user' as const,
              isOnline: user.isOnline || false,
              lastMessage: conversation?.lastMessage || undefined,
              lastMessageTime: conversation?.lastMessageTime ? new Date(conversation.lastMessageTime) : undefined
            };
          });

        // Add case workers as mock contacts
        const caseWorkerContacts: Contact[] = caseWorkers.map(worker => ({
          id: worker.id,
          name: worker.name,
          type: 'caseworker' as const,
          isOnline: worker.isOnline,
          country: worker.country,
          flag: worker.flag
        }));

        setContacts([...userContacts, ...caseWorkerContacts]);
      } catch (error) {
        console.error('Error loading users and conversations:', error);
      }
    };

    loadUsersAndConversations();
  }, []);

  // ✨ Socket.IO Real-time Connection
  useEffect(() => {
    const socket = io('http://localhost:3000');
    
    // User room'a katıl
    socket.emit('join-user-room', CURRENT_USER_ID);
    console.log(`🔌 Connected to Socket.IO as user ${CURRENT_USER_ID}`);
    
    // Yeni mesaj dinle
    socket.on('new-message', (messageData) => {
      console.log('💬 New message received:', messageData);
      
      // Sadece aktif conversation'a ait mesajları ekle
      if (selectedContact && 
          ((messageData.senderId === selectedContact.id && messageData.receiverId === CURRENT_USER_ID) ||
           (messageData.senderId === CURRENT_USER_ID && messageData.receiverId === selectedContact.id))) {
        setMessages(prev => [...prev, {
          id: messageData.id,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          receiverId: messageData.receiverId,
          receiverName: messageData.receiverName,
          content: messageData.content,
          timestamp: new Date(messageData.timestamp),
          isFromCaseWorker: messageData.isFromCaseWorker
        }]);
      }
      
      // Contact'ın son mesajını güncelle
      setContacts(prev => prev.map(contact => 
        contact.id === messageData.senderId || contact.id === messageData.receiverId
          ? { 
              ...contact, 
              lastMessage: messageData.content, 
              lastMessageTime: new Date(messageData.timestamp)
            }
          : contact
      ));
    });
    
    // Typing indicators
    socket.on('user-typing', (data) => {
      console.log(`${data.senderName} is typing...`);
      // Typing indicator UI buraya eklenebilir
    });
    
    socket.on('user-stop-typing', (data) => {
      console.log(`${data.userId} stopped typing`);
      // Typing indicator UI'ı kaldır
    });
    
    // Online/offline status
    socket.on('user-online', (data) => {
      console.log(`User ${data.userId} came online`);
      setContacts(prev => prev.map(contact => 
        contact.id === data.userId ? { ...contact, isOnline: true } : contact
      ));
    });
    
    socket.on('user-offline', (data) => {
      console.log(`User ${data.userId} went offline`);
      setContacts(prev => prev.map(contact => 
        contact.id === data.userId ? { ...contact, isOnline: false } : contact
      ));
    });
    
    // Cleanup
    return () => {
      console.log('🔌 Disconnecting from Socket.IO');
      socket.disconnect();
    };
  }, [selectedContact]); // selectedContact değiştiğinde yeniden bağlan

  // Load messages when contact is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (selectedContact) {
        setMessages([]); // Önce temizle
        
        if (selectedContact.type === 'user') {
          try {
            console.log(`📥 Loading messages between ${CURRENT_USER_ID} and ${selectedContact.id}`);
            const messagesData = await api.getMessages(CURRENT_USER_ID, selectedContact.id);
            const formattedMessages: Message[] = messagesData.map((msg: any) => ({
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.senderName,
              receiverId: msg.receiverId,
              receiverName: msg.receiverName,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
              isFromCaseWorker: false
            }));
            setMessages(formattedMessages);
            console.log(`✅ Loaded ${formattedMessages.length} messages`);
          } catch (error) {
            console.error('Error loading messages:', error);
            setMessages([]);
          }
        } else if (selectedContact.type === 'caseworker') {
          // Mock messages for case workers (unchanged behavior)
          const mockMessages: Message[] = [
            {
              id: 'mock1',
              senderId: selectedContact.id,
              senderName: selectedContact.name,
              receiverId: CURRENT_USER_ID,
              receiverName: 'You',
              content: `Hello! I'm ${selectedContact.name}. How can I help you today?`,
              timestamp: new Date(Date.now() - 30000),
              isFromCaseWorker: true
            }
          ];
          setMessages(mockMessages);
        }
      } else {
        setMessages([]); // Contact seçilmemişse mesajları temizle
      }
    };

    loadMessages();
  }, [selectedContact]); // selectedContact değiştiğinde mesajları yükle

  const scheduleAppointment = async () => {
    if (newAppointment.date && newAppointment.time && selectedCaseWorker) {
      const appointment: Appointment = {
        id: Date.now().toString(),
        date: newAppointment.date,
        time: newAppointment.time,
        type: newAppointment.type,
        status: 'scheduled',
        location: newAppointment.type === 'in-person' ? `${selectedCaseWorker.country} Social Services Center` : undefined,
        caseWorker: selectedCaseWorker.name,
        country: selectedCaseWorker.country
      };
      
      setAppointments(prev => [...prev, appointment]);
      
      // Save to backend
      try {
        const appointmentForBackend = {
          userId: 1,
          date: newAppointment.date,
          time: newAppointment.time,
          type: newAppointment.type,
          location: appointment.location || '',
          purpose: newAppointment.reason || 'General consultation',
          caseWorkerName: selectedCaseWorker.name
        };
        await api.createAppointment(appointmentForBackend);
      } catch (error) {
        // Continue showing in UI even if backend fails
      }

      // Auto-message from case worker after booking appointment (mock behavior)
      const autoMessage: Message = {
        id: Date.now().toString(),
        senderId: selectedCaseWorker.id,
        senderName: selectedCaseWorker.name,
        receiverId: CURRENT_USER_ID,
        receiverName: 'You',
        content: `Thank you for booking an appointment with me! I look forward to meeting with you on ${newAppointment.date} at ${newAppointment.time}. Please prepare any relevant documents you'd like to discuss. If you have any questions before our meeting, feel free to message me here.`,
        timestamp: new Date(),
        isFromCaseWorker: true
      };

      setMessages(prev => [...prev, autoMessage]);

      // Add case worker to contacts if not already there
      const caseWorkerContact: Contact = {
        id: selectedCaseWorker.id,
        name: selectedCaseWorker.name,
        type: 'caseworker',
        isOnline: selectedCaseWorker.isOnline,
        lastMessage: autoMessage.content,
        lastMessageTime: autoMessage.timestamp,
        country: selectedCaseWorker.country,
        flag: selectedCaseWorker.flag
      };

      setContacts(prev => {
        const existingIndex = prev.findIndex(contact => contact.id === selectedCaseWorker.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = caseWorkerContact;
          return updated;
        } else {
          return [...prev, caseWorkerContact];
        }
      });
      
      setNewAppointment({
        date: '',
        time: '',
        type: 'video',
        reason: ''
      });
      setShowNewAppointment(false);
      setSelectedCaseWorker(null);
      
      alert(`✅ Appointment scheduled successfully with ${selectedCaseWorker.name} from ${selectedCaseWorker.country}!`);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() && selectedContact) {
      if (selectedContact.type === 'user') {
        // Real user messaging
        try {
          const messageData = {
            senderId: CURRENT_USER_ID,
            receiverId: selectedContact.id,
            content: newMessage.trim()
          };

          await api.sendMessage(messageData);

          // Create message for immediate UI update
          const message: Message = {
            id: Date.now().toString(),
            senderId: CURRENT_USER_ID,
            senderName: 'You',
            receiverId: selectedContact.id,
            receiverName: selectedContact.name,
            content: newMessage.trim(),
            timestamp: new Date(),
            isFromCaseWorker: false
          };

          setMessages(prev => [...prev, message]);
          
          // Update contact's last message
          setContacts(prev => prev.map(contact => 
            contact.id === selectedContact.id 
              ? { ...contact, lastMessage: message.content, lastMessageTime: message.timestamp }
              : contact
          ));

          setNewMessage('');
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        }
      } else if (selectedContact.type === 'caseworker') {
        // Mock case worker messaging (unchanged behavior)
        const message: Message = {
          id: Date.now().toString(),
          senderId: CURRENT_USER_ID,
          senderName: 'You',
          receiverId: selectedContact.id,
          receiverName: selectedContact.name,
          content: newMessage.trim(),
          timestamp: new Date(),
          isFromCaseWorker: false
        };

        setMessages(prev => [...prev, message]);
        
        // Update contact's last message
        setContacts(prev => prev.map(contact => 
          contact.id === selectedContact.id 
            ? { ...contact, lastMessage: message.content, lastMessageTime: message.timestamp }
            : contact
        ));

        setNewMessage('');

        // Auto-reply from case worker
        setTimeout(() => {
          const autoReply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: selectedContact.id,
            senderName: selectedContact.name,
            receiverId: CURRENT_USER_ID,
            receiverName: 'You',
            content: 'Thank you for your message! I\'ll review it and get back to you soon. If this is urgent, please don\'t hesitate to book an appointment for immediate assistance.',
            timestamp: new Date(),
            isFromCaseWorker: true
          };
          setMessages(prev => [...prev, autoReply]);
          
          setContacts(prev => prev.map(contact => 
            contact.id === selectedContact.id 
              ? { ...contact, lastMessage: autoReply.content, lastMessageTime: autoReply.timestamp }
              : contact
          ));
        }, 2000);
      }
    }
  };

  const getMessagesForContact = (contactId: string) => {
    return messages.filter(msg => 
      (msg.senderId === CURRENT_USER_ID && msg.receiverId === contactId) ||
      (msg.senderId === contactId && msg.receiverId === CURRENT_USER_ID)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'phone': return '📞';
      case 'video': return '📹';
      default: return '📅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: 'transparent',
      minHeight: 'calc(100vh - 120px)',
      color: isDarkMode ? '#ffffff' : '#1f2937'
    }}>
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} />
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: isDarkMode ? '#f87171' : '#dc2626',
          marginBottom: '8px',
          margin: 0
        }}>
          🌍 International Case Workers
        </h1>
        <p style={{
          fontSize: '16px',
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          margin: 0
        }}>
          Connect with case workers from different countries and chat with the community
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          background: isDarkMode ? '#374151' : '#f3f4f6',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button
            onClick={() => setActiveTab('caseworkers')}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'caseworkers' 
                ? isDarkMode 
                  ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'transparent',
              color: activeTab === 'caseworkers'
                ? 'white'
                : isDarkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            👥 Case Workers & Appointments
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === 'messages' 
                ? isDarkMode 
                  ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                : 'transparent',
              color: activeTab === 'messages'
                ? 'white'
                : isDarkMode ? '#9ca3af' : '#6b7280'
            }}
          >
            💬 Messages ({contacts.filter(c => c.type === 'user').length} users)
          </button>
        </div>
      </div>

      {/* Case Workers Tab */}
      {activeTab === 'caseworkers' && (
        <>
          {/* Case Workers Grid */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: isDarkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👥 Available Case Workers
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {caseWorkers.map((worker) => (
                <div
                  key={worker.id}
                  style={{
                    background: isDarkMode
                      ? 'linear-gradient(135deg, #1f2937, #111827)'
                      : 'white',
                    border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: isDarkMode
                      ? '0 8px 30px rgba(0,0,0,0.3)'
                      : '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isDarkMode
                      ? '0 12px 40px rgba(0,0,0,0.4)'
                      : '0 8px 30px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = isDarkMode
                      ? '0 8px 30px rgba(0,0,0,0.3)'
                      : '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                  onClick={() => setSelectedCaseWorker(worker)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '32px' }}>{worker.flag}</span>
                        <div>
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: isDarkMode ? '#f9fafb' : '#1f2937',
                            margin: 0
                          }}>
                            {worker.name}
                          </h3>
                          <p style={{
                            fontSize: '14px',
                            color: isDarkMode ? '#9ca3af' : '#6b7280',
                            margin: 0
                          }}>
                            {worker.country}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{
                          fontSize: '13px',
                          color: isDarkMode ? '#d1d5db' : '#4b5563',
                          margin: '0 0 4px 0'
                        }}>
                          <strong>Languages:</strong> {worker.languages.join(', ')}
                        </p>
                        <p style={{
                          fontSize: '13px',
                          color: isDarkMode ? '#d1d5db' : '#4b5563',
                          margin: '0 0 4px 0'
                        }}>
                          <strong>Specialties:</strong> {worker.specialties.join(', ')}
                        </p>
                        <p style={{
                          fontSize: '13px',
                          color: isDarkMode ? '#d1d5db' : '#4b5563',
                          margin: 0
                        }}>
                          <strong>Hours:</strong> {worker.availability}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: worker.isOnline
                        ? isDarkMode ? '#065f46' : '#dcfce7'
                        : isDarkMode ? '#7c2d12' : '#fef3c7',
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: worker.isOnline ? '#16a34a' : '#f59e0b'
                      }} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: worker.isOnline
                          ? isDarkMode ? '#86efac' : '#16a34a'
                          : isDarkMode ? '#fcd34d' : '#f59e0b'
                      }}>
                        {worker.isOnline ? 'Online' : 'Away'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseWorker(worker);
                        setShowNewAppointment(true);
                      }}
                      style={{
                        flex: 1,
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                          : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      📅 Book Appointment
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const caseWorkerContact: Contact = {
                          id: worker.id,
                          name: worker.name,
                          type: 'caseworker',
                          isOnline: worker.isOnline,
                          country: worker.country,
                          flag: worker.flag
                        };
                        
                        setContacts(prev => {
                          const existingIndex = prev.findIndex(contact => contact.id === worker.id);
                          if (existingIndex === -1) {
                            return [...prev, caseWorkerContact];
                          }
                          return prev;
                        });
                        
                        setSelectedContact(caseWorkerContact);
                        setActiveTab('messages');
                      }}
                      style={{
                        background: isDarkMode
                          ? 'linear-gradient(135deg, #047857, #059669)'
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Section */}
          <div style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #1f2937, #111827)'
              : 'white',
            border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: isDarkMode
              ? '0 8px 30px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: isDarkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📅 Your Appointments ({appointments.length})
              <span style={{
                background: isDarkMode ? '#065f46' : '#dcfce7',
                color: isDarkMode ? '#86efac' : '#16a34a',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Saved
              </span>
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              {appointments.length === 0 ? (
                <p style={{
                  textAlign: 'center',
                  color: isDarkMode ? '#9ca3af' : '#6b7280',
                  padding: '32px'
                }}>
                  No appointments scheduled yet
                </p>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      background: isDarkMode ? '#374151' : '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {getAppointmentIcon(appointment.type)}
                      </span>
                      <div>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: '600',
                          color: isDarkMode ? '#f9fafb' : '#1f2937'
                        }}>
                          {appointment.date} at {appointment.time}
                        </p>
                        <p style={{ 
                          margin: 0, 
                          fontSize: '14px', 
                          color: isDarkMode ? '#9ca3af' : '#6b7280' 
                        }}>
                          {appointment.caseWorker} • {appointment.country}
                        </p>
                        {appointment.location && (
                          <p style={{ 
                            margin: 0, 
                            fontSize: '12px', 
                            color: isDarkMode ? '#9ca3af' : '#6b7280' 
                          }}>
                            📍 {appointment.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <span style={{
                      color: getStatusColor(appointment.status),
                      fontSize: '12px',
                      fontWeight: '600',
                      background: `${getStatusColor(appointment.status)}15`,
                      padding: '4px 8px',
                      borderRadius: '6px'
                    }}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            {/* New Appointment Form */}
            {showNewAppointment && selectedCaseWorker ? (
              <div style={{
                background: isDarkMode ? '#374151' : '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
              }}>
                <h4 style={{ 
                  margin: '0 0 12px 0',
                  color: isDarkMode ? '#f9fafb' : '#1f2937'
                }}>
                  Schedule Appointment with {selectedCaseWorker.name} ({selectedCaseWorker.country} {selectedCaseWorker.flag})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      padding: '8px',
                      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      background: isDarkMode ? '#1f2937' : 'white',
                      color: isDarkMode ? '#f9fafb' : '#1f2937'
                    }}
                  />
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    style={{
                      padding: '8px',
                      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      background: isDarkMode ? '#1f2937' : 'white',
                      color: isDarkMode ? '#f9fafb' : '#1f2937'
                    }}
                  />
                  <select
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value as any }))}
                    style={{
                      padding: '8px',
                      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      background: isDarkMode ? '#1f2937' : 'white',
                      color: isDarkMode ? '#f9fafb' : '#1f2937'
                    }}
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    {selectedCaseWorker.country === 'Cyprus' && <option value="in-person">In-Person</option>}
                  </select>
                  <input
                    type="text"
                    value={newAppointment.reason}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Reason for appointment (optional)"
                    style={{
                      padding: '8px',
                      border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '6px',
                      background: isDarkMode ? '#1f2937' : 'white',
                      color: isDarkMode ? '#f9fafb' : '#1f2937'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={scheduleAppointment}
                      disabled={!newAppointment.date || !newAppointment.time}
                      style={{
                        background: newAppointment.date && newAppointment.time 
                          ? isDarkMode 
                            ? 'linear-gradient(135deg, #047857, #059669)'
                            : 'linear-gradient(135deg, #10b981, #059669)'
                          : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: newAppointment.date && newAppointment.time ? 'pointer' : 'not-allowed',
                        flex: 1
                      }}
                    >
                      ✅ Schedule & Save
                    </button>
                    <button
                      onClick={() => {
                        setShowNewAppointment(false);
                        setSelectedCaseWorker(null);
                      }}
                      style={{
                        background: isDarkMode ? '#4b5563' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Info Section */}
          <div style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
              : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: `1px solid ${isDarkMode ? '#3b82f6' : '#93c5fd'}`,
            borderRadius: '12px',
            padding: '20px',
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌐</div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#dbeafe' : '#1e40af',
              margin: '0 0 8px 0'
            }}>
              International Support Network
            </h3>
            <p style={{
              fontSize: '14px',
              color: isDarkMode ? '#93c5fd' : '#3730a3',
              margin: 0
            }}>
              Our case workers speak multiple languages and understand cultural differences. 
              Schedule appointments in your preferred language and time zone.
            </p>
          </div>
        </>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px',
          height: '600px'
        }}>
          {/* Contacts List */}
          <div style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #1f2937, #111827)'
              : 'white',
            border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '20px',
            boxShadow: isDarkMode
              ? '0 8px 30px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDarkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👥 Contacts
              <span style={{
                background: isDarkMode ? '#065f46' : '#dcfce7',
                color: isDarkMode ? '#86efac' : '#16a34a',
                fontSize: '12px',
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                Live
              </span>
            </h3>
            
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              marginRight: '-8px',
              paddingRight: '8px'
            }}>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: selectedContact?.id === contact.id 
                      ? isDarkMode ? '#374151' : '#f3f4f6'
                      : 'transparent',
                    border: `1px solid ${
                      selectedContact?.id === contact.id 
                        ? isDarkMode ? '#4b5563' : '#d1d5db'
                        : 'transparent'
                    }`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedContact?.id !== contact.id) {
                      e.currentTarget.style.background = isDarkMode ? '#374151' : '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedContact?.id !== contact.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: contact.type === 'caseworker' 
                          ? isDarkMode 
                            ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : isDarkMode 
                            ? 'linear-gradient(135deg, #047857, #059669)'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: 'white'
                      }}>
                        {contact.type === 'caseworker' ? (contact.flag || '👨‍💼') : '👤'}
                      </div>
                      {contact.isOnline && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#16a34a',
                          border: `2px solid ${isDarkMode ? '#1f2937' : 'white'}`
                        }} />
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isDarkMode ? '#f9fafb' : '#1f2937',
                          margin: 0,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}>
                          {contact.name}
                        </p>
                        {contact.type === 'caseworker' && (
                          <span style={{
                            fontSize: '10px',
                            background: isDarkMode ? '#1e40af' : '#dbeafe',
                            color: isDarkMode ? '#dbeafe' : '#1e40af',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            CASE WORKER
                          </span>
                        )}
                        {contact.type === 'user' && (
                          <span style={{
                            fontSize: '10px',
                            background: isDarkMode ? '#047857' : '#dcfce7',
                            color: isDarkMode ? '#86efac' : '#16a34a',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            USER
                          </span>
                        )}
                      </div>
                      
                      {contact.lastMessage && (
                        <p style={{
                          fontSize: '12px',
                          color: isDarkMode ? '#9ca3af' : '#6b7280',
                          margin: '2px 0 0 0',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}>
                          {contact.lastMessage}
                        </p>
                      )}
                      
                      {contact.lastMessageTime && (
                        <p style={{
                          fontSize: '11px',
                          color: isDarkMode ? '#6b7280' : '#9ca3af',
                          margin: '2px 0 0 0'
                        }}>
                          {formatDate(contact.lastMessageTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, #1f2937, #111827)'
              : 'white',
            border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '12px',
            boxShadow: isDarkMode
              ? '0 8px 30px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  background: isDarkMode ? '#374151' : '#f9fafb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: selectedContact.type === 'caseworker' 
                          ? isDarkMode 
                            ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : isDarkMode 
                            ? 'linear-gradient(135deg, #047857, #059669)'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        color: 'white'
                      }}>
                        {selectedContact.type === 'caseworker' ? (selectedContact.flag || '👨‍💼') : '👤'}
                      </div>
                      {selectedContact.isOnline && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#16a34a',
                          border: `2px solid ${isDarkMode ? '#374151' : '#f9fafb'}`
                        }} />
                      )}
                    </div>
                    
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: isDarkMode ? '#f9fafb' : '#1f2937',
                        margin: 0
                      }}>
                        {selectedContact.name}
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        margin: 0
                      }}>
                        {selectedContact.type === 'caseworker' 
                          ? `Case Worker${selectedContact.country ? ` • ${selectedContact.country}` : ''}`
                          : selectedContact.type === 'user'
                            ? 'Community Member'
                            : selectedContact.isOnline ? 'Online' : 'Offline'
                        }
                        {selectedContact.type === 'user' && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '10px',
                            background: isDarkMode ? '#047857' : '#dcfce7',
                            color: isDarkMode ? '#86efac' : '#16a34a',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            REAL USER
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div style={{
                  flex: 1,
                  padding: '16px 20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {getMessagesForContact(selectedContact.id).length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      marginTop: '50px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                      <p style={{ margin: 0, fontSize: '16px' }}>Start a conversation</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                        {selectedContact.type === 'caseworker' 
                          ? 'Ask questions about services or schedule an appointment'
                          : selectedContact.type === 'user'
                            ? 'Connect with a fellow community member - this is a real user!'
                            : 'Connect with a fellow community member'
                        }
                      </p>
                    </div>
                  ) : (
                    getMessagesForContact(selectedContact.id).map((message) => (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent: message.senderId === CURRENT_USER_ID ? 'flex-end' : 'flex-start',
                          marginBottom: '8px'
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: message.senderId === CURRENT_USER_ID ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: message.senderId === CURRENT_USER_ID
                              ? isDarkMode 
                                ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                              : message.isFromCaseWorker
                                ? isDarkMode
                                  ? 'linear-gradient(135deg, #047857, #059669)'
                                  : 'linear-gradient(135deg, #10b981, #059669)'
                                : isDarkMode ? '#374151' : '#f3f4f6',
                            color: message.senderId === CURRENT_USER_ID || message.isFromCaseWorker 
                              ? 'white' 
                              : isDarkMode ? '#f9fafb' : '#1f2937'
                          }}
                        >
                          <p style={{ 
                            margin: 0, 
                            fontSize: '14px', 
                            lineHeight: '1.4',
                            wordBreak: 'break-word'
                          }}>
                            {message.content}
                          </p>
                          <p style={{
                            margin: '6px 0 0 0',
                            fontSize: '11px',
                            opacity: 0.7
                          }}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                  background: isDarkMode ? '#374151' : '#f9fafb'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={`Message ${selectedContact.name}...${selectedContact.type === 'user' ? ' (Real user messaging)' : ''}`}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                        borderRadius: '24px',
                        background: isDarkMode ? '#1f2937' : 'white',
                        color: isDarkMode ? '#f9fafb' : '#1f2937',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      style={{
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '24px',
                        background: newMessage.trim()
                          ? selectedContact.type === 'user'
                            ? isDarkMode 
                              ? 'linear-gradient(135deg, #047857, #059669)'
                              : 'linear-gradient(135deg, #10b981, #059669)'
                            : isDarkMode 
                              ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : isDarkMode ? '#4b5563' : '#9ca3af',
                        color: 'white',
                        cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                    >
                      {selectedContact.type === 'user' ? '📤 Send Live' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: isDarkMode ? '#9ca3af' : '#6b7280',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  Select a contact to start messaging
                </h3>
                <p style={{
                  fontSize: '14px',
                  margin: '0 0 8px 0'
                }}>
                  Choose from case workers or community members on the left
                </p>
                <p style={{
                  fontSize: '12px',
                  margin: 0,
                  color: isDarkMode ? '#6b7280' : '#9ca3af'
                }}>
                  💡 Real user messaging is now enabled for community members
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseWorkerPage;