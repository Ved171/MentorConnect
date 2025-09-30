import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import db from '../../services/database';
import { Mentor, Mentee, MentorshipRequest, RequestStatus, AnyUser, AvailabilityStatus, Goal, Session } from '../../types';
import Card from '../common/Card';
import UserGroupIcon from '../icons/UserGroupIcon';
import ClipboardCheckIcon from '../icons/ClipboardCheckIcon';
import CalendarIcon from '../icons/CalendarIcon';
import ScheduleSessionModal from './ScheduleSessionModal';
import MyResources from './MyResources';
import Avatar from '../common/Avatar';
import { getSocket } from '../../services/socket';

type RequestWithMentee = MentorshipRequest & { mentee: AnyUser | undefined };

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <Card className="flex items-center gap-4">
        <div className="bg-gray-800 p-3 rounded-lg">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    </Card>
);

interface MentorDashboardProps {
    user: Mentor;
    setUser: (user: AnyUser) => void;
}

const MentorDashboard: React.FC<MentorDashboardProps> = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [myMentees, setMyMentees] = useState<Mentee[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<RequestWithMentee[]>([]);
    const [menteeGoals, setMenteeGoals] = useState<{[key: string]: Goal[]}>({});
    const [sessions, setSessions] = useState<Session[]>([]);
    const [allUsers, setAllUsers] = useState<AnyUser[]>([]);
    const [isScheduling, setIsScheduling] = useState(false);
    const [schedulingForMentee, setSchedulingForMentee] = useState<Mentee | null>(null);
    
    const fetchData = useCallback(async () => {
        const allUsersData = await db.getUsers();
        setAllUsers(allUsersData);
        
        setMyMentees(allUsersData.filter(u => u.role === 'Mentee' && user.menteeIds.includes(u.id)) as Mentee[]);
        
        const allRequests = await db.getRequests();
        const pending = allRequests.filter(r => r.toId === user.id && r.status === RequestStatus.PENDING);
        const pendingWithMenteeData = pending.map(req => ({
            ...req,
            mentee: allUsersData.find(u => u.id === req.fromId)
        }));
        setIncomingRequests(pendingWithMenteeData);

        const userSessions = await db.getSessionsForUser();
        const formattedSessions = userSessions.map(s => ({...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime)}));
        setSessions(formattedSessions);
    }, [user.id, user.menteeIds]);

    useEffect(() => {
        fetchData();
        const socket = getSocket();
        const handler = () => fetchData();
        socket.on('request:created', handler);
        socket.on('request:updated', handler);
        return () => {
            socket.off('request:created', handler);
            socket.off('request:updated', handler);
        };
    }, [fetchData]);

    const handleRequest = async (requestId: string, status: RequestStatus.ACCEPTED | RequestStatus.DECLINED) => {
        const { updatedMentor } = await db.updateRequestStatus(requestId, status);
        if (updatedMentor) {
            // Update global user state. This will trigger a re-render and fetchData will be called by the useEffect hook.
            setUser(updatedMentor);
        } else {
            // If no mentor was updated (e.g., on decline), just refetch the data to update the request list.
            fetchData();
        }
    };
    
    const handleAvailabilityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as AvailabilityStatus;
        await db.updateUser({ ...user, availability: newStatus });
    };
    
    const toggleMenteeGoals = async (menteeId: string) => {
        if (menteeGoals[menteeId]) {
            const newGoals = {...menteeGoals};
            delete newGoals[menteeId];
            setMenteeGoals(newGoals);
        } else {
            const goals = await db.getGoalsForMentee(menteeId);
            setMenteeGoals(prev => ({ ...prev, [menteeId]: goals }));
        }
    }
    
    const handleScheduleClick = (mentee: Mentee) => {
        setSchedulingForMentee(mentee);
        setIsScheduling(true);
    };

    const handleSessionRequested = () => {
        fetchData();
    };

    const upcomingSessions = sessions.filter(s => s.status === 'Confirmed' && s.startTime > new Date());

    return (
        <>
        <ScheduleSessionModal
            isOpen={isScheduling}
            onClose={() => setIsScheduling(false)}
            onSessionRequested={handleSessionRequested}
            mentee={schedulingForMentee}
            mentorId={user.id}
        />
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-4">Incoming Requests</h2>
                    {incomingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {incomingRequests.map(req => (
                                <div key={req.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <div className="flex items-center mb-3">
                                        <Avatar user={req.mentee} className="w-12 h-12 mr-4"/>
                                        <div>
                                            <p className="font-semibold text-white">{req.mentee?.name}</p>
                                            <p className="text-sm text-gray-400">{req.mentee?.department}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-4 italic p-3 bg-gray-800 rounded">"{req.message}"</p>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleRequest(req.id, RequestStatus.DECLINED)} className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">Decline</button>
                                        <button onClick={() => handleRequest(req.id, RequestStatus.ACCEPTED)} className="bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-lg text-sm">Accept</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400">No new mentorship requests.</p>}
                </Card>
                 <Card>
                    <h2 className="text-2xl font-bold text-white mb-4">My Mentees</h2>
                    {myMentees.length > 0 ? (
                       <div className="space-y-2">
                            {myMentees.map(mentee => (
                                <div key={mentee.id}>
                                    <div className="flex items-center bg-gray-900 p-3 rounded-lg">
                                        <Avatar user={mentee} className="w-12 h-12 mr-4"/>
                                        <div>
                                            <p className="font-semibold text-white">{mentee.name}</p>
                                            <p className="text-sm text-gray-400">{mentee.department} - Year {mentee.year}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                                            <button onClick={() => toggleMenteeGoals(mentee.id)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition whitespace-nowrap">
                                                {menteeGoals[mentee.id] ? 'Hide Goals' : 'View Goals'}
                                            </button>
                                            <button onClick={() => handleScheduleClick(mentee)} className="bg-brand-teal hover:bg-teal-500 text-white px-3 py-1 rounded-lg text-sm transition whitespace-nowrap">
                                                Schedule
                                            </button>
                                            <button onClick={() => navigate('/messages', { state: { recipientId: mentee.id } })} className="bg-brand-accent hover:bg-brand-accent-dark text-white px-3 py-1 rounded-lg text-sm transition whitespace-nowrap">
                                                Message
                                            </button>
                                        </div>
                                    </div>
                                    {menteeGoals[mentee.id] && (
                                        <div className="bg-gray-900/50 p-4 mt-1 rounded-b-lg border-l-2 border-brand-teal ml-6">
                                             <h4 className="font-bold text-white mb-2">{mentee.name.split(' ')[0]}'s Goals:</h4>
                                            {menteeGoals[mentee.id].length > 0 ? (
                                                <ul className="space-y-1 list-disc list-inside">
                                                    {menteeGoals[mentee.id].map(goal => (
                                                        <li key={goal.id} className={`text-sm ${goal.isCompleted ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                                            {goal.text}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-sm text-gray-400">No goals set yet.</p>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400">You currently have no mentees.</p>}
                </Card>
                <MyResources />
            </div>
            <div className="lg:col-span-1 space-y-8">
                 <div className="grid grid-cols-1 gap-6">
                    <StatCard icon={<UserGroupIcon className="w-6 h-6 text-brand-accent"/>} label="Active Mentees" value={myMentees.length} />
                    <StatCard icon={<ClipboardCheckIcon className="w-6 h-6 text-yellow-400"/>} label="Pending Requests" value={incomingRequests.length} />
                    <StatCard icon={<CalendarIcon className="w-6 h-6 text-brand-teal" />} label="Upcoming Sessions" value={upcomingSessions.length} />
                 </div>
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-4">My Availability</h2>
                    <p className="text-gray-300 mb-2">Set your current status for receiving new mentorship requests.</p>
                     <select 
                        defaultValue={user.availability}
                        onChange={handleAvailabilityChange} 
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                        {Object.values(AvailabilityStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Upcoming Sessions</h2>
                    <div className="space-y-4">
                        {upcomingSessions.length > 0 ? (
                            upcomingSessions.slice(0, 3).map(session => {
                                const mentee = allUsers.find(u => u.id === session.menteeId);
                                return (
                                    <div key={session.id} className="bg-gray-900 p-3 rounded-lg">
                                        <p className="font-semibold text-white">{session.topic}</p>
                                        <p className="text-sm text-gray-400">with {mentee?.name}</p>
                                        <p className="text-sm text-gray-400">{session.startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}, {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400">No upcoming sessions.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
        </>
    );
};

export default MentorDashboard;