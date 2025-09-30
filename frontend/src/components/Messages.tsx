import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext, Navigate, useLocation, useNavigate } from 'react-router-dom';
import db from '../services/database';
import { Message, AnyUser, Mentee, Mentor, UserRole } from '../types';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import CheckIcon from './icons/CheckIcon';
import { getSocket } from '../services/socket';
import Avatar from './common/Avatar';

const Messages: React.FC = () => {
    const { user: currentUser, messages } = useOutletContext<{ user: AnyUser, messages: Message[] }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<AnyUser[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<AnyUser | null>(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);
    const socket = getSocket();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);
    
    const handleTyping = useCallback((data: { userId: string; isTyping: boolean }) => {
        if (data.userId === selectedConversation?.id) {
            setOtherUserIsTyping(data.isTyping);
        }
    }, [selectedConversation?.id]);
    
    useEffect(() => {
        socket.on('typing', handleTyping);
        return () => {
            socket.off('typing', handleTyping);
        };
    }, [socket, handleTyping]);

    // Effect to derive conversation list from messages and connections (mentors/mentees)
    useEffect(() => {
        const setupConversations = async () => {
            if (!currentUser) return;

            const allUsers = await db.getUsers();
            
            // Use a Set to store unique partner IDs
            const conversationPartnerIds = new Set<string>();

            // 1. Add partners from existing messages
            messages.forEach(m => {
                const partnerId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
                conversationPartnerIds.add(partnerId);
            });

            // 2. Add connected mentors or mentees to ensure they appear even without prior messages
            if (currentUser.role === UserRole.MENTEE) {
                (currentUser as Mentee).mentorIds.forEach(id => conversationPartnerIds.add(id));
            } else if (currentUser.role === UserRole.MENTOR) {
                (currentUser as Mentor).menteeIds.forEach(id => conversationPartnerIds.add(id));
            }

            // 3. Create the user objects for the conversation list
            const conversationUsers = Array.from(conversationPartnerIds)
                .map(id => allUsers.find(u => u.id === id))
                .filter((u): u is AnyUser => u !== undefined);
                
            setConversations(conversationUsers);
        };
        setupConversations();
    }, [currentUser, messages]);

    // Effect to handle selecting a conversation robustly
    useEffect(() => {
        // Don't run selection logic until conversations are loaded
        if (!currentUser || conversations.length === 0) {
            if (selectedConversation) setSelectedConversation(null);
            return;
        }

        // Priority 1: Handle direct navigation via location state
        const recipientId = location.state?.recipientId;
        if (recipientId) {
            const userToSelect = conversations.find(c => c.id === recipientId);
            if (userToSelect) {
                setSelectedConversation(userToSelect);
                navigate(location.pathname, { replace: true, state: {} });
                return;
            }
        }
        
        // Priority 2: If there's already a valid selection, keep it.
        if (selectedConversation && conversations.some(c => c.id === selectedConversation.id)) {
            return;
        }

        // Priority 3: No valid selection, so pick a default (most recent).
        const lastMessageTimestamps = new Map<string, number>();
        messages.forEach(msg => {
            const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
            const latestTimestamp = lastMessageTimestamps.get(partnerId) || 0;
            if (msg.timestamp.getTime() > latestTimestamp) {
                lastMessageTimestamps.set(partnerId, msg.timestamp.getTime());
            }
        });

        // Sort conversations: those with recent messages first, then others.
        const sortedConversations = [...conversations].sort((a, b) => {
            const timeA = lastMessageTimestamps.get(a.id) || 0;
            const timeB = lastMessageTimestamps.get(b.id) || 0;
            return timeB - timeA;
        });
        
        setSelectedConversation(sortedConversations[0] || null);

    }, [conversations, location.state, navigate, messages, currentUser, selectedConversation]);


    // Effect to mark messages as read when a conversation is viewed
    useEffect(() => {
        if (selectedConversation && currentUser) {
            const unreadMessagesExist = messages.some(
                m => m.senderId === selectedConversation.id && m.receiverId === currentUser.id && !m.isRead
            );
            if (unreadMessagesExist) {
                db.markMessagesAsRead(selectedConversation.id);
            }
            setOtherUserIsTyping(false); 
        }
    }, [selectedConversation, currentUser, messages]);

    // Effect to scroll to the bottom of the chat
    useEffect(() => {
        if (selectedConversation) {
             scrollToBottom();
        }
    }, [messages, otherUserIsTyping, selectedConversation, scrollToBottom]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessageText(e.target.value);
        if (!currentUser || !selectedConversation) return;

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        else {
            socket.emit('typing', { recipientId: selectedConversation.id, isTyping: true });
        }
        
        typingTimeoutRef.current = window.setTimeout(() => {
            socket.emit('typing', { recipientId: selectedConversation.id, isTyping: false });
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessageText.trim() || !currentUser || !selectedConversation) return;

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        socket.emit('typing', { recipientId: selectedConversation.id, isTyping: false });
        
        await db.sendMessage(selectedConversation.id, newMessageText.trim());
        setNewMessageText('');
    };

    if (!currentUser) return <Navigate to="/login" />;

    const chatHistory = selectedConversation ? messages.filter(
        m => (m.senderId === currentUser.id && m.receiverId === selectedConversation.id) ||
             (m.senderId === selectedConversation.id && m.receiverId === currentUser.id)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) : [];

    const ConversationItem: React.FC<{ user: AnyUser }> = ({ user }) => {
        const lastMessage = messages
            .filter(m => (m.senderId === user.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === user.id))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        const unreadCount = messages.filter(m => m.receiverId === currentUser.id && m.senderId === user.id && !m.isRead).length;

        return (
            <div 
                key={user.id} 
                className={`flex items-center p-4 cursor-pointer transition-colors duration-200 ${selectedConversation?.id === user.id ? 'bg-brand-accent/20' : 'hover:bg-gray-800'}`}
                onClick={() => setSelectedConversation(user)}
            >
                <div className="relative">
                    <Avatar user={user} className="w-12 h-12 mr-4" />
                    {unreadCount > 0 && <span className="absolute top-0 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-accent text-xs text-white ring-2 ring-brand-secondary-dark">{unreadCount}</span>}
                </div>
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-sm text-gray-400 truncate">{lastMessage?.text || 'Start a conversation!'}</p> 
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6 py-8 h-[calc(100vh-80px)]">
            <div className="flex h-full bg-brand-secondary-dark rounded-lg border border-gray-700 overflow-hidden">
                {/* Conversation List */}
                <div className="w-1/3 border-r border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700">
                        <h1 className="text-xl font-bold text-white">Conversations</h1>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversations.length > 0 ? (
                            conversations.map(user => <ConversationItem key={user.id} user={user} />)
                        ) : (
                             <div className="p-4 text-center text-gray-400">
                                <p>No conversations yet. Find a mentor to get started!</p>
                             </div>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="flex items-center p-4 border-b border-gray-700 bg-gray-800">
                                <Avatar user={selectedConversation} className="w-10 h-10 mr-3" />
                                <h2 className="text-lg font-bold text-white">{selectedConversation.name}</h2>
                            </div>
                            
                            <div className="flex-grow p-6 overflow-y-auto space-y-4">
                                {chatHistory.length > 0 ? chatHistory.map(msg => (
                                    <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                        {msg.senderId !== currentUser.id && <Avatar user={selectedConversation} className="w-8 h-8"/>}
                                        <div>
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.senderId === currentUser.id ? 'bg-brand-accent text-white' : 'bg-gray-700 text-gray-200'}`}>
                                                <p>{msg.text}</p>
                                            </div>
                                            {msg.senderId === currentUser.id && (
                                                <div className="flex items-center justify-end gap-1 text-xs mt-1" style={{ color: msg.isRead ? '#14b8a6' : '#9ca3af' }}>
                                                    <CheckIcon className="w-4 h-4" />
                                                    {msg.isRead && <CheckIcon className="w-4 h-4 -ml-2.5" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                     <div className="text-center text-gray-500 pt-10">
                                        <p>This is the beginning of your conversation with {selectedConversation.name}.</p>
                                     </div>
                                )}
                                {otherUserIsTyping && (
                                     <div className="flex items-end gap-3 justify-start">
                                        <Avatar user={selectedConversation} className="w-8 h-8" />
                                        <div className="px-4 py-3 rounded-xl bg-gray-700">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessageText}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-white hover:bg-brand-accent transition-colors disabled:opacity-50" disabled={!newMessageText.trim() || !selectedConversation}>
                                        <PaperAirplaneIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Select a conversation to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;