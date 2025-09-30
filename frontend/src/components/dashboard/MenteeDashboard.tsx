import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import db from '../../services/database';
import { Mentee, Mentor, RequestStatus, MentorshipRequest, Goal, AnyUser, Session } from '../../types';
import Card from '../common/Card';
import { suggestMentors } from '../../services/geminiService';
import SparklesIcon from '../icons/SparklesIcon';
import UserGroupIcon from '../icons/UserGroupIcon';
import CalendarIcon from '../icons/CalendarIcon';
import PlusCircleIcon from '../icons/PlusCircleIcon';
import TrashIcon from '../icons/TrashIcon';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';
import Avatar from '../common/Avatar';
import { getSocket } from '../../services/socket';


const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <Card className="flex items-center gap-4">
        <div className="bg-gray-800 p-3 rounded-lg">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </Card>
);

const MenteeDashboard: React.FC<{ user: Mentee }> = ({ user }) => {
    const navigate = useNavigate();
    const [myMentors, setMyMentors] = useState<AnyUser[]>([]);
    const [pendingRequests, setPendingRequests] = useState<(MentorshipRequest & { mentor: AnyUser | undefined })[]>([]);
    const [suggested, setSuggested] = useState<Mentor[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalText, setNewGoalText] = useState('');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [allUsers, setAllUsers] = useState<AnyUser[]>([]);
    const [banner, setBanner] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        // Fetch all users once for efficiency
        const allUsersData = await db.getUsers();
        setAllUsers(allUsersData);
        
        // Refresh current user from API to get latest mentorIds
        const freshSelf = await db.findUserById(user.id);
        const mentorIds = (freshSelf && 'mentorIds' in freshSelf ? (freshSelf as Mentee).mentorIds : user.mentorIds);
        const mentors = allUsersData.filter(u => mentorIds.includes(u.id));
        setMyMentors(mentors);

        const allRequests = await db.getRequests();
        const pending = allRequests.filter(r => r.fromId === user.id && r.status === RequestStatus.PENDING);
        const pendingWithMentorData = pending.map(req => ({
            ...req,
            mentor: allUsersData.find(u => u.id === req.toId)
        }));
        setPendingRequests(pendingWithMentorData);

        // Fetch goals
        const userGoals = await db.getGoalsForMentee(user.id);
        setGoals(userGoals);

        // Fetch sessions
        const userSessions = await db.getSessionsForUser();
        const formattedSessions = userSessions.map(s => ({...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime)}));
        setSessions(formattedSessions);

    }, [user.id, user.mentorIds]);

    useEffect(() => {
        fetchDashboardData();
        
        const fetchSuggestions = async () => {
            if (user) {
                setIsLoadingSuggestions(true);
                const suggestions = await suggestMentors(user);
                setSuggested(suggestions);
                setIsLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
        const socket = getSocket();
        const handler = (payload?: { request?: MentorshipRequest }) => {
            const updated = payload?.request;
            if (!updated || updated.fromId !== user.id) return;
            // Update UI immediately
            setPendingRequests(prev => prev.map(r => r.id === updated.id ? { ...r, status: updated.status } : r));
            if (updated.status === 'Accepted') {
                setBanner('Your mentorship request was accepted!');
                setTimeout(() => setBanner(null), 4000);
            }
            // Refresh full data now to sync mentors list and remove from pending if needed
            fetchDashboardData();
        };
        socket.on('request:updated', handler);
        const createdHandler = (payload?: { request?: MentorshipRequest }) => {
            const created = payload?.request;
            if (created?.fromId === user.id) {
                fetchDashboardData();
            }
        };
        socket.on('request:created', createdHandler);
        return () => {
            socket.off('request:updated', handler);
            socket.off('request:created', createdHandler);
        };
    }, [user, fetchDashboardData]);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim()) {
            await db.addGoal({ menteeId: user.id, text: newGoalText.trim() });
            setNewGoalText('');
            fetchDashboardData(); // Refresh goals
        }
    };

    const handleToggleGoal = async (goal: Goal) => {
        await db.updateGoal({ ...goal, isCompleted: !goal.isCompleted });
        fetchDashboardData();
    };

    const handleDeleteGoal = async (goalId: string) => {
        await db.deleteGoal(goalId);
        fetchDashboardData();
    };

    const upcomingSessions = sessions.filter(s => s.status === 'Confirmed' && s.startTime > new Date());

    return (
        <div className="space-y-8">
            {banner && (
                <div className="bg-green-600 text-white text-sm px-4 py-2 rounded-md">{banner}</div>
            )}
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<UserGroupIcon className="w-6 h-6 text-brand-accent"/>} label="Active Mentors" value={myMentors.length} />
                <StatCard icon={<CalendarIcon className="w-6 h-6 text-brand-teal"/>} label="Upcoming Sessions" value={upcomingSessions.length} />
                <StatCard icon={<ClipboardCheckIcon className="w-6 h-6 text-yellow-400"/>} label="Active Goals" value={goals.filter(g => !g.isCompleted).length} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <h2 className="text-xl font-bold text-white mb-4">My Mentors</h2>
                        {myMentors.length > 0 ? (
                            <div className="space-y-4">
                                {myMentors.map(mentor => (
                                    <div key={mentor.id} className="flex items-center bg-gray-900 p-3 rounded-lg">
                                        <Avatar user={mentor} className="w-12 h-12 mr-4" />
                                        <div>
                                            <p className="font-semibold text-white">{mentor.name}</p>
                                            <p className="text-sm text-gray-400">{mentor.department}</p>
                                        </div>
                                        <button 
                                            onClick={() => navigate('/messages', { state: { recipientId: mentor.id } })}
                                            className="ml-auto bg-brand-accent hover:bg-brand-accent-dark text-white px-4 py-1 rounded-lg text-sm transition-transform duration-200 hover:scale-105">
                                            Message
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400">You currently have no mentors.</p>}
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
                        {pendingRequests.length > 0 ? (
                            <div className="space-y-4">
                                {pendingRequests.map(req => (
                                <div key={req.id} className="flex items-center bg-gray-900 p-3 rounded-lg">
                                    <Avatar user={req.mentor} className="w-12 h-12 mr-4" />
                                    <div>
                                        <p className="font-semibold text-white">{req.mentor?.name}</p>
                                        <p className="text-sm text-gray-400">Status: <span className="font-semibold text-yellow-400">{req.status}</span></p>
                                    </div>
                                </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-400">You have no pending requests.</p>}
                    </Card>
                </div>

                {/* Middle Column */}
                <div className="lg:col-span-1 space-y-8">
                     <Card className="flex flex-col h-full">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                           <ClipboardCheckIcon className="w-6 h-6 text-brand-teal" /> My Goals
                        </h2>
                        <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
                            <input 
                                type="text"
                                value={newGoalText}
                                onChange={(e) => setNewGoalText(e.target.value)}
                                placeholder="Add a new goal..."
                                className="flex-grow bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-accent"
                            />
                            <button type="submit" className="bg-brand-accent p-2 rounded-lg hover:bg-brand-accent-dark transition-colors"><PlusCircleIcon className="w-6 h-6 text-white"/></button>
                        </form>
                        <div className="space-y-3 overflow-y-auto flex-grow">
                            {goals.map(goal => (
                                <div key={goal.id} className={`flex items-center p-3 rounded-lg transition-colors ${goal.isCompleted ? 'bg-gray-800/50' : 'bg-gray-800'}`}>
                                    <button onClick={() => handleToggleGoal(goal)} className="mr-3">
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${goal.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                            {goal.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                    </button>
                                    <p className={`flex-grow text-sm ${goal.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{goal.text}</p>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="ml-2 text-gray-500 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                             {goals.length === 0 && <p className="text-center text-gray-400 pt-8">No goals set yet. Add one above!</p>}
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <h2 className="flex items-center gap-2 text-xl font-bold text-white mb-4">
                           <SparklesIcon className="w-6 h-6 text-brand-accent" /> AI Suggested Mentors
                        </h2>
                        {isLoadingSuggestions ? <p className="text-gray-400">Finding matches...</p> : (
                             suggested.length > 0 ? (
                                <div className="space-y-4">
                                    {suggested.map(mentor => (
                                        <div key={mentor.id} className="flex items-center bg-gray-900 p-3 rounded-lg">
                                            <Avatar user={mentor} className="w-10 h-10 mr-3"/>
                                            <div>
                                                <p className="font-semibold text-white text-sm">{mentor.name}</p>
                                                <p className="text-xs text-gray-400">{mentor.department}</p>
                                            </div>
                                            <Link to={`/mentors/${mentor.id}`} className="ml-auto bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs transition">View</Link>
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                <p className="text-gray-400">No new suggestions at this time.</p>
                             )
                        )}
                    </Card>
                    <Card>
                        <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
                         <div className="space-y-4">
                            {upcomingSessions.length > 0 ? (
                                upcomingSessions.slice(0, 2).map(session => {
                                    const mentor = allUsers.find(u => u.id === session.mentorId);
                                    return (
                                        <div key={session.id} className="bg-gray-900 p-3 rounded-lg">
                                            <p className="font-semibold text-white">{session.topic}</p>
                                            <p className="text-sm text-gray-400">with {mentor?.name}</p>
                                            <p className="text-sm text-gray-400">{session.startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}, {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    )
                                })
                            ) : <p className="text-gray-400">You have no upcoming sessions.</p>}
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MenteeDashboard;