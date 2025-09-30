import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import db from '../services/database';
import { Session, AnyUser, UserRole } from '../types';
import Card from './common/Card';
import Avatar from './common/Avatar';

const Schedule: React.FC = () => {
    const { user: currentUser } = useOutletContext<{ user: AnyUser }>();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [users, setUsers] = useState<AnyUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchScheduleData = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        const sessionData = await db.getSessionsForUser();
        const allUsers = await db.getUsers();
        const formattedSessions = sessionData.map(s => ({...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime)}))
        setSessions(formattedSessions);
        setUsers(allUsers);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchScheduleData();
    }, [fetchScheduleData]);

    const handleSessionStatusUpdate = async (sessionId: string, status: Session['status']) => {
        await db.updateSessionStatus(sessionId, status);
        fetchScheduleData();
    };

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    const getUserById = (id: string) => users.find(u => u.id === id);

    const upcomingSessions = sessions
        .filter(s => s.status === 'Confirmed' && s.startTime > new Date())
        .sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
    const pendingSessions = sessions
        .filter(s => s.status === 'Pending')
        .sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
    const pastSessions = sessions
        .filter(s => s.status === 'Completed' || s.status === 'Cancelled' || s.status === 'Declined' || (s.status === 'Confirmed' && s.startTime <= new Date()))
        .sort((a,b) => b.startTime.getTime() - a.startTime.getTime());

    const SessionCard: React.FC<{ session: Session, isPast?: boolean }> = ({ session, isPast = false }) => {
        const otherUserId = currentUser.id === session.mentorId ? session.menteeId : session.mentorId;
        const otherUser = getUserById(otherUserId);
        
        // Show accept/decline buttons if:
        // 1. Current user is the mentor
        // 2. Session status is 'Pending'
        // 3. The session was NOT requested by the current user (i.e., was requested by the mentee)
        const showMentorActions = currentUser.role === UserRole.MENTOR &&
                                  session.status === 'Pending' &&
                                  session.requestedBy !== currentUser.id;
        
        return (
            <div className={`bg-gray-800 p-4 rounded-lg border-l-4 ${
                session.status === 'Confirmed' ? 'border-brand-accent' :
                session.status === 'Pending' ? 'border-yellow-500' :
                'border-gray-600'
            }`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`font-bold text-white ${isPast ? 'text-gray-400' : ''}`}>{session.topic}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                            <Avatar user={otherUser} className="w-6 h-6"/>
                            <span>with {otherUser?.name}</span>
                        </div>
                    </div>
                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        session.status === 'Confirmed' ? 'bg-green-500/20 text-green-300' :
                        session.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        session.status === 'Cancelled' || session.status === 'Declined' ? 'bg-red-500/20 text-red-300' :
                        'bg-gray-500/20 text-gray-300'
                     }`}>{session.status}</span>
                </div>
                <p className={`text-sm mt-3 ${isPast ? 'text-gray-500' : 'text-gray-300'}`}>{session.startTime.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                {showMentorActions && (
                     <div className="flex gap-2 justify-end mt-3">
                        <button onClick={() => handleSessionStatusUpdate(session.id, 'Declined')} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded-lg text-xs">Decline</button>
                        <button onClick={() => handleSessionStatusUpdate(session.id, 'Confirmed')} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-3 py-1 rounded-lg text-xs">Confirm</button>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-white mb-8">My Schedule</h1>
            {loading ? <p className="text-gray-400 text-center">Loading schedule...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
                        <div className="space-y-4">
                            {pendingSessions.length > 0 ? pendingSessions.map(s => <SessionCard key={s.id} session={s} />) : <p className="text-gray-400">No pending session requests.</p>}
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
                        <div className="space-y-4">
                            {upcomingSessions.length > 0 ? upcomingSessions.map(s => <SessionCard key={s.id} session={s} />) : <p className="text-gray-400">No upcoming sessions.</p>}
                        </div>
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">History</h2>
                        <div className="space-y-4">
                            {pastSessions.length > 0 ? pastSessions.map(s => <SessionCard key={s.id} session={s} isPast />) : <p className="text-gray-400">No past sessions.</p>}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Schedule;