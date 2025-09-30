import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './components/Home';
import FindMentors from './components/FindMentors';
import Dashboard from './components/Dashboard';
import Messages from './components/Messages';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Resources from './components/Resources';
import { AnyUser, Message } from './types';
import MentorProfile from './components/MentorProfile';
import Schedule from './components/Schedule';
import db from './services/database';
import { connectSocket, disconnectSocket, getSocket } from './services/socket';


const ProtectedLayout: React.FC<{ 
    user: AnyUser | null, 
    onLogout: () => void, 
    setUser: (user: AnyUser) => void,
    unreadCount: number,
    messages: Message[],
}> = ({ user, onLogout, setUser, unreadCount, messages }) => {
    if (!user) {
        return <Navigate to="/login" />;
    }
    return (
        <div className="min-h-screen bg-brand-dark text-brand-light font-sans">
            <Header onLogout={onLogout} user={user} unreadCount={unreadCount} />
            <main>
                <Outlet context={{ user, setUser, messages }} />
            </main>
        </div>
    );
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<AnyUser & { token?: string } | null>(() => {
        const savedUser = sessionStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    // Effect for handling socket connection based on user authentication state
    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            connectSocket(currentUser.id);
        } else {
            sessionStorage.removeItem('currentUser');
            disconnectSocket();
        }
    }, [currentUser]);

    // Effect for fetching messages and setting up real-time listeners
    useEffect(() => {
        if (!currentUser) {
            setMessages([]);
            return;
        }

        let isMounted = true;
        const socket = getSocket();

        const fetchInitialMessages = async () => {
            const initialMessages = await db.getMessages();
            if (isMounted) {
                const formattedMessages = initialMessages.map(m => ({...m, timestamp: new Date(m.timestamp)}));
                setMessages(formattedMessages);
            }
        };

        fetchInitialMessages();

        const handleNewMessage = (newMessage: Message) => {
             setMessages(prev => [...prev.filter(m => m.id !== newMessage.id), {...newMessage, timestamp: new Date(newMessage.timestamp)}]);
        };
        const handleReadReceipt = (data: { readerId: string; senderId: string }) => {
            setMessages(prev => prev.map(msg => 
                (msg.receiverId === data.readerId && msg.senderId === data.senderId && !msg.isRead) 
                ? { ...msg, isRead: true } 
                : msg
            ));
        };
        
        socket.on('newMessage', handleNewMessage);
        socket.on('readReceipt', handleReadReceipt);

        return () => {
            isMounted = false;
            socket.off('newMessage', handleNewMessage);
            socket.off('readReceipt', handleReadReceipt);
        };
    }, [currentUser]);

    // Effect for calculating unread count
    useEffect(() => {
        if (!currentUser) {
            setUnreadCount(0);
            return;
        }
        const count = messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;
        setUnreadCount(count);

    }, [messages, currentUser]);


    const handleLogin = (user: AnyUser, token: string) => {
        const userWithToken = { ...user, token };
        setCurrentUser(userWithToken);
        navigate('/');
    };

    const handleLogout = () => {
        disconnectSocket();
        setCurrentUser(null);
        navigate('/login');
    };

    const handleUserUpdate = (updatedUser: AnyUser) => {
        setCurrentUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : null);
    };

    return (
        <Routes>
            <Route path="/login" element={<Auth mode="login" onAuth={handleLogin} />} />
            <Route path="/register" element={<Auth mode="register" onAuth={handleLogin} />} />
            <Route element={<ProtectedLayout user={currentUser} onLogout={handleLogout} setUser={handleUserUpdate} unreadCount={unreadCount} messages={messages} />}>
                <Route path="/" element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="mentors" element={<FindMentors />} />
                <Route path="mentors/:mentorId" element={<MentorProfile />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="resources" element={<Resources />} />
                <Route path="messages" element={<Messages />} />
                <Route path="profile" element={<Profile />} />
            </Route>
             <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} />} />
        </Routes>
    );
};

const AppWrapper: React.FC = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);


export default AppWrapper;